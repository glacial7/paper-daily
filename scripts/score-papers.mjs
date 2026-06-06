import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "data", "candidates.json");
const OUTPUT = path.join(ROOT, "data", "latest.json");
const CACHE = path.join(ROOT, "data", "paper-cache.json");
const FEEDBACK = path.join(ROOT, "config", "topic-feedback.json");
const API_KEY = process.env.DEEPSEEK_API_KEY;
const DRY_RUN = process.env.PAPER_DAILY_DRY_RUN === "1" || !API_KEY;

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const PRESCREEN_MODEL = process.env.DEEPSEEK_PRESCREEN_MODEL || "deepseek-v4-flash";
const SCORE_MODEL = process.env.DEEPSEEK_SCORE_MODEL || "deepseek-v4-pro";
const SCORING_VERSION = "2026-06-06-type-v2";
const CACHE_MODE = DRY_RUN ? "dry-run" : `deepseek:${PRESCREEN_MODEL}:${SCORE_MODEL}`;

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

const sourceQualityScores = {
  topJournal: 30,
  reviewJournal: 27,
  professionalJournal: 24,
  natureScienceNews: 20,
  scienceDaily: 16,
  wechat: 10
};

const paperTypeScores = {
  Review: 20,
  SystematicReview: 20,
  MetaAnalysis: 20,
  Article: 17,
  ResearchArticle: 17,
  Methods: 14,
  Data: 14,
  Dataset: 14,
  Protocol: 14,
  Resource: 14,
  Software: 14,
  Perspective: 10,
  Comment: 10,
  Commentary: 10,
  Spotlight: 10,
  Forum: 10,
  Correspondence: 8,
  Letter: 8,
  Editorial: 7,
  NewsAndViews: 7,
  ResearchHighlight: 6,
  News: 8
};

async function readTopicFeedback() {
  try {
    return JSON.parse(await fs.readFile(FEEDBACK, "utf8"));
  } catch {
    return { minFeedbackPerTopic: 3, feedback: [] };
  }
}

async function readCache() {
  try {
    const data = JSON.parse(await fs.readFile(CACHE, "utf8"));
    return {
      version: data.version || SCORING_VERSION,
      updatedAt: data.updatedAt || "",
      items: data.items && typeof data.items === "object" ? data.items : {}
    };
  } catch {
    return { version: SCORING_VERSION, updatedAt: "", items: {} };
  }
}

async function writeCache(cache) {
  await fs.writeFile(
    CACHE,
    `${JSON.stringify({ version: SCORING_VERSION, updatedAt: new Date().toISOString(), items: cache.items }, null, 2)}\n`
  );
}

function stableHash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function topicWeightsFromFeedback(config) {
  if (config.weights && typeof config.weights === "object") return config.weights;
  const min = Number(config.minFeedbackPerTopic || 3);
  const stats = {};
  for (const item of config.feedback || []) {
    const delta = item.value === "dislike" ? -1 : item.value === "like" ? 1 : 0;
    if (!delta) continue;
    for (const tag of item.tags || []) {
      if (!stats[tag]) stats[tag] = { count: 0, total: 0 };
      stats[tag].count += 1;
      stats[tag].total += delta;
    }
  }
  return Object.fromEntries(
    Object.entries(stats).map(([tag, stat]) => {
      if (stat.count < min) return [tag, 0];
      return [tag, Math.max(-3, Math.min(3, Math.round(stat.total / stat.count)))];
    })
  );
}

function cacheKey(paper) {
  if (paper.doi) return `doi:${paper.doi.toLowerCase()}`;
  if (paper.url) {
    try {
      const url = new URL(paper.url);
      url.search = "";
      url.hash = "";
      return `url:${url.toString().toLowerCase()}`;
    } catch {
      return `url:${paper.url.toLowerCase()}`;
    }
  }
  return `title:${normalizeTitle(paper.title)}`;
}

function candidateFingerprint(paper) {
  return stableHash({
    title: normalizeTitle(paper.title || ""),
    abstract: cleanAbstract(paper.abstract || "", paper.title || "").slice(0, 1200),
    doi: (paper.doi || "").toLowerCase(),
    url: paper.url || "",
    journal: paper.journal || "",
    type: paper.type || "",
    authors: paper.authors || [],
    sourceSignals: (paper.sourceSignals || []).map((signal) => ({
      type: signal.type || "",
      name: signal.name || "",
      url: signal.url || ""
    }))
  });
}

