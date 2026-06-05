import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "data", "candidates.json");
const OUTPUT = path.join(ROOT, "data", "latest.json");
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

const PRESCREEN_PROMPT = `
你是 Paper Daily 的低成本预筛模型。你的任务不是写摘要，而是判断候选条目是否值得进入高质量评分阶段。

用户关注主题：
- invasion: 植物入侵、生物入侵、外来植物风险、入侵管理
- fire: 火风险、野火、火干扰、可燃物、火后恢复
- wind: 风电项目、风电道路、施工扰动、风电场生态影响
- drainage: 农田排水、沟渠、面源污染、氮磷削减、农业水文
- methods: 遥感、模型、机器学习、监测方法、数据集

预筛规则：
1. 只根据标题、摘要、期刊、文章类型和来源信号判断。
2. 与至少一个关注主题明确相关，pass=true。
3. 只有泛泛生态、泛泛农业、泛泛气候变化，但无法连接到上述主题，pass=false。
4. 微信公众号或新闻报道可以作为发现入口；如果内容指向一篇可能相关论文，也可以 pass=true。
5. 输出严格 JSON，不要输出解释文字。
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
5. 输出严格 JSON，不要输出解释文字。
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
  const tags = [];
  if (/入侵|invasion|invasive/.test(text)) tags.push("invasion");
  if (/火|fire|wildfire/.test(text)) tags.push("fire");
  if (/风电|wind farm|wind power/.test(text)) tags.push("wind");
  if (/排水|沟渠|drainage|ditch|phosphorus|nitrogen/.test(text)) tags.push("drainage");
  if (/遥感|remote sensing|model|machine learning/.test(text)) tags.push("methods");
  return {
    pass: tags.length > 0,
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
    citation: `${paper.title}. (${paper.date || "n.d."}). ${paper.journal || "Journal Name"}. ${paper.doi ? `https://doi.org/${paper.doi}` : ""}`.trim()
  };
}

async function scorePaper(paper, pre) {
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
          citation: "APA-like reference using provided metadata only"
        }
      })
    }
  ]);
  const source = sourceScore(paper);
  const type = typeScore(paper);
  const theme = Math.max(0, Math.min(Number(modelScore.theme || pre.relevance || 0), 50));
  return {
    source,
    theme,
    type,
    total: source + theme + type,
    summary: modelScore.summary,
    oneLine: modelScore.oneLine || pre.oneLine,
    reason: modelScore.reason,
    citation: modelScore.citation || dryScore(paper, pre).citation
  };
}

async function main() {
  const raw = await fs.readFile(INPUT, "utf8");
  const candidates = JSON.parse(raw);
  const clusters = clusterCandidates(candidates);
  const selected = [];

  for (const paper of clusters) {
    const pre = await prescreen(paper);
    if (!pre.pass) continue;
    const score = await scorePaper(paper, pre);
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
  const output = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    prescreenModel: DRY_RUN ? "local-rule" : PRESCREEN_MODEL,
    scoreModel: DRY_RUN ? "local-rule" : SCORE_MODEL,
    items: selected.slice(0, 10)
  };

  await fs.writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${OUTPUT} with ${output.items.length} selected item(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
