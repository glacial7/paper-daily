import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { loadLocalEnv } from "./local-env.mjs";
import { journalImpactFactor, journalNameFromDoiMetadata, journalNameFromDoiPattern, journalPartitionScore } from "./journal-index.mjs";
import {
  enrichPaperMetadata,
  inferInterpretivePaperType,
  looksLikeEnglishTitle,
  metadataConfidence as computeMetadataConfidence,
  metadataFingerprint as paperMetadataFingerprint
} from "./metadata-utils.mjs";

const ROOT = process.cwd();
await loadLocalEnv(ROOT);
const INPUT = path.join(ROOT, "data", "candidates.json");
const OUTPUT = path.join(ROOT, "data", "latest.json");
const OUTPUT_JS = path.join(ROOT, "data", "latest.js");
const CACHE = path.join(ROOT, "data", "paper-cache.json");
const REPORT = path.join(ROOT, "data", "scoring-run-report.json");
const RSS_CANDIDATES = path.join(ROOT, "data", "rss-candidates.json");
const FEEDBACK = path.join(ROOT, "config", "topic-feedback.json");
const MODEL_PROVIDER = process.env.PAPER_DAILY_MODEL_PROVIDER || "deepseek";
const API_KEY = process.env.PAPER_DAILY_MODEL_API_KEY || process.env.DEEPSEEK_API_KEY;
const DRY_RUN = process.env.PAPER_DAILY_DRY_RUN === "1" || !API_KEY;

const MODEL_BASE_URL =
  process.env.PAPER_DAILY_MODEL_BASE_URL ||
  process.env.DEEPSEEK_BASE_URL ||
  "https://api.deepseek.com/chat/completions";
const PRESCREEN_MODEL = process.env.PAPER_DAILY_PRESCREEN_MODEL || process.env.DEEPSEEK_PRESCREEN_MODEL || "deepseek-v4-flash";
const SCORE_MODEL = process.env.PAPER_DAILY_SCORE_MODEL || process.env.DEEPSEEK_SCORE_MODEL || "deepseek-v4-pro";
const SCORING_SYSTEM = "theme_journal_research_profile_v3";
const SCORING_VERSION = "2026-07-15-novel-ecosystems-frame-v1";
const CACHE_MODE = DRY_RUN ? "dry-run" : `${MODEL_PROVIDER}:${PRESCREEN_MODEL}:${SCORE_MODEL}`;
const COMPACT_LOG = process.env.PAPER_DAILY_COMPACT_LOG === "1";
const TRUST_LOCAL_WECHAT_PRESCREEN = process.env.PAPER_DAILY_TRUST_LOCAL_WECHAT_PRESCREEN === "1";
const RSS_ONLY = process.env.PAPER_DAILY_RSS_ONLY === "1";
const JOURNAL_RSS_SOURCE_TYPES = new Set(["topJournal", "reviewJournal", "professionalJournal"]);
const MAX_LOOKBACK_DAYS = 14;
const LOOKBACK_DAYS = normalizeLookbackDays(process.env.PAPER_DAILY_LOOKBACK_DAYS);
const SCORE_RETRIES = Math.max(0, Math.floor(Number(process.env.PAPER_DAILY_SCORE_RETRIES || 2)));
const SCORE_RETRY_SLEEP_MS = Math.max(0, Number(process.env.PAPER_DAILY_SCORE_RETRY_SLEEP_MS || 1200));
const parsedConcurrency = Number(process.env.PAPER_DAILY_SCORE_CONCURRENCY || 2);
const SCORE_CONCURRENCY = Number.isFinite(parsedConcurrency) && parsedConcurrency > 0 ? Math.floor(parsedConcurrency) : 3;
const SOURCE_SIGNAL_SCORE_MAX = 10;
const THEME_SCORE_MAX = 100;
const JOURNAL_QUALITY_SCORE_MAX = 100;
const WATCHLIST_BONUS_MAX = 6;
const DAILY_RECOMMEND_RATIO = 0.1;
const DAILY_RECOMMEND_MAX = 5;
const RANKING_SYSTEM = "theme_journal_layered_daily_v3";
const DAILY_RELATED_THEME_MIN = 45;
const DAILY_STRONG_THEME_MIN = 65;
const DAILY_CORE_THEME_MIN = 80;
const DAILY_RELATED_JOURNAL_MIN = 82;
const DAILY_STRONG_JOURNAL_MIN = 62;
const DAILY_CORE_JOURNAL_MIN = 62;
const DAILY_EXCEPTIONAL_B3_THEME_MIN = 92;
const DAILY_EXCEPTIONAL_B3_JOURNAL_MIN = 52;
const modelStats = {
  retries: { prescreen: 0, score: 0 },
  fallbacks: { prescreen: 0, score: 0 }
};

function normalizeLookbackDays(value) {
  const days = Number(value || 7);
  if (!Number.isFinite(days) || days <= 0) return 7;
  return Math.min(MAX_LOOKBACK_DAYS, Math.max(1, Math.round(days)));
}

const topicLabels = {
  pv_invasion: "光伏/植物入侵",
  invasion_fire: "入侵-野火反馈",
  dry_valley_savanna: "干热河谷/河谷萨王纳",
  pyric_herbivory: "火-食草动物互作",
  renewable_biodiversity_risk: "新能源/生物多样性风险",
  novel_ecosystems_resilience: "新型生态系统/韧性",
  invasion_ecology: "入侵生态学",
  community_interactions: "群落互作",
  restoration_conservation: "恢复/保护管理",
  restoration_conservation_theme: "恢复/保护支撑",
  spatial_risk_methods: "空间风险/SDM",
  remote_sensing_monitoring: "遥感/监测",
  statistical_synthesis_methods: "统计/综合方法",
  soil_rhizosphere_microbe: "土壤/根际/微生物",
  coastal_microalgae: "潮间带微藻",
  saltmarsh_milu_spartina: "麋鹿/互花米草",
  pika_arthropod_grazing: "鼠兔/放牧/节肢动物",
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
  topJournal: 5,
  reviewJournal: 4,
  professionalJournal: 3,
  natureScienceNews: 2,
  scienceDaily: 2,
  wechat: 1
};