function topicWeightsHash(topicWeights) {
  return stableHash(topicWeights || {});
}

const PRESCREEN_PROMPT = `
你是 Paper Daily 的低成本预筛模型。你的任务不是写摘要，而是判断候选条目是否值得进入高质量评分阶段。

第一道门：先判断候选是否属于“泛生态学研究”。泛生态学包括但不限于：
- 群落生态、生态系统生态、景观生态、全球变化生态、恢复生态、城市生态、农业生态、森林/草地/湿地/淡水生态
- 生物多样性、保护生物学、物种分布、植物-土壤/植物-微生物互作、入侵生态、火生态、生态水文、生态遥感和生态模型
- 以生态过程、生态格局、生态功能、生态管理或生态风险为核心的问题

不属于泛生态学的条目应 pass=false，即使来自综合期刊、微信公众号或新闻报道。

生态学主题组（tags 只能从这些 key 中选择）：
- modeling_methods: 生态模型、统计建模、遥感、GIS、机器学习、监测方法、数据集、软件和方法论文
- community_ecosystem: 群落过程、生态系统功能、食物网、物种互作、生态系统服务
- population_traits: 种群动态、生活史、性状、运动扩散、存活率、种群统计
- biogeochemistry: 碳氮磷循环、养分、土壤过程、温室气体、生态水文、植物-土壤过程
- genetics_evolution: 遗传多样性、基因组、进化、系统发育、适应
- landscape_macroecology: 景观生态、宏生态、生物地理、大尺度格局、多尺度过程
- species_distribution: 物种分布、生态位、栖息地适宜性、范围变化
- climate_anthropogenic: 气候变化、人类影响、土地利用、城市化、农业集约化、能源设施扰动
- disturbance: 干扰、野火、火生态、干旱、风暴、采伐、施工扰动、恢复轨迹
- invasion: 外来种、生物入侵、入侵风险、入侵管理
- conservation_management: 保护生物学、恢复生态、自然保护地、管理政策、生态风险
- plant_agroecology: 植物生态、森林/草地、农业生态、农田排水、沟渠、作物生态、植食作用
- aquatic_microbe: 淡水、海洋、湿地、水域过程、微生物生态、微生物组

预筛规则：
1. 只根据标题、摘要、期刊、文章类型和来源信号判断。
2. 先判断 isEcology。isEcology=false 时，pass=false。
3. isEcology=true 且能归入至少一个生态主题组，pass=true。
4. 对植物入侵、火生态/扰动、风电或能源设施生态影响、农田排水/氮磷/面源污染、生态遥感/模型/监测方法给予更高 relevance；其他生态学研究可以通过，但 relevance 应按与这些方向的距离降低。
5. 微信公众号或新闻报道可以作为发现入口；如果内容指向一篇可能相关论文，也可以 pass=true，但仍必须满足 isEcology=true。
6. 微信公众号推送如果主要是征稿、会议、招聘、课程、广告、投稿邀请、期刊宣传、活动通知，而不是介绍一项具体研究或论文，pass=false。
7. 输出严格 JSON，不要输出解释文字。
`;

