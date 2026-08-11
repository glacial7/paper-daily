import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { loadLocalEnv } from "./local-env.mjs";

const ROOT = process.cwd();
await loadLocalEnv(ROOT);

const CACHE_PATH = path.resolve(ROOT, process.env.PAPER_DAILY_WEB_FETCH_CACHE || "data/web-fetch-cache.json");
const REPORT_PATH = path.resolve(ROOT, process.env.PAPER_DAILY_WEB_FETCH_REPORT || "data/web-fetch-report.json");
const API_KEY = process.env.PAPER_DAILY_FIRECRAWL_API_KEY || process.env.FIRECRAWL_API_KEY || "";
const ENABLED = process.env.PAPER_DAILY_FIRECRAWL_ENABLED === "1" && Boolean(API_KEY);
const BASE_URL = (process.env.FIRECRAWL_BASE_URL || "https://api.firecrawl.dev").replace(/\/$/, "");
const MAX_PER_RUN = normalizeInteger(process.env.PAPER_DAILY_FIRECRAWL_MAX_PER_RUN, 20, 100);
const TIMEOUT_MS = normalizeInteger(process.env.PAPER_DAILY_FIRECRAWL_TIMEOUT_MS, 30000, 120000);
const CACHE_DAYS = normalizeInteger(process.env.PAPER_DAILY_WEB_FETCH_CACHE_DAYS, 14, 60);
const USE_CACHE = process.env.PAPER_DAILY_WEB_FETCH_CACHE !== "0";

let cachePromise = null;
const report = {
  generatedAt: new Date().toISOString(),
  enabled: ENABLED,
  configured: Boolean(API_KEY),
  provider: "firecrawl",
  endpoint: firecrawlEndpoint(),
  maxPerRun: MAX_PER_RUN,
  timeoutMs: TIMEOUT_MS,
  calls: 0,
  cacheHits: 0,
  skipped: 0,
  successes: 0,
  failures: 0,
  events: []
};

function normalizeInteger(value, fallback, max) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(max, Math.max(1, Math.round(number)));
}

function firecrawlEndpoint() {
  if (/\/scrape\/?$/i.test(BASE_URL)) return BASE_URL;
  return `${BASE_URL}/v2/scrape`;
}

function cacheKey(url = "") {
  return crypto.createHash("sha256").update(String(url)).digest("hex");
}

function cacheIsFresh(entry = {}) {
  if (!entry.fetchedAt) return false;
  const ageMs = Date.now() - new Date(entry.fetchedAt).getTime();
  return Number.isFinite(ageMs) && ageMs <= CACHE_DAYS * 24 * 60 * 60 * 1000;
}

async function readCache() {
  if (!cachePromise) {
    cachePromise = fs
      .readFile(CACHE_PATH, "utf8")
      .then((text) => JSON.parse(text))
      .catch(() => ({ version: 1, entries: {} }));
  }
  const cache = await cachePromise;
  if (!cache.entries || typeof cache.entries !== "object") cache.entries = {};
  return cache;
}

async function writeCache(cache) {
  if (!USE_CACHE) return;
  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(
    CACHE_PATH,
    `${JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), entries: cache.entries || {} }, null, 2)}\n`
  );
}

function recordEvent(event) {
  report.events.push({
    at: new Date().toISOString(),
    ...event
  });
}

function safeUrl(url = "") {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function shouldSkipUrl(url = "") {
  if (!/^https?:\/\//i.test(url)) return "non_http_url";
  try {
    const host = new URL(url).hostname;
    if (["localhost", "127.0.0.1", "::1"].includes(host)) return "local_url";
  } catch {
    return "invalid_url";
  }
  return "";
}

async function firecrawlScrape(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(firecrawlEndpoint(), {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
        timeout: TIMEOUT_MS
      })
    });
    const text = await response.text();
    let payload = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }
    if (!response.ok || payload.success === false) {
      const message = payload.error || payload.message || `${response.status} ${response.statusText}`;
      throw new Error(message);
    }
    const data = payload.data || payload;
    return {
      ok: true,
      url,
      markdown: data.markdown || "",
      html: data.html || "",
      metadata: data.metadata || {},
      fetchedAt: new Date().toISOString()
    };
  } finally {
    clearTimeout(timer);
  }
}

export function isWebFetcherEnabled() {
  return ENABLED;
}

export async function fetchReadablePage(url, options = {}) {
  const reason = options.reason || "fallback";
  const skipReason = shouldSkipUrl(url);
  if (skipReason) {
    report.skipped += 1;
    recordEvent({ url: safeUrl(url), reason, status: "skipped", detail: skipReason });
    return { ok: false, url, reason: skipReason, source: "skipped" };
  }
  const key = cacheKey(url);
  if (USE_CACHE) {
    const cache = await readCache();
    const cached = cache.entries[key];
    if (cached?.ok && cacheIsFresh(cached)) {
      report.cacheHits += 1;
      recordEvent({ url: safeUrl(url), reason, status: "cache_hit" });
      return { ...cached, source: "cache" };
    }
  }
  if (!ENABLED) {
    report.skipped += 1;
    recordEvent({ url: safeUrl(url), reason, status: "disabled" });
    return { ok: false, url, reason: API_KEY ? "disabled" : "missing_api_key", source: "disabled" };
  }
  if (report.calls >= MAX_PER_RUN) {
    report.skipped += 1;
    recordEvent({ url: safeUrl(url), reason, status: "skipped", detail: "max_per_run_reached" });
    return { ok: false, url, reason: "max_per_run_reached", source: "firecrawl" };
  }
  report.calls += 1;
  try {
    const result = await firecrawlScrape(url);
    report.successes += 1;
    recordEvent({ url: safeUrl(url), reason, status: "ok" });
    if (USE_CACHE) {
      const cache = await readCache();
      cache.entries[key] = result;
      await writeCache(cache);
    }
    return { ...result, source: "firecrawl" };
  } catch (error) {
    report.failures += 1;
    recordEvent({ url: safeUrl(url), reason, status: "failed", detail: error.message });
    return { ok: false, url, reason: error.message, source: "firecrawl" };
  }
}

export function getWebFetchReport() {
  return {
    ...report,
    updatedAt: new Date().toISOString()
  };
}

export async function writeWebFetchReport(filePath = REPORT_PATH) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(getWebFetchReport(), null, 2)}\n`);
}
