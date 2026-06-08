import fs from "node:fs/promises";
import path from "node:path";
import { loadLocalEnv } from "./local-env.mjs";

const ROOT = process.cwd();
await loadLocalEnv(ROOT);

const OUTPUT = path.join(ROOT, "data", "wechat-candidates.json");
const REPORT = path.join(ROOT, "data", "wechat-api-sync-report.json");

const BASE_URL = (process.env.WERSS_BASE_URL || "http://127.0.0.1:8001").replace(/\/$/, "");
const USERNAME = process.env.WERSS_USERNAME || "";
const PASSWORD = process.env.WERSS_PASSWORD || "";
const TOKEN = process.env.WERSS_TOKEN || "";
const ACCESS_KEY = process.env.WERSS_ACCESS_KEY || "";
const SECRET_KEY = process.env.WERSS_SECRET_KEY || "";
const LOOKBACK_DAYS = Number(process.env.PAPER_DAILY_LOOKBACK_DAYS || 5);
const MAX_PER_SOURCE = Number(process.env.PAPER_DAILY_MAX_PER_SOURCE || 30);
const MAX_ARTICLES = Number(process.env.PAPER_DAILY_WECHAT_MAX_ARTICLES || 500);
const MAX_TEXT_CHARS = Number(process.env.PAPER_DAILY_WECHAT_TEXT_CHARS || 6000);
const UPDATE_MPS = !process.argv.includes("--no-update");
const START_PAGE = Number(process.env.WERSS_UPDATE_START_PAGE || 0);
const END_PAGE = Number(process.env.WERSS_UPDATE_END_PAGE || 1);
const UPDATE_SLEEP_MS = Number(process.env.WERSS_UPDATE_SLEEP_MS || 800);
const POST_UPDATE_WAIT_MS = Number(process.env.WERSS_POST_UPDATE_WAIT_MS || 5000);