const SCORE_PROMPT = `
你是 Paper Daily 的高质量评分模型。你的任务是对通过预筛的论文簇做主题相关性评分，并生成日报可读摘要。

总质量分由脚本计算：
- 信源分 source: 0-30，脚本已固定计算，不允许你修改。
- 主题相关性 theme: 0-50，由你评分。
- 论文类型 type: 0-20，脚本已固定计算，不允许你修改。

主题相关性 0-50 评分标准：
- 45-50: 直接命中用户核心课题，可支持选题、综述框架、研究假设或监测方案。
- 38-44: 明确相关，能提供背景、方法、案例或管理启发。
- 28-37: 相关但偏外围，需要人工判断是否保留。
- 15-27: 只有弱相关，通常不应进入精选日报。
- 0-14: 基本无关。

用户核心方向：
- 植物入侵与火烧/扰动风险
- 风电、太阳能等能源设施的生态影响，尤其是与植物入侵或生境扰动相关的研究
- 农田排水、沟渠、生态水文、氮磷和面源污染
- 生态遥感、模型、监测方法和可复用数据集
- 保护管理、恢复生态和生物多样性变化中能服务上述方向的研究

摘要要求：
1. title 优先使用原始论文的英文题名；如果不能识别原始论文，则为公众号或新闻内容生成一个中文研究信息标题。
2. oneLine 必须是中文一句话研究介绍，不要保留英文摘要原文。
3. summary 必须用中文写约 180-220 字。
4. 讲清研究对象、方法/证据、主要发现、为什么值得看。
5. 不要夸大结论，不要凭空添加 DOI、作者或期刊。
6. 引用信息只能使用输入元数据；缺失则保留空缺或用已有字段。
7. citation 不要包含 DOI、doi: 字样或 DOI URL；DOI 会由页面单独显示。
8. 输出严格 JSON，不要输出解释文字。
`;

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clusterCandidates(candidates) {
  const clusters = new Map();
  for (const item of candidates) {
    const key = item.doi ? `doi:${item.doi.toLowerCase()}` : `title:${normalizeTitle(item.title)}`;
    if (!clusters.has(key)) {
      clusters.set(key, { ...item, sourceSignals: [...(item.sourceSignals || [])] });
      continue;
    }
    const existing = clusters.get(key);
    existing.sourceSignals.push(...(item.sourceSignals || []));
    existing.abstract ||= item.abstract;
    existing.authors = existing.authors?.length ? existing.authors : item.authors || [];
    existing.url ||= item.url;
  }
  return [...clusters.values()];
}

function sourceScore(paper) {
  const signals = paper.sourceSignals || [];
  const base = signals.length
    ? Math.max(...signals.map((signal) => sourceQualityScores[signal.type] || 0))
    : 0;
  const wechatCount = signals.filter((signal) => signal.type === "wechat").length;
  const wechatBoost = Math.min(Math.max(wechatCount - 1, 0) * 2, 6);
  return Math.min(base + wechatBoost, 30);
}

function typeScore(paper) {
  return paperTypeScores[paper.type] || 8;
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON object found in model response: ${text.slice(0, 200)}`);
  return JSON.parse(match[0]);
}

function stripDoiFromCitation(citation = "", doi = "") {
  let value = citation;
  if (doi) {
    const escaped = doi.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    value = value
      .replace(new RegExp(`https?://(?:dx\\.)?doi\\.org/${escaped}`, "ig"), "")
      .replace(new RegExp(`doi:?\\s*${escaped}`, "ig"), "");
  }
  return value.replace(/\s+([.,;])/g, "$1").replace(/\s{2,}/g, " ").replace(/\s*\.\s*$/, ".").trim();
}

function cleanAbstract(value = "", title = "") {
  let text = String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  text = text
    .replace(/^[^,]{2,100},\s*Published online:\s*[^;]+;\s*/i, "")
    .replace(/\bdoi:\s*10\.\d{4,9}\/[-._;()/:A-Z0-9]+\s*/gi, "")
    .replace(/^Publication date:\s*[\s\S]*?Author\(s\):\s*[\s\S]*$/i, "")
    .replace(/^[^,]{2,80},\s*Volume\s+\d+[\s\S]*$/i, "")
    .replace(/^Publication date:\s*[^.。]+[.。]?\s*/i, "")
    .replace(/^Available online\s*[^.。]+[.。]?\s*/i, "")
    .replace(/^Source:\s*[^.。]+[.。]?\s*/i, "")
    .replace(/^Volume\s+\d+[\s\S]*$/i, "")
    .trim();
  if (title) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`^${escaped}\\s*[.。]?\\s*`, "i"), "");
  }
  return text.trim();
}

function chineseOneLine(paper) {
  const abstract = cleanAbstract(paper.abstract || "", paper.title);
  if (/[\u4e00-\u9fff]/.test(abstract)) {
    return abstract.split(/[。！？]/)[0].slice(0, 90) + "。";
  }
  return `该研究围绕“${paper.title}”展开，具体结论需结合原文摘要进一步确认。`;
}

