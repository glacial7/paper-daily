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
    reason: "服务植物入侵与火烧风险主线。"
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
    reason: "服务风电项目与植物入侵风险。"
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
    reason: "支撑农田排水面源污染研究。"
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
    reason: "补充遥感监测技术路线。"
  },
  {
    id: "wechat-invasion-001",
    time: "07:08",
    title: "微信公众号推荐：外来植物风险评估的新综述",
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
    reason: "弥补高发文量期刊不全量订阅造成的漏检。"
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
    reason: "低成本扩展候选池。"
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
  ["期刊 RSS", "Nature Ecology & Evolution", "professional", 5, 12],
  ["期刊 RSS", "Trends in Ecology & Evolution", "professional", 5, 8],
  ["微信公众号", "植物入侵与生态恢复专题号", "wechat", 4, 3],
  ["微信公众号", "生态学者（Ecologist-all）", "wechat", 4, 2],
  ["新闻报道 RSS", "Nature News", "news", 3, 10],
  ["新闻报道 RSS", "ScienceDaily Ecology", "news", 3, 18]
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
    version: "v0.7",
    date: "2026-06-05",
    title: "论文类型权重补全",
    body: "论文类型评分加入 Correspondence、Letter、Editorial、News & Views、Research Highlight 等低权重类型，避免短评和通讯类内容挤占精选。"
  },
  {
    version: "v0.6",
    date: "2026-06-05",
    title: "论文簇合并",
    body: "同一篇论文按 DOI、标题作者匹配和 embedding 相似度合并为一个簇；主条优先选原论文页面，其次期刊新闻、综合新闻、ScienceDaily、公众号。"
  },
  {
    version: "v0.5",
    date: "2026-06-05",
    title: "三维质量分",
    body: "质量分改为信源 30 分、主题相关性 50 分、论文类型 20 分；同一论文多信源合并成簇，以最高信源质量为主，多个公众号推荐给予小幅加分。"
  },
  {
    version: "v0.4",
    date: "2026-06-05",
    title: "主题反馈机制",
    body: "全部论文动态增加 like 和不喜欢反馈；同一主题至少累计 3 篇正负反馈后才更新主题权重，影响后续质量分计算，不即时改写当日论文日报。"
  },
  {
    version: "v0.3",
    date: "2026-06-05",
    title: "信息架构调整",
    body: "左侧保留 Paper Daily 和四个入口；全部论文动态按综合期刊、专业期刊、微信公众号、新闻报道分类。"
  },
  {
    version: "v0.2",
    date: "2026-06-05",
    title: "信源策略",
    body: "综合期刊不全量追踪，只在主题命中、新闻报道反链或微信公众号推荐时进入候选池。"
  },
  {
    version: "v0.1",
    date: "2026-06-05",
    title: "MVP 原型",
    body: "建立静态网页、论文日报、信源添加和更新日志页面；先用示例数据验证信息密度。"
  },
  {
    version: "next",
    date: "计划中",
    title: "抓取与 token 控制",
    body: "先用 RSS 元数据和规则预筛，只把去重后的高分候选交给模型；精选论文再生成约 200 字摘要。"
  }
];

const page = document.body.dataset.page || "updates";
const root = document.querySelector("#pageContent");
let feedFull = false;
let activeFeedFilter = "all";

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
  const signals = paper.sourceSignals || [];
  const base = signals.length
    ? Math.max(...signals.map((signal) => sourceQualityScores[signal.type] || 0))
    : 0;
  const wechatCount = signals.filter((signal) => signal.type === "wechat").length;
  const wechatBoost = Math.min(Math.max(wechatCount - 1, 0) * 2, 6);
  return clamp(base + wechatBoost, 0, 30);
}

