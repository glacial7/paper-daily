const papers = [
  {
    id: "invasion-fire-001",
    time: "08:12",
    title: "入侵草本植物改变可燃物结构并放大火后恢复差异",
    source: "Nature",
    sourceSignals: [
      { type: "topJournal", name: "Nature" },
      { type: "natureScienceNews", name: "Nature News" },
      { type: "wechat", name: "植物入侵与生态恢复专题号" }
    ],
    sourceType: "comprehensive",
    type: "Article",
    score: 93,
    tags: ["invasion", "fire"],
    oneLine: "入侵草本通过改变可燃物连续性和含水量，可能放大火后群落恢复差异。",
    summary:
      "研究聚焦入侵草本植物与火干扰之间的反馈关系，比较了入侵群落和本地群落在可燃物结构、地表覆盖、含水量和火后恢复速度上的差异。论文的价值在于把“入侵改变燃料条件”和“火后入侵优势扩大”连接成可检验机制链条。若原文包含长期样地、实验燃烧或遥感证据，可作为植物入侵与火风险综述中的核心文献。",
    reason: "服务植物入侵与火烧风险主线。",
    paperUrl: "#",
    doi: "10.xxxx/example.001",
    sourceUrls: [
      { label: "Nature 原文", url: "#" },
      { label: "Nature News", url: "#" },
      { label: "公众号推荐", url: "#" }
    ],
    citation:
      "Author, A. A., & Author, B. B. (2026). 入侵草本植物改变可燃物结构并放大火后恢复差异. Nature, 000, 000-000. https://doi.org/xx.xxxx/example"
  },
  {
    id: "wind-invasion-001",
    time: "08:05",
    title: "风电场道路网络对外来植物扩散的廊道效应",
    source: "Journal of Ecology",
    sourceSignals: [
      { type: "professionalJournal", name: "Journal of Ecology" },
      { type: "scienceDaily", name: "ScienceDaily" }
    ],
    sourceType: "professional",
    type: "Article",
    score: 89,
    tags: ["wind", "invasion"],
    oneLine: "风电场道路和施工平台可能形成外来植物扩散廊道，并改变局地生境边缘效应。",
    summary:
      "论文围绕风电场道路、施工平台和输电通道带来的生境破碎化与传播廊道效应，分析外来植物在扰动边缘、道路交汇点和维护通道附近的出现频率。重点值得看的是其是否采用 BACI 设计、景观连通性指标或物种分布模型。如果方法扎实，可直接转化为风电项目外来植物风险分区和野外监测点位设计。",
    reason: "服务风电项目与植物入侵风险。",
    paperUrl: "#",
    doi: "10.xxxx/example.002",
    sourceUrls: [
      { label: "Journal of Ecology 原文", url: "#" },
      { label: "ScienceDaily 报道", url: "#" }
    ],
    citation:
      "Author, C. C., Author, D. D., & Author, E. E. (2026). 风电场道路网络对外来植物扩散的廊道效应. Journal of Ecology, 000, 000-000. https://doi.org/xx.xxxx/example"
  },
  {
    id: "drainage-001",
    time: "07:48",
    title: "农田排水沟渠的氮磷削减效率与生态工程设计",
    source: "Annual Review of Ecology, Evolution, and Systematics",
    sourceSignals: [
      { type: "reviewJournal", name: "Annual Review of Ecology, Evolution, and Systematics" },
      { type: "wechat", name: "农业生态前沿速递" }
    ],
    sourceType: "professional",
    type: "Review",
    score: 86,
    tags: ["drainage"],
    oneLine: "沟渠结构、植被配置和水力停留时间共同影响农田排水中的氮磷削减效率。",
    summary:
      "综述总结农田排水沟渠在氮、磷和悬浮颗粒物削减中的作用，比较不同沟渠断面、植被配置、水力停留时间和季节水文条件下的净化效率。日报中应优先保留可量化参数和工程设计建议，例如缓坡、植被带宽度、沉积区设置和维护频率。该类文章适合沉淀为农田面源污染和沟渠生态功能的长期知识卡。",
    reason: "支撑农田排水面源污染研究。",
    paperUrl: "#",
    doi: "10.xxxx/example.003",
    sourceUrls: [
      { label: "Annual Reviews 原文", url: "#" },
      { label: "公众号推荐", url: "#" }
    ],
    citation:
      "Author, F. F., & Author, G. G. (2026). 农田排水沟渠的氮磷削减效率与生态工程设计. Annual Review of Ecology, Evolution, and Systematics, 000, 000-000. https://doi.org/xx.xxxx/example"
  },
  {
    id: "methods-fire-001",
    time: "07:31",
    title: "多源遥感识别生态扰动后的植被恢复轨迹",
    source: "Remote Sensing of Environment",
    sourceSignals: [{ type: "professionalJournal", name: "Remote Sensing of Environment" }],
    sourceType: "professional",
    type: "Methods",
    score: 82,
    tags: ["methods", "fire"],
    oneLine: "多源遥感可用于重建火烧、施工和农业排水扰动后的植被恢复轨迹。",
    summary:
      "方法论文整合光学遥感、雷达或时间序列植被指数，识别扰动后植被恢复轨迹和异常恢复区域。阅读时应关注数据源、空间分辨率、时间窗口、模型泛化能力、代码开放情况，以及是否能迁移到风电扰动、火烧迹地或农田沟渠监测。若有清晰流程和可复用代码，可进入方法工具库。",
    reason: "补充遥感监测技术路线。",
    paperUrl: "#",
    doi: "10.xxxx/example.004",
    sourceUrls: [{ label: "Remote Sensing of Environment 原文", url: "#" }],
    citation:
      "Author, H. H., Author, I. I., & Author, J. J. (2026). 多源遥感识别生态扰动后的植被恢复轨迹. Remote Sensing of Environment, 000, 000-000. https://doi.org/xx.xxxx/example"
  },
  {
    id: "wechat-invasion-001",
    time: "07:08",
    title: "外来植物风险评估的新综述",
    source: "植物入侵与生态恢复专题号",
    sourceSignals: [
      { type: "wechat", name: "植物入侵与生态恢复专题号" },
      { type: "wechat", name: "农业生态前沿速递" }
    ],
    sourceType: "wechat",
    type: "Review",
    score: 79,
    tags: ["invasion"],
    oneLine: "公众号推荐可作为发现入口，但需要反向定位 DOI 和原始期刊。",
    summary:
      "微信公众号内容不直接作为论文证据源，而是作为主题发现和中文解读入口。处理流程应是先记录推荐标题、关键词和提到的结论，再反向查找原论文、DOI、期刊和发布时间。只有能定位到原始论文并确认研究质量后，才进入论文日报。无法找到原文的内容保留在动态页，不进入精选推荐。",
    reason: "弥补高发文量期刊不全量订阅造成的漏检。",
    paperUrl: "#",
    doi: "10.xxxx/example.005",
    sourceUrls: [
      { label: "公众号推荐 A", url: "#" },
      { label: "公众号推荐 B", url: "#" }
    ],
    citation:
      "Author, K. K. (2026). 外来植物风险评估的新综述. Journal Name, 000, 000-000. https://doi.org/xx.xxxx/example"
  },
  {
    id: "news-drainage-001",
    time: "06:55",
    title: "ScienceDaily 农业污染新闻反链论文",
    source: "ScienceDaily",
    sourceSignals: [{ type: "scienceDaily", name: "ScienceDaily" }],
    sourceType: "news",
    type: "News",
    score: 69,
    tags: ["drainage"],
    oneLine: "新闻报道适合发现新论文，但必须回到原论文确认。",
    summary:
      "新闻报道源包括 ScienceDaily、Nature News、期刊官网新闻和研究机构新闻稿。它们适合快速发现新论文和获得通俗摘要，但不能替代原文。抓取时应保存新闻链接、原始论文链接、期刊、发布日期和研究机构。找不到原论文或只有宣传性表述的内容，不进入论文日报精选。",
    reason: "低成本扩展候选池。",
    paperUrl: "#",
    doi: "10.xxxx/example.006",
    sourceUrls: [{ label: "ScienceDaily 报道", url: "#" }],
    citation:
      "Author, L. L., & Author, M. M. (2026). ScienceDaily 农业污染新闻反链论文. Journal Name, 000, 000-000. https://doi.org/xx.xxxx/example"
  }
];