function chineseSummary(paper) {
  const abstract = cleanAbstract(paper.abstract || "", paper.title);
  if (/[\u4e00-\u9fff]/.test(abstract)) return abstract;
  if (!abstract) return `该研究题为“${paper.title}”。当前 RSS 未提供有效摘要，需要打开原文查看研究对象、方法和主要结论。`;
  return `该研究题为“${paper.title}”。原始摘要显示，研究关注${abstract}。上线后会由 DeepSeek 将摘要翻译并压缩为中文研究介绍。`;
}

function likelyNonResearchPush(paper) {
  const text = `${paper.title} ${paper.abstract || ""}`.toLowerCase();
  if (/subscription and copyright information|copyright information|table of contents|issue information|front matter|back matter|author correction|publisher correction|correction:|corrigendum|erratum/.test(text)) {
    return true;
  }
  if (!paper.sourceSignals?.some((signal) => signal.type === "wechat")) return false;
  return /征稿|投稿|特刊|会议|研讨会|讲座|直播|课程|培训|招聘|招生|广告|优惠|会员|报名|论坛|workshop|webinar|conference|call for papers|special issue|job|hiring|recruit/.test(text);
}

function addTag(tags, tag, matched) {
  if (matched && !tags.includes(tag)) tags.push(tag);
}

async function deepseekJson(model, messages) {
  const response = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepSeek ${model} failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  return extractJson(data.choices?.[0]?.message?.content || "{}");
}

function dryPrescreen(paper) {
  const text = `${paper.title} ${paper.abstract || ""}`.toLowerCase();
  if (likelyNonResearchPush(paper)) {
    return {
      pass: false,
      isEcology: false,
      tags: [],
      relevance: 0,
      oneLine: ""
    };
  }
  const isEcology =
    /ecolog|ecosystem|biodiversity|conservation|restoration|urban ecology|agroecolog|agricultural ecology|landscape|community|population|species|habitat|trait|biogeochem|carbon|nitrogen|phosphorus|soil|forest|grassland|wetland|freshwater|marine|microbial|microbiome|\binvasion\b|\binvasive\b|wildfire|fire|disturbance|drainage|hydrology|remote sensing|vegetation|species distribution|climate change|land use|生态|生态学|生物多样性|保护生物学|恢复生态|城市生态|农业生态|景观|群落|种群|物种|栖息地|性状|生态系统|生物地球化学|碳|氮|磷|土壤|森林|草地|湿地|淡水|海洋|微生物|入侵|火|扰动|排水|遥感|植被|气候变化|土地利用/.test(
      text
    );
  const tags = [];
  addTag(tags, "modeling_methods", /model|modelling|simulation|remote sensing|machine learning|deep learning|gis|geospatial|dataset|database|software|protocol|模型|模拟|遥感|机器学习|深度学习|地理信息|数据集|数据库|软件|方法/.test(text));
  addTag(tags, "community_ecosystem", /community|ecosystem|food web|species interaction|ecosystem service|群落|生态系统|食物网|物种互作|生态系统服务/.test(text));
  addTag(tags, "population_traits", /population|demograph|trait|life history|movement|dispersal|survivorship|种群|性状|生活史|迁移|扩散|存活/.test(text));
  addTag(tags, "biogeochemistry", /biogeochem|carbon|nitrogen|phosphorus|nutrient|soil|gas flux|greenhouse gas|hydrology|生物地球化学|碳|氮|磷|养分|土壤|温室气体|水文/.test(text));
  addTag(tags, "genetics_evolution", /genetic|genomic|evolution|phylogen|adaptation|遗传|基因组|进化|系统发育|适应/.test(text));
  addTag(tags, "landscape_macroecology", /landscape|macroecolog|biogeograph|large scale|large-scale|scale|景观|宏生态|生物地理|大尺度|尺度/.test(text));
  addTag(tags, "species_distribution", /species distribution|distribution model|range shift|niche|habitat suitability|物种分布|分布模型|范围变化|生态位|栖息地适宜/.test(text));
  addTag(tags, "climate_anthropogenic", /climate change|warming|anthropogenic|urban|land use|agricultural intensification|wind farm|wind power|renewable|solar|气候变化|增温|人类影响|城市|土地利用|农业集约化|风电|新能源|太阳能/.test(text));
  addTag(tags, "disturbance", /disturbance|fire|wildfire|drought|storm|logging|construction|restoration trajectory|扰动|火灾|野火|火烧|干旱|风暴|采伐|施工|恢复轨迹/.test(text));
  addTag(tags, "invasion", /\binvasion\b|\binvasive\b|alien species|non-native|入侵|外来种|外来物种/.test(text));
  addTag(tags, "conservation_management", /conservation|restoration|management|policy|protected area|risk assessment|保护|恢复|管理|政策|自然保护地|风险评估/.test(text));
  addTag(tags, "plant_agroecology", /plant|forest|grassland|herbivor|agronom|agroecolog|crop|drainage|ditch|vegetation|植物|森林|草地|植食|农业生态|农田|作物|排水|沟渠|植被/.test(text));
  addTag(tags, "aquatic_microbe", /aquatic|freshwater|marine|wetland|microbial|microbiome|水域|淡水|海洋|湿地|微生物|微生物组/.test(text));
  const priorityTags = ["invasion", "disturbance", "climate_anthropogenic", "plant_agroecology", "biogeochemistry", "modeling_methods"];
  const priorityBonus = tags.filter((tag) => priorityTags.includes(tag)).length * 2;
  return {
    pass: isEcology && tags.length > 0,
    isEcology,
    tags,
    relevance: Math.min(30 + Math.max(tags.length - 1, 0) * 2 + priorityBonus, 50),
    oneLine: paper.abstract || paper.title
  };
}

