import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SOURCES = path.join(ROOT, "config", "sources.json");
const WECHAT_CANDIDATES = path.join(ROOT, "data", "wechat-candidates.json");
const OUTPUT = path.join(ROOT, "data", "candidates.json");
const LOOKBACK_DAYS = Number(process.env.PAPER_DAILY_LOOKBACK_DAYS || 5);
const MAX_PER_SOURCE = Number(process.env.PAPER_DAILY_MAX_PER_SOURCE || 20);

function decodeEntities(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
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

function allLinks(block) {
  const values = [];
  for (const match of block.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    values.push(decodeEntities(match[1]));
  }
  for (const match of block.matchAll(/<link[^>]*>([\s\S]*?)<\/link>/gi)) {
    values.push(stripHtml(match[1]));
  }
  return values.filter(Boolean);
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
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) PaperDailyBot/0.1"
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
    let title = firstTag(block, ["title"]);
    const links = allLinks(block);
    const abstract = firstTag(block, ["description", "summary", "content:encoded", "content"]);
    const typeText = firstTag(block, ["prism:aggregationType", "dc:type", "category", "media:category"]);
    const dateText = firstTag(block, ["pubDate", "published", "updated", "dc:date"]);
    const date = dateText ? new Date(dateText) : null;
    const doiMatch = `${title} ${abstract} ${links.join(" ")}`.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
    const doi = doiMatch ? doiMatch[0].replace(/[.,;)\]]+$/, "") : "";
    const needsTitleHydration = !title || title.trim().toLowerCase() === source.name.toLowerCase();
    if (needsTitleHydration) {
      title = inferTitleFromAbstract(abstract, source.name, doi) || title;
    }
    const link = chooseArticleLink(links, source, doi) || firstTag(block, ["guid", "id"]);
    const url = resolveArticleUrl(link, source, doi);
    const itemType = inferType(title, abstract, typeText, source, doi);
    const signalType = itemType === "News" && source.type === "topJournal" ? "natureScienceNews" : source.type;

    return {
      id: `${source.id}-${index}-${Buffer.from(title || link).toString("base64url").slice(0, 12)}`,
      title,
      abstract,
      journal: source.name,
      type: itemType,
      doi,
      url,
      date: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "",
      _needsTitleHydration: needsTitleHydration,
      sourceSignals: [
        {
          type: signalType,
          name: source.name,
          url
        }
      ]
    };
  });
}