const topicLabels = {
  invasion: "植物入侵",
  fire: "火风险",
  wind: "风电扰动",
  drainage: "农田排水",
  methods: "方法工具"
};

const sources = [
  ["期刊/页面", "Science", "comprehensive", 5, 30],
  ["期刊 RSS", "Nature", "comprehensive", 5, 30],
  ["期刊/页面", "Nature Reviews Biodiversity", "professional", 5, 4],
  ["期刊/页面", "Nature Reviews Earth & Environment", "professional", 5, 4],
  ["期刊/页面", "Annual Review of Ecology, Evolution, and Systematics", "professional", 5, 3],
  ["期刊/页面", "Trends in Ecology & Evolution", "professional", 5, 8],
  ["期刊/页面", "Frontiers in Ecology and the Environment", "professional", 4, 8],
  ["期刊 RSS", "Nature Ecology & Evolution", "professional", 5, 12],
  ["期刊/页面", "Ecology Letters", "professional", 5, 10],
  ["新闻报道 RSS", "ScienceDaily Agriculture and Food", "news", 3, 18],
  ["新闻报道 RSS", "ScienceDaily Ecology", "news", 3, 18],
  ["微信公众号", "生态学者（Ecologist-all）", "wechat", 4, 2]
];

const wechatTools = [
  {
    name: "wewe-rss",
    repo: "cooderl/wewe-rss",
    stars: "9.5k",
    status: "已归档",
    fit: "暂缓",
    note: "星标最高，功能成熟，但 2026-05-11 已归档，只适合作为方案参考或短期试验。"
  },
  {
    name: "we-mp-rss",
    repo: "rachelos/we-mp-rss",
    stars: "3.4k",
    status: "活跃",
    fit: "推荐",
    note: "Docker 启动简单，支持 RSS、Markdown/PDF/JSON、定时更新和 Webhook，适合私有化接入。"
  },
  {
    name: "Wechat2RSS",
    repo: "ttttmr/Wechat2RSS",
    stars: "1.4k",
    status: "服务型",
    fit: "备选",
    note: "公开服务已收录 300+ 公众号，适合先验证需求；私有部署偏付费软件路线。"
  },
  {
    name: "wechat-download-api",
    repo: "tmwgsicp/wechat-download-api",
    stars: "373",
    status: "增长中",
    fit: "备选",
    note: "API 服务形式，支持 RSS 和代理池，但 star 较低，适合后期技术验证。"
  }
];

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