async function prescreen(paper) {
  if (DRY_RUN) return dryPrescreen(paper);
  return deepseekJson(PRESCREEN_MODEL, [
    {
      role: "system",
      content: PRESCREEN_PROMPT
    },
    {
      role: "user",
      content: JSON.stringify({
        themes: topicLabels,
        paper: {
          title: paper.title,
          abstract: paper.abstract,
          journal: paper.journal,
          type: paper.type,
          date: paper.date,
          sourceSignals: paper.sourceSignals || []
        },
        output_schema: {
          pass: "boolean",
          isEcology: "boolean",
          tags: "array of theme keys",
          relevance: "0-50 integer",
          oneLine: "one Chinese sentence"
        }
      })
    }
  ]);
}

function dryScore(paper, pre) {
  const source = sourceScore(paper);
  const theme = Math.max(0, Math.min(Number(pre.relevance || 0), 50));
  const type = typeScore(paper);
  return {
    source,
    theme,
    type,
    total: source + theme + type,
    title: paper.title,
    oneLine: chineseOneLine(paper),
    summary: chineseSummary(paper),
    citation: ""
  };
}

function dateKeyForPaper(paper) {
  return paper.date || "undated";
}

function topPerDay(items, limit = 5) {
  const byDate = new Map();
  for (const item of items) {
    const key = dateKeyForPaper(item);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(item);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => {
      if (a === "undated") return 1;
      if (b === "undated") return -1;
      return b.localeCompare(a);
    })
    .flatMap(([, entries]) => entries.sort((a, b) => b.score - a.score).slice(0, limit));
}

async function scorePaper(paper, pre, topicWeights) {
  if (DRY_RUN) return dryScore(paper, pre);
  const modelScore = await deepseekJson(SCORE_MODEL, [
    {
      role: "system",
      content: SCORE_PROMPT
    },
    {
      role: "user",
      content: JSON.stringify({
        scoring_rule: {
          source: "0-30, 已由规则计算",
          theme: "0-50, 可参考预筛 relevance",
          type: "0-20, 已由规则计算"
        },
        fixed_scores: {
          source: sourceScore(paper),
          type: typeScore(paper)
        },
        prescreen: pre,
        paper,
        output_schema: {
          theme: "0-50 integer",
          reason: "short Chinese reason for theme score",
          title: "original English paper title when available; otherwise Chinese research information title",
          summary: "about 200 Chinese characters",
          oneLine: "one Chinese sentence",
          citation: "APA-like reference using provided metadata only, without DOI"
        }
      })
    }
  ]);
  const source = sourceScore(paper);
  const type = typeScore(paper);
  const modelTheme = Math.max(0, Math.min(Number(modelScore.theme || pre.relevance || 0), 50));
  const preferenceBonus = (pre.tags || []).reduce(
    (sum, tag) => sum + Number(topicWeights[tag] || 0) * 3,
    0
  );
  const theme = Math.max(0, Math.min(Math.round(modelTheme + preferenceBonus), 50));
  return {
    source,
    theme,
    type,
    total: source + theme + type,
    title: modelScore.title,
    summary: modelScore.summary,
    oneLine: modelScore.oneLine || pre.oneLine,
    reason: modelScore.reason,
    citation: stripDoiFromCitation(modelScore.citation || dryScore(paper, pre).citation, paper.doi)
  };
}