function usage() {
  console.log(`Usage:
  node scripts/sync-wechat-api.mjs [--no-update]

Required in .env.local:
  WERSS_BASE_URL=http://127.0.0.1:8001
  WERSS_USERNAME=admin
  WERSS_PASSWORD=your_we_mprss_password

Optional:
  WERSS_TOKEN=existing_bearer_token
  WERSS_ACCESS_KEY=...
  WERSS_SECRET_KEY=...
`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeEntities(value = "") {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripHtml(value = "") {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function compactText(value = "") {
  return stripHtml(value)
    .replace(/图片|点击蓝字关注我们|欢迎关注|免责声明|END\s*$/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value = "", maxChars = MAX_TEXT_CHARS) {
  const text = String(value || "").trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trim()}...`;
}

function mergeDescriptionAndBody(description = "", body = "") {
  if (!description) return body;
  if (!body) return description;
  if (body.includes(description) || body.slice(0, 300).includes(description.slice(0, 80))) return body;
  if (description.includes(body)) return description;
  return `${description}\n\n${body}`;
}

function inferType(title = "", abstract = "") {
  const text = `${title} ${abstract}`.toLowerCase();
  if (/systematic review|meta[- ]analysis|系统综述|荟萃/.test(text)) return "SystematicReview";
  if (/review|综述/.test(text)) return "Review";
  if (/data descriptor|dataset|database|resource|software|数据论文|数据集|数据库|资源|软件/.test(text)) return "Dataset";
  if (/method|protocol|方法|实验方案/.test(text)) return "Methods";
  if (/spotlight|聚焦/.test(text)) return "Spotlight";
  if (/\bforum\b|\bessay\b|论坛|随笔/.test(text)) return "Forum";
  if (/perspective|viewpoint|opinion|观点/.test(text)) return "Perspective";
  if (/commentary|comment|评论/.test(text)) return "Comment";
  if (/correspondence|letter|通讯|来信|信件/.test(text)) return "Correspondence";
  if (/news\s*&\s*views|news and views/.test(text)) return "NewsAndViews";
  if (/research highlight|研究亮点/.test(text)) return "ResearchHighlight";
  return "News";
}

function toIsoDate(value) {
  if (!value) return "";
  if (typeof value === "number" || /^\d+$/.test(String(value))) {
    const number = Number(value);
    const date = new Date(number > 10_000_000_000 ? number : number * 1000);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function publishTimeMs(article) {
  const value = article.publish_time || article.publishTime || article.created_at || article.updated_at;
  if (!value) return 0;
  if (typeof value === "number" || /^\d+$/.test(String(value))) {
    const number = Number(value);
    return number > 10_000_000_000 ? number : number * 1000;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function isRecent(article) {
  const ms = publishTimeMs(article);
  if (!ms) return true;
  return Date.now() - ms <= LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
}

function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["data", "items", "list", "records", "results"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const nested = extractItems(value);
      if (nested.length) return nested;
    }
  }
  return [];
}

function articleId(article) {
  return article.id || article.article_id || article.doc_id || article.content_id || "";
}

function mpId(mp) {
  return mp.id || mp.mp_id || mp.feed_id || "";
}

function mpName(mp) {
  return mp.mp_name || mp.name || mp.title || "";
}

async function request(pathname, { method = "GET", token = "", query = {}, body = null } = {}) {
  const url = new URL(`${BASE_URL}${pathname}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (ACCESS_KEY) headers["X-Access-Key"] = ACCESS_KEY;
  if (SECRET_KEY) headers["X-Secret-Key"] = SECRET_KEY;
  const options = { method, headers };
  if (body) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${url.pathname} failed: ${response.status} ${text.slice(0, 300)}`);
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function login() {
  if (TOKEN) return TOKEN;
  if (!USERNAME || !PASSWORD) {
    throw new Error("Missing WERSS_USERNAME/WERSS_PASSWORD in .env.local. API sync needs them to get a Bearer token.");
  }
  const params = new URLSearchParams();
  params.set("username", USERNAME);
  params.set("password", PASSWORD);
  params.set("grant_type", "password");
  if (ACCESS_KEY) params.set("client_id", ACCESS_KEY);
  if (SECRET_KEY) params.set("client_secret", SECRET_KEY);
  const response = await fetch(`${BASE_URL}/api/v1/wx/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: params
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Login failed: ${response.status} ${text.slice(0, 300)}`);
  const data = JSON.parse(text);
  const token = data.access_token || data.token || data.data?.access_token || "";
  if (!token) throw new Error(`Login response did not include access_token: ${text.slice(0, 300)}`);
  return token;
}

async function fetchMps(token) {
  const all = [];
  for (let offset = 0; offset < 10000; offset += 100) {
    const data = await request("/api/v1/wx/mps", {
      token,
      query: { limit: 100, offset, status: 1 }
    });
    const items = extractItems(data);
    all.push(...items);
    if (items.length < 100) break;
  }
  return all.filter((mp) => mpId(mp));
}

async function updateMps(token, mps) {
  const results = [];
  if (!UPDATE_MPS) return results;
  for (const [index, mp] of mps.entries()) {
    const id = mpId(mp);
    const name = mpName(mp) || id;
    try {
      console.log(`[${index + 1}/${mps.length}] 更新公众号：${name}`);
      const result = await request(`/api/v1/wx/mps/update/${encodeURIComponent(id)}`, {
        token,
        query: { start_page: START_PAGE, end_page: END_PAGE }
      });
      results.push({ id, name, status: "updated", result });
      await sleep(UPDATE_SLEEP_MS);
    } catch (error) {
      console.warn(`[${index + 1}/${mps.length}] 更新失败：${name} · ${error.message}`);
      results.push({ id, name, status: "failed", error: error.message });
    }
  }
  return results;
}

async function fetchArticles(token) {
  const all = [];
  for (let offset = 0; offset < MAX_ARTICLES; offset += 100) {
    const data = await request("/api/v1/wx/articles", {
      token,
      query: { limit: 100, offset }
    });
    const items = extractItems(data);
    if (!items.length) break;
    const recent = items.filter(isRecent);
    all.push(...recent);
    const oldest = items[items.length - 1];
    if (items.length < 100 || (publishTimeMs(oldest) && !isRecent(oldest))) break;
  }
  return all.slice(0, MAX_ARTICLES);
}

async function fetchArticleDetail(token, article) {
  const id = articleId(article);
  if (!id) return article;
  try {
    const detail = await request(`/api/v1/wx/articles/${encodeURIComponent(id)}`, {
      token,
      query: { content: true }
    });
    const item = detail.data && typeof detail.data === "object" ? detail.data : detail;
    return { ...article, ...item };
  } catch (error) {
    console.warn(`文章详情失败：${article.title || id} · ${error.message}`);
    return article;
  }
}

function toCandidate(article, mpsById) {
  const id = articleId(article);
  const mp = mpsById.get(article.mp_id) || {};
  const name = article.mp_name || mpName(mp) || article.account_name || "微信公众号";
  const title = decodeEntities(article.title || "");
  const description = compactText(article.description || article.summary || "");
  const contentText = compactText(article.content || "");
  const htmlText = compactText(article.content_html || article.contentHtml || article.html || "");
  const body = contentText.length >= htmlText.length ? contentText : htmlText;
  const abstract = truncateText(mergeDescriptionAndBody(description, body));
  const doiMatch = `${title} ${abstract} ${article.url || ""}`.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  const doi = doiMatch ? doiMatch[0].replace(/[.,;)\]]+$/, "") : "";
  return {
    id: `wechat-${id || Buffer.from(`${name}-${title}`).toString("base64url").slice(0, 20)}`,
    title,
    abstract,
    journal: name,
    type: inferType(title, abstract),
    doi,
    url: article.url || "",
    date: toIsoDate(article.publish_time || article.publishTime || article.created_at || article.updated_at),
    wechatTextStatus: {
      hasContent: Boolean(article.has_content || body.length),
      descriptionChars: description.length,
      bodyChars: body.length,
      bodySource: contentText.length >= htmlText.length ? "content" : "content_html",
      usedChars: abstract.length,
      apiDetail: true
    },
    sourceSignals: [
      {
        type: "wechat",
        name,
        url: article.url || ""
      }
    ]
  };
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    usage();
    return;
  }
  const token = await login();
  const mps = await fetchMps(token);
  console.log(`找到 ${mps.length} 个启用公众号。`);
  const updateResults = await updateMps(token, mps);
  if (UPDATE_MPS && updateResults.length && POST_UPDATE_WAIT_MS > 0) {
    console.log(`公众号更新请求已发出，等待 ${POST_UPDATE_WAIT_MS}ms 后读取文章列表...`);
    await sleep(POST_UPDATE_WAIT_MS);
  }
  const articles = await fetchArticles(token);
  console.log(`找到 ${articles.length} 篇近 ${LOOKBACK_DAYS} 日文章，开始补详情。`);
  const detailArticles = [];
  for (const [index, article] of articles.entries()) {
    console.log(`[${index + 1}/${articles.length}] 文章详情：${article.title || articleId(article)}`);
    detailArticles.push(await fetchArticleDetail(token, article));
    await sleep(120);
  }
  const mpsById = new Map(mps.map((mp) => [mpId(mp), mp]));
  const counts = new Map();
  const candidates = [];
  for (const article of detailArticles) {
    const key = article.mp_id || "unknown";
    if ((counts.get(key) || 0) >= MAX_PER_SOURCE) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
    const candidate = toCandidate(article, mpsById);
    if (candidate.title && candidate.url) candidates.push(candidate);
  }
  const output = {
    generatedAt: new Date().toISOString(),
    source: "local-we-mp-rss-api",
    items: candidates
  };
  await fs.writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(
    REPORT,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        lookbackDays: LOOKBACK_DAYS,
        updateMps: UPDATE_MPS,
        mps: mps.length,
        articles: articles.length,
        candidates: candidates.length,
        updateResults
      },
      null,
      2
    )}\n`
  );
  console.log(`Wrote ${OUTPUT} with ${candidates.length} WeChat candidate(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
