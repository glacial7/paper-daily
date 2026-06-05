import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SOURCES = path.join(ROOT, "config", "sources.json");
const OUTPUT = path.join(ROOT, "data", "candidates.json");
const LOOKBACK_DAYS = Number(process.env.PAPER_DAILY_LOOKBACK_DAYS || 21);
const MAX_PER_SOURCE = Number(process.env.PAPER_DAILY_MAX_PER_SOURCE || 20);

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value = "") {
  return decodeEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function firstTag(block, names) {
  for (const name of names) {
    const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (match) return stripHtml(match[1]);
  }
  return "";
}

function firstAttr(block, tagName, attrName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*\\s${attrName}=["']([^"']+)["'][^>]*>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

function absoluteUrl(url, base) {
  if (!url) return "";
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "PaperDailyBot/0.1 (+https://github.com/glacial7/paper-daily)"
    }
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

function discoverFeed(html, pageUrl) {
  const linkMatches = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  for (const link of linkMatches) {
    const type = firstAttr(link, "link", "type").toLowerCase();
    const rel = firstAttr(link, "link", "rel").toLowerCase();
    if (!rel.includes("alternate")) continue;
    if (!type.includes("rss") && !type.includes("atom") && !type.includes("xml")) continue;
    return absoluteUrl(firstAttr(link, "link", "href"), pageUrl);
  }
  return "";
}

function parseFeed(xml, source) {
  const isAtom = /<entry[\s>]/i.test(xml);
  const blocks = isAtom
    ? [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0])
    : [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);

  return blocks.slice(0, MAX_PER_SOURCE).map((block, index) => {
    const title = firstTag(block, ["title"]);
    const link =
      firstTag(block, ["link"]) ||
      firstAttr(block, "link", "href") ||
      firstTag(block, ["guid", "id"]);
    const abstract = firstTag(block, ["description", "summary", "content:encoded", "content"]);
    const dateText = firstTag(block, ["pubDate", "published", "updated", "dc:date"]);
    const date = dateText ? new Date(dateText) : null;
    const doiMatch = `${title} ${abstract} ${link}`.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);

    return {
      id: `${source.id}-${index}-${Buffer.from(title || link).toString("base64url").slice(0, 12)}`,
      title,
      abstract,
      journal: source.name,
      type: inferType(title, abstract),
      doi: doiMatch ? doiMatch[0] : "",
      url: absoluteUrl(link, source.pageUrl || source.feedUrl),
      date: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "",
      sourceSignals: [
        {
          type: source.type,
          name: source.name,
          url: absoluteUrl(link, source.pageUrl || source.feedUrl)
        }
      ]
    };
  });
}

function inferType(title = "", abstract = "") {
  const text = `${title} ${abstract}`.toLowerCase();
  if (/review|综述/.test(text)) return "Review";
  if (/method|protocol|dataset|data descriptor|database|方法|数据/.test(text)) return "Methods";
  if (/perspective|comment|opinion|观点|评论/.test(text)) return "Perspective";
  if (/correspondence|letter|通讯|来信/.test(text)) return "Correspondence";
  if (/news|highlight|新闻/.test(text)) return "News";
  return "Article";
}

function isRecent(item) {
  if (!item.date) return true;
  const date = new Date(item.date);
  if (Number.isNaN(date.getTime())) return true;
  const ageMs = Date.now() - date.getTime();
  return ageMs <= LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
}

async function readSource(source) {
  if (!source.feedUrl && !source.pageUrl) return [];
  try {
    const feedUrl = source.feedUrl || discoverFeed(await fetchText(source.pageUrl), source.pageUrl);
    if (!feedUrl) {
      console.warn(`No feed discovered for ${source.name}`);
      return [];
    }
    const xml = await fetchText(feedUrl);
    return parseFeed(xml, { ...source, feedUrl }).filter((item) => item.title && isRecent(item));
  } catch (error) {
    console.warn(`Failed ${source.name}: ${error.message}`);
    return [];
  }
}

function mergeCandidates(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.doi
      ? `doi:${item.doi.toLowerCase()}`
      : `title:${item.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()}`;
    if (!map.has(key)) {
      map.set(key, item);
      continue;
    }
    const existing = map.get(key);
    existing.sourceSignals.push(...item.sourceSignals);
    existing.abstract ||= item.abstract;
    existing.doi ||= item.doi;
    existing.url ||= item.url;
  }
  return [...map.values()];
}

async function main() {
  const sources = JSON.parse(await fs.readFile(SOURCES, "utf8"));
  const enabled = sources.filter((source) => source.category !== "wechat" || source.feedUrl);
  const batches = await Promise.all(enabled.map(readSource));
  const candidates = mergeCandidates(batches.flat());
  await fs.writeFile(OUTPUT, `${JSON.stringify(candidates, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT} with ${candidates.length} candidate(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