function cacheHit(entry, fingerprint, weightsHash) {
  return (
    entry &&
    entry.version === SCORING_VERSION &&
    entry.mode === CACHE_MODE &&
    entry.fingerprint === fingerprint &&
    entry.topicWeightsHash === weightsHash
  );
}

function selectedFromScore(paper, pre, score) {
  return {
    ...paper,
    title: score.title || paper.title,
    tags: pre.tags || [],
    oneLine: score.oneLine || pre.oneLine,
    summary: score.summary,
    reason: score.reason || "通过主题预筛并进入三维评分。",
    score: score.total,
    scoreBreakdown: {
      source: score.source,
      theme: score.theme,
      type: score.type
    },
    citation: score.citation,
    generatedAt: new Date().toISOString()
  };
}

async function main() {
  const raw = await fs.readFile(INPUT, "utf8");
  const candidates = JSON.parse(raw);
  const clusters = clusterCandidates(candidates);
  const topicWeights = topicWeightsFromFeedback(await readTopicFeedback());
  const weightsHash = topicWeightsHash(topicWeights);
  const cache = await readCache();
  const selected = [];
  const stats = { cacheHits: 0, cacheMisses: 0, rejectedHits: 0, rejectedMisses: 0 };

  for (const paper of clusters) {
    const key = cacheKey(paper);
    const fingerprint = candidateFingerprint(paper);
    const cached = cache.items[key];

    if (cacheHit(cached, fingerprint, weightsHash)) {
      if (cached.status === "selected") {
        stats.cacheHits += 1;
        selected.push({
          ...cached.item,
          sourceSignals: paper.sourceSignals || cached.item.sourceSignals || [],
          sourceUrls: undefined,
          generatedAt: cached.item.generatedAt || cached.updatedAt || new Date().toISOString()
        });
      } else {
        stats.rejectedHits += 1;
      }
      continue;
    }

    stats.cacheMisses += 1;
    const pre = await prescreen(paper);
    if (!pre.pass || pre.isEcology === false) {
      stats.rejectedMisses += 1;
      cache.items[key] = {
        version: SCORING_VERSION,
        mode: CACHE_MODE,
        topicWeightsHash: weightsHash,
        fingerprint,
        status: "rejected",
        pre,
        updatedAt: new Date().toISOString()
      };
      continue;
    }
    const score = await scorePaper(paper, pre, topicWeights);
    const item = selectedFromScore(paper, pre, score);
    selected.push(item);
    cache.items[key] = {
      version: SCORING_VERSION,
      mode: CACHE_MODE,
      topicWeightsHash: weightsHash,
      fingerprint,
      status: "selected",
      pre,
      score,
      item,
      updatedAt: new Date().toISOString()
    };
  }

  selected.sort((a, b) => b.score - a.score);
  const items = selected;
  const output = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    prescreenModel: DRY_RUN ? "local-rule" : PRESCREEN_MODEL,
    scoreModel: DRY_RUN ? "local-rule" : SCORE_MODEL,
    topicWeights,
    cache: {
      mode: CACHE_MODE,
      version: SCORING_VERSION,
      hits: stats.cacheHits,
      misses: stats.cacheMisses,
      rejectedHits: stats.rejectedHits,
      rejectedMisses: stats.rejectedMisses
    },
    items
  };

  await fs.writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  await writeCache(cache);
  console.log(
    `Wrote ${OUTPUT} with ${output.items.length} selected item(s). Cache hits: ${stats.cacheHits}, misses: ${stats.cacheMisses}, rejected hits: ${stats.rejectedHits}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
