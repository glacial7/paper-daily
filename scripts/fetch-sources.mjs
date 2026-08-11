import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchReadablePage, getWebFetchReport, writeWebFetchReport } from "./web-fetcher.mjs";

const ROOT = process.cwd();
const SOURCES = path.join(ROOT, "config", "sources.json");
const RSS_HISTORY = process.env.PAPER_DAILY_RSS_HISTORY
  ? path.resolve(ROOT, process.env.PAPER_DAILY_RSS_HISTORY)
  : path.join(ROOT, "data", "rss-history.json");
const OUTPUT = process.env.PAPER_DAILY_CANDIDATES_OUTPUT
  ? path.resolve(ROOT, process.env.PAPER_DAILY_CANDIDATES_OUTPUT)
  : path.join(ROOT, "data", "candidates.json");
const REPORT = process.env.PAPER_DAILY_FETCH_REPORT
  ? path.resolve(ROOT, process.env.PAPER_DAILY_FETCH_REPORT)
  : OUTPUT.endsWith("rss-candidates.json")
    ? path.join(ROOT, "data", "rss-fetch-report.json")
    : path.join(ROOT, "data", "source-merge-report.json");
const RSS_CANDIDATES_INPUT = process.env.PAPER_DAILY_RSS_CANDIDATES_INPUT
  ? path.resolve(ROOT, process.env.PAPER_DAILY_RSS_CANDIDATES_INPUT)
  : "";
const STRICT_JOURNAL_RSS = process.env.PAPER_DAILY_STRICT_JOURNAL_RSS === "1";
const JOURNAL_RSS_SOURCE_TYPES = new Set(["topJournal", "reviewJournal", "professionalJournal"]);
const MAX_LOOKBACK_DAYS = 14;
const CROSSREF_WINDOW_DAYS = 15;
const MAX_CROSSREF_WINDOW_DAYS = 15;
const LOOKBACK_DAYS = normalizeLookbackDays(process.env.PAPER_DAILY_LOOKBACK_DAYS);
const RSS_HISTORY_DAYS = normalizeLookbackDays(process.env.PAPER_DAILY_RSS_HISTORY_DAYS || MAX_LOOKBACK_DAYS);
const MAX_PER_SOURCE = Number(process.env.PAPER_DAILY_MAX_PER_SOURCE || 20);
const METADATA_HYDRATION_CONCURRENCY = Number(process.env.PAPER_DAILY_METADATA_HYDRATION_CONCURRENCY || 3);
const SOURCE_FETCH_CONCURRENCY = normalizeBoundedInteger(process.env.PAPER_DAILY_SOURCE_FETCH_CONCURRENCY, 6, 12);
const HYDRATE_MISSING_RSS_DOI = process.env.PAPER_DAILY_RSS_HYDRATE_DOI !== "0";
const COMPACT_LOG = process.env.PAPER_DAILY_COMPACT_LOG === "1";
const sourceReports = [];

function normalizeLookbackDays(value) {
  const days = Number(value || MAX_LOOKBACK_DAYS);
  if (!Number.isFinite(days) || days <= 0) return MAX_LOOKBACK_DAYS;
  return Math.min(MAX_LOOKBACK_DAYS, Math.max(1, Math.round(days)));
}

function normalizeBoundedInteger(value, fallback, max) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(max, Math.max(1, Math.round(number)));
}

function crossrefWindowDaysForSource(source = {}) {
  if (source.crossrefWindowDays) {
    return normalizeBoundedInteger(source.crossrefWindowDays, CROSSREF_WINDOW_DAYS, MAX_CROSSREF_WINDOW_DAYS);
  }
  if (process.env.PAPER_DAILY_CROSSREF_WINDOW_DAYS) {
    return normalizeBoundedInteger(process.env.PAPER_DAILY_CROSSREF_WINDOW_DAYS, CROSSREF_WINDOW_DAYS, MAX_CROSSREF_WINDOW_DAYS);
  }
  return CROSSREF_WINDOW_DAYS;
}

function crossrefRowsForSource(source = {}) {
  if (source.crossrefRows) return normalizeBoundedInteger(source.crossrefRows, 50, 300);
  if (process.env.PAPER_DAILY_CROSSREF_ROWS) return normalizeBoundedInteger(process.env.PAPER_DAILY_CROSSREF_ROWS, 50, 300);
  if (source.category === "comprehensive" || source.type === "topJournal") return 100;
  if (source.type === "reviewJournal") return 80;
  return 50;
}

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

function allTags(block, names) {
  const values = [];
  for (const name of names) {
    const pattern = new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "gi");
    for (const match of block.matchAll(pattern)) {
      const value = stripHtml(match[1]);
      if (value) values.push(value);
    }
  }
  return values;
}

function normalizeAuthorList(authors = []) {
  if (authors.length === 1 && /,\s+/.test(authors[0]) && !/^[^,]+,\s*[A-Z]/.test(authors[0])) {
    return authors[0].split(/,\s*/).map((item) => item.trim()).filter(Boolean);
  }
  return authors.map((item) => item.trim()).filter(Boolean);
}

function authorsFromText(text = "") {
  const match = text.match(/Author\(s\):\s*([\s\S]+)$/i);
  if (!match) return [];
  return match[1]
    .replace(/\s+/g, " ")
    .split(/,\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
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

function normalizeDoi(value = "") {
  const match = String(value || "").match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  return match ? match[0].replace(/[.,;)\]\s]+$/, "").toLowerCase() : "";
}

function doiMatches(value = "") {
  const values = [];
  for (const match of String(value || "").matchAll(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi)) {
    const doi = normalizeDoi(match[0]);
    if (doi && !values.includes(doi)) values.push(doi);
  }
  return values;
}

function doiFromFeedBlock(block = "", title = "", abstract = "", links = []) {
  const explicitValues = [
    firstTag(block, ["prism:doi", "doi", "dc:identifier", "dc:source", "article:doi", "id", "guid"]),
    firstAttr(block, "guid", "isPermaLink") === "false" ? firstTag(block, ["guid"]) : "",
    ...allTags(block, ["prism:doi", "doi", "dc:identifier", "identifier", "id", "guid"])
  ];
  const explicit = doiMatches(explicitValues.join("\n")).find(Boolean);
  if (explicit) return explicit;
  return doiMatches([title, abstract, links.join("\n"), block].filter(Boolean).join("\n"))[0] || "";
}

function isNewsPageDoi(doi = "", item = {}) {
  const normalized = normalizeDoi(doi);
  const pageDoi = normalizeDoi(item.pageDoi || item.doi || "");
  return !normalized || Boolean(pageDoi && normalized === pageDoi);
}