function chooseArticleLink(links, source, doi = "") {
  const feedUrl = source.feedUrl || "";
  const normalizedFeed = feedUrl.replace(/\/$/, "");
  return (
    links.find((link) => /\/articles?\//i.test(link)) ||
    links.find((link) => doi && link.toLowerCase().includes(doi.toLowerCase())) ||
    links.find((link) => /^https?:\/\//i.test(link) && link.replace(/\/$/, "") !== normalizedFeed) ||
    links[0] ||
    ""
  );
}

function resolveArticleUrl(link, source, doi = "") {
  const url = absoluteUrl(link, source.pageUrl || source.feedUrl);
  const feedUrl = source.feedUrl || "";
  if (!url || url.replace(/\/$/, "") === feedUrl.replace(/\/$/, "")) {
    return doi ? `https://doi.org/${doi}` : url;
  }
  return url;
}

function inferTitleFromAbstract(abstract = "", journal = "", doi = "") {
  let text = stripHtml(abstract);
  if (journal) text = text.replace(new RegExp(`^${journal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*,?\\s*`, "i"), "");
  text = text.replace(/^Published online:\s*[^;]+;\s*/i, "");
  if (doi) text = text.replace(new RegExp(`doi:?\\s*${doi.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "");
  const sentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  if (sentence.length > 12 && sentence.length < 220) return sentence.trim();
  return text.length > 12 ? text.slice(0, 160).replace(/\s+\S*$/, "").trim() : "";
}

function cleanMetaTitle(value = "", sourceName = "") {
  let title = stripHtml(value)
    .replace(/\s*\|\s*Nature Portfolio\s*$/i, "")
    .replace(/\s*-\s*Nature\s*$/i, "")
    .replace(/\s*\|\s*Science\s*$/i, "")
    .trim();
  if (sourceName) {
    title = title.replace(new RegExp(`\\s*[|–-]\\s*${sourceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"), "");
  }
  return title.trim();
}

function metaContent(html, names) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const attrFirst = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=(["'])([\\s\\S]*?)\\1[^>]*>`, "i"));
    if (attrFirst) return decodeEntities(attrFirst[2]);
    const contentFirst = html.match(new RegExp(`<meta[^>]+content=(["'])([\\s\\S]*?)\\1[^>]+(?:name|property)=["']${escaped}["'][^>]*>`, "i"));
    if (contentFirst) return decodeEntities(contentFirst[2]);
  }
  return "";
}

function titleFromHtml(html, sourceName = "") {
  const metaTitle = metaContent(html, ["citation_title", "dc.title", "og:title", "twitter:title"]);
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
  const title = cleanMetaTitle(metaTitle || titleTag, sourceName);
  if (/client challenge|access denied|just a moment|forbidden/i.test(title)) return "";
  return title && title.toLowerCase() !== sourceName.toLowerCase() ? title : "";
}

function typeFromHtml(html) {
  return metaContent(html, [
    "citation_article_type",
    "dc.type",
    "prism.aggregationType",
    "article:section",
    "og:type"
  ]);
}

function typeFromCrossref(value = "") {
  const type = value.toLowerCase();
  if (type.includes("review")) return "Review";
  if (type.includes("dataset")) return "Dataset";
  if (type.includes("posted-content")) return "Article";
  if (type.includes("journal-article")) return "Article";
  if (type.includes("editorial")) return "Editorial";
  return "";
}

async function metadataFromDoi(doi = "") {
  if (!doi) return {};
  try {
    const text = await fetchText(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    const data = JSON.parse(text);
    const message = data.message || {};
    return {
      title: cleanMetaTitle(message.title?.[0] || ""),
      type: typeFromCrossref(message.type || "")
    };
  } catch {
    return {};
  }
}

function isSuspiciousTitle(item, source) {
  const title = (item.title || "").trim().toLowerCase();
  const sourceName = (source.name || "").trim().toLowerCase();
  return !title || title === sourceName || title.length < 8;
}

async function hydrateSuspiciousItems(items, source) {
  return Promise.all(
    items.map(async (item) => {
      const { _needsTitleHydration, ...cleanItem } = item;
      if (!_needsTitleHydration && !isSuspiciousTitle(item, source)) return cleanItem;
      if (!item.url || item.url === "#") return cleanItem;
      try {
        const html = await fetchText(item.url);
        const pageTitle = titleFromHtml(html, source.name);
        const htmlType = typeFromHtml(html);
        const doiMeta = pageTitle ? {} : await metadataFromDoi(item.doi);
        const title = pageTitle || doiMeta.title;
        return {
          ...cleanItem,
          title: title || inferTitleFromAbstract(item.abstract, source.name, item.doi) || item.title,
          type: doiMeta.type || inferType(title || item.title, item.abstract, htmlType, source, item.doi)
        };
      } catch {
        const doiMeta = await metadataFromDoi(item.doi);
        return {
          ...cleanItem,
          title: doiMeta.title || inferTitleFromAbstract(item.abstract, source.name, item.doi) || item.title,
          type: doiMeta.type || cleanItem.type
        };
      }
    })
  );
}

function inferType(title = "", abstract = "", typeText = "", source = {}, doi = "") {
  const text = `${typeText} ${title} ${abstract}`.toLowerCase();
  if (source.category === "news") return "News";
  if (/^10\.1038\/d41586/i.test(doi)) return "News";
  if (/systematic review|meta[- ]analysis|meta analysis|系统综述|荟萃/.test(text)) return "SystematicReview";
  if (/\breview\b|reviews|综述/.test(text)) return "Review";
  if (/research article|original article|article type article|研究论文|原创研究/.test(text)) return "ResearchArticle";
  if (/data descriptor|data paper|dataset|database|resource|software|数据论文|数据集|数据库|资源|软件/.test(text)) return "Dataset";
  if (/method|methods|protocol|方法|实验方案/.test(text)) return "Methods";
  if (/news\s*&\s*views|news and views/.test(text)) return "NewsAndViews";
  if (/research highlight|highlight|研究亮点/.test(text)) return "ResearchHighlight";
  if (/perspective|viewpoint|opinion|观点/.test(text)) return "Perspective";
  if (/commentary|comment|评论/.test(text)) return "Comment";
  if (/correspondence|通讯|通信|来信/.test(text)) return "Correspondence";
  if (/\bletter\b|letters|信件/.test(text)) return "Letter";
  if (/editorial|社论/.test(text)) return "Editorial";
  if (/news|新闻/.test(text)) return "News";
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
    const parsed = parseFeed(xml, { ...source, feedUrl }).filter((item) => item.title && isRecent(item));
    return hydrateSuspiciousItems(parsed, { ...source, feedUrl });
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
  const localWechat = await readLocalWechatCandidates();
  const candidates = mergeCandidates([...batches.flat(), ...localWechat]);
  await fs.writeFile(OUTPUT, `${JSON.stringify(candidates, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT} with ${candidates.length} candidate(s), including ${localWechat.length} local WeChat candidate(s).`);
}

async function readLocalWechatCandidates() {
  try {
    const data = JSON.parse(await fs.readFile(WECHAT_CANDIDATES, "utf8"));
    const items = Array.isArray(data) ? data : data.items || [];
    return items.filter((item) => item && item.title && isRecent(item));
  } catch {
    return [];
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
