import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { loadLocalEnv } from "./local-env.mjs";

const ROOT = process.cwd();
await loadLocalEnv(ROOT);
const INPUT = path.join(ROOT, "data", "wechat-candidates.json");
const OUTPUT = path.join(ROOT, "data", "wechat-candidates.prescreened.json");
const REPORT = path.join(ROOT, "data", "wechat-prescreen-report.json");
const CACHE = path.join(ROOT, "data", "wechat-prescreen-cache.json");

const API_KEY = process.env.DEEPSEEK_API_KEY;
const MODEL =
  process.env.DEEPSEEK_WECHAT_PRESCREEN_MODEL ||
  process.env.DEEPSEEK_PRESCREEN_MODEL ||
  "deepseek-v4-flash";
const MAX_INPUT_CHARS = Number(process.env.PAPER_DAILY_WECHAT_PRESCREEN_CHARS || 3500);
const APPLY = process.argv.includes("--apply");
const DRY_RUN = process.argv.includes("--dry-run");
const VERSION = "2026-06-08-wechat-local-prescreen-v1";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

const topicLabels = {
  modeling_methods: "模型/方法",
  community_ecosystem: "群落/生态系统",
  population_traits: "种群/性状",
  biogeochemistry: "生物地球化学",
  genetics_evolution: "遗传/进化",
  landscape_macroecology: "景观/宏生态",
  species_distribution: "物种分布",
  climate_anthropogenic: "气候/人类影响",
  disturbance: "扰动/火生态",
  invasion: "生物入侵",
  conservation_management: "保护/管理",
  plant_agroecology: "植物/农业生态",
  aquatic_microbe: "水域/微生物"
};

const allowedCategories = new Set([
  "research_article",
  "dataset",
  "method_tool",
  "review",
  "commentary",
  "news_report",
  "non_research"
]);

const typeByCategory = {
  research_article: "ResearchArticle",
  dataset: "Dataset",
  method_tool: "Methods",
  review: "Review",
  commentary: "Commentary",
  news_report: "News",
  non_research: "News"
};

const PROMPT = `
你是 Paper Daily 的本地微信公众号预筛模型。目标是先用低成本模型把 we-mp-rss 抓到的公众号文章整理成更干净的候选，再交给 GitHub 上的统一评分流程。

你必须完成四件事：
1. 判断该公众号文章是否介绍了一个具体的泛生态学研究、数据集、方法工具、综述或观点评论。
2. 排除征稿、会议、招聘、课程、广告、直播、期刊目录、纯机构动态、项目宣传、没有具体研究对象/论文/方法的数据不足推送。
3. 如果是研究内容，尽量从正文中提取原始英文论文标题、期刊名、DOI、作者线索和文章类型。
4. 保留数据论文、方法/软件/工具、数据集介绍、综述和观点评论，但要用 category 标清楚，方便后续快速识别。

泛生态学包括：群落生态、生态系统生态、景观生态、全球变化生态、恢复生态、城市生态、农业生态、森林/草地/湿地/淡水生态、生物多样性、保护生物学、物种分布、植物-土壤/植物-微生物互作、入侵生态、火生态、生态水文、生态遥感、生态模型、面源污染、能源设施生态影响。

category 只能选择：
- research_article: 原始研究论文
- dataset: 数据集、数据库、数据论文或数据产品介绍
- method_tool: 方法、模型、软件、工具、协议或监测流程
- review: 综述、系统综述、Meta 分析
- commentary: Perspective、Comment、Forum、Spotlight、News & Views、Correspondence、Letter 等观点/评论类
- news_report: 新闻报道或公众号研究报道，能对应一项具体研究但论文元数据不完整
- non_research: 非研究信息，应 rejected

输出严格 JSON，不要输出解释文字。`;

function usage() {
  console.log(`Usage:
  node scripts/import-wechat-local.mjs
  DEEPSEEK_API_KEY=... node scripts/prescreen-wechat-local.mjs [--apply]

Options:
  --apply    overwrite data/wechat-candidates.json with filtered prescreened items
  --dry-run  use local keyword rules instead of DeepSeek
`);
}

function stableHash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function itemFingerprint(item) {
  return stableHash({
    version: VERSION,
    model: DRY_RUN ? "local-rule" : MODEL,
    id: item.id || "",
    title: item.title || "",
    abstract: item.abstract || "",
    journal: item.journal || "",
    url: item.url || "",
    date: item.date || ""
  });
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

function extractJson(text) {
  const trimmed = String(text || "").trim();
  const candidates = [];
  if (trimmed.startsWith("{")) candidates.push(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) candidates.push(match[0]);
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      const repaired = repairJsonObject(candidate);
      if (repaired !== candidate) {
        try {
          return JSON.parse(repaired);
        } catch {
          // Try the next candidate.
        }
      }
    }
  }
  throw new Error(`No valid JSON object found in model response: ${trimmed.slice(0, 240)}`);
}