const logs = [
  {
    version: "2026-06-06",
    date: "今日更新",
    title: "信源与筛选策略完善",
    body:
      "补充泛生态学预筛：综合期刊、新闻报道和微信公众号来源会先判断是否属于生态学相关研究，再进入主题匹配和评分。补齐当前目标期刊的 RSS 配置，新增 Journal of Ecology，并完善 Science、Science Advances、Annual Review、Trends、Frontiers 和 Ecology Letters 等来源。论文动态和日报按近 5 日分日展示，日报每天单独筛选 Top 10。信源添加页增加信源分、权重显示，并支持修改和删除，导出的 sources.json 会同步反映这些调整。自动更新时间调整为北京时间每日 08:00。"
  },
  {
    version: "2026-06-05",
    date: "今日更新",
    title: "Paper Daily 原型上线",
    body:
      "完成 Paper Daily 的基础页面：全部论文动态、论文日报、信源添加和更新日志。论文动态页支持按信源类型浏览、展示近 5 日信息，并按日期分别统计每日主题；论文日报按日期展示近 5 日结果，每天单独筛选质量分 Top 10；论文条目支持原始论文链接、DOI、参考文献和多来源折叠；信源添加页开始支持把期刊、新闻和公众号来源整理成后续可使用的信源配置，并对同名信源执行更新而非重复添加。"
  },
  {
    version: "next",
    date: "计划中",
    title: "功能完善方向",
    body:
      "下一步优先完善信源添加方式，让期刊网页、RSS、新闻报道和微信公众号订阅更容易维护；完善公众号订阅接入，让公众号推荐能稳定进入论文候选池；完善偏好主题反馈，让 like/不喜欢更好地影响后续推荐；继续调试评分系统，让精选日报更符合个人研究关注。"
  }
];

const page = document.body.dataset.page || "updates";
const root = document.querySelector("#pageContent");
let feedFull = false;
let activeFeedFilter = "all";
const RECENT_DAYS = 5;

function normalizeGeneratedItem(item, index) {
  const sourceSignals = item.sourceSignals || [];
  const firstType = sourceSignals[0]?.type;
  const primarySource = item.journal || sourceSignals[0]?.name || "Unknown source";
  return {
    id: item.id || item.doi || `generated-${index}`,
    time: item.generatedAt ? item.generatedAt.slice(11, 16) : "00:00",
    date: item.date || (item.generatedAt ? item.generatedAt.slice(0, 10) : ""),
    title: item.title,
    source: primarySource,
    sourceSignals,
    sourceType:
      firstType === "topJournal"
        ? "comprehensive"
        : firstType === "scienceDaily"
          ? "news"
          : firstType === "wechat"
            ? "wechat"
            : "professional",
    type: item.type || "Article",
    tags: item.tags || [],
    oneLine: item.oneLine || item.abstract || item.title,
    summary: item.summary || item.abstract || "",
    reason: "由两阶段模型评分流程生成。",
    paperUrl: item.url || (item.doi ? `https://doi.org/${item.doi}` : "#"),
    doi: item.doi,
    sourceUrls: sourceSignals.map((signal) => ({
      label: signal.name,
      url: signal.url || "#"
    })),
    citation: item.citation || item.title,
    generatedScore: item.score,
    generatedBreakdown: item.scoreBreakdown
  };
}

function isRecentPaper(paper) {
  if (!paper.date) return true;
  const date = new Date(`${paper.date}T00:00:00`);
  if (Number.isNaN(date.getTime())) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - RECENT_DAYS + 1);
  return date >= cutoff && date <= today;
}

function recentPapers() {
  return papers.filter(isRecentPaper);
}

function dateKeyForPaper(paper) {
  return paper.date || "undated";
}

function dateLabel(date) {
  return date === "undated" ? "未标日期" : date;
}