async function readTopicFeedback() {
  try {
    return JSON.parse(await fs.readFile(FEEDBACK, "utf8"));
  } catch {
    return { minFeedbackPerTopic: 3, feedback: [] };
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

function journalRssPaper(paper = {}) {
  if (!RSS_ONLY) return paper;
  const sourceSignals = (paper.sourceSignals || []).filter((signal) =>
    JOURNAL_RSS_SOURCE_TYPES.has(signal?.type)
  );
  if (!sourceSignals.length) return null;
  const sanitized = {
    ...paper,
    sourceSignals,
    sourceType: sourceSignals.some((signal) => signal.type === "professionalJournal")
      ? "professional"
      : "comprehensive",
    sourceUrls: (paper.sourceUrls || []).filter(
      (source) => !/mp\.weixin\.qq\.com|wechat|微信公众号/i.test(`${source?.url || ""} ${source?.label || ""}`)
    )
  };
  delete sanitized.localPrescreen;
  delete sanitized.paperMention;
  delete sanitized.wechatSource;
  delete sanitized.wechatArticle;
  return sanitized;
}

function sanitizeRssOnlyCache(cache, candidates = []) {
  if (!RSS_ONLY) return cache;
  const allowedKeys = new Set(candidates.map(cacheKey));
  const items = {};
  for (const [key, entry] of Object.entries(cache.items || {})) {
    if (!allowedKeys.has(key)) continue;
    const item = entry.item ? journalRssPaper(entry.item) : null;
    if (entry.item && !item) continue;
    items[key] = item ? { ...entry, item } : entry;
  }
  return { ...cache, items };
}

function asArrayPayload(payload) {
  return Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
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

async function writeLatestData(output) {
  const json = JSON.stringify(output, null, 2);
  await fs.writeFile(OUTPUT, `${json}\n`);
  await fs.writeFile(OUTPUT_JS, `globalThis.PAPER_DAILY_LATEST = ${json};\n`);
}

function stableHash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function topicWeightsFromFeedback(config) {
  const safeConfig = config && typeof config === "object" ? config : {};
  const min = Number(safeConfig.minFeedbackPerTopic || 3);
  const baseWeights = Object.fromEntries(
    Object.keys(topicLabels).map((tag) => [tag, clampTopicWeight(safeConfig.weights?.[tag] || 0)])
  );
  const stats = {};
  for (const item of safeConfig.feedback || []) {
    const delta = item.value === "dislike" ? -1 : item.value === "like" ? 1 : 0;
    if (!delta) continue;
    for (const tag of item.tags || []) {
      if (!stats[tag]) stats[tag] = { count: 0, total: 0 };
      stats[tag].count += 1;
      stats[tag].total += delta;
    }
  }
  for (const [tag, stat] of Object.entries(stats)) {
    if (stat.count < min || !(tag in baseWeights)) continue;
    baseWeights[tag] = clampTopicWeight(baseWeights[tag] + Math.round(stat.total / stat.count));
  }
  return baseWeights;
}

function clampTopicWeight(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(-3, Math.min(3, Math.round(numeric)));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function preferenceSettingsFromFeedback(config) {
  const safeConfig = config && typeof config === "object" ? config : {};
  return {
    topicWeights: topicWeightsFromFeedback(safeConfig),
    watchlist: watchlistFromFeedback(safeConfig),
    watchlistBonusMax: clamp(Number(safeConfig.watchlistBonusMax || WATCHLIST_BONUS_MAX), 0, WATCHLIST_BONUS_MAX)
  };
}

function watchlistFromFeedback(config = {}) {
  const raw = Array.isArray(config.watchlist)
    ? config.watchlist
    : Array.isArray(config.watchTeams)
      ? config.watchTeams
      : [];
  return raw
    .map((entry) => {
      if (typeof entry === "string") return { name: entry, aliases: [entry] };
      if (!entry || typeof entry !== "object") return null;
      const aliases = [
        entry.name,
        entry.pi,
        entry.team,
        ...(Array.isArray(entry.aliases) ? entry.aliases : [])
      ].filter(Boolean);
      if (!aliases.length) return null;
      return {
        name: entry.name || entry.pi || entry.team || aliases[0],
        aliases,
        bonus: clamp(Number(entry.bonus || 4), 0, WATCHLIST_BONUS_MAX),
        notes: entry.notes || ""
      };
    })
    .filter(Boolean);
}

function cacheKey(paper) {
  const doi = normalizeDoi(paper.doi || "");
  if (doi) return `doi:${doi}`;
  const titleKey = reliableTitleKey(paper);
  if (titleKey) return `title:${titleKey}`;
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

function contentFingerprint(paper) {
  const enriched = enrichPaperMetadata(paper);
  const doi = normalizeDoi(enriched.doi || "");
  const titleKey = reliableTitleKey(enriched) || normalizeTitle(enriched.title || "");
  return stableHash({
    doi,
    title: titleKey,
    journal: normalizeTitle(enriched.journal || ""),
    type: enriched.type || "",
    authors: (enriched.authors || []).slice(0, 6).map((author) => normalizeTitle(author || "")),
    abstract: cleanAbstract(enriched.abstract || "", enriched.title || "").slice(0, 900)
  });
}

function sourceSignalsFingerprint(paper) {
  return stableHash(dedupeSourceSignals(paper.sourceSignals || []).map(sourceSignalKey).sort());
}

function legacyCandidateFingerprint(paper) {
  return stableHash({
    title: normalizeTitle(paper.title || ""),
    abstract: cleanAbstract(paper.abstract || "", paper.title || "").slice(0, 1200),
    doi: (paper.doi || "").toLowerCase(),
    url: paper.url || "",
    journal: paper.journal || "",
    type: paper.type || "",
    authors: paper.authors || [],
    localPrescreen: paper.localPrescreen || null,
    sourceSignals: (paper.sourceSignals || []).map((signal) => ({
      type: signal.type || "",
      name: signal.name || "",
      url: signal.url || ""
    }))
  });
}

function candidateFingerprint(paper) {
  const enriched = enrichPaperMetadata(paper);
  return stableHash({
    title: normalizeTitle(enriched.title || ""),
    abstract: cleanAbstract(enriched.abstract || "", enriched.title || "").slice(0, 1200),
    doi: (enriched.doi || "").toLowerCase(),
    journal: normalizeTitle(enriched.journal || ""),
    type: enriched.type || "",
    metadata: paperMetadataFingerprint(enriched),
    localPrescreen: enriched.localPrescreen || null,
    sourceSignals: (enriched.sourceSignals || [])
      .map((signal) => ({
        type: signal.type || "",
        name: normalizeTitle(signal.name || "")
      }))
      .sort((a, b) => `${a.type}:${a.name}`.localeCompare(`${b.type}:${b.name}`))
  });
}

function topicWeightsHash(preferences) {
  if (preferences?.topicWeights && !(preferences.watchlist || []).length) {
    return stableHash(preferences.topicWeights);
  }
  return stableHash(preferences || {});
}

const PRESCREEN_PROMPT = `
你是 Paper Daily 的低成本预筛模型。你的任务不是写摘要，而是判断候选条目是否值得进入高质量评分阶段。

第一道门：先判断候选是否属于“泛生态学研究”。泛生态学优先看明确研究对象，而不是只看宽泛学科名：
- 生态系统、生物群落、动植物种群、物种、栖息地、生物多样性、森林/草地/湿地/淡水/农田等生态系统
- 这些对象与气候变化、水文、土壤、土地利用、干扰、火烧、入侵、保护管理或资源管理之间的关系
- 群落生态、生态系统生态、景观生态、全球变化生态、恢复生态、城市生态、农业生态、保护生物学、物种分布、生态遥感和生态模型
- 环境科学、农学、地学、植物学、动物学中的相邻研究，只有在明确服务上述生态系统/群落/种群/物种/栖息地目标时才算相关

不属于泛生态学的条目应 pass=false，即使来自综合期刊、微信公众号或新闻报道。

生态学主题组（tags 只能从这些 key 中选择）。新研究画像优先使用前面的细分 family，旧 key 仅用于兼容历史数据：
- pv_invasion: 光伏工程/太阳能电站对植物入侵、植物群落、微生境、扩散风险和生态安全的影响
- invasion_fire: 植物入侵-野火反馈、可燃性、燃料连通性、火后遗留效应、种子库、优先效应
- dry_valley_savanna: 干热河谷、金沙江/元江/怒江河谷、河谷萨王纳、稀树灌草丛及其植被动态
- pyric_herbivory: 火-食草动物互作、放牧、大型食草动物、pyric herbivory、植被斑块动态
- renewable_biodiversity_risk: 光伏/风电/新能源基础设施与生物多样性风险、物种 range map、IUCN、exposure/vulnerability/risk
- novel_ecosystems_resilience: 新型生态系统、生态重组、群落重组、演变路径与韧性未来；必须同时有明确生态对象/过程，不能仅凭 resilience、治理或公平等泛词命中
- invasion_ecology: 生物入侵理论、外来种、入侵滞后、扩散廊道、生物抗性、干扰-资源波动-入侵
- community_interactions: 种间关系、群落生态、食物网、植物-土壤反馈、竞争/促进/捕食/传粉/食草作用
- restoration_conservation: 生态恢复、保护管理、rewilding、生态安全屏障、入侵治理
- spatial_risk_methods: SDM、MaxEnt、物种分布、栖息地适宜性、空间风险、热点识别、景观连接度
- remote_sensing_monitoring: Landsat、Sentinel、MODIS、GEE、UAV、LiDAR、植被指数、长期监测
- statistical_synthesis_methods: meta-analysis、GLMM、SEM、Bayesian、层级模型、因果推断、机器学习
- soil_rhizosphere_microbe: 根际、根系分泌物、微生物组、菌根、土壤结构；只有连接入侵、恢复、农业生态安全或干扰机制时才作为支撑。镉胁迫、植物修复、植物激素和泛根际过程不再作为主要兴趣点
- coastal_microalgae: 潮间带/海岸底栖微藻、microphytobenthos、biofilm、benthic algal bloom、消费者 top-down control
- saltmarsh_milu_spartina: 麋鹿再野化、互花米草、盐沼湿地、大型食草动物控制入侵
- pika_arthropod_grazing: 鼠兔、青藏高原放牧、牦牛/绵羊、节肢动物群落、土壤扰动
- modeling_methods: 生态模型、统计建模、生态统计、遥感、GIS、机器学习、监测方法、数据集、软件和方法论文
- community_ecosystem: 群落过程、生态系统功能、食物网、物种互作、动植物种间关系、生态系统服务
- population_traits: 种群动态、生活史、性状、运动扩散、存活率、种群统计
- biogeochemistry: 碳氮磷循环、养分、土壤过程、温室气体、生态水文、植物-土壤过程
- genetics_evolution: 遗传多样性、基因组、进化、系统发育、适应
- landscape_macroecology: 景观生态、宏生态、生物地理、大尺度格局、多尺度过程
- species_distribution: 物种分布、生态位、栖息地适宜性、范围变化
- climate_anthropogenic: 气候变化、人类影响、土地利用、城市化、农业集约化、光伏工程、太阳能设施和能源设施扰动
- disturbance: 干扰、野火、火生态、干旱、风暴、采伐、施工扰动、恢复轨迹
- invasion: 外来种、生物入侵、入侵风险、入侵管理
- conservation_management: 保护生物学、恢复生态、自然保护地、管理政策、生态风险
- plant_agroecology: 植物生态、森林/草地、干热河谷植被、农业生态、农业生态安全、农田排水、沟渠、作物生态、植食作用
- aquatic_microbe: 淡水、海洋、湿地、水域过程、微生物生态、微生物组

预筛规则：
1. 只根据标题、摘要、期刊、文章类型和来源信号判断。
2. 先判断 isEcology。isEcology=false 时，pass=false。
3. isEcology=true 且能归入至少一个生态主题组，pass=true。
4. 当前核心任务来自 PROJECT_GOAL.md 与 README.md 的 Research Profile 部分：光伏工程与植物入侵风险、干热河谷植物入侵-野火反馈、火-食草动物-地形互作与河谷萨王纳植被动态、新能源基础设施与生物多样性风险。“新型生态系统与韧性未来”是连接弃耕、火烧或入侵地、干热河谷及光伏/新能源人造场地的上位框架；单独出现相关泛词只算支撑兴趣，只有连接具体场地、生态对象/过程和当前任务时才可提高 relevance。环境科学、农学、地学、植物学、动物学等泛生态内容可以通过，但如果没有明确生态系统、生物群落、动植物种群、物种或栖息地目标，relevance 应保守降低。
5. 微信公众号或新闻报道可以作为发现入口；如果内容指向一篇可能相关论文，也可以 pass=true，但仍必须满足 isEcology=true。
6. 微信公众号推送如果主要是征稿、会议、招聘、课程、广告、投稿邀请、期刊宣传、活动通知，而不是介绍一项具体研究或论文，pass=false。
7. 输出严格 JSON，不要输出解释文字。
`;

const SCORE_PROMPT = `
你是 Paper Daily 的高质量评分模型。你的任务是对通过预筛的论文簇做主题相关性评分，并生成日报可读摘要。

分层评分由脚本计算和展示：
- 主题相关性 theme: 0-100，由你评分；脚本会在此基础上加入用户反馈和 watchlist 小幅调整。右上角分值显示 theme，不再显示 theme+journal 总分。
- 期刊质量 journal: 0-100，脚本按 DOI 精确元数据优先识别期刊后固定计算；A 档沿用手工规则；B1=排除 A 档后的 Nature Index、CAS 小类生态学一区或环境科学与生态学大类一区；B2=排除 A/B1 后的其它 CAS 大类/小类一区；B3=排除以上后的 JCR Q1 且 CAS 大类/小类二区；C=排除高档位后的剩余 JCR Q1；其它期刊不计 journal 分。IF 仅用于同档排序/展示，不允许升档；文章类型只在同一期刊档位内微调优先级。
- 信源 sourceSignal: 0-10，只代表 DOI 聚合、多来源重复和信息质量，不进入总分，不允许你把公众号或新闻来源当作论文质量加分。

主题相关性 0-100 评分要比普通关键词匹配更保守。请先判断命中维度：
1. current_task: 直接命中当前核心任务。
2. task_support: 可迁移支持当前任务的理论、对象、过程或应用场景。
3. secondary_task: 连接未完成论文或既有待推进工作，如潮间带底栖微藻、麋鹿-互花米草、鼠兔/放牧-节肢动物。
4. ecology_object: 明确研究生态系统、生物群落、动植物种群、物种、栖息地、生物多样性或生态过程。
5. method_data: 提供可复用方法、模型、统计分析、遥感监测、数据集或数据源。
6. metadata_ready: DOI、英文题名、期刊、摘要等元数据足够可信。

主题相关性 0-100 评分标准：
- 95-100: 基本不用。除非直接命中当前核心任务，且能直接支持当前课题设计、综述框架、监测方案或论文写作；普通 A 档生态论文也不要给到满分。
- 85-94: 直接命中当前核心任务，并且至少另有一个维度支持。单一关键词命中核心方向通常不要超过 78。
- 66-84: 明确相关。当前核心任务单维度命中，或 task_support/secondary_task + ecology_object/method_data 等两个以上维度可以在此档。
- 45-65: 泛生态或方法/数据相关，但离当前核心任务仍偏外围。低层次期刊或公众号单一线索通常应落在此档或更低。
- 25-49: 只有弱相关，通常不应进入精选日报。
- 0-24: 基本无关。

泛生态学扩展领域如环境科学、农学、地学、植物学、动物学可以进入评分，但除非明确研究生态系统、生物群落、动植物种群、物种、栖息地或生物多样性，并服务用户核心方向，不要因为学科相邻而给高 theme 分。

必须避免的高分误判：
- 只因为文章含有 plant、soil、water、model、Bayesian、remote sensing 等泛词，不要给 90+。
- 只有方法/数据价值但不服务当前核心或二级兴趣时，不要给 80+。
- 只有公众号报道、摘要缺失或 DOI/期刊不稳时，不要给 80+。
- generic ecology、环境/水文/土壤/农业相邻主题，除非同时满足两个以上命中维度，否则整体降低一档。

用户研究画像依据 PROJECT_GOAL.md 与 README.md 的 Research Profile 部分，不能把旧 topic 配置当作兴趣证据。
当前核心任务：
- 光伏工程与植物入侵风险：云南/西南山地干热河谷光伏电站、微生境异质性、紫茎泽兰/飞机草等入侵种、SDM/MaxEnt/GEE 和入侵预警。
- 干热河谷植物入侵-野火反馈：入侵植物功能性状、群落可燃性、火后遗留效应、种子库/优先效应、燃料连通性和灾变阈值。
- 火-食草动物-地形互作与河谷萨王纳植被动态：pyric herbivory、放牧/大型食草动物、地形调控、遥感时序和野外控制实验。
- 新能源基础设施与生物多样性风险：光伏/海上风电等 renewable energy infrastructure、物种 range map、IUCN threat/habitat、exposure-vulnerability-risk 和空间热点。
支撑兴趣：
- 入侵生态学、群落互作、生态恢复与保护管理、遥感/SDM/空间风险、统计与综合分析方法。
- “新型生态系统与韧性未来”是上位任务框架：关注弃耕地、火烧或入侵主导土地、干热河谷及光伏等能源工程场地中的生态过程改变、群落重组、生物多样性维持、演变路径、韧性适应和生态系统服务。
- 该框架单独出现只算 task_support；只有同时连接上述具体场地、明确生态对象/过程和当前课题时，才按 current_task 进入高分路径。纯社会经济、公平或治理讨论不得因此获得高 theme。
低优先背景：
- 镉胁迫、植物修复、植物激素和泛根际过程不再作为主要兴趣点。除非论文发表在 A 档期刊，或明确连接当前核心任务、入侵/恢复/干扰机制、农业生态安全和可复用方法需求，否则不要进入高 theme 或日报推荐。
次级任务：
- 潮间带底栖微藻、麋鹿-互花米草、鼠兔/放牧-节肢动物等方向保留，但默认不压过当前核心课题。

摘要要求：
1. title 优先使用原始论文的英文题名；如果不能识别原始论文，则为公众号或新闻内容生成一个中文研究信息标题。
2. oneLine 必须是中文一句话，用一句话说明这篇文献研究的是什么问题、属于什么研究方向/领域，以及文献类型（如实验研究、综述、理论研究、方法论文、数据论文、评论等）；不要保留英文摘要原文。
3. summary 必须用中文写成单段落结构化详细介绍，总字数控制在 500 字以内，语言简洁凝练，避免学术套话。
4. summary 仍然是一个段落，不要换行分节，不要使用项目符号列表；可以在段内用 [背景]、[方法]、[发现]、[贡献]、[局限]、[精读] 这类行内小标题突出结构。
5. summary 覆盖以下信息，每个部分只保留影响快速判断文献价值的信息：背景与动机用 2-3 句话说明为什么做、现有空白或不足，不展开文献综述；方法/设计概括方法、数据来源、样本、实验或模型设计中影响结论可信度的关键要素；关键发现按重要性概括 3-5 条最重要发现或结论，可用 1)、2)、3) 在同一段中串联，避免罗列所有数据细节；创新与贡献指出相对已有研究的独特贡献或新意；局限与边界说明作者自述或可判断的局限、适用范围或需谨慎解读之处；是否精读给出一句简短判断，可指出值得精读的方法、结果或讨论部分。
6. 不要夸大结论，不要凭空添加 DOI、作者、期刊、样本量、地点或方法；输入证据不足时明确写“信息不足，需查原文确认”。
7. 引用信息只能使用输入元数据；缺失则保留空缺或用已有字段。
8. citation 不要包含 DOI、doi: 字样或 DOI URL；DOI 会由页面单独显示。
9. 输出严格 JSON，不要输出解释文字。
`;

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleTokens(title = "") {
  return normalizeTitle(title)
    .split(" ")
    .filter((token) => token.length > 1 && !/^(the|and|for|with|from|into|over|under|using|use|via|are|was|were|that|this|these|those|new|study|research|paper)$/.test(token));
}

function reliableTitleKey(paper = {}) {
  const title = normalizeTitle(paper.title || paper.originalTitle || paper.rawTitle || "");
  if (!title) return "";
  const tokens = titleTokens(title);
  const hasChinese = /[\u4e00-\u9fff]/.test(paper.title || "");
  const latinTokens = tokens.filter((token) => /[a-z]/i.test(token));
  if (hasChinese && latinTokens.length < 4) return "";
  if (tokens.length < 4 || title.length < 22) return "";
  if (/^(science|nature|journal|proceedings|annual review|frontiers|trends|ecology letters|new phytologist)$/.test(title)) return "";
  return title;
}

function tokenSimilarity(a = "", b = "") {
  const aTokens = new Set(titleTokens(a));
  const bTokens = new Set(titleTokens(b));
  if (!aTokens.size || !bTokens.size) return 0;
  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap += 1;
  }
  const containment = overlap / Math.min(aTokens.size, bTokens.size);
  const jaccard = overlap / new Set([...aTokens, ...bTokens]).size;
  return Math.max(containment * 0.8 + jaccard * 0.2, jaccard);
}

function paperYear(paper = {}) {
  const dateText = paper.date || paper.publishedAt || paper.generatedAt || "";
  const match = String(dateText).match(/\b(20\d{2}|19\d{2})\b/);
  return match ? match[1] : "";
}

function metadataCompatible(a = {}, b = {}) {
  const journalA = normalizeTitle(a.journal || "");
  const journalB = normalizeTitle(b.journal || "");
  const yearA = paperYear(a);
  const yearB = paperYear(b);
  if (journalA && journalB && (journalA.includes(journalB) || journalB.includes(journalA))) return true;
  if (yearA && yearB && yearA === yearB) return true;
  return !journalA || !journalB || !yearA || !yearB;
}

function samePaperByTitle(a = {}, b = {}) {
  const titleA = reliableTitleKey(a);
  const titleB = reliableTitleKey(b);
  if (!titleA || !titleB) return false;
  if (titleA === titleB) return true;
  const similarity = tokenSimilarity(titleA, titleB);
  if (similarity >= 0.96) return true;
  return similarity >= 0.9 && metadataCompatible(a, b);
}

function normalizeDoi(value = "") {
  const match = String(value).match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  if (!match) return "";
  return match[0]
    .replace(/[。；;，,、\s"'<>()[\]{}]+$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
}

function doiMatches(value = "") {
  return [...String(value).matchAll(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi)]
    .map((match) => normalizeDoi(match[0]))
    .filter(Boolean);
}

function hasDoiLabelNearby(text = "", doi = "") {
  const index = String(text).toLowerCase().indexOf(doi.toLowerCase());
  if (index < 0) return false;
  const window = String(text).slice(Math.max(0, index - 90), index + doi.length + 30);
  return /doi|原文链接|论文信息|文章信息|paper information|article information|read more|阅读原文/i.test(window);
}

function primaryDoiFromPaper(paper = {}) {
  const candidates = new Map();
  const add = (doi, score) => {
    const normalized = normalizeDoi(doi);
    if (!normalized) return;
    candidates.set(normalized, Math.max(candidates.get(normalized) || 0, score));
  };

  add(paper.doi, 100);
  add(paper.url, 90);
  for (const signal of paper.sourceSignals || []) add(signal.url, 90);

  const text = [paper.title, paper.abstract, paper.journal, paper.citation].filter(Boolean).join("\n");
  for (const doi of doiMatches(text)) {
    add(doi, hasDoiLabelNearby(text, doi) ? 82 : 40);
  }

  const sorted = [...candidates.entries()].sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return "";
  if (sorted[0][1] >= 70) return sorted[0][0];
  return sorted.length === 1 ? sorted[0][0] : "";
}

function prepareCandidate(item) {
  const doi = primaryDoiFromPaper(item);
  return enrichPaperMetadata(doi ? { ...item, doi } : item);
}

function clusterCandidates(candidates) {
  const clusters = new Map();
  for (const rawItem of candidates) {
    const item = prepareCandidate(rawItem);
    const key = clusterKey(item, clusters);
    if (!clusters.has(key)) {
      clusters.set(key, { ...item, sourceSignals: [...(item.sourceSignals || [])] });
      continue;
    }
    const existing = clusters.get(key);
    existing.sourceSignals.push(...(item.sourceSignals || []));
    existing.abstract = chooseLongerText(existing.abstract, item.abstract);
    existing.authors = existing.authors?.length ? existing.authors : item.authors || [];
    existing.doi ||= item.doi;
    existing.url = choosePreferredUrl(existing.url, item.url);
    existing.journal = choosePreferredJournal(existing.journal, item.journal);
    existing.type = choosePreferredMetadata(existing.type, item.type);
  }
  return [...clusters.values()].map((item) => ({
    ...item,
    sourceSignals: orderedSourceSignals(item.sourceSignals || [])
  }));
}

function clusterKey(item, clusters) {
  const doi = normalizeDoi(item.doi || "");
  if (doi) return `doi:${doi}`;
  const titleKey = reliableTitleKey(item) || normalizeTitle(item.title || "");
  if (titleKey) {
    for (const [existingKey, existing] of clusters.entries()) {
      if (!existingKey.startsWith("title:")) continue;
      if (samePaperByTitle(existing, item)) return existingKey;
    }
    return `title:${titleKey}`;
  }
  return cacheKey(item);
}

function chooseLongerText(a = "", b = "") {
  return String(b || "").length > String(a || "").length ? b : a;
}

function choosePreferredMetadata(a = "", b = "") {
  if (!a || a === "Article") return b || a;
  return a;
}

function normalizedJournalName(value = "") {
  return normalizeTitle(value || "");
}

function isGenericJournalName(value = "") {
  const normalized = normalizedJournalName(value);
  return normalized === "nature" || normalized === "science";
}

function choosePreferredJournal(a = "", b = "") {
  if (!a) return b || "";
  if (!b) return a || "";
  const normalizedA = normalizedJournalName(a);
  const normalizedB = normalizedJournalName(b);
  if (!normalizedA || normalizedA === "article") return b || a;
  if (!normalizedB || normalizedB === "article") return a || b;
  if (normalizedA === normalizedB) return a;
  if (isGenericJournalName(a) && !isGenericJournalName(b) && normalizedB.startsWith(`${normalizedA} `)) return b;
  if (isGenericJournalName(b) && !isGenericJournalName(a) && normalizedA.startsWith(`${normalizedB} `)) return a;
  return a;
}

function choosePreferredUrl(a = "", b = "") {
  if (!a) return b || "";
  if (!b) return a;
  if (/mp\.weixin\.qq\.com/.test(a) && !/mp\.weixin\.qq\.com/.test(b)) return b;
  return a;
}

function sourceSignalKey(signal) {
  const type = signal.type || "";
  const name = normalizeTitle(signal.name || "");
  const url = String(signal.url || "").replace(/[?#].*$/, "").toLowerCase();
  return `${type}|${name}|${url}`;
}

function sourceSignalPriority(signal = {}) {
  if (["topJournal", "reviewJournal", "professionalJournal"].includes(signal.type)) return 0;
  if (["natureScienceNews", "scienceDaily"].includes(signal.type)) return 1;
  if (signal.type === "wechat") return 2;
  return 3;
}

function dedupeSourceSignals(signals = []) {
  const seen = new Set();
  const output = [];
  for (const signal of signals) {
    const key = sourceSignalKey(signal);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(signal);
  }
  return output;
}

function orderedSourceSignals(signals = []) {
  return dedupeSourceSignals(signals)
    .map((signal, index) => ({ signal, index }))
    .sort((a, b) => sourceSignalPriority(a.signal) - sourceSignalPriority(b.signal) || a.index - b.index)
    .map((item) => item.signal);
}

function mergeSourceSignals(...groups) {
  return orderedSourceSignals(groups.flat().filter(Boolean));
}

function itemDateMs(item = {}) {
  const value = item.publishedAt || item.date || item.generatedAt || "";
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function recentEnough(item = {}, referenceMs = Date.now()) {
  const valueMs = itemDateMs(item);
  if (!valueMs) return true;
  return valueMs >= referenceMs - LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
}

async function recentKnownSourceIndex(referenceMs = Date.now()) {
  const known = [];
  const add = (item) => {
    if (!item || !recentEnough(item, referenceMs)) return;
    const scoped = journalRssPaper(item);
    if (!scoped) return;
    const enriched = enrichPaperMetadata(scoped);
    if (!enriched.sourceSignals?.length) return;
    known.push({ key: cacheKey(enriched), item: enriched });
  };

  for (const item of asArrayPayload(await readJson(OUTPUT, null))) add(item);
  for (const item of asArrayPayload(await readJson(RSS_CANDIDATES, null))) add(item);

  const cache = await readCache();
  for (const entry of Object.values(cache.items || {})) {
    if (entry?.status === "selected" && entry.item) add(entry.item);
  }

  const byKey = new Map();
  for (const { key, item } of known) {
    if (!byKey.has(key)) {
      byKey.set(key, item);
      continue;
    }
    const existing = byKey.get(key);
    byKey.set(key, {
      ...existing,
      sourceSignals: mergeSourceSignals(existing.sourceSignals || [], item.sourceSignals || [])
    });
  }
  return byKey;
}

async function mergeRecentKnownSources(candidates) {
  const items = asArrayPayload(candidates);
  const referenceMs =
    items
      .map(itemDateMs)
      .filter(Boolean)
      .sort((a, b) => b - a)[0] || Date.now();
  const knownByKey = await recentKnownSourceIndex(referenceMs);
  return items.map((item) => {
    const enriched = enrichPaperMetadata(item);
    const known = knownByKey.get(cacheKey(enriched));
    if (!known) return item;
    return {
      ...item,
      sourceSignals: mergeSourceSignals(known.sourceSignals || [], item.sourceSignals || []),
      journal: item.journal || known.journal || "",
      doi: item.doi || known.doi || "",
      publishedAt: item.publishedAt || known.publishedAt || "",
      date: item.date || known.date || ""
    };
  });
}

function sourceScore(paper) {
  const signals = dedupeSourceSignals(paper.sourceSignals || []);
  const wechatCount = signals.filter((signal) => signal.type === "wechat").length;
  const signalWeight = signals.length
    ? Math.max(...signals.map((signal) => sourceQualityForSignal(signal)))
    : 0;
  const sourceTypes = new Set(signals.map((signal) => signal.type || ""));
  const base = Math.min(signalWeight, 3);
  const distinctNames = new Set(signals.map((signal) => `${signal.type || ""}:${normalizeTitle(signal.name || signal.url || "")}`)).size;
  const crossSourceTypes = sourceTypes.size;
  const repeatBoost = Math.min(Math.max(distinctNames - 1, 0) * 1.2, 3);
  const crossTypeBoost = Math.min(Math.max(crossSourceTypes - 1, 0) * 1.5, 3);
  const wechatBoost = Math.min(Math.max(wechatCount - 1, 0) * 0.8, 2);
  return clamp(Math.round((base + repeatBoost + crossTypeBoost + wechatBoost) * 10) / 10, 0, SOURCE_SIGNAL_SCORE_MAX);
}

function sourceQualityForSignal(signal = {}) {
  const name = normalizeTitle(signal.name || "");
  if (name === "science advances") return 4;
  return sourceQualityScores[signal.type] || 0;
}

function authoritativeJournal(paper = {}) {
  const doiMetadataJournal = journalNameFromDoiMetadata(paper.doi || "");
  if (doiMetadataJournal) return doiMetadataJournal;
  const explicitJournal = [
    paper.journal,
    paper.localPrescreen?.journal,
    paper.localPrescreen?.paperMention?.journal,
    ...(paper.sourceSignals || [])
      .filter((signal) => ["topJournal", "reviewJournal", "professionalJournal", "rss"].includes(signal.type))
      .map((signal) => signal.name)
  ].reduce((best, candidate) => choosePreferredJournal(best, candidate), "");
  return explicitJournal || journalNameFromDoiPattern(paper.doi || "") || "";
}

function journalScore(paper) {
  const journal = authoritativeJournal(paper);
  const base = journalQualityBaseScore(journalPartitionScore(journal || paper.doi || "").score);
  if (base <= 0) return 0;
  return clamp(Math.round((base + typeAdjustment(paper)) * 10) / 10, 0, JOURNAL_QUALITY_SCORE_MAX);
}

function journalQualityBaseScore(partitionScore = 0) {
  const score = Number(partitionScore || 0);
  if (score >= 25) return 97;
  if (score >= 23.5) return 90;
  if (score >= 22) return 82;
  if (score >= 18) return 72;
  if (score >= 15) return 62;
  if (score >= 12) return 52;
  if (score >= 10) return 35;
  if (score >= 5) return 18;
  return 0;
}

function articleTypeGroup(type = "") {
  const text = String(type || "").toLowerCase();
  if (/author correction|correction|erratum|corrigendum|retraction|expression of concern|更正|勘误|撤稿/.test(text)) return "correction";
  if (/systematic review|meta[- ]analysis|review|综述|荟萃/.test(text)) return "review";
  if (/data descriptor|data paper|dataset|database|resource|software|protocol|数据论文|数据集|数据库|资源|软件|协议/.test(text)) {
    return "data";
  }
  if (/letter to (?:the )?editor/.test(text)) return "commentary";
  if (text === "letter" || text === "letters" || /\bletter\b/.test(text)) return "research";
  if (/commentary|comment|perspective|opinion|editorial|correspondence|forum|spotlight|news|view|highlight|in[-\s]?depth|career|books?|culture|podcast|video|观点|评论|通讯|来信|社论|新闻|深度|职业/.test(text)) {
    return "commentary";
  }
  if (/research article|original research|originalpaper|original paper|brief communication|report|研究论文|原创研究|论文/.test(text)) {
    return "research";
  }
  if (text === "article") return "research";
  return "other";
}

function preferredArticleTypeGroup(type = "", ...groups) {
  const direct = articleTypeGroup(type);
  if (direct !== "other") return direct;
  return groups.find((group) => group && group !== "other") || direct;
}

function resolvedArticleTypeGroup(paper = {}, ...fallbackGroups) {
  const interpretiveType = inferInterpretivePaperType(paper);
  if (interpretiveType?.paperTypeGroup) return interpretiveType.paperTypeGroup;
  return preferredArticleTypeGroup(paper.type || paper.paperType || paper.localPrescreen?.paperType || "", paper.paperTypeGroup, paper.localPrescreen?.paperTypeGroup, ...fallbackGroups);
}

function typeScore(paper = {}) {
  const group = resolvedArticleTypeGroup(paper);
  if (group === "review") return 3;
  if (group === "research") return 2;
  if (group === "data") return 1;
  return 0;
}

function typeAdjustment(paper = {}) {
  return typeScore(paper);
}

function paperImpactFactor(paper) {
  const journal = authoritativeJournal(paper);
  return journalImpactFactor(journal || "") ?? journalImpactFactor(paper.doi || "") ?? null;
}

function normalizedWatchText(value = "") {
  return normalizeTitle(value).replace(/\b(and|et|al|lab|group|team|团队|课题组|实验室)\b/g, " ").replace(/\s+/g, " ").trim();
}

function watchlistTextBuckets(paper = {}) {
  const authors = Array.isArray(paper.authors) ? paper.authors : [];
  const corresponding = [
    paper.correspondingAuthor,
    paper.correspondingAuthors,
    paper.corresponding,
    paper.pi,
    paper.team,
    paper.lab
  ]
    .flat()
    .filter(Boolean);
  return {
    primary: [
      authors[0],
      ...corresponding
    ]
      .filter(Boolean)
      .map(normalizedWatchText)
      .filter(Boolean),
    secondary: [
      ...authors.slice(1),
      ...(Array.isArray(paper.affiliations) ? paper.affiliations : [])
    ]
      .filter(Boolean)
      .map(normalizedWatchText)
      .filter(Boolean)
  };
}

function watchlistTopicBonus(paper = {}, preferences = {}) {
  const entries = Array.isArray(preferences.watchlist) ? preferences.watchlist : [];
  if (!entries.length) return 0;
  const buckets = watchlistTextBuckets(paper);
  let bonus = 0;
  for (const entry of entries) {
    const aliases = (entry.aliases || [entry.name]).map(normalizedWatchText).filter(Boolean);
    if (!aliases.length) continue;
    const entryBonus = Number(entry.bonus || 4);
    const primaryHit = aliases.some((alias) => buckets.primary.some((text) => text === alias || text.includes(alias) || alias.includes(text)));
    if (primaryHit) {
      bonus = Math.max(bonus, entryBonus);
      continue;
    }
    const secondaryHit = aliases.some((alias) => buckets.secondary.some((text) => text === alias || text.includes(alias) || alias.includes(text)));
    if (secondaryHit) bonus = Math.max(bonus, Math.min(entryBonus, 2));
  }
  return clamp(Math.round(bonus), 0, Number(preferences.watchlistBonusMax || WATCHLIST_BONUS_MAX));
}

function extractJson(text) {
  const trimmed = text.trim();
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

  throw new Error(`No valid JSON object found in model response: ${text.slice(0, 300)}`);
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function modelErrorReason(error) {
  return String(error?.message || error || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function warnModelRetry(stage, paper, error, attempt, retries) {
  if (modelStats.retries[stage] != null) modelStats.retries[stage] += 1;
  const title = String(paper?.title || "").slice(0, 120);
  const reason = modelErrorReason(error);
  if (COMPACT_LOG) return;
  console.warn(
    `Model ${stage} retry ${attempt}/${retries} for "${title}": ${reason}`
  );
}

function warnModelFallback(stage, paper, error) {
  if (modelStats.fallbacks[stage] != null) modelStats.fallbacks[stage] += 1;
  const title = String(paper?.title || "").slice(0, 120);
  const reason = modelErrorReason(error);
  if (COMPACT_LOG) return;
  console.warn(`Model ${stage} fallback for "${title}": ${reason}`);
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

function cleanGeneratedText(value = "") {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(
      /在小说阅读器读本章|去阅读|在小说阅读器中沉浸阅读|点击蓝字，?关注我们|欢迎点击上方名片关注|继续滑动看下一个|向上滑动看下一个|打开此内容|使用完整服务|微信扫一扫|轻点两下取消赞|取消 允许|视频 小程序|分享 留言 收藏 听过|预览时标签不可点/g,
      " "
    )
    .replace(/\b(read more|subscribe|copyright|all rights reserved)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateChineseText(text = "", limit = 220) {
  const value = cleanGeneratedText(text);
  if (value.length <= limit) return value;
  const boundary = Math.max(
    value.lastIndexOf("。", limit),
    value.lastIndexOf("；", limit),
    value.lastIndexOf("，", limit),
    value.lastIndexOf(".", limit),
    value.lastIndexOf(";", limit),
    value.lastIndexOf(",", limit)
  );
  const sliced = value.slice(0, boundary > 80 ? boundary + 1 : limit).trim();
  return /[。！？.!?]$/.test(sliced) ? sliced : `${sliced}。`;
}

function usefulResearchSentences(text = "") {
  const cleaned = cleanGeneratedText(text);
  return cleaned
    .split(/(?<=[。！？!?])\s*/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => sentence.length >= 12)
    .filter((sentence) => !/原创|作者|公众号|关注|扫码|二维码|加群|菜单栏|小说阅读器|小程序|点赞|转发|留言|收藏|广告|课程|报名|会议|招聘/.test(sentence));
}

function conciseChineseSummary(paper, limit = 220) {
  const abstract = cleanGeneratedText(cleanAbstract(paper.abstract || "", paper.title));
  const sentences = usefulResearchSentences(abstract);
  const research = sentences.filter((sentence) =>
    /研究|结果|发现|表明|显示|揭示|基于|利用|分析|模拟|评估|提出|数据|模型|机制|影响|变化|study|result|show|reveal|using|based/i.test(sentence)
  );
  const pool = research.length ? research : sentences;
  let summary = "";
  for (const sentence of pool) {
    if ((summary + sentence).length > limit && summary.length >= 80) break;
    summary += sentence;
    if (summary.length >= 160) break;
  }
  if (summary) return truncateChineseText(summary, limit);
  if (/[\u4e00-\u9fff]/.test(abstract)) return truncateChineseText(abstract, limit);
  return "";
}

function chineseOneLine(paper) {
  const abstract = cleanGeneratedText(cleanAbstract(paper.abstract || "", paper.title));
  if (/[\u4e00-\u9fff]/.test(abstract)) {
    const firstUseful = usefulResearchSentences(abstract).find((sentence) =>
      /研究|结果|发现|表明|显示|揭示|基于|利用|分析|模拟|评估|提出|影响|变化/.test(sentence)
    );
    return truncateChineseText(firstUseful || abstract.split(/[。！？]/)[0], 90);
  }
  return `该研究围绕“${paper.title}”展开，具体结论需结合原文摘要进一步确认。`;
}

function chineseSummary(paper) {
  const abstract = cleanGeneratedText(cleanAbstract(paper.abstract || "", paper.title));
  const concise = conciseChineseSummary(paper);
  if (concise) return concise;
  if (!abstract) return `该研究题为“${paper.title}”。当前 RSS 未提供有效摘要，需要打开原文查看研究对象、方法和主要结论。`;
  return truncateChineseText(
    `该研究题为“${paper.title}”。原始摘要显示，研究关注 ${abstract}。本次模型降级时仅保留压缩摘录，下次更新会重新生成正式中文摘要。`,
    260
  );
}

function likelyNonResearchPush(paper) {
  const text = `${paper.title} ${paper.abstract || ""}`.toLowerCase();
  if (/subscription and copyright information|copyright information|table of contents|issue information|cover image|front cover|inside cover|masthead|editorial board|front matter|back matter|author correction|publisher correction|correction:|corrigendum|erratum/.test(text)) {
    return true;
  }
  if (!paper.sourceSignals?.some((signal) => signal.type === "wechat")) return false;
  return /征稿|投稿|特刊|会议|研讨会|讲座|直播|课程|培训|招聘|招生|广告|优惠|会员|报名|论坛|workshop|webinar|conference|call for papers|special issue|job|hiring|recruit/.test(text);
}

function hasSourceType(paper = {}, type = "") {
  return (paper.sourceSignals || []).some((signal) => signal.type === type);
}

function localRejectPre(source = "local-prefilter") {
  return {
    pass: false,
    isEcology: false,
    tags: [],
    relevance: 0,
    oneLine: "",
    source
  };
}

function obviousWechatNonPaper(paper = {}) {
  const text = `${paper.title || ""} ${paper.abstract || ""} ${paper.localPrescreen?.reason || ""}`.toLowerCase();
  return /征稿|投稿|特刊|会议|研讨会|讲座|直播|课程|培训|招聘|招生|广告|优惠|会员|报名|论坛|转载指南|合作推广|workshop|webinar|conference|call for papers|special issue|job|hiring|recruit/.test(text);
}

function obviousTopJournalNonEcology(paper = {}) {
  if (!hasSourceType(paper, "topJournal")) return false;
  const text = `${paper.title || ""} ${paper.abstract || ""}`.toLowerCase();
  if (dryPrescreen(paper).pass) return false;
  return /pharma|pharmaceutical|monopoly|obesity|hfpef|contractile protein|sleep|memory reactivation|remote work|mental health|human cooperation|photocataly|alkene|co2 as an oxygen donor|nanotube|mos2|radical|cross-coupling|quantum|battery|semiconductor|catalyst|polymer|cancer|tumou?r|immune|neuron|clinical|patient|protein function|合成|催化|肿瘤|癌症|临床|患者|睡眠|心理健康/.test(text);
}

const PAN_ECOLOGY_CORE_TAGS = new Set([
  "pv_invasion",
  "invasion_fire",
  "dry_valley_savanna",
  "pyric_herbivory",
  "renewable_biodiversity_risk",
  "novel_ecosystems_resilience",
  "invasion_ecology",
  "community_interactions",
  "restoration_conservation",
  "spatial_risk_methods",
  "remote_sensing_monitoring",
  "statistical_synthesis_methods",
  "community_ecosystem",
  "population_traits",
  "biogeochemistry",
  "landscape_macroecology",
  "species_distribution",
  "disturbance",
  "invasion",
  "conservation_management",
  "plant_agroecology",
  "aquatic_microbe",
  "coastal_microalgae",
  "saltmarsh_milu_spartina",
  "pika_arthropod_grazing"
]);

const PAN_ECOLOGY_SUPPORT_TAGS = new Set([
  "soil_rhizosphere_microbe",
  "modeling_methods",
  "statistical_synthesis_methods",
  "remote_sensing_monitoring",
  "biogeochemistry",
  "genetics_evolution",
  "climate_anthropogenic"
]);

function mixedRssColumnSignal(paper = {}) {
  return (paper.sourceSignals || []).some((signal) => {
    const type = signal.type || "";
    const name = normalizeTitle(signal.name || "");
    return type === "natureScienceNews" && (name.startsWith("nature") || name.startsWith("science"));
  });
}

function hasPanEcologyEvidence(tags = []) {
  const normalized = tags.filter(Boolean);
  const hasCore = normalized.some((tag) => PAN_ECOLOGY_CORE_TAGS.has(tag));
  if (hasCore) return true;
  const supportCount = normalized.filter((tag) => PAN_ECOLOGY_SUPPORT_TAGS.has(tag)).length;
  return supportCount >= 2;
}

function panEcologyPrecheck(paper = {}) {
  const dry = dryPrescreen(paper);
  const local = paper.localPrescreen || {};
  const localTags = Array.isArray(local.tags) ? local.tags : [];
  const localPass = local.pass === true && local.isEcology !== false && hasPanEcologyEvidence(localTags);
  const dryPass = dry.pass === true && dry.isEcology !== false && hasPanEcologyEvidence(dry.tags || []);
  return {
    pass: dryPass || localPass,
    dry,
    source: dryPass ? "local-pan-ecology" : localPass ? "local-prescreen-pan-ecology" : "local-non-pan-ecology"
  };
}

function nonPanEcologyCandidate(paper = {}) {
  return !panEcologyPrecheck(paper).pass;
}

function mixedRssColumnNonEcology(paper = {}) {
  if (!mixedRssColumnSignal(paper)) return false;
  const typeGroup = articleTypeGateGroup(paper.paperTypeGroup || paper.type || paper.paperType || "");
  if (!["non_paper_feed", "interpretive", "unknown"].includes(typeGroup)) return false;
  return nonPanEcologyCandidate(paper);
}

function localPreModelReject(paper = {}) {
  if (likelyNonResearchPush(paper)) return localRejectPre("local-obvious-non-research");
  if (hasSourceType(paper, "wechat") && obviousWechatNonPaper(paper)) return localRejectPre("local-wechat-non-paper");
  if (mixedRssColumnNonEcology(paper)) return localRejectPre("local-mixed-rss-non-ecology");
  if (nonPanEcologyCandidate(paper)) return localRejectPre("local-non-pan-ecology");
  if (obviousTopJournalNonEcology(paper)) return localRejectPre("local-topjournal-non-ecology");
  return null;
}

function addTag(tags, tag, matched) {
  if (matched && !tags.includes(tag)) tags.push(tag);
}

async function modelJson(model, messages) {
  const response = await fetch(MODEL_BASE_URL, {
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
    throw new Error(`${MODEL_PROVIDER} ${model} failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  return extractJson(data.choices?.[0]?.message?.content || "{}");
}

async function scoreJsonWithRetry(paper, messages) {
  let lastError;
  for (let attempt = 0; attempt <= SCORE_RETRIES; attempt += 1) {
    try {
      return await modelJson(SCORE_MODEL, messages);
    } catch (error) {
      lastError = error;
      if (attempt >= SCORE_RETRIES) break;
      warnModelRetry("score", paper, error, attempt + 1, SCORE_RETRIES);
      await sleep(SCORE_RETRY_SLEEP_MS * (attempt + 1));
    }
  }
  throw lastError;
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
    /ecolog|ecosystem|environmental science|environment|pollution|contaminant|water quality|ecosystem|biodiversity|conservation|restoration|urban ecology|agronom|agroecolog|agricultural ecology|agricultural ecological security|crop|landscape|geoscience|earth system|geomorph|erosion|sediment|community|population|species|habitat|trait|botan|plant physiology|root|leaf|zoolog|animal ecology|wildlife|biogeochem|carbon|nitrogen|phosphorus|soil|forest|grassland|wetland|freshwater|marine|microbial|microbiome|\binvasion\b|\binvasive\b|wildfire|fire|disturbance|drainage|hydrology|remote sensing|vegetation|vegetation index|dry-hot valley|hot-dry valley|hot dry valley|photovoltaic|solar farm|species distribution|climate change|land use|生态|生态学|环境科学|环境|污染|水质|生物多样性|保护生物学|恢复生态|城市生态|农业生态|农业生态安全|生态安全|农学|作物|地学|地球系统|侵蚀|沉积|植物学|植物生理|动物学|野生动物|景观|群落|种群|物种|栖息地|性状|生态系统|生物地球化学|碳|氮|磷|土壤|森林|草地|湿地|淡水|海洋|微生物|入侵|火|扰动|排水|遥感|植被|植被指数|干热河谷|光伏|气候变化|土地利用/.test(
      text
    );
  const tags = [];
  addTag(tags, "pv_invasion", /photovoltaic|solar farm|solar park|solar array|solar panel|agrivoltaic|panel shade|dripline|microclimate|ageratina|chromolaena|plant invasion|光伏|太阳能电站|光伏电站|光伏工程|农光互补|板下|滴水线|微气候|紫茎泽兰|飞机草|入侵植物/.test(text));
  addTag(tags, "invasion_fire", /invasion[-\s]?fire|fire[-\s]?invasion|wildfire|fire ecology|flammability|fuel connectivity|fuel bed|post[-\s]?fire|burned plot|seed bank|priority effect|入侵.*火|火.*入侵|野火|火生态|可燃性|燃料连通|火后|火烧迹地|种子库|优先效应/.test(text));
  addTag(tags, "dry_valley_savanna", /dry[-\s]?hot valley|hot[-\s]?dry valley|hot dry valley|jinsha river|yuanjiang|nujiang|river valley savanna|干热河谷|金沙江|元江|怒江|河谷萨王纳|稀树灌草丛/.test(text));
  addTag(tags, "pyric_herbivory", /pyric herbivory|fire[-\s]?herbivore|grazing|livestock|large herbivore|herbivory|yak|sheep|火.*食草|食草.*火|放牧|家畜|大型食草动物|食草作用|牦牛|绵羊/.test(text));
  addTag(tags, "renewable_biodiversity_risk", /offshore wind|wind farm|wind power|renewable energy|energy infrastructure|biodiversity risk|range map|iucn|exposure|vulnerability|hazard|risk hotspot|海上风电|风电|新能源|能源基础设施|生物多样性风险|物种分布图|暴露度|脆弱性|风险热点/.test(text));
  const novelEcosystemFrame =
    /novel ecosystem|emerging ecosystem|ecosystem reorganization|ecosystem transformation|community reassembly|新型生态系统|新生生态系统|生态系统重组|生态系统转型|群落重组/.test(text) &&
    /ecological process|ecosystem process|biodiversity|resilien|adaptation|transition|trajectory|regime shift|alternative state|ecosystem service|community reassembly|生态过程|生物多样性|韧性|适应|演变路径|转型路径|稳态转换|替代稳态|生态系统服务|群落重组/.test(text);
  addTag(tags, "novel_ecosystems_resilience", novelEcosystemFrame);
  addTag(tags, "invasion_ecology", /\binvasion\b|\binvasive\b|alien species|non[-\s]?native|invasion lag|dispersal corridor|biotic resistance|resource fluctuation|入侵|外来种|外来物种|入侵滞后|扩散廊道|生物抗性|资源波动/.test(text));
  addTag(tags, "community_interactions", /community ecology|food web|species interaction|interspecific|plant[-\s]?animal interaction|plant[-\s]?soil feedback|mutualism|competition|predation|pollination|seed dispersal|herbivory|facilitation|群落生态|食物网|物种互作|种间关系|种间互作|动植物互作|植物[—-]?土壤反馈|互惠|竞争|捕食|传粉|种子传播|食草作用|促进作用/.test(text));
  addTag(tags, "restoration_conservation", /restoration|conservation|rewilding|protected area|ecosystem degradation|ecological security|invasion management|恢复|保护|再野化|自然保护地|生态退化|生态安全|入侵治理/.test(text));
  addTag(tags, "spatial_risk_methods", /species distribution model|\bsdm\b|maxent|habitat suitability|risk assessment|risk map|hotspot|landscape connectivity|exposure|vulnerability|物种分布模型|栖息地适宜|风险评估|风险图|热点识别|景观连接度|暴露度|脆弱性/.test(text));
  addTag(tags, "remote_sensing_monitoring", /remote sensing|google earth engine|\bgee\b|landsat|sentinel|modis|uav|lidar|hyperspectral|vegetation index|\bndvi\b|monitoring|遥感|谷歌地球引擎|哨兵|无人机|激光雷达|高光谱|植被指数|监测/.test(text));
  addTag(tags, "statistical_synthesis_methods", /meta[-\s]?analysis|glmm|mixed model|structural equation|\bsem\b|bayesian|hierarchical model|causal inference|machine learning|模型整合|荟萃分析|混合模型|结构方程|贝叶斯|层级模型|因果推断|机器学习/.test(text));
  addTag(tags, "soil_rhizosphere_microbe", /rhizosphere|root exudate|microbiome|mycorrhiz|soil structure|soil[-\s]?on[-\s]?chip|microfluidic|根际|根系分泌物|微生物组|菌根|土壤结构|芯片|微流控/.test(text));
  addTag(tags, "coastal_microalgae", /benthic microalgae|microphytobenthos|biofilm|algal bloom|cyanobacteria|diatom|tidal flat|coastal food web|底栖微藻|微型底栖藻|生物膜|藻华|蓝藻|硅藻|潮滩|潮间带/.test(text));
  addTag(tags, "saltmarsh_milu_spartina", /spartina|smooth cordgrass|milu|p[eè]re david|salt marsh|saltmarsh|互花米草|麋鹿|盐沼|滨海湿地/.test(text));
  addTag(tags, "pika_arthropod_grazing", /pika|arthropod|alpine meadow|yak|sheep|soil perturbation|鼠兔|节肢动物|高寒草甸|牦牛|绵羊|土壤扰动/.test(text));
  addTag(tags, "modeling_methods", /model|modelling|simulation|remote sensing|machine learning|deep learning|gis|geospatial|dataset|database|software|protocol|statistic|statistical|bayesian|causal inference|mixed model|structural equation|ordination|vegetation index|\bndvi\b|\bevi\b|sentinel|landsat|\buav\b|模型|模拟|遥感|机器学习|深度学习|地理信息|数据集|数据库|软件|方法|统计|贝叶斯|因果推断|混合模型|结构方程|排序|植被指数|无人机/.test(text));
  addTag(tags, "community_ecosystem", /community|ecosystem|food web|species interaction|interspecific|plant-animal interaction|mutualism|competition|predation|pollination|seed dispersal|ecosystem service|群落|生态系统|食物网|物种互作|种间关系|种间互作|动植物互作|互惠|竞争|捕食|传粉|种子传播|生态系统服务/.test(text));
  addTag(tags, "population_traits", /population|demograph|trait|life history|movement|dispersal|survivorship|种群|性状|生活史|迁移|扩散|存活/.test(text));
  addTag(tags, "biogeochemistry", /biogeochem|carbon|nitrogen|phosphorus|nutrient|soil|gas flux|greenhouse gas|hydrology|pollution|contaminant|water quality|erosion|sediment|生物地球化学|碳|氮|磷|养分|土壤|温室气体|水文|污染|水质|侵蚀|沉积/.test(text));
  addTag(tags, "genetics_evolution", /genetic|genomic|evolution|phylogen|adaptation|遗传|基因组|进化|系统发育|适应/.test(text));
  addTag(tags, "landscape_macroecology", /landscape|macroecolog|biogeograph|large scale|large-scale|scale|景观|宏生态|生物地理|大尺度|尺度/.test(text));
  addTag(tags, "species_distribution", /species distribution|distribution model|range shift|niche|habitat suitability|物种分布|分布模型|范围变化|生态位|栖息地适宜/.test(text));
  addTag(tags, "climate_anthropogenic", /climate change|warming|anthropogenic|urban|land use|agricultural intensification|agricultural ecological security|wind farm|wind power|renewable|solar|photovoltaic|solar farm|solar park|solar facility|environmental change|earth system|dry-hot valley|hot-dry valley|hot dry valley|气候变化|增温|人类影响|城市|土地利用|农业集约化|农业生态安全|生态安全|风电|新能源|太阳能|光伏|光伏工程|光伏电站|太阳能设施|环境变化|地球系统|干热河谷/.test(text));
  addTag(tags, "disturbance", /disturbance|fire|wildfire|prescribed burn|burning|drought|storm|logging|construction|restoration trajectory|photovoltaic|solar farm|solar park|扰动|火灾|野火|火烧|火后|干旱|风暴|采伐|施工|恢复轨迹|光伏|光伏工程|光伏电站/.test(text));
  addTag(tags, "invasion", /\binvasion\b|\binvasive\b|alien species|non-native|入侵|外来种|外来物种/.test(text));
  addTag(tags, "conservation_management", /conservation|restoration|management|policy|protected area|risk assessment|ecological security|agricultural ecological security|保护|恢复|管理|政策|自然保护地|风险评估|生态安全|农业生态安全/.test(text));
  addTag(tags, "plant_agroecology", /plant|botan|leaf|root|forest|grassland|herbivor|agronom|agroecolog|crop|drainage|ditch|vegetation|vegetation index|dry-hot valley|hot-dry valley|hot dry valley|photovoltaic|solar farm|solar park|agricultural ecological security|植物|植物学|叶片|根系|森林|草地|植食|农业生态|农业生态安全|农学|农田|作物|排水|沟渠|植被|植被指数|干热河谷|光伏|光伏工程|光伏电站/.test(text));
  addTag(tags, "aquatic_microbe", /aquatic|freshwater|marine|wetland|microbial|microbiome|水域|淡水|海洋|湿地|微生物|微生物组/.test(text));
  const priorityTags = [
    "pv_invasion",
    "invasion_fire",
    "dry_valley_savanna",
    "pyric_herbivory",
    "renewable_biodiversity_risk",
    "novel_ecosystems_resilience",
    "invasion_ecology",
    "community_interactions",
    "restoration_conservation",
    "spatial_risk_methods",
    "remote_sensing_monitoring",
    "statistical_synthesis_methods"
  ];
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
  const localReject = localPreModelReject(paper);
  if (localReject) return localReject;
  const local = paper.localPrescreen;
  if (TRUST_LOCAL_WECHAT_PRESCREEN && local && local.pass === true) {
    return {
      pass: true,
      isEcology: local.isEcology !== false,
      tags: Array.isArray(local.tags) ? local.tags : [],
      relevance: Math.max(0, Math.min(Number(local.relevance || 30), 50)),
      oneLine: local.oneLine || chineseOneLine(paper),
      category: local.category,
      source: "local-wechat-prescreen",
      model: local.model || "local"
    };
  }
  if (DRY_RUN) return dryPrescreen(paper);
  try {
    return await modelJson(PRESCREEN_MODEL, [
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
            oneLine: "one Chinese sentence covering research question, field, and paper type"
          }
        })
      }
    ]);
  } catch (error) {
    warnModelFallback("prescreen", paper, error);
    return {
      ...dryPrescreen(paper),
      source: "model-prescreen-fallback",
      modelStatus: {
        prescreen: "fallback",
        needsRepair: true,
        reason: modelErrorReason(error),
        updatedAt: new Date().toISOString()
      }
    };
  }
}

function dryScore(paper, pre, preferences = {}, options = {}) {
  const source = sourceScore(paper);
  const preferenceBonus = (pre.tags || []).reduce(
    (sum, tag) => sum + Number(preferences.topicWeights?.[tag] || 0) * 3,
    0
  ) + watchlistTopicBonus(paper, preferences);
  const cappedTheme = capThemeScore(themeScoreFromPrescreen(pre.relevance) - metadataPenalty(paper) + preferenceBonus, paper, pre);
  const theme = cappedTheme.theme;
  const journal = journalScore(paper);
  const type = typeScore(paper);
  const modelStatus = options.modelStatus || {
    score: DRY_RUN ? "local-rule" : "fallback",
    needsRepair: !DRY_RUN
  };
  return {
    source,
    theme,
    journal,
    type,
    total: theme,
    displayScore: theme,
    themeRaw: cappedTheme.rawTheme,
    themeCap: cappedTheme.capInfo.cap,
    themeCapReason: cappedTheme.capInfo.reason,
    themeDimensions: cappedTheme.capInfo.dimensions,
    themeDimensionCount: cappedTheme.capInfo.dimensionCount,
    scoringSystem: SCORING_SYSTEM,
    title: paper.title,
    oneLine: chineseOneLine(paper),
    summary: chineseSummary(paper),
    citation: "",
    modelFallback: modelStatus.score === "fallback",
    needsModelRepair: Boolean(modelStatus.needsRepair),
    modelStatus
  };
}

function metadataPenalty(paper = {}) {
  const signals = dedupeSourceSignals(paper.sourceSignals || []);
  const sourceTypes = new Set(signals.map((signal) => signal.type || ""));
  const onlyWechat = signals.length > 0 && sourceTypes.size === 1 && sourceTypes.has("wechat");
  if (!onlyWechat) return 0;
  const confidence = paper.metadataConfidence || computeMetadataConfidence(paper);
  if (confidence.score >= 45) return 0;
  if (!paper.doi && !paper.journal && !looksLikeEnglishTitle(paper.originalTitle || paper.title || "")) return 12;
  if (!paper.doi && !paper.journal) return 8;
  return 4;
}

function themeEvidenceText(paper = {}, pre = {}) {
  return [
    paper.title,
    paper.originalTitle,
    paper.rawTitle,
    paper.abstract,
    paper.summary,
    paper.oneLine,
    paper.journal,
    paper.type,
    paper.paperType,
    pre.oneLine,
    pre.extractedTitle,
    pre.summary,
    (pre.tags || []).join(" ")
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function matchesAny(text = "", patterns = []) {
  return patterns.some((pattern) => pattern.test(text));
}

function lowPriorityLegacyResearch(text = "") {
  return matchesAny(text, [
    /\b(cadmium|cd stress|heavy metal stress|phytoremediation|phytoextraction|plant hormone|auxin|gibberellin|abscisic acid|salicylic acid|jasmonic acid)\b/i,
    /镉|重金属胁迫|植物修复|植物提取|植物激素|生长素|赤霉素|脱落酸|水杨酸|茉莉酸/i
  ]);
}

function soilRhizosphereConnectedToCurrentTasks(text = "", tags = new Set()) {
  const hasSoilRhizosphere =
    tags.has("soil_rhizosphere_microbe") ||
    matchesAny(text, [
      /\b(rhizosphere|root exudate|microbiome|mycorrhiz|plant[-\s]?soil[-\s]?microbe|soil microbial)\b/i,
      /根际|根系分泌物|微生物组|菌根|植物[—-]?土壤[—-]?微生物|土壤微生物/i
    ]);
  if (!hasSoilRhizosphere) return false;
  return matchesAny(text, [
    /\b(invasion|invasive|alien species|biotic resistance|restoration ecology|ecosystem restoration|rewilding|fire ecology|wildfire|disturbance|agricultural ecological security|agroecological security)\b/i,
    /入侵|外来种|生物抗性|生态恢复|再野化|火生态|野火|扰动|农业生态安全|生态安全/i
  ]);
}

function directCurrentTaskEvidence(text = "", tags = new Set()) {
  const hasTag = (tag) => tags.has(tag);
  const hasPv = hasTag("pv_invasion") || matchesAny(text, [
    /\b(photovoltaic|solar farm|solar park|solar array|solar panel|agrivoltaic|panel shade|dripline)\b/i,
    /光伏|太阳能电站|光伏电站|农光互补|板下|滴水线/i
  ]);
  const hasInvasion = hasTag("invasion_ecology") || hasTag("invasion") || matchesAny(text, [
    /\b(invasion|invasive|alien species|non[-\s]?native|ageratina|chromolaena)\b/i,
    /入侵|外来种|紫茎泽兰|飞机草/i
  ]);
  const hasPlantCommunity = hasTag("plant_agroecology") || hasTag("community_ecosystem") || matchesAny(text, [
    /\b(plant community|vegetation|species richness|biodiversity|microclimate|soil moisture|habitat suitability)\b/i,
    /植物群落|植被|物种丰富度|生物多样性|微气候|土壤水分|栖息地适宜/i
  ]);
  const hasFire = hasTag("invasion_fire") || matchesAny(text, [
    /\b(wildfire|fire ecology|flammability|fuel connectivity|fuel bed|post[-\s]?fire|burned plot|seed bank|priority effect|burn severity)\b/i,
    /野火|火生态|可燃性|燃料连通|火后|火烧迹地|种子库|优先效应|火烧强度/i
  ]);
  const hasDryValley = hasTag("dry_valley_savanna") || matchesAny(text, [
    /\b(dry[-\s]?hot valley|hot[-\s]?dry valley|jinsha river|yuanjiang|nujiang|river valley savanna)\b/i,
    /干热河谷|金沙江|元江|怒江|河谷萨王纳|稀树灌草丛/i
  ]);
  const hasHerbivory = hasTag("pyric_herbivory") || matchesAny(text, [
    /\b(pyric herbivory|fire[-\s]?herbivore|large herbivore|livestock grazing|grazing livestock)\b/i,
    /火.*食草|食草.*火|大型食草动物|家畜放牧|放牧家畜/i
  ]);
  const hasRenewable = hasTag("renewable_biodiversity_risk") || matchesAny(text, [
    /\b(offshore wind|wind farm|wind power|renewable energy infrastructure|energy infrastructure|photovoltaic|solar farm|solar park)\b/i,
    /海上风电|风电|新能源基础设施|能源基础设施|光伏|光伏电站/i
  ]);
  const hasRisk = matchesAny(text, [
    /\b(biodiversity risk|exposure|vulnerability|risk hotspot|range map|iucn|species range|habitat threat)\b/i,
    /生物多样性风险|暴露度|脆弱性|风险热点|物种分布图|物种范围|栖息地威胁/i
  ]);
  const hasAgroSecurity = matchesAny(text, [
    /\b(agricultural ecological security|agroecological security|farmland ecological security)\b/i,
    /农业生态安全|农田生态安全/i
  ]);
  const hasNovelEcosystemFrame = tags.has("novel_ecosystems_resilience") || matchesAny(text, [
    /\b(novel ecosystem|emerging ecosystem|ecosystem reorganization|ecosystem transformation|community reassembly)\b/i,
    /新型生态系统|新生生态系统|生态系统重组|生态系统转型|群落重组/i
  ]);
  const hasNovelSystemContext = matchesAny(text, [
    /\b(abandoned (?:farm)?land|land abandonment|old field|post[-\s]?agricultural|burned site|post[-\s]?fire site|invasion[-\s]?dominated|invaded site|photovoltaic site|solar (?:farm|park)|renewable energy site|dry[-\s]?hot valley)\b/i,
    /弃耕地|弃耕农田|撂荒地|火烧迹地|火后场地|入侵地|入侵主导|光伏场地|光伏电站|新能源场地|干热河谷/i
  ]);
  const hasReorganizationProcess = matchesAny(text, [
    /\b(ecological process|ecosystem process|community reassembly|biodiversity maintenance|transition trajectory|resilien(?:ce|t|cy)?|adaptation|regime shift|alternative state|ecosystem service)\b/i,
    /生态过程|群落重组|生物多样性维持|演变路径|转型轨迹|韧性|适应能力|稳态转换|替代稳态|生态系统服务/i
  ]);
  return {
    pvInvasion: hasPv && (hasInvasion || hasPlantCommunity),
    invasionFire: hasInvasion && hasFire,
    dryValley: hasDryValley,
    pyricHerbivory: hasFire && hasHerbivory,
    renewableRisk: hasRenewable && hasRisk,
    agroSecurity: hasAgroSecurity,
    novelEcosystems: hasNovelEcosystemFrame && hasNovelSystemContext && hasReorganizationProcess
  };
}

function themeDimensionEvidence(paper = {}, pre = {}) {
  const text = themeEvidenceText(paper, pre);
  const tags = new Set([...(Array.isArray(pre.tags) ? pre.tags : []), ...(Array.isArray(paper.tags) ? paper.tags : [])]);
  const confidence = paper.metadataConfidence || computeMetadataConfidence(paper);
  const typeGroup = paper.paperTypeGroup || pre.paperTypeGroup || articleTypeGroup(paper.type || paper.paperType || pre.paperType || "");
  const hasDoi = Boolean(normalizeDoi(paper.doi || ""));
  const hasJournal = Boolean(paper.journal || pre.journal);
  const hasTitle = looksLikeEnglishTitle(paper.originalTitle || paper.title || pre.extractedTitle || "");
  const metadataReady = hasDoi || (confidence.score >= 70 && hasJournal && hasTitle);
  const coreTaskTags = ["pv_invasion", "invasion_fire", "dry_valley_savanna", "pyric_herbivory", "renewable_biodiversity_risk"];
  const supportTags = [
    "novel_ecosystems_resilience",
    "invasion_ecology",
    "invasion",
    "disturbance",
    "community_interactions",
    "restoration_conservation",
    "restoration_conservation_theme",
    "spatial_risk_methods",
    "remote_sensing_monitoring",
    "statistical_synthesis_methods",
    "community_ecosystem",
    "modeling_methods",
    "species_distribution",
    "conservation_management"
  ];
  const secondaryTaskTags = ["coastal_microalgae", "saltmarsh_milu_spartina", "pika_arthropod_grazing"];
  const ecologyObjectTags = [
    "community_interactions",
    "community_ecosystem",
    "population_traits",
    "biogeochemistry",
    "landscape_macroecology",
    "species_distribution",
    "plant_agroecology",
    "aquatic_microbe",
    "soil_rhizosphere_microbe",
    "coastal_microalgae",
    "saltmarsh_milu_spartina",
    "pika_arthropod_grazing"
  ];
  const directCore = directCurrentTaskEvidence(text, tags);
  const coreTask = Object.values(directCore).some(Boolean);
  const novelEcosystemsFrame = tags.has("novel_ecosystems_resilience");
  const secondaryTask = secondaryTaskTags.some((tag) => tags.has(tag));
  const soilRhizosphereConnected = soilRhizosphereConnectedToCurrentTasks(text, tags);
  const lowPriorityLegacy = lowPriorityLegacyResearch(text) || (tags.has("soil_rhizosphere_microbe") && !soilRhizosphereConnected);
  const declaredInterest =
    supportTags.some((tag) => tags.has(tag)) ||
    tags.has("species_distribution") ||
    soilRhizosphereConnected ||
    matchesAny(text, [
      /\b(species interaction|community ecology|plant[-\s]?soil feedback|food web|mutualis|competition|predation|pollination|herbivory)\b/i,
      /种间关系|种间互作|群落生态|群落构建|食物网|植物[—-]?土壤反馈/i,
      /\b(statistical model|bayesian|hierarchical model|structural equation|mixed model|causal inference)\b/i,
      /统计模型|贝叶斯|层级模型|混合模型|结构方程|因果推断/i,
      /\b(remote sensing|vegetation index|landsat|sentinel|lidar|hyperspectral|species distribution model|maxent|sdm|risk assessment)\b/i,
      /遥感|植被指数|高光谱|激光雷达|物种分布模型|风险评估/i,
      /\b(restoration|conservation|rewilding|invasion ecology|biotic resistance)\b/i,
      /生态恢复|保护|再野化|入侵生态|生物抗性/i
    ]);
  const broadEcology =
    ecologyObjectTags.some((tag) => tags.has(tag)) ||
    matchesAny(text, [
      /\b(ecolog|ecosystem|community|population|species|biodiversity|habitat|vegetation|forest|grassland|wetland|soil microbe)\b/i,
      /生态系统|生物群落|群落|种群|物种|栖息地|生物多样性|植被|森林|草地|湿地|土壤微生物/i
    ]);
  const methodData =
    tags.has("modeling_methods") ||
    typeGroup === "data" ||
    matchesAny(text, [
      /\b(method|model|dataset|database|data source|monitoring|remote sensing|bayesian|statistical|machine learning|algorithm)\b/i,
      /方法|模型|数据集|数据库|数据源|监测|遥感|贝叶斯|统计|机器学习|算法/i
    ]);
  const dimensions = {
    coreTask,
    directCore,
    novelEcosystemsFrame,
    declaredInterest,
    secondaryTask,
    broadEcology,
    methodData,
    metadataReady,
    soilRhizosphereConnected,
    lowPriorityLegacy
  };
  const dimensionCount = ["coreTask", "declaredInterest", "secondaryTask", "broadEcology", "methodData"].filter((key) => dimensions[key]).length;
  return { dimensions, dimensionCount, confidence, typeGroup };
}

function themeCapForPaper(paper = {}, pre = {}) {
  const evidence = themeDimensionEvidence(paper, pre);
  const { dimensions, dimensionCount, confidence, typeGroup } = evidence;
  let cap = 39;
  let capReason = "no_ecology_dimension";
  if (dimensions.coreTask) {
    cap = dimensionCount >= 2 ? 88 : 78;
    capReason = dimensionCount >= 2 ? "core_task_multi_dimension" : "core_task_single_dimension";
    if (dimensionCount >= 3 && dimensions.metadataReady) {
      cap = 94;
      capReason = "core_task_high_confidence_multi_dimension";
    }
  } else if (dimensions.declaredInterest) {
    cap = dimensionCount >= 2 ? 78 : 66;
    capReason = dimensionCount >= 2 ? "interest_multi_dimension" : "interest_single_dimension";
  } else if (dimensions.secondaryTask) {
    cap = dimensionCount >= 2 ? 76 : 64;
    capReason = dimensionCount >= 2 ? "secondary_task_multi_dimension" : "secondary_task_single_dimension";
  } else if (dimensions.broadEcology) {
    cap = dimensionCount >= 2 ? 60 : 54;
    capReason = dimensionCount >= 2 ? "broad_ecology_multi_dimension" : "broad_ecology_single_dimension";
  } else if (dimensions.methodData) {
    cap = dimensionCount >= 2 ? 56 : 48;
    capReason = dimensionCount >= 2 ? "method_data_multi_dimension" : "method_data_single_dimension";
  }

  const signals = dedupeSourceSignals(paper.sourceSignals || []);
  const sourceTypes = new Set(signals.map((signal) => signal.type || ""));
  const onlyWechat = signals.length > 0 && sourceTypes.size === 1 && sourceTypes.has("wechat");
  const hasDoi = Boolean(normalizeDoi(paper.doi || ""));
  const journalIsA = journalScore(paper) >= 82;
  if (dimensions.novelEcosystemsFrame && !dimensions.coreTask) {
    const frameCap = dimensions.broadEcology && dimensions.methodData ? 74 : 68;
    cap = Math.min(cap, frameCap);
    capReason = `${capReason}:novel_ecosystem_support_only`;
  }
  if (dimensions.lowPriorityLegacy && !dimensions.coreTask && !dimensions.soilRhizosphereConnected && !journalIsA) {
    cap = Math.min(cap, 44);
    capReason = `${capReason}:low_priority_legacy_not_a_journal`;
  }
  if (typeGroup === "commentary" && !dimensions.coreTask) {
    cap = Math.min(cap, 69);
    capReason = `${capReason}:commentary_cap`;
  }
  if (onlyWechat && !hasDoi && confidence.score < 70) {
    cap = Math.min(cap, 74);
    capReason = `${capReason}:wechat_metadata_cap`;
  }
  if (!hasDoi && confidence.score < 55) {
    cap = Math.min(cap, 64);
    capReason = `${capReason}:low_metadata_cap`;
  }
  if (confidence.score < 45) {
    cap = Math.min(cap, 59);
    capReason = `${capReason}:very_low_metadata_cap`;
  }
  return {
    cap: clamp(Math.round(cap), 0, THEME_SCORE_MAX),
    reason: capReason,
    dimensionCount,
    dimensions
  };
}

function capThemeScore(rawTheme = 0, paper = {}, pre = {}) {
  const capInfo = themeCapForPaper(paper, pre);
  const raw = clamp(Math.round(Number(rawTheme || 0)), 0, THEME_SCORE_MAX);
  return {
    theme: clamp(Math.min(raw, capInfo.cap), 0, THEME_SCORE_MAX),
    rawTheme: raw,
    capInfo
  };
}

function articleTypeGateGroup(type = "") {
  const text = String(type || "").toLowerCase();
  if (/author correction|correction|erratum|corrigendum|retraction|expression of concern|更正|勘误|撤稿/.test(text)) {
    return "non_paper_feed";
  }
  if (/letter to (?:the )?editor/.test(text)) return "interpretive";
  if (/systematic review|meta[- ]analysis|review|research article|original research|originalpaper|original paper|research report|brief communication|\bletter\b|data descriptor|data paper|dataset|database|resource|software|protocol|method|methods|研究论文|原创研究|研究报告|综述|荟萃|数据论文|数据集|数据库|资源|软件|协议|方法/.test(text)) {
    return "scoreable";
  }
  if (/commentary|comment|perspective|viewpoint|opinion|correspondence|forum|essay|spotlight|research\s*briefing|briefing|观点|评论|通讯|来信|论坛|随笔|聚焦/.test(text)) {
    return "interpretive";
  }
  if (/news\s*&\s*views|news and views|research highlight|highlight|news feature|in[-\s]?depth|world view|worldview|editorial|新闻观点|研究亮点|深度|社论/.test(text)) {
    return "interpretive";
  }
  if (/\bnews\b|career|books?|culture|podcast|video|cover image|front cover|inside cover|table of contents|issue information|masthead|新闻|职业|图书|文化|播客|视频|目录|封面/.test(text)) {
    return "non_paper_feed";
  }
  if (text === "article") return "scoreable";
  return "unknown";
}

function journalLikeFeedSignal(signal = {}) {
  const type = signal.type || "";
  if (["topJournal", "reviewJournal", "professionalJournal"].includes(type)) return true;
  if (type !== "natureScienceNews") return false;
  const name = normalizeTitle(signal.name || "");
  return name.startsWith("nature") || name.startsWith("science");
}

function mixedJournalNonPaperGate(paper = {}, local = {}) {
  const signals = dedupeSourceSignals(paper.sourceSignals || []);
  if (!signals.some(journalLikeFeedSignal)) return null;
  const gateGroup = articleTypeGateGroup(
    paper.paperTypeGroup || local.paperTypeGroup || paper.type || paper.paperType || local.paperType || ""
  );
  if (gateGroup !== "non_paper_feed") return null;
  return {
    eligible: false,
    status: "dynamic_only",
    reason: "journal_non_paper_type"
  };
}

function recommendationGate(paper = {}) {
  const local = paper.localPrescreen || {};
  const explicitStatus = paper.resolutionStatus || local.resolutionStatus || "";
  if (explicitStatus === "rejected") return { eligible: false, status: "rejected", reason: "rejected" };
  if (explicitStatus === "dynamic_only") return { eligible: false, status: "dynamic_only", reason: "dynamic_only" };
  if (paper.recommendationEligible === false || local.recommendationEligible === false) {
    return { eligible: false, status: explicitStatus || "dynamic_only", reason: "explicit_false" };
  }

  const confidence = paper.metadataConfidence || computeMetadataConfidence(paper);
  const doi = normalizeDoi(paper.doi || "");
  const title = paper.originalTitle || paper.title || local.extractedTitle || "";
  const hasEnglishTitle = looksLikeEnglishTitle(title);
  const hasJournal = Boolean(paper.journal || local.journal);
  const hasSummary = cleanAbstract(paper.abstract || paper.summary || local.summary || local.oneLine || "", paper.title).length >= 120;
  const signals = dedupeSourceSignals(paper.sourceSignals || []);
  const sourceTypes = new Set(signals.map((signal) => signal.type || ""));
  const onlyWechat = sourceTypes.size === 1 && sourceTypes.has("wechat");
  const probableThreshold = onlyWechat ? 70 : 55;
  const nonPaperGate = mixedJournalNonPaperGate(paper, local);
  if (nonPaperGate) return nonPaperGate;

  if (doi) return { eligible: true, status: "paper_resolved", reason: "doi" };
  if (paper.recommendationEligible === true || local.recommendationEligible === true) {
    if (confidence.score >= 55 && (hasEnglishTitle || hasJournal)) return { eligible: true, status: explicitStatus || "paper_probable", reason: "explicit_true" };
  }
  if (hasEnglishTitle && hasJournal && hasSummary && confidence.score >= probableThreshold) {
    return { eligible: true, status: "paper_probable", reason: "metadata" };
  }
  return { eligible: false, status: explicitStatus || "dynamic_only", reason: "metadata_incomplete" };
}

function dynamicFromPaper(paper = {}, gate = {}) {
  const local = paper.localPrescreen || {};
  const isWechat = (paper.sourceSignals || []).some((signal) => signal.type === "wechat");
  const title = isWechat && !paper.doi ? paper.rawTitle || paper.title : paper.title;
  const oneLine = local.oneLine || paper.oneLine || chineseOneLine({ ...paper, title });
  const summary = local.summary || paper.summary || paper.abstract || chineseSummary({ ...paper, title });
  const confidence = paper.metadataConfidence || computeMetadataConfidence(paper);
  return {
    ...paper,
    title,
    rawTitle: paper.rawTitle || paper.title || "",
    oneLine,
    summary,
    reason: local.reason || gate.reason || "元数据不足，仅保留为全部动态。",
    resolutionStatus: gate.status || paper.resolutionStatus || local.resolutionStatus || "dynamic_only",
    recommendationEligible: false,
    paperTypeGroup: paper.paperTypeGroup || local.paperTypeGroup || articleTypeGroup(paper.type || local.paperType || ""),
    metadataEvidence: paper.metadataEvidence || local.metadataEvidence || {},
    doiEvidence: paper.doiEvidence || local.doiEvidence || null,
    metadataConfidence: confidence,
    metadataStatus: confidence.status,
    journalImpactFactor: paperImpactFactor(paper),
    generatedAt: new Date().toISOString()
  };
}

function dateKeyForPaper(paper) {
  return paper.date || "undated";
}

function recentTimeForSort(paper = {}) {
  const value = paper.publishedAt || paper.date || paper.generatedAt || "";
  if (!value) return 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-").map(Number);
    return new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function numericScorePart(paper = {}, key = "") {
  return Number(paper.scoreBreakdown?.[key] ?? paper[key] ?? 0) || 0;
}

function themeScoreFromPrescreen(relevance = 0) {
  const score = Number(relevance || 0);
  if (!Number.isFinite(score) || score <= 0) return 0;
  if (score <= 50) return Math.round((score * 88) / 50);
  if (score <= 55) return Math.round((score * 88) / 55);
  return clamp(Math.round(score), 0, 88);
}

function themeTier(theme = 0) {
  const score = Number(theme || 0);
  if (score >= 80) return { rank: 4, key: "core", label: "核心主题" };
  if (score >= 65) return { rank: 3, key: "strong", label: "强相关主题" };
  if (score >= 45) return { rank: 2, key: "related", label: "相关但偏外围" };
  if (score >= 25) return { rank: 1, key: "weak", label: "弱相关" };
  return { rank: 0, key: "irrelevant", label: "基本无关" };
}

function journalTier(journal = 0) {
  const score = Number(journal || 0);
  if (score >= 97) return { rank: 8, key: "a1", label: "A1 Nature/Science 正刊" };
  if (score >= 90) return { rank: 7, key: "a2", label: "A2 高影响综述期刊" };
  if (score >= 82) return { rank: 6, key: "a3", label: "A3 综合期刊/大子刊" };
  if (score >= 72) return { rank: 5, key: "b1", label: "B1 Nature Index/生态小类/环境生态大类一区" };
  if (score >= 62) return { rank: 4, key: "b2", label: "B2 其它 CAS 一区" };
  if (score >= 52) return { rank: 3, key: "b3", label: "B3 JCR Q1 + CAS 二区" };
  if (score >= 35) return { rank: 2, key: "c", label: "C JCR Q1" };
  return { rank: 0, key: "unknown", label: "未知期刊" };
}

function dailyRecommendationProfile(paper = {}) {
  const theme = numericScorePart(paper, "theme");
  const journal = numericScorePart(paper, "journal");
  const type = numericScorePart(paper, "type");
  const source = numericScorePart(paper, "source");
  const themeLevel = themeTier(theme);
  const journalLevel = journalTier(journal);
  const scoreable = paper.recommendationEligible !== false;
  const dimensions = paper.scoreBreakdown?.themeDimensions || paper.themeDimensions || {};
  const dimensionCount = Number(paper.scoreBreakdown?.themeDimensionCount ?? paper.themeDimensionCount ?? 0);
  const hasCorePath = theme >= DAILY_CORE_THEME_MIN && journal >= DAILY_CORE_JOURNAL_MIN;
  const hasStrongPath = theme >= DAILY_STRONG_THEME_MIN && journal >= DAILY_STRONG_JOURNAL_MIN;
  const hasRelatedTopJournalPath = theme >= DAILY_RELATED_THEME_MIN && journal >= DAILY_RELATED_JOURNAL_MIN;
  const hasExceptionalB3Path =
    theme >= DAILY_EXCEPTIONAL_B3_THEME_MIN &&
    journal >= DAILY_EXCEPTIONAL_B3_JOURNAL_MIN &&
    journal < DAILY_STRONG_JOURNAL_MIN &&
    dimensions.coreTask === true &&
    dimensionCount >= 2;
  const eligible = scoreable && (hasCorePath || hasStrongPath || hasRelatedTopJournalPath || hasExceptionalB3Path);
  let reason = "daily_candidate";
  if (!scoreable) reason = "not_scoreable";
  else if (hasCorePath) reason = "core_theme_b2_or_above";
  else if (hasExceptionalB3Path) reason = "exceptional_core_theme_b3";
  else if (hasStrongPath) reason = "strong_theme_b2_or_above";
  else if (hasRelatedTopJournalPath) reason = "related_theme_a3_or_above";
  else if (theme < DAILY_RELATED_THEME_MIN) reason = "theme_below_daily_gate";
  else if (theme >= DAILY_CORE_THEME_MIN && journal < DAILY_CORE_JOURNAL_MIN) reason = "journal_below_core_theme_gate";
  else if (theme >= DAILY_STRONG_THEME_MIN && journal < DAILY_STRONG_JOURNAL_MIN) reason = "journal_below_strong_theme_gate";
  else if (theme < DAILY_STRONG_THEME_MIN && journal < DAILY_RELATED_JOURNAL_MIN) reason = "journal_below_related_theme_gate";
  else if (!eligible) reason = "daily_gate_not_met";
  return {
    rankingSystem: RANKING_SYSTEM,
    eligible,
    reason,
    theme,
    journal,
    type,
    source,
    themeTier: themeLevel.key,
    themeTierRank: themeLevel.rank,
    journalTier: journalLevel.key,
    journalTierRank: journalLevel.rank
  };
}

function withDailyRecommendation(item = {}) {
  return {
    ...item,
    dailyRecommendation: dailyRecommendationProfile(item)
  };
}

function dailySelectionFromPool(items) {
  const byDate = new Map();
  for (const item of items) {
    const key = dateKeyForPaper(item);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(withDailyRecommendation(item));
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => {
      if (a === "undated") return 1;
      if (b === "undated") return -1;
      return b.localeCompare(a);
    })
    .flatMap(([, entries]) => {
      const limit = Math.min(DAILY_RECOMMEND_MAX, Math.ceil(entries.length * DAILY_RECOMMEND_RATIO));
      if (limit <= 0) return [];
      return entries
        .filter((item) => item.dailyRecommendation?.eligible)
        .sort(rankPapers)
        .slice(0, limit);
    });
}

function rankPapers(a = {}, b = {}) {
  const aProfile = a.dailyRecommendation || dailyRecommendationProfile(a);
  const bProfile = b.dailyRecommendation || dailyRecommendationProfile(b);
  const aBreakdown = a.scoreBreakdown || {};
  const bBreakdown = b.scoreBreakdown || {};
  const aImpact = Number(a.journalImpactFactor ?? paperImpactFactor(a) ?? 0);
  const bImpact = Number(b.journalImpactFactor ?? paperImpactFactor(b) ?? 0);
  return (
    Number(bProfile.eligible) - Number(aProfile.eligible) ||
    Number(bProfile.themeTierRank || 0) - Number(aProfile.themeTierRank || 0) ||
    Number(bBreakdown.theme || 0) - Number(aBreakdown.theme || 0) ||
    Number(bProfile.journalTierRank || 0) - Number(aProfile.journalTierRank || 0) ||
    Number(bBreakdown.journal || 0) - Number(aBreakdown.journal || 0) ||
    Number(bBreakdown.type || 0) - Number(aBreakdown.type || 0) ||
    bImpact - aImpact ||
    Number(bBreakdown.source || 0) - Number(aBreakdown.source || 0) ||
    recentTimeForSort(b) - recentTimeForSort(a) ||
    Number(b.score || 0) - Number(a.score || 0) ||
    String(a.title || "").localeCompare(String(b.title || ""), "en")
  );
}

async function scorePaper(paper, pre, preferences) {
  if (DRY_RUN) return dryScore(paper, pre, preferences, { modelStatus: { score: "local-rule", needsRepair: false } });
  let modelScore;
  let modelStatus = { score: "ok", needsRepair: false };
  const scoreMessages = [
    {
      role: "system",
      content: SCORE_PROMPT
    },
    {
      role: "user",
      content: JSON.stringify({
        scoring_rule: {
          sourceSignal: "0-10, 已由规则计算，只代表信息质量和多来源热度，不进入总分",
          theme: "0-100, 可参考预筛 relevance；这是右上角显示分和日报第一层排序分",
          journal: "0-100, 已由规则计算，包含期刊档位和文章类型微调",
          type: "0-3, 已由规则计算，只用于同分排序解释"
        },
        fixed_scores: {
          sourceSignal: sourceScore(paper),
          journal: journalScore(paper),
          type: typeScore(paper)
        },
        watchlist: (preferences.watchlist || []).map((entry) => ({ name: entry.name, aliases: entry.aliases })),
        prescreen: pre,
        paper,
        output_schema: {
          theme: "0-100 integer",
          reason: "short Chinese reason for theme score",
          title: "original English paper title when available; otherwise Chinese research information title",
          summary: "single-paragraph structured Chinese detailed introduction under 500 Chinese characters, using inline labels such as [背景] [方法] [发现] [贡献] [局限] [精读]; no line breaks or bullet list",
          oneLine: "one Chinese sentence covering research question, field, and paper type",
          citation: "APA-like reference using provided metadata only, without DOI"
        }
      })
    }
  ];
  try {
    modelScore = await scoreJsonWithRetry(paper, scoreMessages);
  } catch (error) {
    warnModelFallback("score", paper, error);
    modelStatus = {
      score: "fallback",
      needsRepair: true,
      reason: modelErrorReason(error),
      updatedAt: new Date().toISOString()
    };
    return dryScore(paper, pre, preferences, { modelStatus });
  }
  const source = sourceScore(paper);
  const journal = journalScore(paper);
  const type = typeScore(paper);
  const prescreenTheme = themeScoreFromPrescreen(pre.relevance);
  const modelTheme = Math.max(0, Math.min(Number(modelScore.theme || prescreenTheme || 0) - metadataPenalty(paper), THEME_SCORE_MAX));
  const blendedTheme = Math.round(modelTheme * 0.7 + prescreenTheme * 0.3);
  const preferenceBonus = (pre.tags || []).reduce(
    (sum, tag) => sum + Number(preferences.topicWeights?.[tag] || 0) * 3,
    0
  ) + watchlistTopicBonus(paper, preferences);
  const cappedTheme = capThemeScore(blendedTheme + preferenceBonus, paper, pre);
  const theme = cappedTheme.theme;
  return {
    source,
    theme,
    journal,
    type,
    total: theme,
    displayScore: theme,
    themeRaw: cappedTheme.rawTheme,
    themeCap: cappedTheme.capInfo.cap,
    themeCapReason: cappedTheme.capInfo.reason,
    themeDimensions: cappedTheme.capInfo.dimensions,
    themeDimensionCount: cappedTheme.capInfo.dimensionCount,
    scoringSystem: SCORING_SYSTEM,
    title: modelScore.title,
    summary: modelScore.summary,
    oneLine: modelScore.oneLine || pre.oneLine,
    reason: modelScore.reason,
    citation: stripDoiFromCitation(modelScore.citation || "", paper.doi),
    modelFallback: Boolean(modelScore.modelFallback || modelStatus.score === "fallback"),
    needsModelRepair: Boolean(modelScore.needsModelRepair || modelStatus.needsRepair || pre.modelStatus?.needsRepair),
    modelStatus: {
      ...(pre.modelStatus || {}),
      ...modelStatus,
      needsRepair: Boolean(modelStatus.needsRepair || pre.modelStatus?.needsRepair)
    }
  };
}

function cacheHit(entry, fingerprint, weightsHash, legacyFingerprint = "") {
  return (
    entry &&
    !cacheNeedsModelRepair(entry) &&
    ["selected", "rejected"].includes(entry.status) &&
    entry.version === SCORING_VERSION &&
    entry.mode === CACHE_MODE &&
    (entry.fingerprint === fingerprint || entry.fingerprint === legacyFingerprint) &&
    entry.topicWeightsHash === weightsHash
  );
}

function findCanonicalCacheKey(cache, paper, fallbackKey) {
  if (fallbackKey.startsWith("doi:")) return fallbackKey;
  if (!reliableTitleKey(paper)) return fallbackKey;
  for (const [key, entry] of Object.entries(cache.items || {})) {
    if (!entry?.item || entry.status !== "selected") continue;
    if (samePaperByTitle(entry.item, paper)) return key;
  }
  return fallbackKey;
}

function reusableSelectedCache(entry, paper, key, weightsHash) {
  if (!entry || entry.status !== "selected") return false;
  if (cacheNeedsModelRepair(entry)) return false;
  if (entry.mode !== CACHE_MODE || entry.topicWeightsHash !== weightsHash || !entry.item) return false;
  if (key.startsWith("doi:")) return true;
  if (entry.contentFingerprint && entry.contentFingerprint === contentFingerprint(paper)) return true;
  return samePaperByTitle(entry.item, paper);
}

function reusableRejectedCache(entry, key, weightsHash) {
  return (
    entry &&
    !cacheNeedsModelRepair(entry) &&
    entry.status === "rejected" &&
    entry.version === SCORING_VERSION &&
    entry.mode === CACHE_MODE &&
    entry.topicWeightsHash === weightsHash &&
    key.startsWith("doi:")
  );
}

function noisyGeneratedText(value = "") {
  return /小说阅读器|去阅读|点击蓝字|关注我们|打开此内容|使用完整服务|微信扫一扫|轻点两下取消赞|取消 允许|视频 小程序|分享 留言 收藏|预览时标签不可点/.test(
    String(value || "")
  );
}

function textNeedsModelRepair(value = "", maxLength = 420) {
  const text = cleanGeneratedText(value);
  if (!text) return true;
  if (text.length > maxLength) return true;
  return text.length > 240 && noisyGeneratedText(value);
}

function cacheNeedsModelRepair(entry = null) {
  if (!entry) return false;
  const item = entry.item || {};
  const score = entry.score || {};
  const pre = entry.pre || {};
  if (item.needsModelRepair || score.needsModelRepair) return true;
  if (item.modelFallback || score.modelFallback) return true;
  if (item.modelStatus?.needsRepair || score.modelStatus?.needsRepair || pre.modelStatus?.needsRepair) return true;
  if (
    !item.doi &&
    /^(nature|NATURE)$/.test(String(item.journal || "")) &&
    (item.sourceSignals || []).some((signal) => signal.type === "wechat") &&
    (item.wechatTextStatus?.hasContent === false || item.localPrescreen?.textStatus === "empty")
  ) {
    return true;
  }
  if (entry.status === "selected" && textNeedsModelRepair(item.summary, 560)) return true;
  if (entry.status === "selected" && textNeedsModelRepair(item.oneLine, 160)) return true;
  return false;
}

function refreshScoreForSources(score = {}, paper = {}, pre = {}) {
  const source = sourceScore(paper);
  const journal = journalScore(paper);
  const type = typeScore(paper);
  const rawTheme = Number(score.theme ?? paper.scoreBreakdown?.theme ?? 0);
  const existingSystem = score.scoringSystem || paper.scoreBreakdown?.scoringSystem || "";
  const oldThemeMax = score.type == null && paper.scoreBreakdown?.type == null ? 50 : 55;
  const themeMax =
    existingSystem === SCORING_SYSTEM
      ? THEME_SCORE_MAX
      : existingSystem === "theme_journal_layered_v1"
        ? THEME_SCORE_MAX
      : ["theme_journal_quality_v2", "theme_journal_quality_v3", "theme_journal_quality_v4"].includes(existingSystem)
        ? 55
        : oldThemeMax;
  const migratedTheme = clamp(Math.round((rawTheme * THEME_SCORE_MAX) / Math.max(themeMax, 1)), 0, THEME_SCORE_MAX);
  const cappedTheme = capThemeScore(migratedTheme, paper, pre);
  const theme = cappedTheme.theme;
  return {
    ...score,
    source,
    journal,
    type,
    theme,
    total: theme,
    displayScore: theme,
    themeRaw: cappedTheme.rawTheme,
    themeCap: cappedTheme.capInfo.cap,
    themeCapReason: cappedTheme.capInfo.reason,
    themeDimensions: cappedTheme.capInfo.dimensions,
    themeDimensionCount: cappedTheme.capInfo.dimensionCount,
    scoringSystem: SCORING_SYSTEM
  };
}

function preferredDisplayTitle(cachedItem = {}, incoming = {}) {
  const incomingTitle = incoming.originalTitle || incoming.title || "";
  const cachedTitle = cachedItem.title || cachedItem.originalTitle || "";
  if (looksLikeEnglishTitle(incomingTitle) && !looksLikeEnglishTitle(cachedTitle)) return incomingTitle;
  if (!cachedTitle) return incomingTitle;
  if (looksLikeEnglishTitle(cachedTitle)) return cachedTitle;
  if ((incoming.metadataConfidence?.score || 0) > (cachedItem.metadataConfidence?.score || 0) + 15 && incomingTitle) {
    return incomingTitle;
  }
  return cachedTitle;
}

function preferredOriginalTitle(cachedItem = {}, incoming = {}) {
  const incomingTitle = incoming.originalTitle || (looksLikeEnglishTitle(incoming.title || "") ? incoming.title : "");
  const cachedTitle = cachedItem.originalTitle || (looksLikeEnglishTitle(cachedItem.title || "") ? cachedItem.title : "");
  return incomingTitle || cachedTitle || "";
}

function mergeMetadataConfidence(cachedItem = {}, incoming = {}, merged = {}) {
  const computed = computeMetadataConfidence(merged);
  const cachedScore = Number(cachedItem.metadataConfidence?.score || 0);
  const incomingScore = Number(incoming.metadataConfidence?.score || 0);
  if (incomingScore >= cachedScore && incoming.metadataConfidence) return incoming.metadataConfidence;
  if (cachedScore > computed.score && cachedItem.metadataConfidence) return cachedItem.metadataConfidence;
  return computed;
}

function mergeCachedSelection(entry, paper) {
  const cachedItem = enrichPaperMetadata(entry.item || {});
  const incoming = enrichPaperMetadata(paper);
  const sourceSignals = mergeSourceSignals(cachedItem.sourceSignals || [], incoming.sourceSignals || []);
  const mergedPaper = {
    ...cachedItem,
    ...incoming,
    title: preferredDisplayTitle(cachedItem, incoming),
    originalTitle: preferredOriginalTitle(cachedItem, incoming),
    journal: choosePreferredJournal(authoritativeJournal(incoming), authoritativeJournal(cachedItem)),
    type: incoming.type || cachedItem.type || "",
    oneLine: cachedItem.oneLine || incoming.oneLine,
    summary: cachedItem.summary || incoming.summary,
    reason: cachedItem.reason || incoming.reason,
    citation: cachedItem.citation || incoming.citation || "",
    abstract: chooseLongerText(cachedItem.abstract, incoming.abstract),
    authors: incoming.authors?.length ? incoming.authors : cachedItem.authors || [],
    date: incoming.date || cachedItem.date || "",
    publishedAt: incoming.publishedAt || cachedItem.publishedAt || "",
    doi: normalizeDoi(incoming.doi || cachedItem.doi || ""),
    url: choosePreferredUrl(cachedItem.url, incoming.url),
    journalImpactFactor: paperImpactFactor(incoming) ?? paperImpactFactor(cachedItem),
    resolutionStatus: incoming.resolutionStatus || cachedItem.resolutionStatus || "paper_resolved",
    recommendationEligible: incoming.recommendationEligible ?? cachedItem.recommendationEligible ?? true,
    metadataEvidence: incoming.metadataEvidence || cachedItem.metadataEvidence || {},
    doiEvidence: incoming.doiEvidence || cachedItem.doiEvidence || null,
    paperTypeGroup: resolvedArticleTypeGroup(incoming, cachedItem.paperTypeGroup, cachedItem.localPrescreen?.paperTypeGroup),
    localPrescreen: {
      ...(cachedItem.localPrescreen || {}),
      ...(incoming.localPrescreen || {})
    },
    sourceSignals,
    sourceUrls: undefined,
    modelFallback: Boolean(cachedItem.modelFallback || entry.score?.modelFallback),
    needsModelRepair: Boolean(cachedItem.needsModelRepair || entry.score?.needsModelRepair),
    modelStatus: cachedItem.modelStatus || entry.score?.modelStatus || {},
    generatedAt: cachedItem.generatedAt || entry.updatedAt || new Date().toISOString()
  };
  const metadata = mergeMetadataConfidence(cachedItem, incoming, mergedPaper);
  mergedPaper.metadataConfidence = metadata;
  mergedPaper.metadataStatus = metadata.status;
  const score = refreshScoreForSources(entry.score || mergedPaper.scoreBreakdown || {}, mergedPaper, entry.pre || mergedPaper.localPrescreen || {});
  const scoreBreakdown = {
    scoringSystem: SCORING_SYSTEM,
    source: score.source,
    theme: score.theme,
    journal: score.journal,
    type: score.type,
    themeRaw: score.themeRaw,
    themeCap: score.themeCap,
    themeCapReason: score.themeCapReason,
    themeDimensions: score.themeDimensions,
    themeDimensionCount: score.themeDimensionCount
  };
  const item = {
    ...mergedPaper,
    score: score.total,
    scoreBreakdown
  };
  item.dailyRecommendation = dailyRecommendationProfile(item);
  return {
    score,
    item
  };
}

function selectedFromScore(paper, pre, score) {
  const enriched = enrichPaperMetadata(paper);
  const confidence = computeMetadataConfidence(enriched);
  const scoreBreakdown = {
    scoringSystem: SCORING_SYSTEM,
    source: score.source,
    theme: score.theme,
    journal: score.journal,
    type: score.type,
    themeRaw: score.themeRaw,
    themeCap: score.themeCap,
    themeCapReason: score.themeCapReason,
    themeDimensions: score.themeDimensions,
    themeDimensionCount: score.themeDimensionCount
  };
  const item = {
    ...enriched,
    originalTitle: enriched.originalTitle || enriched.rawTitle || enriched.title,
    title: score.title || enriched.title,
    journal: authoritativeJournal(enriched),
    tags: pre.tags || [],
    oneLine: score.oneLine || pre.oneLine,
    summary: score.summary,
    reason: score.reason || "通过主题预筛并进入 theme/journal 分层评分。",
    score: score.total,
    scoreBreakdown,
    resolutionStatus: enriched.resolutionStatus || "paper_resolved",
    recommendationEligible: true,
    metadataEvidence: enriched.metadataEvidence || {},
    doiEvidence: enriched.doiEvidence || null,
    paperTypeGroup: resolvedArticleTypeGroup(enriched, pre.paperTypeGroup),
    journalImpactFactor: paperImpactFactor(enriched),
    citation: score.citation,
    metadataConfidence: confidence,
    metadataStatus: confidence.status,
    modelFallback: Boolean(score.modelFallback),
    needsModelRepair: Boolean(score.needsModelRepair),
    modelStatus: score.modelStatus || {},
    generatedAt: new Date().toISOString()
  };
  item.dailyRecommendation = dailyRecommendationProfile(item);
  return item;
}

async function main() {
  const raw = await fs.readFile(INPUT, "utf8");
  const inputPayload = JSON.parse(raw);
  const rawCandidates = asArrayPayload(inputPayload).map(journalRssPaper).filter(Boolean);
  const candidates = await mergeRecentKnownSources(rawCandidates);
  const clusters = clusterCandidates(candidates);
  const preferences = preferenceSettingsFromFeedback(await readTopicFeedback());
  const weightsHash = topicWeightsHash(preferences);
  const cache = sanitizeRssOnlyCache(await readCache(), rawCandidates);
  const selected = [];
  const dynamicItems = [];
  const stats = {
    cacheHits: 0,
    cacheMisses: 0,
    rejectedHits: 0,
    rejectedMisses: 0,
    localRejects: 0,
    dynamicOnly: 0,
    sourceMerges: 0,
    modelRepairs: 0,
    gateReasons: {},
    localRejectSources: {},
    prescreenRejectSources: {},
    scoreCalls: 0
  };
  const concurrency = Math.min(SCORE_CONCURRENCY, Math.max(clusters.length, 1));
  let nextIndex = 0;
  let processed = 0;

  if (COMPACT_LOG) {
    console.log(`评分准备：输入 ${rawCandidates.length}，历史来源合并后 ${candidates.length}，聚类 ${clusters.length}。`);
    console.log(`评分并发：${concurrency}`);
  }

  function logProgress(force = false) {
    if (!COMPACT_LOG) return;
    if (force || processed === 1 || processed % 10 === 0 || processed === clusters.length) {
      console.log(`处理候选：${processed}/${clusters.length}，精选池 ${selected.length}，仅动态 ${stats.dynamicOnly}`);
    }
  }

  function increment(map, key = "unknown") {
    map[key || "unknown"] = (map[key || "unknown"] || 0) + 1;
  }

  async function processPaper(paper) {
    paper = enrichPaperMetadata(paper);
    const key = findCanonicalCacheKey(cache, paper, cacheKey(paper));
    const fingerprint = candidateFingerprint(paper);
    const legacyFingerprint = legacyCandidateFingerprint(paper);
    const contentHash = contentFingerprint(paper);
    const sourceHash = sourceSignalsFingerprint(paper);
    const metadataHash = paperMetadataFingerprint(paper);
    const cached = cache.items[key];
    if (cacheNeedsModelRepair(cached)) stats.modelRepairs += 1;

    const localReject = localPreModelReject(paper);
    if (localReject) {
      stats.localRejects += 1;
      increment(stats.localRejectSources, localReject.source || "local-prefilter");
      cache.items[key] = {
        version: SCORING_VERSION,
        mode: CACHE_MODE,
        topicWeightsHash: weightsHash,
        fingerprint,
        legacyFingerprint,
        contentFingerprint: contentHash,
        sourceSignalsFingerprint: sourceHash,
        metadataFingerprint: metadataHash,
        status: "rejected",
        pre: localReject,
        updatedAt: new Date().toISOString()
      };
      return;
    }

    const gate = recommendationGate(paper);
    if (!gate.eligible) {
      stats.dynamicOnly += 1;
      increment(stats.gateReasons, gate.reason || gate.status || "unknown");
      const dynamicItem = dynamicFromPaper(paper, gate);
      dynamicItems.push(dynamicItem);
      cache.items[key] = {
        version: SCORING_VERSION,
        mode: CACHE_MODE,
        topicWeightsHash: weightsHash,
        fingerprint,
        legacyFingerprint,
        contentFingerprint: contentHash,
        sourceSignalsFingerprint: sourceHash,
        metadataFingerprint: paperMetadataFingerprint(dynamicItem),
        status: "dynamic_only",
        gate,
        item: dynamicItem,
        updatedAt: new Date().toISOString()
      };
      return;
    }

    if (cacheHit(cached, fingerprint, weightsHash, legacyFingerprint)) {
      if (cached.status === "selected") {
        stats.cacheHits += 1;
        const merged = mergeCachedSelection(cached, paper);
        selected.push(merged.item);
        cache.items[key] = {
          ...cached,
          fingerprint,
          legacyFingerprint,
          contentFingerprint: contentHash,
          sourceSignalsFingerprint: sourceHash,
          metadataFingerprint: metadataHash,
          score: merged.score,
          item: merged.item,
          updatedAt: new Date().toISOString()
        };
      } else {
        stats.rejectedHits += 1;
      }
      return;
    }

    if (reusableSelectedCache(cached, paper, key, weightsHash)) {
      stats.cacheHits += 1;
      if (cached.sourceSignalsFingerprint !== sourceHash) stats.sourceMerges += 1;
      const merged = mergeCachedSelection(cached, paper);
      selected.push(merged.item);
      cache.items[key] = {
        ...cached,
        version: SCORING_VERSION,
        fingerprint,
        legacyFingerprint,
        contentFingerprint: contentHash,
        sourceSignalsFingerprint: sourceSignalsFingerprint(merged.item),
        metadataFingerprint: paperMetadataFingerprint(merged.item),
        score: merged.score,
        item: merged.item,
        updatedAt: new Date().toISOString()
      };
      return;
    }

    if (reusableRejectedCache(cached, key, weightsHash)) {
      stats.rejectedHits += 1;
      cache.items[key] = {
        ...cached,
        fingerprint,
        legacyFingerprint,
        contentFingerprint: contentHash,
        sourceSignalsFingerprint: sourceHash,
        metadataFingerprint: metadataHash,
        updatedAt: new Date().toISOString()
      };
      return;
    }

    stats.cacheMisses += 1;
    const pre = await prescreen(paper);
    if (!pre.pass || pre.isEcology === false) {
      stats.rejectedMisses += 1;
      increment(stats.prescreenRejectSources, pre.source || pre.reason || "model-prescreen");
      cache.items[key] = {
        version: SCORING_VERSION,
        mode: CACHE_MODE,
        topicWeightsHash: weightsHash,
        fingerprint,
        legacyFingerprint,
        contentFingerprint: contentHash,
        sourceSignalsFingerprint: sourceHash,
        metadataFingerprint: metadataHash,
        status: "rejected",
        pre,
        updatedAt: new Date().toISOString()
      };
      return;
    }
    stats.scoreCalls += 1;
    const score = await scorePaper(paper, pre, preferences);
    const item = selectedFromScore(paper, pre, score);
    selected.push(item);
    cache.items[key] = {
      version: SCORING_VERSION,
      mode: CACHE_MODE,
      topicWeightsHash: weightsHash,
      fingerprint,
      legacyFingerprint,
      contentFingerprint: contentHash,
      sourceSignalsFingerprint: sourceHash,
      metadataFingerprint: metadataHash,
      status: "selected",
      pre,
      score,
      item,
      updatedAt: new Date().toISOString()
    };
  }

  async function worker() {
    while (nextIndex < clusters.length) {
      const index = nextIndex;
      nextIndex += 1;
      await processPaper(clusters[index]);
      processed += 1;
      logProgress();
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  logProgress(true);

  const selectedPool = selected.sort(rankPapers);
  const dailySelection = dailySelectionFromPool(selectedPool);
  const dailyIds = new Set(dailySelection.map((item) => item.id));
  const nonDailySelected = selectedPool.filter((item) => !dailyIds.has(item.id));
  const dailyGateReasons = selectedPool.reduce((counts, item) => {
    const profile = item.dailyRecommendation || dailyRecommendationProfile(item);
    counts[profile.reason] = (counts[profile.reason] || 0) + 1;
    return counts;
  }, {});
  dynamicItems.push(...nonDailySelected);
  dynamicItems.sort((a, b) => recentTimeForSort(b) - recentTimeForSort(a) || String(a.title || "").localeCompare(String(b.title || ""), "zh-Hans-CN"));
  const items = dailySelection.map(journalRssPaper).filter(Boolean);
  const publicDynamicItems = dynamicItems.map(journalRssPaper).filter(Boolean);
  const modelRetryTotal = Object.values(modelStats.retries).reduce((sum, value) => sum + value, 0);
  const modelFallbackTotal = Object.values(modelStats.fallbacks).reduce((sum, value) => sum + value, 0);
  const output = {
    generatedAt: new Date().toISOString(),
    lookbackDays: LOOKBACK_DAYS,
    dryRun: DRY_RUN,
    prescreenModel: DRY_RUN ? "local-rule" : PRESCREEN_MODEL,
    scoreModel: DRY_RUN ? "local-rule" : SCORE_MODEL,
    scoringSystem: SCORING_SYSTEM,
    sourceMode: RSS_ONLY ? "public-journal-rss-only" : "local-mixed-sources",
    dailySelectionApplied: true,
    dailySelectionRule: {
      rankingSystem: RANKING_SYSTEM,
      ratio: DAILY_RECOMMEND_RATIO,
      maxPerDay: DAILY_RECOMMEND_MAX,
      relatedThemeMin: DAILY_RELATED_THEME_MIN,
      strongThemeMin: DAILY_STRONG_THEME_MIN,
      coreThemeMin: DAILY_CORE_THEME_MIN,
      relatedJournalMin: DAILY_RELATED_JOURNAL_MIN,
      strongJournalMin: DAILY_STRONG_JOURNAL_MIN,
      coreJournalMin: DAILY_CORE_JOURNAL_MIN,
      exceptionalB3ThemeMin: DAILY_EXCEPTIONAL_B3_THEME_MIN,
      exceptionalB3JournalMin: DAILY_EXCEPTIONAL_B3_JOURNAL_MIN,
      displayScore: "theme",
      selectedPool: selectedPool.length,
      nonDailySelected: nonDailySelected.length,
      gateReasons: dailyGateReasons
    },
    topicWeights: preferences.topicWeights,
    watchlist: preferences.watchlist.map((entry) => ({ name: entry.name, aliases: entry.aliases, bonus: entry.bonus })),
    cache: {
      mode: CACHE_MODE,
      version: SCORING_VERSION,
      hits: stats.cacheHits,
      misses: stats.cacheMisses,
      rejectedHits: stats.rejectedHits,
      rejectedMisses: stats.rejectedMisses,
      localRejects: stats.localRejects,
      dynamicOnly: stats.dynamicOnly,
      sourceMerges: stats.sourceMerges,
      modelRepairs: stats.modelRepairs,
      modelRetries: modelStats.retries,
      modelFallbacks: modelStats.fallbacks
    },
    items,
    dynamicItems: publicDynamicItems
  };

  await writeLatestData(output);
  await writeCache(cache);
  await fs.writeFile(
    REPORT,
    `${JSON.stringify(
      {
        generatedAt: output.generatedAt,
        lookbackDays: LOOKBACK_DAYS,
        dryRun: DRY_RUN,
        inputCandidates: rawCandidates.length,
        afterHistorySourceMerge: candidates.length,
        clusters: clusters.length,
        selectedPool: selectedPool.length,
        dynamicItems: publicDynamicItems.length,
        dailySelection: {
          count: dailySelection.length,
          rankingSystem: RANKING_SYSTEM,
          ratio: DAILY_RECOMMEND_RATIO,
          maxPerDay: DAILY_RECOMMEND_MAX,
          relatedThemeMin: DAILY_RELATED_THEME_MIN,
          strongThemeMin: DAILY_STRONG_THEME_MIN,
          coreThemeMin: DAILY_CORE_THEME_MIN,
          relatedJournalMin: DAILY_RELATED_JOURNAL_MIN,
          strongJournalMin: DAILY_STRONG_JOURNAL_MIN,
          coreJournalMin: DAILY_CORE_JOURNAL_MIN,
          displayScore: "theme",
          nonDailySelected: nonDailySelected.length,
          gateReasons: dailyGateReasons,
          byDate: Object.fromEntries(
            [...dailySelection.reduce((map, item) => {
              const key = dateKeyForPaper(item);
              map.set(key, (map.get(key) || 0) + 1);
              return map;
            }, new Map()).entries()].sort()
          )
        },
        cache: output.cache,
        modelStats,
        gateReasons: stats.gateReasons,
        localRejectSources: stats.localRejectSources,
        prescreenRejectSources: stats.prescreenRejectSources
      },
      null,
      2
    )}\n`
  );
  const modelSummary = modelRetryTotal || modelFallbackTotal ? `，模型降级 ${modelFallbackTotal}，重试 ${modelRetryTotal}` : "";
  const repairSummary = stats.modelRepairs ? `，重跑待修复 ${stats.modelRepairs}` : "";
  console.log(
    COMPACT_LOG
      ? `评分完成：精选池 ${selectedPool.length}，日报精选 ${output.items.length}，未入日报转动态 ${nonDailySelected.length}，仅动态 ${stats.dynamicOnly}，缓存命中 ${stats.cacheHits + stats.rejectedHits}，合并重复 ${stats.sourceMerges}，本地过滤 ${stats.localRejects}，新处理 ${stats.cacheMisses}，模型评分 ${stats.scoreCalls}${repairSummary}${modelSummary}。`
      : `Wrote ${OUTPUT} with ${output.items.length} daily item(s), ${nonDailySelected.length} scored dynamic item(s), and ${stats.dynamicOnly} dynamic-only item(s). Cache hits: ${stats.cacheHits}, source merges: ${stats.sourceMerges}, misses: ${stats.cacheMisses}, local rejects: ${stats.localRejects}, rejected hits: ${stats.rejectedHits}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