function repairJsonObject(value) {
  let inString = false;
  let escape = false;
  let balance = 0;
  for (const char of value) {
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString && char === "{") balance += 1;
    if (!inString && char === "}") balance -= 1;
  }
  if (inString || balance <= 0) return value;
  return `${value}${"}".repeat(balance)}`;
}

function truncate(value = "", maxChars = MAX_INPUT_CHARS) {
  const text = String(value || "").trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trim()}...`;
}

function fullTextStatus(item) {
  const status = item.wechatTextStatus || {};
  const bodyChars = Number(status.bodyChars || 0);
  const usedChars = Number(status.usedChars || String(item.abstract || "").length);
  if (bodyChars >= 800) return "full_text";
  if (bodyChars > 0 || usedChars >= 300) return "partial_text";
  if (usedChars > 0) return "summary_only";
  return "empty";
}

function inferDoi(item, modelResult = {}) {
  const found = `${modelResult.doi || ""} ${item.doi || ""} ${item.title || ""} ${item.abstract || ""} ${item.url || ""}`.match(
    /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i
  );
  return found ? found[0].replace(/[.,;)\]]+$/, "") : "";
}

function cleanArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function normalizeResult(raw, item) {
  const category = allowedCategories.has(raw.category) ? raw.category : "news_report";
  const tags = cleanArray(raw.tags).filter((tag) => topicLabels[tag]).slice(0, 5);
  const confidence = Math.max(0, Math.min(Number(raw.confidence ?? 50), 100));
  const relevance = Math.max(0, Math.min(Number(raw.relevance ?? confidence / 2), 50));
  const doi = inferDoi(item, raw);
  const passed = Boolean(raw.pass) && category !== "non_research";
  return {
    pass: passed,
    isEcology: Boolean(raw.isEcology),
    category,
    paperType: raw.paperType || typeByCategory[category] || item.type || "News",
    extractedTitle: String(raw.extractedTitle || "").trim(),
    journal: String(raw.journal || "").trim(),
    doi,
    authors: cleanArray(raw.authors).slice(0, 8),
    tags,
    relevance,
    confidence,
    oneLine: String(raw.oneLine || "").trim(),
    reason: String(raw.reason || "").trim(),
    textStatus: fullTextStatus(item),
    model: DRY_RUN ? "local-rule" : MODEL,
    version: VERSION
  };
}

function addTag(tags, tag, matched) {
  if (matched && !tags.includes(tag)) tags.push(tag);
}

function dryPrescreen(item) {
  const text = `${item.title || ""} ${item.abstract || ""}`.toLowerCase();
  const nonResearch =
    /征稿|投稿|特刊|会议|研讨会|讲座|直播|课程|培训|招聘|招生|广告|优惠|会员|报名|论坛|workshop|webinar|conference|call for papers|special issue|job|hiring|recruit/.test(text) ||
    fullTextStatus(item) === "empty";
  const tags = [];
  addTag(tags, "modeling_methods", /model|remote sensing|machine learning|dataset|database|software|method|模型|遥感|机器学习|数据集|数据库|软件|方法/.test(text));
  addTag(tags, "community_ecosystem", /community|ecosystem|food web|群落|生态系统|食物网/.test(text));
  addTag(tags, "biogeochemistry", /carbon|nitrogen|phosphorus|soil|greenhouse gas|碳|氮|磷|土壤|温室气体/.test(text));
  addTag(tags, "climate_anthropogenic", /climate|warming|urban|land use|wind|solar|气候|增温|城市|土地利用|风电|太阳能/.test(text));
  addTag(tags, "disturbance", /fire|wildfire|disturbance|drought|火|扰动|干旱/.test(text));
  addTag(tags, "invasion", /invasion|invasive|入侵|外来种/.test(text));
  addTag(tags, "conservation_management", /conservation|restoration|management|保护|恢复|管理/.test(text));
  addTag(tags, "plant_agroecology", /plant|forest|grassland|crop|agro|植物|森林|草地|作物|农业/.test(text));
  addTag(tags, "aquatic_microbe", /freshwater|marine|wetland|microb|淡水|海洋|湿地|微生物/.test(text));
  const isEcology = tags.length > 0 || /ecolog|biodiversity|生态|生物多样性/.test(text);
  let category = "news_report";
  if (/dataset|database|数据集|数据库|数据论文/.test(text)) category = "dataset";
  if (/method|software|tool|model|方法|软件|工具|模型/.test(text)) category = "method_tool";
  if (/review|综述|meta-analysis|systematic review/.test(text)) category = "review";
  if (/perspective|comment|spotlight|forum|观点|评论/.test(text)) category = "commentary";
  if (/research article|article|研究/.test(text)) category = "research_article";
  if (nonResearch || !isEcology) category = "non_research";
  return normalizeResult(
    {
      pass: category !== "non_research",
      isEcology,
      category,
      tags,
      relevance: Math.min(30 + tags.length * 3, 50),
      confidence: fullTextStatus(item) === "full_text" ? 70 : 45,
      oneLine: item.abstract || item.title,
      reason: category === "non_research" ? "本地规则判断为非研究或信息不足。" : "本地规则判断为生态相关候选。"
    },
    item
  );
}

async function deepseekPrescreen(item) {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            source: {
              account: item.journal,
              date: item.date,
              url: item.url,
              textStatus: fullTextStatus(item)
            },
            article: {
              title: item.title,
              text: truncate(item.abstract || "")
            },
            topics: topicLabels,
            output_schema: {
              pass: "boolean",
              isEcology: "boolean",
              category: "research_article | dataset | method_tool | review | commentary | news_report | non_research",
              extractedTitle: "original English paper title if identifiable, otherwise empty",
              journal: "journal name if identifiable, otherwise empty",
              doi: "DOI if identifiable, otherwise empty",
              authors: "array of author names if identifiable",
              paperType: "ResearchArticle | Dataset | Methods | Review | Commentary | News",
              tags: "array of topic keys",
              relevance: "0-50 integer",
              confidence: "0-100 integer",
              oneLine: "one concise Chinese research description",
              reason: "short Chinese reason"
            }
          })
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek ${MODEL} failed: ${response.status} ${body}`);
  }
  const data = await response.json();
  return normalizeResult(extractJson(data.choices?.[0]?.message?.content || "{}"), item);
}