function absoluteUrl(url, base) {
  if (!url) return "";
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) PaperDailyBot/0.1"
        }
      });
      if (!response.ok) {
        const retryAfter = Number(response.headers.get("retry-after") || 0);
        const error = new Error(`${response.status} ${response.statusText}`);
        error.retryAfterMs = retryAfter > 0 ? retryAfter * 1000 : response.status === 429 ? 1600 * (attempt + 1) : 0;
        throw error;
      }
      return response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 2) await sleep(error.retryAfterMs || 350 * (attempt + 1));
    }
  }
  throw lastError;
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
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
    : [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((match) => match[0]);

  return blocks.slice(0, MAX_PER_SOURCE).map((block, index) => {
    let title = firstTag(block, ["title"]);
    const links = allLinks(block);
    const abstract = firstTag(block, ["description", "summary", "content:encoded", "content"]);
    const authors = normalizeAuthorList(allTags(block, ["dc:creator", "author", "name", "creator"]));
    const typeText = allTags(block, ["prism:aggregationType", "dc:type", "category", "media:category"]).join(" ");
    const dateText = firstTag(block, ["pubDate", "published", "updated", "dc:date"]);
    const date = dateText ? new Date(dateText) : null;
    const dateIsValid = date && !Number.isNaN(date.getTime());
    const doi = doiFromFeedBlock(block, title, abstract, links);
    const needsTitleHydration = !title || title.trim().toLowerCase() === source.name.toLowerCase();
    if (needsTitleHydration) {
      title = inferTitleFromAbstract(abstract, source.name, doi) || title;
    }
    const link = chooseArticleLink(links, source, doi) || firstTag(block, ["guid", "id"]);
    const url = resolveArticleUrl(link, source, doi);
    const itemType = inferType(title, abstract, typeText, source, doi);
    const signalType = sourceSignalTypeForItem(itemType, source);
    const signalName = sourceSignalNameForItem(itemType, source);

    return {
      id: `${source.id}-${index}-${Buffer.from(title || link).toString("base64url").slice(0, 12)}`,
      title,
      abstract,
      authors: authors.length ? authors : authorsFromText(abstract),
      journal: journalNameForFeedItem(itemType, source),
      type: itemType,
      doi,
      url,
      date: dateIsValid ? date.toISOString().slice(0, 10) : "",
      publishedAt: dateIsValid ? date.toISOString() : "",
      _needsTitleHydration: needsTitleHydration,
      sourceSignals: [
        {
          type: signalType,
          name: signalName,
          url
        }
      ]
    };
  });
}

function isNatureSource(source = {}) {
  return String(source.name || "").trim().toLowerCase() === "nature";
}

function natureColumnType(type = "") {
  const text = String(type || "").toLowerCase().replace(/[\s_-]+/g, "");
  return /news|editorial|researchbriefing|newsandviews|researchhighlight|newsfeature|worldview|indepth|career|booksandculture|podcast|video|comment|commentary|correspondence|perspective|opinion|forum|spotlight/.test(text);
}

function shouldHydrateNatureType(item = {}, source = {}) {
  return isNatureSource(source);
}

function sourceSignalTypeForItem(itemType = "", source = {}) {
  if (source.category === "news") return source.type || "natureScienceNews";
  if (isNatureSource(source) && natureColumnType(itemType)) return "natureScienceNews";
  return source.type;
}

function sourceSignalNameForItem(itemType = "", source = {}) {
  if (!isNatureSource(source) || !natureColumnType(itemType)) return source.name;
  const type = displayNatureType(itemType);
  return type ? `Nature ${type}` : "Nature News";
}

function journalNameForFeedItem(itemType = "", source = {}) {
  const signalType = sourceSignalTypeForItem(itemType, source);
  return signalType === source.type ? source.name : sourceSignalNameForItem(itemType, source);
}

function displayNatureType(itemType = "") {
  const compact = String(itemType || "").toLowerCase().replace(/[\s_-]+/g, "");
  if (compact.includes("researchbriefing")) return "Research Briefing";
  if (compact.includes("newsandviews")) return "News & Views";
  if (compact.includes("researchhighlight")) return "Research Highlight";
  if (compact.includes("newsfeature")) return "News Feature";
  if (compact.includes("worldview")) return "World View";
  if (compact.includes("indepth")) return "In Depth";
  if (compact.includes("editorial")) return "Editorial";
  if (compact.includes("correspondence")) return "Correspondence";
  if (compact.includes("commentary") || compact.includes("comment")) return "Comment";
  if (compact.includes("perspective")) return "Perspective";
  if (compact.includes("career")) return "Career";
  if (compact.includes("booksandculture")) return "Books & Culture";
  if (compact.includes("podcast")) return "Podcast";
  if (compact.includes("video")) return "Video";
  if (compact.includes("news")) return "News";
  return "";
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

function doiFromHtml(html = "", item = {}) {
  const metaDoi = metaContent(html, [
    "citation_doi",
    "dc.identifier",
    "dc.Identifier",
    "prism.doi",
    "doi",
    "bepress_citation_doi"
  ]);
  const candidates = [
    metaDoi,
    ...doiMatches(html),
    ...doiMatches(`${item.title || ""} ${item.abstract || ""} ${item.url || ""}`)
  ].filter((doi) => doi && !isNewsPageDoi(doi, item));
  return candidates[0] || "";
}

function textFromHtml(html = "") {
  return stripHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
  );
}

function pageTextFromReadable(readable = {}) {
  const metadata = readable.metadata || {};
  return [
    readable.html || "",
    readable.markdown || "",
    metadata.title || "",
    metadata.description || "",
    metadata.ogDescription || ""
  ]
    .filter(Boolean)
    .join("\n");
}

function mergeReadablePageText(html = "", readable = {}) {
  return [html, pageTextFromReadable(readable)].filter(Boolean).join("\n");
}

function compactText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function firstSentences(value = "", maxLength = 900) {
  const text = compactText(value);
  if (!text) return "";
  const sentences = text.split(/(?<=[.!?。！？])\s+/).filter(Boolean);
  let output = "";
  for (const sentence of sentences) {
    const next = output ? `${output} ${sentence}` : sentence;
    if (next.length > maxLength && output) break;
    output = next;
    if (output.length >= Math.min(260, maxLength)) break;
  }
  return output || text.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
}

