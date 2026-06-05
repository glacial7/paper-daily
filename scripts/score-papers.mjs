import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "data", "candidates.json");
const OUTPUT = path.join(ROOT, "data", "latest.json");
const FEEDBACK = path.join(ROOT, "config", "topic-feedback.json");
const API_KEY = process.env.DEEPSEEK_API_KEY;
const DRY_RUN = process.env.PAPER_DAILY_DRY_RUN === "1" || !API_KEY;

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const PRESCREEN_MODEL = process.env.DEEPSEEK_PRESCREEN_MODEL || "deepseek-v4-flash";
const SCORE_MODEL = process.env.DEEPSEEK_SCORE_MODEL || "deepseek-v4-pro";

const topicLabels = {
  invasion: "植物入侵",
  fire: "火风险",
  wind: "风电扰动",
  drainage: "农田排水",
  methods: "方法工具"
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
  Article: 17,
  Methods: 14,
  Data: 14,
  Perspective: 10,
  Comment: 10,
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

const PRESCREEN_PROMPT = `
你是 Paper Daily 的低成本预筛模型。你的任务不是写摘要，而是判断候选条目是否值得进入高质量评分阶段。

第一道门：先判断候选是否属于“泛生态学研究”。泛生态学包括但不限于：
- 群落生态、生态系统生态、景观生态、全球变化生态、恢复生态、城市生态、农业生态、森林/草地/湿地/淡水生态
- 生物多样性、保护生物学、物种分布、植物-土壤/植物-微生物互作、入侵生态、火生态、生态水文、生态遥感和生态模型
- 以生态过程、生态格局、生态功能、生态管理或生态风险为核心的问题

不属于泛生态学的条目应 pass=false，即使来自综合期刊、微信公众号或新闻报道。

用户关注主题：
- invasion: 植物入侵、生物入侵、外来植物风险、入侵管理
- fire: 火风险、野火、火干扰、可燃物、火后恢复
- wind: 风电项目、风电道路、施工扰动、风电场生态影响
- drainage: 农田排水、沟渠、面源污染、氮磷削减、农业水文
- methods: 遥感、模型、机器学习、监测方法、数据集

预筛规则：
1. 只根据标题、摘要、期刊、文章类型和来源信号判断。
2. 先判断 isEcology。isEcology=false 时，pass=false。
3. isEcology=true 且与至少一个关注主题明确相关，pass=true。
4. isEcology=true 但只是泛泛生态、泛泛农业、泛泛气候变化，无法连接到上述主题，通常 pass=false；如果它明显属于农业生态、城市生态、恢复生态、生物多样性或生态方法，并对用户主题有潜在价值，可给低 relevance 后 pass=true。
5. 微信公众号或新闻报道可以作为发现入口；如果内容指向一篇可能相关论文，也可以 pass=true，但仍必须满足 isEcology=true。
6. 输出严格 JSON，不要输出解释文字。
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
- 植物入侵与火烧风险
- 风电项目与植物入侵风险
- 农田排水与面源污染
- 生态遥感、模型和监测方法

摘要要求：
1. 用中文写约 180-220 字。
2. 讲清研究对象、方法/证据、主要发现、为什么值得看。
3. 不要夸大结论，不要凭空添加 DOI、作者或期刊。
4. 引用信息只能使用输入元数据；缺失则保留空缺或用已有字段。
5. citation 不要包含 DOI、doi: 字样或 DOI URL；DOI 会由页面单独显示。
6. 输出严格 JSON，不要输出解释文字。
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
  const isEcology =
    /ecolog|ecosystem|biodiversity|conservation|restoration|urban ecology|agroecolog|agricultural ecology|landscape|community|invasion|invasive|wildfire|fire|drainage|hydrology|remote sensing|vegetation|species distribution|生态|生态学|生物多样性|保护生物学|恢复生态|城市生态|农业生态|景观|群落|生态系统|入侵|火|排水|遥感|植被/.test(
      text
    );
  const tags = [];
  if (/入侵|invasion|invasive/.test(text)) tags.push("invasion");
  if (/火|fire|wildfire/.test(text)) tags.push("fire");
  if (/风电|wind farm|wind power/.test(text)) tags.push("wind");
  if (/排水|沟渠|drainage|ditch|phosphorus|nitrogen/.test(text)) tags.push("drainage");
  if (/遥感|remote sensing|model|machine learning/.test(text)) tags.push("methods");
  return {
    pass: isEcology && tags.length > 0,
    isEcology,
    tags,
    relevance: Math.min(40 + Math.max(tags.length - 1, 0) * 2, 50),
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
    summary: paper.abstract || pre.oneLine || paper.title,
    citation: `${paper.title}. (${paper.date || "n.d."}). ${paper.journal || "Journal Name"}.`
  };
}

function dateKeyForPaper(paper) {
  return paper.date || "undated";
}

function topPerDay(items, limit = 10) {
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
    summary: modelScore.summary,
    oneLine: modelScore.oneLine || pre.oneLine,
    reason: modelScore.reason,
    citation: stripDoiFromCitation(modelScore.citation || dryScore(paper, pre).citation, paper.doi)
  };
}

async function main() {
  const raw = await fs.readFile(INPUT, "utf8");
  const candidates = JSON.parse(raw);
  const clusters = clusterCandidates(candidates);
  const topicWeights = topicWeightsFromFeedback(await readTopicFeedback());
  const selected = [];

  for (const paper of clusters) {
    const pre = await prescreen(paper);
    if (!pre.pass || pre.isEcology === false) continue;
    const score = await scorePaper(paper, pre, topicWeights);
    selected.push({
      ...paper,
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
    });
  }

  selected.sort((a, b) => b.score - a.score);
  const items = topPerDay(selected, 10);
  const output = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    prescreenModel: DRY_RUN ? "local-rule" : PRESCREEN_MODEL,
    scoreModel: DRY_RUN ? "local-rule" : SCORE_MODEL,
    topicWeights,
    items
  };

  await fs.writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT} with ${output.items.length} selected item(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