function themeScore(paper) {
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

function paperCard(paper) {
  const score = adjustedScore(paper);
  const parts = scoreBreakdown(paper);
  const signals = paper.sourceSignals || [];
  return `
    <article class="card paper">
      <div class="paper-top">
        <div>
          <h2><a href="#">${paper.title}</a></h2>
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
  root.innerHTML = `
    ${renderHead(
      "全部论文动态",
      "2026-06-05 · 28 candidates · feedback collected for next scoring run",
      '<button class="btn" id="feedMode">完整</button>'
    )}
    <section class="theme-panel card" id="themePanel"></section>
    <div class="tabs">
      <button class="tab active" data-filter="all">全部</button>
      <button class="tab" data-filter="comprehensive">综合期刊</button>
      <button class="tab" data-filter="professional">专业期刊</button>
      <button class="tab" data-filter="wechat">微信公众号</button>
      <button class="tab" data-filter="news">新闻报道</button>
    </div>
    <section class="grid" id="feed"></section>
  `;
  bindFeed();
}

function renderFeed(filter = activeFeedFilter) {
  activeFeedFilter = filter;
  const visible = filter === "all" ? papers : papers.filter((paper) => paper.sourceType === filter);
  const feedback = getFeedback();
  renderThemePanel();
  document.querySelector("#feed").innerHTML = visible
    .map(
      (paper) => `
        <article class="card feed-item">
          <div class="feed-time">${paper.time}</div>
          <div>
            <div class="feed-title">${paper.title}</div>
            <div class="feed-desc">${feedFull ? paper.summary : paper.oneLine}</div>
            <div class="tag-row feed-tags">
              ${paper.tags
                .map((tag) => `<span class="tag">${topicLabels[tag] || tag}</span>`)
                .join("")}
            </div>
          </div>
          <div class="score" aria-label="质量分 ${adjustedScore(paper)}">${adjustedScore(paper)}</div>
          <div class="feedback" aria-label="主题反馈">
            <button class="${feedback[paper.id] === "like" ? "active" : ""}" data-feedback="like" data-paper="${paper.id}" title="like" aria-label="like">${feedbackIcon("like")}</button>
            <button class="${feedback[paper.id] === "dislike" ? "active negative" : ""}" data-feedback="dislike" data-paper="${paper.id}" title="不喜欢" aria-label="不喜欢">${feedbackIcon("dislike")}</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderThemePanel() {
  const themeWeights = getThemeWeights();
  const stats = feedbackStatsByTopic();
  const topTopics = Object.entries(topicLabels)
    .map(([key, label]) => ({
      key,
      label,
      count: papers.filter((paper) => paper.tags.includes(key)).length
    }))
    .filter((topic) => topic.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  document.querySelector("#themePanel").innerHTML = `
    <div class="theme-head">
      <strong>主题权重</strong>
      <span>每个主题至少 3 篇正负反馈后才生效</span>
    </div>
    <div class="theme-list">
      ${Object.entries(topicLabels)
        .map(([key, label]) => {
          const value = Number(themeWeights[key] || 0);
          const count = stats[key]?.count || 0;
          const status = count >= 3 ? `${value >= 0 ? "+" : ""}${value}` : `${count}/3`;
          return `<span class="theme-chip">${label} <b>${status}</b></span>`;
        })
        .join("")}
    </div>
    <div class="theme-summary">
      今日主题：${topTopics.map((topic) => `${topic.label} ${topic.count}`).join(" · ")}
    </div>
  `;
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
  document.querySelector("#feed").addEventListener("click", (event) => {
    const button = event.target.closest("[data-feedback]");
    if (!button) return;
    setFeedback(button.dataset.paper, button.dataset.feedback);
    renderFeed();
  });
  renderFeed();
}

function renderDaily() {
  const selected = [...papers].sort((a, b) => adjustedScore(b) - adjustedScore(a)).slice(0, 10);
  root.innerHTML = `
    ${renderHead("论文日报", "VOL.2026.06.05 · top 10 selected")}
    <section class="grid" id="dailyList">${selected.map((paper) => paperCard(paper)).join("")}</section>
  `;
}

function renderSources() {
  root.innerHTML = `
    ${renderHead("信源添加", "期刊 RSS、微信公众号更新链接、新闻报道 RSS")}
    <form class="form-grid card paper" id="sourceForm">
      <div class="two-col">
        <div class="field">
          <label for="sourceType">信源类型</label>
          <select id="sourceType">
            <option value="professional">期刊 RSS</option>
            <option value="wechat">微信公众号</option>
            <option value="news">新闻报道 RSS</option>
            <option value="comprehensive">综合期刊</option>
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
      <button class="btn primary" type="submit">添加到本地列表</button>
    </form>
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
  const rawSaved = JSON.parse(localStorage.getItem("paperDailySources") || "[]");
  const saved = rawSaved.map((item) => {
    if (item.length >= 5) return item;
    const oldTier = item[2];
    const tier = oldTier === "wechat" ? "wechat" : oldTier === "news" ? "news" : "professional";
    const type = tier === "wechat" ? "微信公众号" : tier === "news" ? "新闻报道 RSS" : "期刊 RSS";
    return [type, item[1] || "未命名信源", tier, 3, 0];
  });
  localStorage.setItem("paperDailySources", JSON.stringify(saved));
  const all = [...sources, ...saved];
  const list = document.querySelector("#sourceList");

  const draw = (items) => {
    const labels = {
      comprehensive: "综合期刊",
      professional: "专业期刊 RSS",
      wechat: "微信公众号",
      news: "新闻报道 RSS"
    };

    list.innerHTML = Object.entries(labels)
      .map(([key, label]) => {
        const group = items.filter((item) => item[2] === key);
        const volume = group.reduce((sum, item) => sum + Number(item[4] || 0), 0);
        return `
          <section class="source-cluster">
            <div class="cluster-head">
              <strong>${label}</strong>
              <span>${group.length} 个信源 · 约 ${volume} 条/日</span>
            </div>
            <div class="source-list">
              ${group
                .map(
                  ([type, name, tier, weight, daily]) => `
                    <article class="card source-item">
                      <strong>${name}</strong>
                      <span>${type} · 权重 ${weight} · 约 ${daily || 0} 条/日</span>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        `;
      })
      .join("");
  };

  draw(all);

  document.querySelector("#sourceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const sourceType = document.querySelector("#sourceType");
    const item = [
      sourceType.options[sourceType.selectedIndex].text,
      document.querySelector("#sourceName").value || "未命名信源",
      sourceType.value,
      Number(document.querySelector("#sourceTier").value),
      0
    ];
    saved.push(item);
    localStorage.setItem("paperDailySources", JSON.stringify(saved));
    draw([...sources, ...saved]);
    event.target.reset();
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

renderers[page]?.();