function newsSummaryFromHtml(html = "", fallback = "") {
  const metaSummary = metaContent(html, ["description", "dc.description", "og:description", "twitter:description"]);
  const text = textFromHtml(html);
  const scienceDailySummary =
    text.match(/Summary:\s*([\s\S]*?)(?:Share:|FULL STORY|\* \* \*)/i)?.[1] ||
    text.match(/FULL STORY\s*([\s\S]*?)(?:Story Source:|Journal Reference:|RELATED TOPICS|$)/i)?.[1] ||
    "";
  const natureLead =
    text.match(/#\s*[^#]+?\s+([\s\S]*?)(?:By\s+|Access options|References|## Access options|$)/i)?.[1] || "";
  return firstSentences(scienceDailySummary || metaSummary || natureLead || fallback, 900);
}

function referenceSectionFromText(text = "") {
  return (
    text.match(/Journal Reference:\s*(?:1\.\s*)?([\s\S]*?)(?:Cite This Page:|Explore More|RELATED STORIES|$)/i)?.[1] ||
    text.match(/References\s*(?:1\.\s*)?([\s\S]*?)(?:Download references|Related Articles|Subjects|Latest on:|$)/i)?.[1] ||
    ""
  );
}

function referenceTitleJournal(section = "") {
  const beforeDoi = compactText(section.replace(/\bDOI:\s*10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi, ""));
  const parts = beforeDoi
    .split(/\.\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return {};
  const journalPart = parts[parts.length - 1].replace(/\s*(?:Article|Google Scholar|PubMed).*$/i, "");
  const journal = journalPart.match(/^([^,;]+)(?:,|;|\s+\d{4}\b)/)?.[1]?.trim() || "";
  const title = parts[parts.length - 2]?.trim() || "";
  return {
    title: title && title.length > 18 ? title : "",
    journal: journal && journal.length > 2 ? journal : ""
  };
}

function extractNewsReferenceMetadata(html = "", item = {}) {
  const text = textFromHtml(html);
  const section = referenceSectionFromText(text);
  const pageDoi = normalizeDoi(item.doi || metaContent(html, [
    "citation_doi",
    "dc.identifier",
    "dc.Identifier",
    "prism.doi",
    "doi"
  ]));
  const itemWithPageDoi = { ...item, pageDoi };
  const doiPool = section ? doiMatches(section) : [];
  if (!doiPool.length) {
    doiPool.push(...doiMatches(html).filter((doi) => !isNewsPageDoi(doi, itemWithPageDoi)));
  }
  const doi = doiPool.find((candidate) => !isNewsPageDoi(candidate, itemWithPageDoi)) || "";
  if (!doi) return null;
  const reference = referenceTitleJournal(section);
  return {
    doi,
    title: reference.title,
    journal: reference.journal,
    citation: compactText(section).slice(0, 500),
    source: section ? "reference-section" : "doi-link"
  };
}

function titleFromHtml(html, sourceName = "") {
  const metaTitle = metaContent(html, ["citation_title", "dc.title", "og:title", "twitter:title"]);
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
  const h1 =
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ||
    html.match(/^\s*#\s+(.+)$/m)?.[1] ||
    "";
  const title = cleanMetaTitle(metaTitle || titleTag || h1, sourceName);
  if (/client challenge|access denied|just a moment|forbidden/i.test(title)) return "";
  return title && title.toLowerCase() !== sourceName.toLowerCase() ? title : "";
}

function typeFromHtml(html) {
  const metaType = metaContent(html, [
    "citation_article_type",
    "dc.type",
    "prism.aggregationType",
    "prism.section",
    "article:section",
    "WT.cg_s",
    "WT.z_cg_type",
    "og:type"
  ]);
  if (metaType && metaType.toLowerCase() !== "article") return metaType;
  const visibleType =
    html
      .match(/data-test=["']article-category["'][\s\S]*?<span[^>]*class=["'][^"']*c-article-identifiers__type[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ||
    html
      .match(/class=["'][^"']*c-article-identifiers__type[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ||
    html
      .match(/data-test=["']article-type["'][^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1] ||
    html
      .match(/(?:content-type|article-type)["'][^>]*>\s*([A-Za-z][A-Za-z &-]{2,50})\s*</i)?.[1] ||
    "";
  const visibleTextType =
    textFromHtml(html)
      .match(/\b(Research Article|Review Article|Review|Research Briefing|News & Views|Research Highlight|News Feature|World View|In Depth|Perspective|Comment|Correspondence|Editorial|News|Letter)\b/i)?.[1] ||
    "";
  return stripHtml(visibleType) || visibleTextType || metaType;
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

function authorsFromCrossref(authors = []) {
  return authors
    .map((author) => {
      const family = author.family || "";
      const given = author.given || "";
      const name = [family, given].filter(Boolean).join(", ");
      return name || author.name || "";
    })
    .filter(Boolean);
}

function datePartsToIso(parts = []) {
  const first = Array.isArray(parts?.[0]) ? parts[0] : parts;
  if (!Array.isArray(first) || !first[0]) return "";
  const [year, month = 1, day = 1] = first;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function crossrefDateInfo(work = {}) {
  const candidates = [
    ["published-online", work["published-online"]?.["date-parts"]],
    ["published", work.published?.["date-parts"]],
    ["published-print", work["published-print"]?.["date-parts"]],
    ["issued", work.issued?.["date-parts"]],
    ["created", work.created?.["date-parts"]]
  ];
  for (const [source, parts] of candidates) {
    const date = datePartsToIso(parts);
    if (date) return { date, source };
  }
  return { date: "", source: "" };
}

function crossrefDate(work = {}) {
  return crossrefDateInfo(work).date;
}

function isThinRssAbstract(value = "") {
  const text = compactText(stripHtml(value));
  if (!text) return true;
  if (text.length < 90) return true;
  if (/^Science,\s+(Ahead of Print|Volume\s+\d+)/i.test(text)) return true;
  if (/^Proceedings of the National Academy of Sciences,\s+Volume\s+\d+/i.test(text)) return true;
  if (/^Published online:\s*[^.;]+[.;]?\s*$/i.test(text)) return true;
  return false;
}

function preferOnlineDateFields(item = {}, doiMeta = {}) {
  if (!doiMeta.date || doiMeta.dateSource !== "published-online") return {};
  return {
    date: doiMeta.date,
    publishedAt: item.publishedAt && item.publishedAt.startsWith(doiMeta.date) ? item.publishedAt : "",
    dateSource: "published-online"
  };
}

function parseCrossrefWorks(data, source, options = {}) {
  const items = data.message?.items || [];
  const maxItems = Number(options.maxItems || MAX_PER_SOURCE);
  return items.slice(0, maxItems).map((work, index) => {
    const doi = work.DOI || "";
    const title = cleanMetaTitle(work.title?.[0] || "", source.name);
    const abstract = stripHtml(work.abstract || work.subtitle?.[0] || "");
    const authors = authorsFromCrossref(work.author || []);
    const url = work.URL || (doi ? `https://doi.org/${doi}` : source.pageUrl || "");
    const typeText = [work.type, work.subtype, ...(work.subject || [])].filter(Boolean).join(" ");
    const inferredType = inferType(title, abstract, typeText, source, doi);
    const crossrefType = typeFromCrossref(work.type || "");
    const type =
      source.type === "reviewJournal" && inferredType === "Article"
        ? "Review"
        : mergeTypeInference(inferredType, crossrefType);

    const dateInfo = crossrefDateInfo(work);
    return {
      id: `${source.id}-crossref-${index}-${Buffer.from(title || doi || url).toString("base64url").slice(0, 12)}`,
      title,
      abstract,
      authors,
      journal: work["container-title"]?.[0] || source.name,
      type,
      doi,
      url,
      date: dateInfo.date,
      dateSource: dateInfo.source,
      sourceSignals: [
        {
          type: source.type,
          name: source.name,
          url
        }
      ]
    };
  });
}

async function metadataFromDoi(doi = "") {
  if (!doi) return {};
  try {
    const text = await fetchText(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    const data = JSON.parse(text);
    const message = data.message || {};
    return {
      doi: message.DOI || doi,
      title: cleanMetaTitle(message.title?.[0] || ""),
      journal: message["container-title"]?.[0] || "",
      authors: authorsFromCrossref(message.author || []),
      type: typeFromCrossref(message.type || ""),
      abstract: stripHtml(message.abstract || message.subtitle?.[0] || ""),
      date: crossrefDateInfo(message).date,
      dateSource: crossrefDateInfo(message).source,
      url: message.URL || (doi ? `https://doi.org/${doi}` : "")
    };
  } catch {
    return {};
  }
}

function isNewsLikeItem(item = {}, source = {}) {
  if (source.category === "news") return true;
  return ["natureScienceNews", "scienceDaily"].includes(source.type || "") && source.category !== "comprehensive";
}

async function hydrateNewsReferenceItem(item, source) {
  if (!item.url || item.url === "#") return null;
  try {
    let html = "";
    let usedReadableFallback = false;
    try {
      html = await fetchText(item.url);
    } catch {
      const readable = await fetchReadablePage(item.url, { reason: "news_page_fetch_failed" });
      if (readable.ok) {
        html = mergeReadablePageText("", readable);
        usedReadableFallback = true;
      }
    }
    let reference = extractNewsReferenceMetadata(html, item);
    if (!reference?.doi && !usedReadableFallback) {
      const readable = await fetchReadablePage(item.url, { reason: "news_reference_missing" });
      if (readable.ok) {
        html = mergeReadablePageText(html, readable);
        reference = extractNewsReferenceMetadata(html, item);
      }
    }
    if (!reference?.doi) return null;
    const doiMeta = await metadataFromDoi(reference.doi);
    const newsSummary = newsSummaryFromHtml(html, item.abstract || "");
    const title = doiMeta.title || reference.title || item.title;
    const journal = doiMeta.journal || reference.journal || item.journal || source.name;
    const type = mergeTypeInference(doiMeta.type, "Article");
    const abstract = [doiMeta.abstract, newsSummary].filter(Boolean).join("\n\n");
    const paperUrl = doiMeta.url || `https://doi.org/${reference.doi}`;
    const signalType = source.category === "news" ? source.type || "natureScienceNews" : "natureScienceNews";
    return {
      ...item,
      id: `${source.id}-ref-${Buffer.from(reference.doi).toString("base64url").slice(0, 18)}`,
      title,
      rawTitle: item.title,
      originalTitle: title,
      abstract: abstract || item.abstract,
      summary: newsSummary || item.abstract,
      oneLine: firstSentences(newsSummary || item.abstract, 180),
      authors: doiMeta.authors?.length ? doiMeta.authors : item.authors || [],
      journal,
      type,
      doi: reference.doi,
      url: paperUrl,
      paperPublishedDate: doiMeta.date || "",
      referenceCitation: reference.citation,
      newsReference: {
        source: reference.source,
        title: item.title,
        url: item.url,
        doi: reference.doi
      },
      resolutionStatus: "paper_resolved",
      recommendationEligible: true,
      metadataEvidence: {
        doi: "news_reference",
        title: doiMeta.title ? "crossref" : reference.title ? "news_reference" : "",
        journal: doiMeta.journal ? "crossref" : reference.journal ? "news_reference" : "",
        abstract: doiMeta.abstract ? "crossref" : newsSummary ? "news_summary" : ""
      },
      doiEvidence: { value: reference.doi, source: "news_reference" },
      sourceSignals: [
        {
          type: signalType,
          name: source.name,
          url: item.url
        }
      ]
    };
  } catch {
    return null;
  }
}

async function hydrateNewsReferenceItems(items, source) {
  const hydrated = await mapWithConcurrency(
    items,
    METADATA_HYDRATION_CONCURRENCY,
    async (item) => (isNewsLikeItem(item, source) ? hydrateNewsReferenceItem(item, source) : item)
  );
  return hydrated.filter(Boolean);
}

function isSuspiciousTitle(item, source) {
  const title = (item.title || "").trim().toLowerCase();
  const sourceName = (source.name || "").trim().toLowerCase();
  return !title || title === sourceName || title.length < 8;
}

async function hydrateSuspiciousItems(items, source) {
  return mapWithConcurrency(
    items,
    METADATA_HYDRATION_CONCURRENCY,
    async (item) => {
      const { _needsTitleHydration, ...cleanItem } = item;
      const needsTitle = _needsTitleHydration || isSuspiciousTitle(item, source);
      const needsNatureType = shouldHydrateNatureType(cleanItem, source);
      const needsDoi = HYDRATE_MISSING_RSS_DOI && !item.doi && item.url && item.url !== "#";
      const needsAbstract = item.doi && isThinRssAbstract(item.abstract);
      const needsDoiMeta = needsTitle || needsAbstract || (!item.authors?.length && item.doi);
      const needsMetadata = needsTitle || needsNatureType || needsDoiMeta || needsDoi;
      if (!needsMetadata) return cleanItem;
      if ((!item.url || item.url === "#") && !item.doi) return cleanItem;
      try {
        let html = "";
        let usedReadableFallback = false;
        if (item.url && item.url !== "#") {
          try {
            html = await fetchText(item.url);
          } catch {
            const readable = await fetchReadablePage(item.url, { reason: "rss_detail_fetch_failed" });
            if (readable.ok) {
              html = mergeReadablePageText("", readable);
              usedReadableFallback = true;
            }
          }
        }
        let htmlDoi = html ? doiFromHtml(html, item) : "";
        let pageTitle = html ? titleFromHtml(html, source.name) : "";
        let htmlType = html ? typeFromHtml(html) : "";
        if (
          item.url &&
          item.url !== "#" &&
          !usedReadableFallback &&
          ((needsDoi && !htmlDoi) || (needsTitle && !pageTitle) || (needsNatureType && !htmlType))
        ) {
          const readable = await fetchReadablePage(item.url, { reason: "rss_detail_metadata_thin" });
          if (readable.ok) {
            html = mergeReadablePageText(html, readable);
            htmlDoi = doiFromHtml(html, item);
            pageTitle = titleFromHtml(html, source.name);
            htmlType = typeFromHtml(html);
          }
        }
        const resolvedDoi = item.doi || htmlDoi;
        const doiMeta = resolvedDoi && (needsDoiMeta || htmlDoi) ? await metadataFromDoi(resolvedDoi) : {};
        const title = needsTitle ? pageTitle || doiMeta.title || inferTitleFromAbstract(item.abstract, source.name, item.doi) || item.title : item.title;
        const type = mergeTypeInference(inferType(title || item.title, item.abstract, htmlType, source, resolvedDoi), doiMeta.type);
        const signalType = sourceSignalTypeForItem(type, source);
        const signalName = sourceSignalNameForItem(type, source);
        const abstract = needsAbstract && doiMeta.abstract ? doiMeta.abstract : cleanItem.abstract;
        return {
          ...cleanItem,
          doi: resolvedDoi || cleanItem.doi || "",
          authors: cleanItem.authors?.length ? cleanItem.authors : doiMeta.authors || [],
          title,
          abstract,
          journal: journalNameForFeedItem(type, source),
          type,
          paperPublishedDate: doiMeta.date || cleanItem.paperPublishedDate || "",
          ...preferOnlineDateFields(cleanItem, doiMeta),
          metadataEvidence: {
            ...(cleanItem.metadataEvidence || {}),
            doi: htmlDoi ? "article_meta" : cleanItem.metadataEvidence?.doi || "",
            abstract: needsAbstract && doiMeta.abstract ? "crossref" : cleanItem.metadataEvidence?.abstract || "",
            date: doiMeta.dateSource || cleanItem.metadataEvidence?.date || ""
          },
          doiEvidence: htmlDoi ? { value: htmlDoi, source: "article_meta" } : cleanItem.doiEvidence || null,
          sourceSignals: (cleanItem.sourceSignals || []).map((signal) => ({
            ...signal,
            type: signalType,
            name: signalName
          }))
        };
      } catch {
        const doiMeta = item.doi && needsDoiMeta ? await metadataFromDoi(item.doi) : {};
        const title = needsTitle ? doiMeta.title || inferTitleFromAbstract(item.abstract, source.name, item.doi) || item.title : item.title;
        const type = mergeTypeInference(cleanItem.type, doiMeta.type);
        const signalType = sourceSignalTypeForItem(type, source);
        const signalName = sourceSignalNameForItem(type, source);
        const abstract = needsAbstract && doiMeta.abstract ? doiMeta.abstract : cleanItem.abstract;
        return {
          ...cleanItem,
          authors: cleanItem.authors?.length ? cleanItem.authors : doiMeta.authors || [],
          title,
          abstract,
          journal: journalNameForFeedItem(type, source),
          type,
          paperPublishedDate: doiMeta.date || cleanItem.paperPublishedDate || "",
          ...preferOnlineDateFields(cleanItem, doiMeta),
          sourceSignals: (cleanItem.sourceSignals || []).map((signal) => ({
            ...signal,
            type: signalType,
            name: signalName
          }))
        };
      }
    }
  );
}

function inferType(title = "", abstract = "", typeText = "", source = {}, doi = "") {
  const text = `${typeText} ${title} ${abstract}`.toLowerCase();
  const explicitType = String(typeText || "").toLowerCase();
  if (source.category === "news" && !doi) return "News";
  if (/author correction|correction|erratum|corrigendum|retraction|expression of concern|更正|勘误|撤稿/.test(text)) {
    return "Correction";
  }
  if (/systematic review|meta[- ]analysis|meta analysis|系统综述|荟萃/.test(text)) return "SystematicReview";
  if (/\breview\b|reviews|综述/.test(text)) return "Review";
  if (/career feature|career column|careers?\b|职业/.test(text)) return "CareerFeature";
  if (/books?\s*&\s*culture|book review|books?\b|culture\b|图书|文化/.test(text)) return "BooksAndCulture";
  if (/podcast|播客/.test(text)) return "Podcast";
  if (/\bvideo\b|视频/.test(text)) return "Video";
  if (/\bspotlight\b|聚焦/.test(text)) return "Spotlight";
  if (/research briefing|research brief|briefing/.test(text)) return "ResearchBriefing";
  if (/\bin depth\b|in-depth|深度/.test(text)) return "InDepth";
  if (/\bforum\b|\bessay\b|论坛|随笔/.test(text)) return "Forum";
  if (/news\s*&\s*views|news and views/.test(text)) return "NewsAndViews";
  if (/research highlight|highlight|研究亮点/.test(text)) return "ResearchHighlight";
  if (/news feature/.test(text)) return "NewsFeature";
  if (/world view|worldview/.test(text)) return "WorldView";
  if (/perspective|viewpoint|opinion|观点/.test(text)) return "Perspective";
  if (/commentary|comment|评论/.test(text)) return "Comment";
  if (/correspondence|通讯|通信|来信/.test(text)) return "Correspondence";
  if (/\bletter to (?:the )?editor\b|信件/.test(text)) return "Correspondence";
  if (/^letters?$/.test(explicitType) || /\barticle type\s*:?\s*letters?\b/.test(text) || /\btype\s*:?\s*letters?\b/.test(text)) {
    return "Letter";
  }
  if (/editorial|社论/.test(text)) return "Editorial";
  if (/originalpaper|original paper|research article|original article|article type article|研究论文|原创研究/.test(text)) {
    return "ResearchArticle";
  }
  if (/data descriptor|data paper|dataset|database|resource|software|数据论文|数据集|数据库|资源|软件/.test(text)) return "Dataset";
  if (/method|methods|protocol|方法|实验方案/.test(text)) return "Methods";
  if (/news|新闻/.test(text)) return "News";
  return "Article";
}

function mergeTypeInference(primary = "", fallback = "") {
  if (primary && primary !== "Article") return primary;
  return fallback || primary || "Article";
}

function recentTimeMs(item) {
  const value = item.publishedAt || item.date;
  if (!value) return 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-").map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function isRecent(item) {
  const timeMs = recentTimeMs(item);
  if (!timeMs) return true;
  const ageMs = Date.now() - timeMs;
  return ageMs <= LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
}

function isWithinDays(item, days) {
  const timeMs = recentTimeMs(item);
  if (!timeMs) return true;
  const ageMs = Date.now() - timeMs;
  return ageMs <= days * 24 * 60 * 60 * 1000;
}

function isoDateDaysAgo(days) {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function countFeedBlocks(xml = "") {
  const isAtom = /<entry[\s>]/i.test(xml);
  const pattern = isAtom ? /<entry[\s\S]*?<\/entry>/gi : /<item\b[\s\S]*?<\/item>/gi;
  return [...String(xml || "").matchAll(pattern)].length;
}

async function readFeedUrl(source, feedUrl, diagnostics = null) {
  const startedAt = new Date().toISOString();
  try {
    const xml = await fetchText(feedUrl);
    const parsedAll = parseFeed(xml, { ...source, feedUrl });
    const withTitle = parsedAll.filter((item) => item.title);
    const recent = withTitle.filter(isRecent);
    const withNewsReferences = await hydrateNewsReferenceItems(recent, { ...source, feedUrl });
    const hydrated = await hydrateSuspiciousItems(withNewsReferences, { ...source, feedUrl });
    if (diagnostics) {
      Object.assign(diagnostics, {
        status: "ok",
        startedAt,
        rawItems: countFeedBlocks(xml),
        parsedItems: parsedAll.length,
        titleItems: withTitle.length,
        recentItems: recent.length,
        paperReferenceItems: withNewsReferences.length,
        itemCount: hydrated.length,
        doiCount: hydrated.filter((item) => item.doi).length,
        missingDoiCount: hydrated.filter((item) => !item.doi).length
      });
    }
    return hydrated;
  } catch (error) {
    if (diagnostics) {
      Object.assign(diagnostics, {
        status: "error",
        startedAt,
        error: error.message
      });
    }
    throw error;
  }
}

function sourceFeedUrls(source = {}) {
  return [...new Set([source.feedUrl, ...(Array.isArray(source.feedUrls) ? source.feedUrls : [])].filter(Boolean))];
}

async function discoverSourceFeed(source) {
  if (!source.pageUrl) return "";
  const html = await fetchText(source.pageUrl);
  return discoverFeed(html, source.pageUrl);
}

async function readCrossrefSource(source) {
  if (!source.crossrefIssn) return [];
  const rows = crossrefRowsForSource(source);
  const windowDays = crossrefWindowDaysForSource(source);
  const url = new URL(`https://api.crossref.org/journals/${encodeURIComponent(source.crossrefIssn)}/works`);
  url.searchParams.set("rows", String(rows));
  url.searchParams.set("sort", "published");
  url.searchParams.set("order", "desc");
  url.searchParams.set("filter", `from-pub-date:${isoDateDaysAgo(windowDays)},type:journal-article`);
  const data = JSON.parse(await fetchText(url.toString()));
  return parseCrossrefWorks(data, source, { maxItems: rows }).filter((item) => item.title && isWithinDays(item, windowDays));
}

async function readRssHistory() {
  try {
    const data = JSON.parse(await fs.readFile(RSS_HISTORY, "utf8"));
    return {
      version: data.version || 1,
      updatedAt: data.updatedAt || "",
      historyDays: Number(data.historyDays || RSS_HISTORY_DAYS),
      items: Array.isArray(data.items) ? data.items : []
    };
  } catch {
    return { version: 1, updatedAt: "", historyDays: RSS_HISTORY_DAYS, items: [] };
  }
}

function pruneHistoryItems(items = [], referenceMs = Date.now()) {
  const cutoff = referenceMs - RSS_HISTORY_DAYS * 24 * 60 * 60 * 1000;
  return items.filter((item) => {
    const timeMs = recentTimeMs(item);
    if (timeMs) return timeMs >= cutoff;
    const discoveredMs = item.rssDiscoveredAt ? new Date(item.rssDiscoveredAt).getTime() : 0;
    return discoveredMs ? discoveredMs >= cutoff : true;
  });
}

async function updateRssHistory(currentItems = []) {
  const history = await readRssHistory();
  const discoveredAt = new Date().toISOString();
  const stamped = currentItems.map((item) => ({
    ...item,
    rssDiscoveredAt: item.rssDiscoveredAt || discoveredAt
  }));
  const stats = {};
  const merged = mergeCandidates([...history.items, ...stamped], stats);
  const items = pruneHistoryItems(merged);
  await fs.writeFile(
    RSS_HISTORY,
    `${JSON.stringify({ version: 1, updatedAt: discoveredAt, historyDays: RSS_HISTORY_DAYS, items }, null, 2)}\n`
  );
  return {
    items,
    stats: {
      ...stats,
      inputHistory: history.items.length,
      current: currentItems.length,
      outputHistory: items.length
    }
  };
}

async function readRecentRssHistory() {
  const history = await readRssHistory();
  return {
    ...history,
    items: pruneHistoryItems(history.items).filter(isRecent)
  };
}

function logRecoveredFeedFailure(source, method, count, errors = []) {
  if (!errors.some((error) => error.startsWith("feed "))) return;
  const detail =
    method === "crossref"
      ? `已用 Crossref 兜底 ${count} 条`
      : `已用页面发现 RSS 兜底 ${count} 条`;
  console.warn(
    COMPACT_LOG
      ? `RSS 失败：${source.name}；${detail}`
      : `RSS failed for ${source.name}: ${errors.join("; ")}; ${detail}`
  );
}

function compactFailureSummary(errors = []) {
  const parts = [];
  const feedError = errors.find((error) => error.startsWith("feed "))?.replace(/^feed\s+/, "");
  if (feedError) parts.push(`RSS ${feedError}`);
  if (errors.includes("crossref no recent items")) parts.push(`Crossref 无近 ${LOOKBACK_DAYS} 日候选`);
  if (errors.some((error) => error.startsWith("crossref ") && error !== "crossref no recent items")) {
    parts.push("Crossref 失败");
  }
  if (errors.some((error) => error.startsWith("discover "))) parts.push("页面发现失败");
  if (!parts.length && errors.length) parts.push(errors.join("; "));
  return parts.length ? `；${parts.join("；")}` : "";
}

function feedEmptyReason(source = {}, diagnostics = []) {
  if (!diagnostics.length) return "";
  const okFeeds = diagnostics.filter((entry) => entry.status === "ok");
  const errorFeeds = diagnostics.filter((entry) => entry.status === "error");
  if (okFeeds.some((entry) => entry.itemCount > 0)) return "";
  if (!okFeeds.length && errorFeeds.length) return "feed_fetch_failed";
  if (okFeeds.some((entry) => entry.rawItems === 0)) return "feed_empty";
  if (okFeeds.some((entry) => entry.rawItems > 0 && entry.parsedItems === 0)) return "feed_unparsed";
  if (okFeeds.some((entry) => entry.parsedItems > 0 && entry.titleItems === 0)) return "missing_titles";
  if (okFeeds.some((entry) => entry.titleItems > 0 && entry.recentItems === 0)) return "no_recent_items";
  if (okFeeds.some((entry) => entry.recentItems > 0 && entry.paperReferenceItems === 0)) {
    return source.category === "news" ? "news_without_paper_reference" : "paper_reference_gate_empty";
  }
  if (okFeeds.some((entry) => entry.paperReferenceItems > 0 && entry.itemCount === 0)) return "metadata_hydration_empty";
  return "no_candidates_after_filters";
}

function compactEmptyFeedSummary(source = {}, report = {}, errors = []) {
  const reason = report.emptyReason || "";
  const feedCount = report.feedDiagnostics?.length || 0;
  const okCount = report.feedDiagnostics?.filter((entry) => entry.status === "ok").length || 0;
  const prefix = feedCount ? `；feed ${okCount}/${feedCount} 可读` : "";
  const suffix = compactFailureSummary(errors).replace(/^；/, "；兜底：");
  if (reason === "feed_fetch_failed") return compactFailureSummary(errors);
  if (reason === "feed_empty") return `${prefix}，RSS 没有 item${suffix}`;
  if (reason === "feed_unparsed") return `${prefix}，XML 有条目但解析器未识别 item/entry${suffix}`;
  if (reason === "missing_titles") return `${prefix}，条目缺少标题${suffix}`;
  if (reason === "no_recent_items") return `${prefix}，近 ${LOOKBACK_DAYS} 日无条目${suffix}`;
  if (reason === "news_without_paper_reference") return `${prefix}，未解析到明确论文 DOI/Reference${suffix}`;
  if (reason === "paper_reference_gate_empty") return `${prefix}，非论文服务内容或未解析到论文 DOI${suffix}`;
  if (reason === "metadata_hydration_empty") return `${prefix}，元数据补全后无有效候选${suffix}`;
  if (reason === "no_candidates_after_filters") return `${prefix}，过滤后无候选${suffix}`;
  return compactFailureSummary(errors);
}

function chooseLongerText(a = "", b = "") {
  return String(b || "").length > String(a || "").length ? b : a;
}

function dateSourcePriority(value = "") {
  if (value === "published-online") return 3;
  if (value === "published" || value === "published-print") return 2;
  if (value) return 1;
  return 0;
}

function shouldUseIncomingDate(existing = {}, incoming = {}) {
  if (!existing.date && incoming.date) return true;
  if (dateSourcePriority(incoming.dateSource) > dateSourcePriority(existing.dateSource)) return true;
  if (!existing.publishedAt && incoming.publishedAt) return true;
  return false;
}

async function readSource(source) {
  const feedUrls = sourceFeedUrls(source);
  if (!feedUrls.length && !source.pageUrl && !source.crossrefIssn) return [];
  const errors = [];
  const attemptedFeeds = new Set();
  const report = {
    id: source.id || "",
    name: source.name || "",
    category: source.category || "",
    type: source.type || "",
    feedUrl: source.feedUrl || "",
    feedUrls,
    crossrefIssn: source.crossrefIssn || "",
    crossrefWindowDays: source.crossrefIssn ? crossrefWindowDaysForSource(source) : 0,
    crossrefRows: source.crossrefIssn ? crossrefRowsForSource(source) : 0,
    pageUrl: source.pageUrl || "",
    attempts: [],
    feedDiagnostics: [],
    errors: [],
    recoveredBy: "",
    emptyReason: "",
    itemCount: 0,
    doiCount: 0,
    missingDoiCount: 0,
    newsReferenceCount: 0
  };
  const finish = (items, recoveredBy = "") => {
    report.recoveredBy = recoveredBy;
    report.itemCount = items.length;
    report.doiCount = items.filter((item) => item.doi).length;
    report.missingDoiCount = items.filter((item) => !item.doi).length;
    report.newsReferenceCount = items.filter((item) => item.newsReference).length;
    report.errors = errors.slice();
    report.emptyReason = items.length ? "" : report.emptyReason || feedEmptyReason(source, report.feedDiagnostics);
    sourceReports.push(report);
    return items;
  };

  if (feedUrls.length) {
    const feedItems = [];
    for (const feedUrl of feedUrls) {
      attemptedFeeds.add(feedUrl);
      report.attempts.push(`feed:${feedUrl}`);
      const diagnostics = { url: feedUrl };
      report.feedDiagnostics.push(diagnostics);
      try {
        feedItems.push(...(await readFeedUrl(source, feedUrl, diagnostics)));
      } catch (error) {
        errors.push(`feed ${feedUrl} ${error.message}`);
      }
    }
    if (feedItems.length) {
      if (!STRICT_JOURNAL_RSS && source.crossrefAugment && source.crossrefIssn) {
        try {
          report.attempts.push("crossrefAugment");
          const crossrefItems = await readCrossrefSource(source);
          if (crossrefItems.length) {
            const augmentStats = {};
            const merged = mergeCandidates([...feedItems, ...crossrefItems], augmentStats);
            report.crossrefAugmentCount = crossrefItems.length;
            report.crossrefAugmentMerged = augmentStats.doiMerges || 0;
            return finish(merged, "feed+crossref");
          }
        } catch (error) {
          errors.push(`crossref augment ${error.message}`);
        }
      }
      return finish(feedItems, "feed");
    }
  }

  if (STRICT_JOURNAL_RSS) {
    report.emptyReason = feedEmptyReason(source, report.feedDiagnostics);
    const detail = compactEmptyFeedSummary(source, report, errors);
    console.warn(COMPACT_LOG ? `RSS 无候选：${source.name}${detail}` : `No RSS candidates for ${source.name}: ${detail}`);
    return finish([], "");
  }

  try {
    report.attempts.push("crossref");
    const items = await readCrossrefSource(source);
    if (items.length) {
      logRecoveredFeedFailure(source, "crossref", items.length, errors);
      return finish(items, "crossref");
    }
    if (source.crossrefIssn) errors.push("crossref no recent items");
  } catch (error) {
    if (source.crossrefIssn) errors.push(`crossref ${error.message}`);
  }

  const hasReadableFeedItems = report.feedDiagnostics.some(
    (entry) => entry.status === "ok" && Number(entry.rawItems || 0) > 0
  );
  if (!hasReadableFeedItems) {
    try {
      report.attempts.push("discoverFeed");
      const discoveredFeed = feedUrls.length ? await discoverSourceFeed(source) : source.feedUrl || (await discoverSourceFeed(source));
      if (discoveredFeed && !attemptedFeeds.has(discoveredFeed)) {
        const diagnostics = { url: discoveredFeed, discovered: true };
        report.feedDiagnostics.push(diagnostics);
        const items = await readFeedUrl(source, discoveredFeed, diagnostics);
        logRecoveredFeedFailure(source, "discoveredFeed", items.length, errors);
        return finish(items, "discoveredFeed");
      }
      if (!discoveredFeed && !source.crossrefIssn) {
        errors.push("no feed discovered");
      }
    } catch (error) {
      if (source.pageUrl) errors.push(`discover ${error.message}`);
    }
  }

  report.emptyReason = feedEmptyReason(source, report.feedDiagnostics);
  const feedFetchFailed = errors.some((error) => error.startsWith("feed "));
  const compactLabel = feedFetchFailed && report.emptyReason === "feed_fetch_failed" ? "RSS 失败" : "RSS 无候选";
  const compactDetail = compactLabel === "RSS 失败" ? compactFailureSummary(errors) : compactEmptyFeedSummary(source, report, errors);
  console.warn(COMPACT_LOG ? `${compactLabel}：${source.name}${compactDetail}` : `No candidates for ${source.name}: ${compactDetail || errors.join("; ")}`);
  return finish([], "");
}

function mergeCandidates(items, stats = {}) {
  const map = new Map();
  stats.input = items.length;
  stats.doiMerges = 0;
  stats.titleMerges = 0;
  for (const item of items) {
    const key = item.doi
      ? `doi:${item.doi.toLowerCase()}`
      : `title:${item.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()}`;
    if (!map.has(key)) {
      map.set(key, item);
      continue;
    }
    if (key.startsWith("doi:")) stats.doiMerges += 1;
    if (key.startsWith("title:")) stats.titleMerges += 1;
    const existing = map.get(key);
    existing.sourceSignals = [...(existing.sourceSignals || []), ...(item.sourceSignals || [])];
    existing.abstract = chooseLongerText(existing.abstract, item.abstract);
    existing.summary = chooseLongerText(existing.summary, item.summary);
    existing.oneLine ||= item.oneLine;
    existing.authors = existing.authors?.length ? existing.authors : item.authors || [];
    existing.doi ||= item.doi;
    existing.url ||= item.url;
    existing.journal ||= item.journal;
    existing.type = existing.type === "News" ? item.type || existing.type : existing.type || item.type;
    if (shouldUseIncomingDate(existing, item)) {
      existing.date = item.date || existing.date || "";
      existing.publishedAt = item.publishedAt || "";
      existing.dateSource = item.dateSource || existing.dateSource || "";
    }
    existing.paperPublishedDate ||= item.paperPublishedDate || "";
    existing.rssDiscoveredAt ||= item.rssDiscoveredAt || "";
  }
  const output = [...map.values()];
  stats.output = output.length;
  stats.doiCount = output.filter((item) => item.doi).length;
  stats.missingDoiCount = output.filter((item) => !item.doi).length;
  return output;
}

async function main() {
  let rssItems = [];
  let rssHistoryResult = { items: [], stats: { inputHistory: 0, current: 0, outputHistory: 0 } };
  const mode = RSS_CANDIDATES_INPUT ? "merge" : "journal-rss-only";
  if (RSS_CANDIDATES_INPUT) {
    const data = JSON.parse(await fs.readFile(RSS_CANDIDATES_INPUT, "utf8"));
    const currentRssItems = Array.isArray(data) ? data : data.items || [];
    const history = await readRecentRssHistory();
    rssHistoryResult = {
      items: history.items,
      stats: {
        inputHistory: history.items.length,
        current: currentRssItems.length,
        outputHistory: history.items.length
      }
    };
    rssItems = mergeCandidates([...history.items, ...currentRssItems], {});
  } else {
    const sources = JSON.parse(await fs.readFile(SOURCES, "utf8"));
    const enabled = sources.filter(
      (source) => JOURNAL_RSS_SOURCE_TYPES.has(source.type) && sourceFeedUrls(source).length
    );
    const batches = await mapWithConcurrency(enabled, SOURCE_FETCH_CONCURRENCY, readSource);
    const currentRssItems = batches.flat();
    rssHistoryResult = await updateRssHistory(currentRssItems);
    rssItems = mergeCandidates(rssHistoryResult.items.filter(isRecent), {});
  }
  const mergeStats = {};
  const candidates = mergeCandidates(rssItems, mergeStats);
  const webFetchReport = getWebFetchReport();
  await writeWebFetchReport();
  await fs.writeFile(OUTPUT, `${JSON.stringify(candidates, null, 2)}\n`);
  await fs.writeFile(
    REPORT,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        mode,
        lookbackDays: LOOKBACK_DAYS,
        output: path.relative(ROOT, OUTPUT),
        rss: {
          items: rssItems.length,
          doiCount: rssItems.filter((item) => item.doi).length,
          missingDoiCount: rssItems.filter((item) => !item.doi).length,
          historyDays: RSS_HISTORY_DAYS,
          historyItems: rssHistoryResult.stats.outputHistory,
          currentItems: rssHistoryResult.stats.current,
          sourceFetchConcurrency: SOURCE_FETCH_CONCURRENCY,
          sources: sourceReports.length,
          failedSources: sourceReports.filter(
            (entry) => !entry.itemCount && entry.errors.some((error) => error.startsWith("feed "))
          ).length,
          emptyCandidateSources: sourceReports.filter(
            (entry) => !entry.itemCount && entry.emptyReason && !entry.errors.some((error) => error.startsWith("feed "))
          ).length
        },
        merge: mergeStats,
        webFetch: webFetchReport,
        sources: sourceReports
      },
      null,
      2
    )}\n`
  );
  const doiSummary = `DOI ${mergeStats.doiCount}/${mergeStats.output}，缺 DOI ${mergeStats.missingDoiCount}`;
  console.log(
    COMPACT_LOG
      ? `期刊 RSS 抓取完成：候选 ${candidates.length}，${doiSummary}。`
      : `Wrote ${OUTPUT} with ${candidates.length} journal RSS candidate(s), ${doiSummary}.`
  );
}

export {
  extractNewsReferenceMetadata,
  hydrateNewsReferenceItem,
  newsSummaryFromHtml,
  referenceSectionFromText
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