function applyPrescreen(item, localPrescreen) {
  const title = localPrescreen.extractedTitle || item.title;
  const journal = localPrescreen.journal || item.journal;
  const type = localPrescreen.paperType || typeByCategory[localPrescreen.category] || item.type;
  const doi = localPrescreen.doi || item.doi || "";
  return {
    ...item,
    title,
    journal,
    type,
    doi,
    authors: localPrescreen.authors?.length ? localPrescreen.authors : item.authors || [],
    localPrescreen
  };
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    usage();
    return;
  }
  if (!API_KEY && !DRY_RUN) {
    console.error("DEEPSEEK_API_KEY is not set. Use --dry-run for local keyword rules, or set the key before running.");
    process.exit(1);
  }

  const data = await readJson(INPUT, null);
  if (!data) throw new Error(`Cannot read ${INPUT}. Run node scripts/import-wechat-local.mjs first.`);
  const items = Array.isArray(data) ? data : data.items || [];
  const cache = await readJson(CACHE, { version: VERSION, items: {} });
  const passed = [];
  const rejected = [];
  const stats = { total: items.length, passed: 0, rejected: 0, cacheHits: 0, cacheMisses: 0, textStatus: {} };

  for (const [index, item] of items.entries()) {
    const textStatus = fullTextStatus(item);
    stats.textStatus[textStatus] = (stats.textStatus[textStatus] || 0) + 1;
    const fingerprint = itemFingerprint(item);
    let localPrescreen = cache.items[item.id]?.fingerprint === fingerprint ? cache.items[item.id].localPrescreen : null;
    if (localPrescreen) {
      stats.cacheHits += 1;
    } else {
      stats.cacheMisses += 1;
      try {
        localPrescreen = DRY_RUN ? dryPrescreen(item) : await deepseekPrescreen(item);
      } catch (error) {
        console.warn(`Prescreen fallback for "${String(item.title || "").slice(0, 80)}": ${error.message}`);
        localPrescreen = dryPrescreen(item);
      }
      cache.items[item.id] = {
        fingerprint,
        localPrescreen,
        updatedAt: new Date().toISOString()
      };
    }

    const enriched = applyPrescreen(item, localPrescreen);
    if (localPrescreen.pass) {
      stats.passed += 1;
      passed.push(enriched);
    } else {
      stats.rejected += 1;
      rejected.push({
        id: item.id,
        title: item.title,
        journal: item.journal,
        url: item.url,
        date: item.date,
        localPrescreen
      });
    }
    console.log(`[${index + 1}/${items.length}] ${localPrescreen.pass ? "pass" : "reject"} · ${localPrescreen.category} · ${item.title}`);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    source: "local-we-mp-rss-db-prescreened",
    prescreenModel: DRY_RUN ? "local-rule" : MODEL,
    version: VERSION,
    items: passed
  };
  await fs.writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  await fs.writeFile(
    REPORT,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), version: VERSION, model: output.prescreenModel, stats, rejected }, null, 2)}\n`
  );
  await fs.writeFile(CACHE, `${JSON.stringify({ version: VERSION, updatedAt: new Date().toISOString(), items: cache.items }, null, 2)}\n`);

  if (APPLY) {
    await fs.writeFile(INPUT, `${JSON.stringify(output, null, 2)}\n`);
    console.log(`Applied prescreened output to ${INPUT}.`);
  } else {
    console.log(`Wrote ${OUTPUT}. Re-run with --apply to replace ${INPUT}.`);
  }
  console.log(`Passed ${stats.passed}/${stats.total}; rejected ${stats.rejected}. Text status: ${JSON.stringify(stats.textStatus)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
