import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ALLOWED_SOURCE_TYPES = new Set(["topJournal", "reviewJournal", "professionalJournal"]);

function hasPublicFeed(source = {}) {
  return Boolean(source.feedUrl || (Array.isArray(source.feedUrls) && source.feedUrls.length));
}

function sanitizeItem(item = {}) {
  const sourceSignals = (item.sourceSignals || []).filter((signal) =>
    ALLOWED_SOURCE_TYPES.has(signal?.type)
  );
  if (!sourceSignals.length) return null;
  const sanitized = {
    ...item,
    sourceSignals,
    sourceType: sourceSignals.some((signal) => signal.type === "professionalJournal")
      ? "professional"
      : "comprehensive",
    sourceUrls: (item.sourceUrls || []).filter(
      (source) => !/mp\.weixin\.qq\.com|wechat|微信公众号/i.test(
        `${source?.url || ""} ${source?.label || ""}`
      )
    )
  };
  delete sanitized.localPrescreen;
  delete sanitized.paperMention;
  delete sanitized.wechatSource;
  delete sanitized.wechatArticle;
  return sanitized;
}

async function readJson(relativePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, relativePath), "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(relativePath, value) {
  await fs.writeFile(path.join(ROOT, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

const sources = (await readJson("config/sources.json", []))
  .filter((source) => ALLOWED_SOURCE_TYPES.has(source.type) && hasPublicFeed(source));
await writeJson("config/sources.json", sources);

const rssCandidates = (await readJson("data/rss-candidates.json", []))
  .map(sanitizeItem)
  .filter(Boolean);
await writeJson("data/rss-candidates.json", rssCandidates);

const candidates = (await readJson("data/candidates.json", rssCandidates))
  .map(sanitizeItem)
  .filter(Boolean);
await writeJson("data/candidates.json", candidates);

const latest = await readJson("data/latest.json", {});
const publicLatest = {
  ...latest,
  sourceMode: "public-journal-rss-only",
  items: (latest.items || []).map(sanitizeItem).filter(Boolean),
  dynamicItems: (latest.dynamicItems || []).map(sanitizeItem).filter(Boolean)
};
await writeJson("data/latest.json", publicLatest);
await fs.writeFile(
  path.join(ROOT, "data/latest.js"),
  `globalThis.PAPER_DAILY_LATEST = ${JSON.stringify(publicLatest, null, 2)};\n`
);

const candidateKeys = new Set(
  candidates
    .map((item) => String(item.doi || "").trim().toLowerCase())
    .filter(Boolean)
    .map((doi) => `doi:${doi}`)
);
const cache = await readJson("data/paper-cache.json", { version: "", updatedAt: "", items: {} });
const cacheItems = {};
for (const [key, entry] of Object.entries(cache.items || {})) {
  if (!candidateKeys.has(key)) continue;
  const item = entry.item ? sanitizeItem(entry.item) : null;
  if (entry.item && !item) continue;
  cacheItems[key] = item ? { ...entry, item } : entry;
}
await writeJson("data/paper-cache.json", { ...cache, items: cacheItems });

console.log(
  `Prepared public RSS-only data: ${sources.length} feeds, ${candidates.length} candidates, ${publicLatest.items.length} daily, ${publicLatest.dynamicItems.length} dynamic, ${Object.keys(cacheItems).length} cache entries.`
);