function groupPapersByDate(items) {
  const byDate = new Map();
  items.forEach((paper) => {
    const key = dateKeyForPaper(paper);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(paper);
  });
  return [...byDate.entries()]
    .sort(([a], [b]) => {
      if (a === "undated") return 1;
      if (b === "undated") return -1;
      return b.localeCompare(a);
    })
    .map(([date, entries]) => ({
      date,
      entries: [...entries].sort((a, b) => adjustedScore(b) - adjustedScore(a))
    }));
}

async function loadGeneratedData() {
  try {
    const response = await fetch("./data/latest.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    if (!Array.isArray(data.items) || !data.items.length) return;
    papers.splice(0, papers.length, ...data.items.map(normalizeGeneratedItem));
  } catch {
    // Keep prototype data when opened from file:// or before the workflow runs.
  }
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function getThemeWeights() {
  return Object.fromEntries(
    Object.entries(topicLabels).map(([tag]) => {
      const stat = feedbackStatsByTopic()[tag];
      if (!stat || stat.count < 3) return [tag, 0];
      return [tag, clamp(Math.round(stat.total / stat.count), -3, 3)];
    })
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getFeedback() {
  const legacy = readJson("paperDailyFeedback", {});
  if (Array.isArray(legacy)) {
    const migrated = {};
    legacy.forEach((paperId) => {
      migrated[paperId] = "like";
    });
    localStorage.setItem("paperDailyFeedback", JSON.stringify(migrated));
    return migrated;
  }
  const migrated = Object.fromEntries(
    Object.entries(legacy)
      .map(([paperId, value]) => {
        if (value === "helpful" || value === "priority" || value === true || value === "like") {
          return [paperId, "like"];
        }
        if (value === "ignore" || value === "dislike") return [paperId, "dislike"];
        return null;
      })
      .filter(Boolean)
  );
  localStorage.setItem("paperDailyFeedback", JSON.stringify(migrated));
  return migrated;
}

function feedbackStatsByTopic() {
  const feedback = getFeedback();
  return papers.reduce((stats, paper) => {
    const value = feedback[paper.id];
    if (!value) return stats;
    const delta = value === "like" ? 1 : -1;
    paper.tags.forEach((tag) => {
      if (!stats[tag]) stats[tag] = { count: 0, total: 0 };
      stats[tag].count += 1;
      stats[tag].total += delta;
    });
    return stats;
  }, {});
}

function sourceScore(paper) {
  if (paper.generatedBreakdown?.source != null) return paper.generatedBreakdown.source;
  const signals = paper.sourceSignals || [];
  const base = signals.length
    ? Math.max(...signals.map((signal) => sourceQualityScores[signal.type] || 0))
    : 0;
  const wechatCount = signals.filter((signal) => signal.type === "wechat").length;
  const wechatBoost = Math.min(Math.max(wechatCount - 1, 0) * 2, 6);
  return clamp(base + wechatBoost, 0, 30);
}

function themeScore(paper) {
  if (paper.generatedBreakdown?.theme != null) return paper.generatedBreakdown.theme;
  if (!paper.tags.length) return 0;
  const themeWeights = getThemeWeights();
  const initialScore = 40;
  const multiTopicBonus = Math.min(Math.max(paper.tags.length - 1, 0) * 2, 6);
  const preferenceBonus = paper.tags.reduce(
    (sum, tag) => sum + Number(themeWeights[tag] || 0) * 3,
    0
  );
  return clamp(Math.round(initialScore + multiTopicBonus + preferenceBonus), 0, 50);
}

function typeScore(paper) {
  if (paper.generatedBreakdown?.type != null) return paper.generatedBreakdown.type;
  return paperTypeScores[paper.type] || 8;
}

function scoreBreakdown(paper) {
  return {
    source: sourceScore(paper),
    theme: themeScore(paper),
    type: typeScore(paper)
  };
}

function adjustedScore(paper) {
  if (paper.generatedScore != null) return paper.generatedScore;
  const score = scoreBreakdown(paper);
  return clamp(score.source + score.theme + score.type, 0, 100);
}

function setFeedback(paperId, value) {
  const paper = papers.find((item) => item.id === paperId);
  if (!paper) return;

  const feedback = getFeedback();
  if (feedback[paper.id] === value) {
    delete feedback[paper.id];
  } else {
    feedback[paper.id] = value;
  }
  localStorage.setItem("paperDailyFeedback", JSON.stringify(feedback));
}

document.querySelectorAll("[data-nav]").forEach((item) => {
  if (item.dataset.nav === page) item.classList.add("active");
});

function badge(type) {
  const label = {
    comprehensive: "综合",
    professional: "专业",
    wechat: "微信",
    news: "新闻"
  }[type];
  return `<span class="badge ${type}">${label}</span>`;
}

function sourceSignalLabel(type) {
  return {
    topJournal: "顶刊原文",
    reviewJournal: "综述期刊",
    professionalJournal: "专业期刊",
    natureScienceNews: "期刊新闻",
    scienceDaily: "ScienceDaily",
    wechat: "微信公众号"
  }[type] || "其他";
}

function referenceBlock(paper) {
  return `
    <div class="reference-block">
      <p>${paper.citation}</p>
      ${paper.doi ? `<div class="doi-line">DOI: ${paper.doi}</div>` : ""}
      <div class="reference-links">
        <a href="${paper.paperUrl}">原始论文</a>
        ${(paper.sourceUrls || [])
          .map((item) => `<a href="${item.url}">${item.label}</a>`)
          .join("")}
      </div>
    </div>
  `;
}

function paperCard(paper) {
  const score = adjustedScore(paper);
  const parts = scoreBreakdown(paper);
  const signals = paper.sourceSignals || [];
  return `
    <article class="card paper">
      <div class="paper-top">
        <div>
          <h2><a href="${paper.paperUrl}">${paper.title}</a></h2>
          <div class="source-line">
            <span>${paper.source}</span>
            <span>${paper.type}</span>
          </div>
        </div>
        <div class="score" aria-label="质量分 ${score}">${score}</div>
      </div>
      <p>${paper.summary}</p>
      <p class="meta">${paper.reason}</p>
      <details class="source-fold">
        <summary>主条：${paper.source} · 合并 ${signals.length} 条来源</summary>
        <div class="source-signal-list">
          ${signals
            .map(
              (signal) => `
                <span>${sourceSignalLabel(signal.type)} · ${signal.name}</span>
              `
            )
            .join("")}
        </div>
      </details>
      ${referenceBlock(paper)}
      <div class="score-parts">
        <span>信源 ${parts.source}/30</span>
        <span>主题 ${parts.theme}/50</span>
        <span>类型 ${parts.type}/20</span>
      </div>
      <div class="tag-row">
        ${paper.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderHead(title, meta, actions = "") {
  return `
    <header class="page-head">
      <div>
        <h1 class="page-title">${title}</h1>
        <div class="meta">${meta}</div>
      </div>
      ${actions ? `<div class="actions">${actions}</div>` : ""}
    </header>
  `;
}

function feedbackIcon(type) {
  if (type === "like") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 10v11" />
        <path d="M15 6.5 14 10h5.5a2 2 0 0 1 1.9 2.5l-1.4 6A2 2 0 0 1 18 20H7" />
        <path d="M7 10h-.8A2.2 2.2 0 0 0 4 12.2v6.6A2.2 2.2 0 0 0 6.2 21H7" />
        <path d="M14 10V5.8A2.8 2.8 0 0 0 11.2 3L9 10" />
      </svg>
    `;
  }
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 14V3" />
      <path d="M15 17.5 14 14h5.5a2 2 0 0 0 1.9-2.5l-1.4-6A2 2 0 0 0 18 4H7" />
      <path d="M7 14h-.8A2.2 2.2 0 0 1 4 11.8V5.2A2.2 2.2 0 0 1 6.2 3H7" />
      <path d="M14 14v4.2a2.8 2.8 0 0 1-2.8 2.8L9 14" />
    </svg>
  `;
}

function renderUpdates() {
  const pool = recentPapers();
  root.innerHTML = `
    ${renderHead(
      "全部论文动态",
      `近 ${RECENT_DAYS} 日 · ${pool.length} candidates · 每日 08:00 更新`,
      '<button class="btn" id="exportFeedback">导出反馈</button><button class="btn" id="feedMode">完整</button>'
    )}
    <section class="theme-panel card" id="themePanel"></section>
    <div class="tabs">
      <button class="tab active" data-filter="all">全部</button>
      <button class="tab" data-filter="comprehensive">综合期刊</button>
      <button class="tab" data-filter="professional">专业期刊</button>
      <button class="tab" data-filter="news">新闻报道</button>
      <button class="tab" data-filter="wechat">微信公众号</button>
    </div>
    <section class="grid" id="feed"></section>
  `;
  bindFeed();
}

function renderFeed(filter = activeFeedFilter) {
  activeFeedFilter = filter;
  const pool = recentPapers();
  const visible = filter === "all" ? pool : pool.filter((paper) => paper.sourceType === filter);
  const feedback = getFeedback();
  renderThemePanel();
  document.querySelector("#feed").innerHTML = groupPapersByDate(visible)
    .map(
      (group) => `
        <section class="date-section">
          <div class="date-heading">
            <strong>${dateLabel(group.date)}</strong>
            <span>${group.entries.length} 条</span>
          </div>
          <div class="grid">
            ${group.entries
              .map(
                (paper) => `
                  <article class="card feed-item">
                    <div>
                      <div class="feed-title"><a href="${paper.paperUrl}">${paper.title}</a></div>
                      <div class="feed-desc">${feedFull ? paper.summary : paper.oneLine}</div>
                      <div class="tag-row feed-tags">
                        ${paper.tags
                          .map((tag) => `<span class="tag">${topicLabels[tag] || tag}</span>`)
                          .join("")}
                      </div>
                      ${referenceBlock(paper)}
                    </div>
                    <div class="score" aria-label="质量分 ${adjustedScore(paper)}">${adjustedScore(paper)}</div>
                    <div class="feedback" aria-label="主题反馈">
                      <button class="${feedback[paper.id] === "like" ? "active" : ""}" data-feedback="like" data-paper="${paper.id}" title="like" aria-label="like">${feedbackIcon("like")}</button>
                      <button class="${feedback[paper.id] === "dislike" ? "active negative" : ""}" data-feedback="dislike" data-paper="${paper.id}" title="不喜欢" aria-label="不喜欢">${feedbackIcon("dislike")}</button>
                    </div>
                  </article>
                `
              )
              .join("")}
            </div>
        </section>
      `
    )
    .join("");
}

function renderThemePanel() {
  const pool = recentPapers();
  const byDate = new Map();
  pool.forEach((paper) => {
    const key = paper.date || "undated";
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(paper);
  });
  const dailyStats = [...byDate.entries()]
    .sort(([a], [b]) => {
      if (a === "undated") return 1;
      if (b === "undated") return -1;
      return b.localeCompare(a);
    })
    .slice(0, RECENT_DAYS)
    .map(([date, items]) => {
      const topicCounts = Object.entries(topicLabels)
        .map(([key, label]) => ({
          label,
          count: items.filter((paper) => paper.tags.includes(key)).length
        }))
        .filter((topic) => topic.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      const dateLabel = date === "undated" ? "未标日期" : date.slice(5);
      const topicText = topicCounts.length
        ? topicCounts.map((topic) => `${topic.label} ${topic.count}`).join(" · ")
        : "暂无主题";
      return `${dateLabel}：${topicText} · 共 ${items.length} 条`;
    });
  document.querySelector("#themePanel").innerHTML = `
    <div class="theme-head">
      <strong>每日主题以及统计信息</strong>
      <span>近 ${RECENT_DAYS} 日 ${pool.length} 条动态</span>
    </div>
    <div class="theme-summary">
      ${dailyStats.join("<br />")}
    </div>
  `;
}

function feedbackConfig() {
  const feedback = getFeedback();
  return {
    minFeedbackPerTopic: 3,
    feedback: Object.entries(feedback).map(([paperId, value]) => {
      const paper = papers.find((item) => item.id === paperId);
      return {
        paperId,
        title: paper?.title || "",
        doi: paper?.doi || "",
        tags: paper?.tags || [],
        value
      };
    })
  };
}

function downloadJson(filename, data) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function bindFeed() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      renderFeed(tab.dataset.filter);
    });
  });
  document.querySelector("#feedMode").addEventListener("click", (event) => {
    feedFull = !feedFull;
    event.currentTarget.textContent = feedFull ? "紧凑" : "完整";
    renderFeed();
  });
  document.querySelector("#exportFeedback").addEventListener("click", () => {
    downloadJson("topic-feedback.json", feedbackConfig());
  });
  document.querySelector("#feed").addEventListener("click", (event) => {
    const button = event.target.closest("[data-feedback]");
    if (!button) return;
    setFeedback(button.dataset.paper, button.dataset.feedback);
    renderFeed();
  });
  renderFeed();
}

function renderDaily() {
  const groups = groupPapersByDate(recentPapers()).map((group) => ({
    ...group,
    entries: group.entries.slice(0, 10)
  }));
  root.innerHTML = `
    ${renderHead("论文日报", `近 ${RECENT_DAYS} 日 · 每日 top 10 selected`)}
    <section class="grid" id="dailyList">
      ${groups
        .map(
          (group) => `
            <section class="date-section">
              <div class="date-heading">
                <strong>${dateLabel(group.date)}</strong>
                <span>Top ${group.entries.length}</span>
              </div>
              <div class="grid">${group.entries.map((paper) => paperCard(paper)).join("")}</div>
            </section>
          `
        )
        .join("")}
    </section>
  `;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function likelyFeedUrl(url) {
  return /\.(rss|xml|atom)($|\?)/i.test(url) || /rss|feed|atom/i.test(url);
}

function normalizeSourceName(value = "") {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function sourceKey(item) {
  return normalizeSourceName(item.name) || item.id || slugify(item.feedUrl || item.pageUrl || "");
}

function sourceFormToConfig({ name, category, weight, url }) {
  const isFeed = likelyFeedUrl(url);
  const type =
    category === "comprehensive"
      ? "topJournal"
      : category === "wechat"
        ? "wechat"
        : category === "news"
          ? /sciencedaily/i.test(name + url)
            ? "scienceDaily"
            : "natureScienceNews"
          : /review|annual|trends/i.test(name)
            ? "reviewJournal"
            : "professionalJournal";
  return {
    id: slugify(name || url || `source-${Date.now()}`),
    name,
    type,
    category,
    ...(isFeed ? { feedUrl: url } : { pageUrl: url }),
    weight,
    status: isFeed ? "feed configured" : "homepage, feed discovery required"
  };
}

function sourceConfigToDisplay(item) {
  return {
    key: sourceKey(item),
    name: item.name,
    category: item.category,
    weight: item.weight || 3,
    sourceScore: sourceQualityScores[item.type] || 0,
    daily: item.daily || 0,
    typeLabel:
      item.category === "wechat"
        ? "微信公众号"
        : item.category === "news"
          ? "新闻报道 RSS"
          : item.category === "comprehensive"
            ? "综合期刊"
            : "期刊/页面",
    urlLabel: item.feedUrl ? "RSS 已配置" : item.pageUrl ? "网页待发现 RSS" : "待配置"
  };
}

function mergeSourceConfigs(items) {
  const map = new Map();
  items.forEach((item) => {
    const key = sourceKey(item);
    const existing = map.get(key);
    map.set(key, existing ? { ...existing, ...item, id: existing.id || item.id } : item);
  });
  return [...map.values()];
}

async function loadBaseSourceConfigs() {
  try {
    const response = await fetch("./config/sources.json", { cache: "no-store" });
    if (!response.ok) throw new Error("no config");
    return await response.json();
  } catch {
    return sources.map(([typeLabel, name, category, weight, daily]) => ({
      id: slugify(name),
      name,
      type: category === "wechat" ? "wechat" : category === "news" ? "scienceDaily" : "professionalJournal",
      category,
      weight,
      daily,
      status: typeLabel
    }));
  }
}

function renderSources() {
  root.innerHTML = `
    ${renderHead("信源添加", "期刊 RSS、微信公众号更新链接、新闻报道 RSS")}
    <form class="form-grid card paper" id="sourceForm">
      <div class="two-col">
        <div class="field">
          <label for="sourceType">信源类型</label>
          <select id="sourceType">
            <option value="comprehensive">综合期刊</option>
            <option value="professional">期刊 RSS</option>
            <option value="news">新闻报道 RSS</option>
            <option value="wechat">微信公众号</option>
          </select>
        </div>
        <div class="field">
          <label for="sourceTier">权重等级</label>
          <select id="sourceTier">
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label for="sourceName">名称</label>
        <input id="sourceName" placeholder="例如：Nature Ecology & Evolution RSS" />
      </div>
      <div class="field">
        <label for="sourceUrl">RSS 或链接</label>
        <input id="sourceUrl" placeholder="https://..." />
      </div>
      <div class="field">
        <label for="sourceNote">主题</label>
        <textarea id="sourceNote" placeholder="invasive plant, wildfire, wind farm, agricultural drainage"></textarea>
      </div>
      <div class="actions">
        <button class="btn primary" id="sourceSubmit" type="submit">加入待提交配置</button>
        <button class="btn" id="cancelSourceEdit" type="button" hidden>取消修改</button>
      </div>
    </form>
    <section class="method-section">
      <div class="cluster-head">
        <strong>待提交信源配置</strong>
        <span>下载后覆盖 config/sources.json，再提交到 GitHub</span>
      </div>
      <div class="card config-export">
        <textarea id="sourceConfigOutput" readonly></textarea>
        <div class="actions">
          <button class="btn" id="copySourcesConfig">复制配置</button>
          <button class="btn primary" id="downloadSourcesConfig">下载 sources.json</button>
        </div>
      </div>
    </section>
    <section class="method-section">
      <div class="cluster-head">
        <strong>微信公众号抓取方案</strong>
        <span>按 star、维护状态和接入难度排序</span>
      </div>
      <div class="method-list">
        ${wechatTools
          .map(
            (tool) => `
              <article class="card method-item">
                <div>
                  <strong>${tool.name}</strong>
                  <span>${tool.repo} · ${tool.stars} stars · ${tool.status}</span>
                </div>
                <b>${tool.fit}</b>
                <p>${tool.note}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
    <section id="sourceList"></section>
  `;
  bindSources();
}

function bindSources() {
  let saved = mergeSourceConfigs(
    readJson("paperDailySourceConfigs", [])
  ).filter((item) => item && item.id && item.name);
  const deleted = new Set(readJson("paperDailyDeletedSources", []));
  localStorage.setItem("paperDailySourceConfigs", JSON.stringify(saved));
  const list = document.querySelector("#sourceList");
  const output = document.querySelector("#sourceConfigOutput");
  const submitButton = document.querySelector("#sourceSubmit");
  const cancelButton = document.querySelector("#cancelSourceEdit");
  let currentConfigs = [];
  let editingKey = "";

  const persistDeleted = () => {
    localStorage.setItem("paperDailyDeletedSources", JSON.stringify([...deleted]));
  };

  const persistSaved = () => {
    saved = mergeSourceConfigs(saved).filter((item) => item && item.id && item.name);
    localStorage.setItem("paperDailySourceConfigs", JSON.stringify(saved));
  };

  const resetSourceForm = () => {
    document.querySelector("#sourceForm").reset();
    editingKey = "";
    submitButton.textContent = "加入待提交配置";
    cancelButton.hidden = true;
  };

  const draw = (items) => {
    const displayItems = items.map(sourceConfigToDisplay);
    const labels = {
      comprehensive: "综合期刊",
      professional: "专业期刊 RSS",
      news: "新闻报道 RSS",
      wechat: "微信公众号"
    };

    list.innerHTML = Object.entries(labels)
      .map(([key, label]) => {
        const group = displayItems.filter((item) => item.category === key);
        const volume = group.reduce((sum, item) => sum + Number(item.daily || 0), 0);
        return `
          <section class="source-cluster">
            <div class="cluster-head">
              <strong>${label}</strong>
              <span>${group.length} 个信源 · 约 ${volume} 条/日</span>
            </div>
            <div class="source-list">
              ${group
                .map(
                  (item) => `
                    <article class="card source-item">
                      <div>
                        <strong>${item.name}</strong>
                        <span>${item.typeLabel} · 权重 ${item.weight} · 信源分 ${item.sourceScore}/30 · ${item.urlLabel}</span>
                      </div>
                      <div class="source-actions">
                        <button class="btn" data-source-action="edit" data-source-key="${encodeURIComponent(item.key)}">修改</button>
                        <button class="btn" data-source-action="delete" data-source-key="${encodeURIComponent(item.key)}">删除</button>
                      </div>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        `;
      })
      .join("");
    output.value = JSON.stringify(items, null, 2);
  };

  loadBaseSourceConfigs().then((baseConfigs) => {
    const activeBase = baseConfigs.filter((item) => !deleted.has(sourceKey(item)));
    const activeSaved = saved.filter((item) => !deleted.has(sourceKey(item)));
    currentConfigs = mergeSourceConfigs([...activeBase, ...activeSaved]);
    draw(currentConfigs);
  });

  document.querySelector("#sourceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const sourceType = document.querySelector("#sourceType");
    const item = sourceFormToConfig({
      name: document.querySelector("#sourceName").value || "未命名信源",
      category: sourceType.value,
      weight: Number(document.querySelector("#sourceTier").value),
      url: document.querySelector("#sourceUrl").value.trim()
    });
    const existing = editingKey
      ? currentConfigs.find((entry) => sourceKey(entry) === editingKey)
      : currentConfigs.find((entry) => sourceKey(entry) === sourceKey(item));
    if (existing?.id) item.id = existing.id;
    const itemKey = sourceKey(item);
    if (editingKey && editingKey !== itemKey) {
      deleted.add(editingKey);
    }
    deleted.delete(itemKey);
    persistDeleted();
    const savedIndex = saved.findIndex((entry) => sourceKey(entry) === itemKey || sourceKey(entry) === editingKey);
    if (savedIndex >= 0) {
      saved[savedIndex] = { ...saved[savedIndex], ...item, id: saved[savedIndex].id || item.id };
    } else {
      saved.push(item);
    }
    persistSaved();
    currentConfigs = mergeSourceConfigs([
      ...currentConfigs.filter((entry) => sourceKey(entry) !== editingKey && sourceKey(entry) !== itemKey),
      item
    ]);
    draw(currentConfigs);
    resetSourceForm();
  });

  cancelButton.addEventListener("click", resetSourceForm);

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-source-action]");
    if (!button) return;
    const key = decodeURIComponent(button.dataset.sourceKey || "");
    const item = currentConfigs.find((entry) => sourceKey(entry) === key);
    if (!item) return;

    if (button.dataset.sourceAction === "delete") {
      deleted.add(key);
      persistDeleted();
      saved = saved.filter((entry) => sourceKey(entry) !== key);
      persistSaved();
      currentConfigs = currentConfigs.filter((entry) => sourceKey(entry) !== key);
      draw(currentConfigs);
      if (editingKey === key) resetSourceForm();
      return;
    }

    editingKey = key;
    document.querySelector("#sourceType").value = item.category || "professional";
    document.querySelector("#sourceTier").value = String(item.weight || 3);
    document.querySelector("#sourceName").value = item.name || "";
    document.querySelector("#sourceUrl").value = item.feedUrl || item.pageUrl || "";
    document.querySelector("#sourceNote").value = item.topics || "";
    submitButton.textContent = "保存修改";
    cancelButton.hidden = false;
  });

  document.querySelector("#copySourcesConfig").addEventListener("click", async () => {
    await navigator.clipboard?.writeText(output.value);
  });

  document.querySelector("#downloadSourcesConfig").addEventListener("click", () => {
    downloadJson("sources.json", JSON.parse(output.value || "[]"));
  });
}

function renderChangelog() {
  root.innerHTML = `
    ${renderHead("更新日志", "version history")}
    <section class="log-list">
      ${logs
        .map(
          (log) => `
            <article class="card log-item">
              <div class="log-meta">${log.version} · ${log.date}</div>
              <strong>${log.title}</strong>
              <p>${log.body}</p>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

const renderers = {
  updates: renderUpdates,
  daily: renderDaily,
  sources: renderSources,
  changelog: renderChangelog
};

loadGeneratedData().finally(() => {
  renderers[page]?.();
});
