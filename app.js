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
    tags: ["invasion", "disturbance"],
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
    tags: ["climate_anthropogenic", "invasion", "disturbance"],
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
    tags: ["plant_agroecology", "biogeochemistry"],
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
    tags: ["modeling_methods", "disturbance"],
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
      "微信公众号内容不直接作为论文证据源，而是作为主题发现和中文解读入口。处理流程应是先记录推荐标题、关键词和提到的结论，再反向查找原论文、DOI、期刊和发布时间。只有能定位到原始论文并确认研究质量后，才进入日报精选。无法找到原文的内容保留在动态页，不进入精选推荐。",
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
    tags: ["plant_agroecology", "biogeochemistry"],
    oneLine: "新闻报道适合发现新论文，但必须回到原论文确认。",
    summary:
      "新闻报道源包括 ScienceDaily、Nature News、期刊官网新闻和研究机构新闻稿。它们适合快速发现新论文和获得通俗摘要，但不能替代原文。抓取时应保存新闻链接、原始论文链接、期刊、发布日期和研究机构。找不到原论文或只有宣传性表述的内容，不进入日报精选。",
    reason: "低成本扩展候选池。",
    paperUrl: "#",
    doi: "10.xxxx/example.006",
    sourceUrls: [{ label: "ScienceDaily 报道", url: "#" }],
    citation:
      "Author, L. L., & Author, M. M. (2026). ScienceDaily 农业污染新闻反链论文. Journal Name, 000, 000-000. https://doi.org/xx.xxxx/example"
  }
];

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

const logs = [
  {
    version: "2026-06-07",
    date: "今日更新",
    title: "公众号正文导入增强",
    body:
      "1. 公众号：本地导入不再只使用文章列表摘要，已改为优先读取 we-mp-rss 中保存的正文内容。\\n2. 推荐：公众号候选会给 DeepSeek 提供更充分的研究介绍，同时限制输入长度，避免正文过长造成不必要的 token 消耗。\\n3. 稳定性：增强模型返回格式的容错，单条候选解析失败时降级处理，不再中断整次日报更新。\\n4. 页面：日报增加 like/dislike 与反馈导出；动态页标记已进入日报推荐的论文，并折叠往日超出 3 条的动态。\\n5. 信源：信源页改为拼块式分类聚合视图，微信公众号按本地候选数据归入公众号分类展示。\\n6. 显示：公众号条目会从标题和正文中推断期刊名；参考文献只显示更可靠的作者或 DOI，避免把公众号或单位误当作者。\\n7. 交互：动态页点击 like/dislike 不再重绘整页，已展开的详细内容和折叠状态会保持。"
  },
  {
    version: "2026-06-06",
    date: "今日更新",
    title: "信源与筛选策略完善",
    body:
      "1. 信源：补齐目标期刊 RSS，修正综合期刊、新闻报道和微信公众号分类。\\n2. 公众号：支持从 Mac 本地 we-mp-rss 数据库导入近 5 日公众号候选，并在筛查时排除征稿、会议、招聘、课程等非研究推送。\\n3. 推荐：参考生态学主题演变研究，将主题扩展为生态学主题组；日报改为按日期分别展示每日 Top 5。\\n4. 成本：新增评分缓存，页面仍展示近 5 日，但模型只处理新增或发生变化的论文，减少重复 token 消耗。\\n5. 类型：加强文章类型识别，Spotlight、Forum、Comment、Perspective 等栏目不再按 Research Article 处理。\\n6. 页面：标题优先使用英文论文题名；标签压缩为年份、期刊/来源、文章类型和少量主题；参考文献只显示作者与 DOI；全部论文动态用一句话介绍并可就地展开详细摘要。"
  },
  {
    version: "2026-06-05",
    date: "今日更新",
    title: "Paper Daily 原型上线",
    body:
      "1. 页面：建立日报、全部论文动态、信源添加和更新日志。\\n2. 信源：支持综合期刊、专业期刊、新闻报道和微信公众号分类。\\n3. 推荐：按信源、主题和论文类型计算质量分，并支持 like/不喜欢反馈。"
  },
  {
    version: "next",
    date: "计划中",
    title: "功能完善方向",
    body:
      "1. 信源：继续完善公众号订阅和本地导入流程。\\n2. 推荐：优化主题反馈对质量分的影响。\\n3. 页面：继续减少重复字段，突出推荐理由和原文入口。"
  }
];

const page = document.body.dataset.page || "updates";
const root = document.querySelector("#pageContent");
let activeFeedFilter = "all";
const RECENT_DAYS = 5;

function decodeText(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function stripDoiFromCitation(citation = "", doi = "") {
  let value = decodeText(citation);
  if (doi) {
    const escaped = doi.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    value = value
      .replace(new RegExp(`https?://(?:dx\\.)?doi\\.org/${escaped}`, "ig"), "")
      .replace(new RegExp(`doi:?\\s*${escaped}`, "ig"), "");
  }
  return value.replace(/\s+([.,;])/g, "$1").replace(/\s{2,}/g, " ").replace(/\s*\.\s*$/, ".").trim();
}

function cleanDisplayText(value = "") {
  return decodeText(String(value || ""))
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDate(value = "", fallback = "") {
  const direct = String(value || "").match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (direct) {
    return `${direct[1]}-${direct[2].padStart(2, "0")}-${direct[3].padStart(2, "0")}`;
  }
  const compact = String(value || "").match(/\b(20\d{2})(\d{2})(\d{2})\b/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  return fallback || "";
}

function compactCitation(paper) {
  const year = (paper.date || "").slice(0, 4) || (paper.citation || "").match(/\b(19|20)\d{2}\b/)?.[0] || "";
  const citation = stripDoiFromCitation(paper.citation || "", paper.doi);
  let author = "";
  const authorMatch = citation.match(/^(.+?)\s*\((?:19|20)\d{2}\)/);
  if (authorMatch) author = authorMatch[1].trim();
  if (!author || author === paper.title || author === paper.source) author = "";
  return [author, year].filter(Boolean).join(" · ");
}

function shortAuthorList(authors = []) {
  const cleaned = authors
    .map((author) => decodeText(String(author || "")).replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!cleaned.length) return "";
  if (cleaned.length <= 5) return cleaned.join("; ");
  return [...cleaned.slice(0, 3), "...", ...cleaned.slice(-2)].join("; ");
}

function referenceAuthors(paper) {
  const direct = shortAuthorList(paper.authors || []);
  if (paper.sourceType === "wechat") {
    if (
      direct &&
      !/团队|课题组|研究所|科学院|大学|学院|中心|实验室|公众号|编辑部|项目|平台/.test(direct)
    ) {
      return direct;
    }
    return "";
  }
  if (direct) return direct;
  const citation = stripDoiFromCitation(paper.citation || "", paper.doi);
  const match = citation.match(/^(.+?)\s*\((?:19|20)\d{2}\)/);
  if (!match) return "";
  const authorText = match[1].trim();
  if (/publication date|available online|source:|doi:|http/i.test(authorText)) return "";
  return authorText;
}

function inferTitleFromText(abstract = "", journal = "", doi = "") {
  let text = decodeText(abstract || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (journal) {
    text = text.replace(new RegExp(`^${journal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*,?\\s*`, "i"), "");
  }
  text = text.replace(/^Published online:\s*[^;]+;\s*/i, "");
  if (doi) {
    text = text.replace(new RegExp(`doi:?\\s*${doi.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "i"), "");
  }
  const first = text.split(/(?<=[.!?])\s+/)[0] || text;
  return first.length > 12 && first.length < 220 ? first.trim() : "";
}

function normalizePaperUrl(url = "", doi = "") {
  if (!url || /\.(rss|xml|atom)($|\?)/i.test(url) || /\/rss\/|feed=rss|current\.rss/i.test(url)) {
    return doi ? `https://doi.org/${doi}` : url || "#";
  }
  return url;
}

const journalAliases = [
  ["Nature Ecology & Evolution", /\bNature Ecology\s*&\s*Evolution\b/i],
  ["Nature Communications", /\bNature Communications\b|《\s*Nature Communications\s*》|\bNC\b/i],
  ["Nature Climate Change", /\bNature Climate Change\b/i],
  ["Nature Food", /\bNature Food\b|\bNF\b/i],
  ["Nature", /《\s*Nature\s*》|\bNature\b|nature：/i],
  ["Science Advances", /\bScience Advances\b/i],
  ["Science Bulletin", /\bScience Bulletin\b/i],
  ["Science", /《\s*Science\s*》|\bScience正刊\b|\bScience\b/i],
  ["PNAS Nexus", /\bPNAS Nexus\b/i],
  ["PNAS", /\bPNAS\b/i],
  ["Global Change Biology", /\bGlobal Change Biology\b|\bGCB\b/i],
  ["Journal of Ecology", /\bJournal of Ecology\b/i],
  ["Ecology Letters", /\bEcology Letters\b/i],
  ["New Phytologist", /\bNew Phytologist\b|\bNew Phytol\b/i],
  ["Plant Physiology", /\bPlant Physiology\b/i],
  ["Remote Sensing of Environment", /\bRemote Sensing of Environment\b|\bRSE\b/i],
  ["ISPRS Journal of Photogrammetry and Remote Sensing", /\bISPRS\b/i],
  ["Earth System Science Data", /\bEarth System Science Data\b|\bESSD\b/i],
  ["Field Crops Research", /\bField Crops Research\b|\bFCR\b/i],
  ["Forest Ecology and Management", /\bForest Ecology and Management\b|\bFEM\b/i],
  ["Soil & Tillage Research", /\bSoil\s*&\s*Tillage Research\b|\bSTR\b/i],
  ["Functional Ecology", /\bFunctional Ecology\b/i],
  ["Ecological Indicators", /\bEcological Indicators\b/i],
  ["Ecological Modelling", /\bEcological Modelling\b/i],
  ["Applied Geography", /\bApplied Geography\b/i],
  ["Catena", /\bCatena\b/i],
  ["One Earth", /\bOne Earth\b/i],
  ["Microbiome", /\bMicrobiome\b/i],
  ["Communications Earth & Environment", /\bCommunications Earth\s*&\s*Environment\b/i],
  ["Journal of Environmental Management", /\bJournal of Environmental Management\b/i]
];

function inferJournalName(item = {}) {
  const haystack = cleanDisplayText(`${item.title || ""} ${item.summary || ""} ${item.abstract || ""}`);
  const bracket = haystack.match(/《\s*([^》]{2,80})\s*》/);
  if (bracket && !/综述|观点|项目|指南|通知|招聘|会议|沙龙|新书|课程|导师|成果/.test(bracket[1])) {
    return bracket[1].trim();
  }
  const prefix = cleanDisplayText(item.title || "").split(/\s*[|丨:：]\s*/)[0];
  if (/^[A-Za-z][A-Za-z &.\-:]{2,80}$/.test(prefix)) {
    const alias = journalAliases.find(([, pattern]) => pattern.test(prefix));
    return alias ? alias[0] : prefix.trim();
  }
  const alias = journalAliases.find(([, pattern]) => pattern.test(haystack));
  return alias ? alias[0] : "";
}

function displayType(type = "") {
  return String(type || "Article")
    .replace(/ResearchArticle/g, "Research Article")
    .replace(/SystematicReview/g, "Systematic Review");
}

function normalizeTags(tags = []) {
  const aliases = {
    fire: "disturbance",
    wind: "climate_anthropogenic",
    drainage: "plant_agroecology",
    methods: "modeling_methods"
  };
  return [...new Set(tags.map((tag) => aliases[tag] || tag).filter(Boolean))];
}

function normalizeGeneratedItem(item, index) {
  const sourceSignals = item.sourceSignals || [];
  const firstType = sourceSignals[0]?.type;
  const rawSource = item.journal || sourceSignals[0]?.name || "Unknown source";
  const isWechat = firstType === "wechat";
  const inferredJournal = isWechat ? inferJournalName(item) : "";
  const primarySource = inferredJournal || rawSource;
  const cleanedSummary = cleanDisplayText(item.summary || item.abstract || "");
  const cleanedOneLine = cleanDisplayText(item.oneLine || item.abstract || item.summary || "");
  const title =
    !item.title || item.title.trim().toLowerCase() === rawSource.toLowerCase()
      ? inferTitleFromText(item.abstract || item.summary || "", primarySource, item.doi) || item.title
      : cleanDisplayText(item.title);
  const paperUrl = normalizePaperUrl(item.url, item.doi);
  return {
    id: item.id || item.doi || `generated-${index}`,
    time: item.generatedAt ? item.generatedAt.slice(11, 16) : "00:00",
    date: normalizeDate(item.date, item.generatedAt ? item.generatedAt.slice(0, 10) : ""),
    title,
    authors: item.authors || [],
    source: primarySource,
    originalSource: rawSource,
    inferredJournal,
    sourceSignals,
    sourceType:
      firstType === "topJournal"
        ? "comprehensive"
        : firstType === "scienceDaily" || firstType === "natureScienceNews"
          ? "news"
          : firstType === "wechat"
            ? "wechat"
          : "professional",
    type: displayType(item.type),
    tags: normalizeTags(item.tags || []),
    oneLine: cleanedOneLine || title,
    summary: cleanedSummary || cleanedOneLine || title,
    reason: "由两阶段模型评分流程生成。",
    paperUrl,
    doi: item.doi,
    sourceUrls: sourceSignals.map((signal) => ({
      label: signal.name,
      url: normalizePaperUrl(signal.url, item.doi)
    })),
    citation: stripDoiFromCitation(item.citation || title, item.doi),
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

function todayDateKey() {
  return localDateKey();
}

function dailyRecommendedIds() {
  const ids = new Set();
  groupPapersByDate(recentPapers()).forEach((group) => {
    group.entries.slice(0, 5).forEach((paper) => ids.add(paper.id));
  });
  return ids;
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

function paperMetaTags(paper) {
  const year = (paper.date || "").slice(0, 4);
  const sourceKind =
    !paper.doi && paper.sourceType === "wechat"
      ? "微信公众号"
      : !paper.doi && paper.sourceType === "news"
        ? "新闻报道"
        : paper.type;
  const labels = [
    year,
    paper.source,
    sourceKind,
    ...(paper.tags || []).slice(0, 5).map((tag) => topicLabels[tag] || tag)
  ];
  return [...new Set(labels.filter(Boolean))];
}

function referenceBlock(paper) {
  const authors = referenceAuthors(paper);
  if (!authors && !paper.doi) return "";
  return `
    <div class="reference-block">
      ${authors ? `<p>${authors}</p>` : ""}
      ${paper.doi ? `<div class="doi-line">DOI: ${paper.doi}</div>` : ""}
    </div>
  `;
}

function sourceLinks(paper) {
  const links = (paper.sourceUrls || [])
    .filter((item) => item.url && item.url !== "#")
    .map((item) => ({ label: item.label, url: item.url }));
  if (paper.paperUrl && paper.paperUrl !== "#" && !links.some((item) => item.url === paper.paperUrl)) {
    links.unshift({ label: paper.source || "来源", url: paper.paperUrl });
  }
  return links;
}

function sourceDetails(paper) {
  const signals = paper.sourceSignals || [];
  const links = sourceLinks(paper);
  if (signals.length <= 1 && links.length <= 1) return "";
  return `
    <details class="source-fold">
      <summary>来源 ${links.length || signals.length}</summary>
      <div class="source-signal-list">
        ${links
          .map((item) => `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.label}</a>`)
          .join("")}
      </div>
    </details>
  `;
}

function detailBlock(paper, mode = "block") {
  return `
    <details class="research-details ${mode === "inline" ? "inline-detail" : ""}">
      <summary>详细</summary>
      <p>${paper.summary || paper.oneLine || ""}</p>
    </details>
  `;
}

function paperCard(paper, options = {}) {
  const score = adjustedScore(paper);
  const showOneLine = options.showOneLine !== false;
  const feedback = options.showFeedback ? getFeedback() : null;
  return `
    <article class="card paper">
      <div class="paper-top">
        <div>
          <h2><a href="${paper.paperUrl}" target="_blank" rel="noopener noreferrer">${paper.title}</a></h2>
          <div class="tag-row">
            ${paperMetaTags(paper).map((label) => `<span class="tag">${label}</span>`).join("")}
          </div>
        </div>
        <div class="paper-side">
          <div class="score" aria-label="质量分 ${score}">${score}</div>
          ${options.showFeedback ? feedbackControls(paper, feedback) : ""}
        </div>
      </div>
      ${showOneLine ? `<p>${paper.oneLine}</p>${detailBlock(paper)}` : `<p>${paper.summary}</p>`}
      ${sourceDetails(paper)}
      ${referenceBlock(paper)}
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

function feedbackControls(paper, feedback = getFeedback()) {
  return `
    <div class="feedback" aria-label="主题反馈">
      <button class="${feedback[paper.id] === "like" ? "active" : ""}" data-feedback="like" data-paper="${paper.id}" title="like" aria-label="like">${feedbackIcon("like")}</button>
      <button class="${feedback[paper.id] === "dislike" ? "active negative" : ""}" data-feedback="dislike" data-paper="${paper.id}" title="不喜欢" aria-label="不喜欢">${feedbackIcon("dislike")}</button>
    </div>
  `;
}

function refreshFeedbackControls(paperId) {
  const feedback = getFeedback();
  document.querySelectorAll(`[data-paper="${CSS.escape(paperId)}"]`).forEach((button) => {
    const isActive = feedback[paperId] === button.dataset.feedback;
    button.classList.toggle("active", isActive);
    button.classList.toggle("negative", isActive && button.dataset.feedback === "dislike");
  });
}

function renderUpdates() {
  const pool = recentPapers();
  root.innerHTML = `
    ${renderHead(
      "全部论文动态",
      `近 ${RECENT_DAYS} 日 · ${pool.length} candidates · 每日 08:00 更新`,
      '<button class="btn" id="exportFeedback">导出反馈</button>'
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
  const recommended = dailyRecommendedIds();
  const today = todayDateKey();
  renderThemePanel();
  document.querySelector("#feed").innerHTML = groupPapersByDate(visible)
    .map((group) => {
      const shouldCollapse = group.date !== today && group.date !== "undated" && group.entries.length > 3;
      const primaryEntries = shouldCollapse ? group.entries.slice(0, 3) : group.entries;
      const hiddenEntries = shouldCollapse ? group.entries.slice(3) : [];
      const renderItem = (paper) => `
        <article class="card feed-item ${recommended.has(paper.id) ? "is-recommended" : ""}">
          <div>
            <div class="feed-title">
              ${recommended.has(paper.id) ? `<span class="recommended-badge">已推荐</span>` : ""}
              <a href="${paper.paperUrl}" target="_blank" rel="noopener noreferrer">${paper.title}</a>
            </div>
            <div class="feed-desc">${paper.oneLine} ${detailBlock(paper, "inline")}</div>
            <div class="tag-row feed-tags">
              ${paperMetaTags(paper)
                .map((label) => `<span class="tag">${label}</span>`)
                .join("")}
            </div>
            ${sourceDetails(paper)}
            ${referenceBlock(paper)}
          </div>
          <div class="score" aria-label="质量分 ${adjustedScore(paper)}">${adjustedScore(paper)}</div>
          ${feedbackControls(paper, feedback)}
        </article>
      `;
      return `
        <section class="date-section">
          <div class="date-heading">
            <strong>${dateLabel(group.date)}</strong>
            <span>${group.entries.length} 条</span>
          </div>
          <div class="grid">
            ${primaryEntries.map(renderItem).join("")}
            ${
              hiddenEntries.length
                ? `<details class="date-more"><summary>展开其余 ${hiddenEntries.length} 条</summary><div class="grid">${hiddenEntries.map(renderItem).join("")}</div></details>`
                : ""
            }
            </div>
        </section>
      `;
    })
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
  document.querySelector("#exportFeedback").addEventListener("click", () => {
    downloadJson("topic-feedback.json", feedbackConfig());
  });
  document.querySelector("#feed").addEventListener("click", (event) => {
    const button = event.target.closest("[data-feedback]");
    if (!button) return;
    setFeedback(button.dataset.paper, button.dataset.feedback);
    refreshFeedbackControls(button.dataset.paper);
  });
  renderFeed();
}

function renderDaily() {
  const groups = groupPapersByDate(recentPapers()).map((group) => ({
    ...group,
    entries: group.entries.slice(0, 5)
  }));
  root.innerHTML = `
    ${renderHead("日报", `近 ${RECENT_DAYS} 日 · 每日 top 5 selected`, '<button class="btn" id="exportFeedback">导出反馈</button>')}
    <section class="grid" id="dailyList">
      ${groups
        .map(
          (group) => `
            <section class="date-section">
              <div class="date-heading">
                <strong>${dateLabel(group.date)}</strong>
                <span>Top ${group.entries.length}</span>
              </div>
              <div class="grid">${group.entries.map((paper) => paperCard(paper, { showOneLine: false, showFeedback: true })).join("")}</div>
            </section>
          `
        )
        .join("")}
    </section>
  `;
  document.querySelector("#exportFeedback").addEventListener("click", () => {
    downloadJson("topic-feedback.json", feedbackConfig());
  });
  document.querySelector("#dailyList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-feedback]");
    if (!button) return;
    setFeedback(button.dataset.paper, button.dataset.feedback);
    refreshFeedbackControls(button.dataset.paper);
  });
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
  return value
    .trim()
    .toLowerCase()
    .replace(/rss$/i, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceKey(item) {
  return normalizeSourceName(item.name) || item.id || slugify(item.feedUrl || item.pageUrl || "");
}

function canonicalSourceFields(item) {
  const key = sourceKey(item);
  if (key === "science" || key === "science advances" || key === "nature") {
    return { category: "comprehensive", type: "topJournal" };
  }
  if (key === "science news") return { category: "news", type: "natureScienceNews" };
  if (key.startsWith("sciencedaily")) return { category: "news", type: "scienceDaily" };
  if (item.category === "wechat" || item.type === "wechat") return { category: "wechat", type: "wechat" };
  if (/review|annual|trends/.test(key)) return { category: "professional", type: "reviewJournal" };
  if (item.category === "news") return { category: "news", type: item.type || "natureScienceNews" };
  if (item.category === "comprehensive") return { category: "comprehensive", type: "topJournal" };
  return { category: "professional", type: item.type || "professionalJournal" };
}

function normalizeSourceConfig(item) {
  const canonical = canonicalSourceFields(item);
  return {
    ...item,
    ...canonical,
    id: item.id || slugify(item.name || item.feedUrl || item.pageUrl || "source")
  };
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
  return normalizeSourceConfig({
    id: slugify(name || url || `source-${Date.now()}`),
    name,
    type,
    category,
    ...(isFeed ? { feedUrl: url } : { pageUrl: url }),
    weight,
    status: isFeed ? "feed configured" : "homepage, feed discovery required"
  });
}

function sourceConfigToDisplay(item) {
  return {
    key: sourceKey(item),
    name: item.name,
    category: item.category,
    weight: item.weight || 3,
    sourceScore: sourceQualityScores[item.type] || 0,
    daily: item.daily || 0,
    recentCount: item.recentCount || 0,
    subgroup: item.subgroup || "",
    virtual: Boolean(item.virtual),
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
    const normalized = normalizeSourceConfig(item);
    const key = sourceKey(normalized);
    const existing = map.get(key);
    map.set(
      key,
      normalizeSourceConfig(existing ? { ...existing, ...normalized, id: existing.id || normalized.id } : normalized)
    );
  });
  return [...map.values()];
}

async function loadBaseSourceConfigs() {
  try {
    const response = await fetch("./config/sources.json", { cache: "no-store" });
    if (!response.ok) throw new Error("no config");
    return mergeSourceConfigs(await response.json());
  } catch {
    return mergeSourceConfigs(sources.map(([typeLabel, name, category, weight, daily]) => ({
      id: slugify(name),
      name,
      type: category === "wechat" ? "wechat" : category === "news" ? "scienceDaily" : "professionalJournal",
      category,
      weight,
      daily,
      status: typeLabel
    })));
  }
}

function wechatSubgroup(name = "") {
  if (/遥感|GIS|GEE|地理|地球|remote|landsat|ndvi/i.test(name)) return "遥感/GIS";
  if (/火|野火|fire/i.test(name)) return "火生态";
  if (/农业|农田|土壤|作物|agro|soil|crop/i.test(name)) return "农业/土壤";
  if (/生物多样性|保护|自然|动物|兽类|conservation|biodiversity/i.test(name)) return "生物多样性/保护";
  if (/植物|植被|群落|生态系统|forest|plant|community/i.test(name)) return "植物/群落/生态系统";
  return "综合/其他";
}

async function loadWechatSourceConfigs() {
  try {
    const response = await fetch("./data/wechat-candidates.json", { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const map = new Map();
    items.forEach((item) => {
      const name = item.journal || item.sourceSignals?.find((signal) => signal.type === "wechat")?.name;
      if (!name) return;
      const key = normalizeSourceName(name);
      const existing = map.get(key) || {
        id: `wechat-${slugify(name)}`,
        name,
        category: "wechat",
        type: "wechat",
        weight: 4,
        recentCount: 0,
        subgroup: wechatSubgroup(name),
        status: "local we-mp-rss",
        virtual: true
      };
      existing.recentCount += 1;
      map.set(key, existing);
    });
    return [...map.values()];
  } catch {
    return [];
  }
}

function renderSources() {
  root.innerHTML = `
    ${renderHead("信源添加", "期刊 RSS、微信公众号更新链接、新闻报道 RSS")}
    <section id="sourceList"></section>
    <section class="source-tools">
      <form class="form-grid compact-form card paper" id="sourceForm">
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
        <div class="actions">
          <button class="btn primary" id="sourceSubmit" type="submit">加入配置</button>
          <button class="btn" id="copyWechatCommand" type="button">复制公众号导入命令</button>
        </div>
      </form>
      <div class="card config-export">
        <div class="cluster-head">
          <strong>sources.json</strong>
          <span>下载后覆盖 config/sources.json</span>
        </div>
        <textarea id="sourceConfigOutput"></textarea>
        <div class="config-status" id="sourceConfigStatus">点击信源的“修改”会定位到对应 JSON 条目。公众号订阅仍在本地 we-mp-rss 中管理。</div>
        <div class="actions">
          <button class="btn" id="copySourcesConfig">复制配置</button>
          <button class="btn primary" id="downloadSourcesConfig">下载 sources.json</button>
        </div>
      </div>
    </section>
  `;
  bindSources();
}

function bindSources() {
  let saved = mergeSourceConfigs(
    readJson("paperDailySourceConfigs", [])
  ).filter((item) => item && item.id && item.name);
  localStorage.setItem("paperDailySourceConfigs", JSON.stringify(saved));
  localStorage.removeItem("paperDailyDeletedSources");
  const list = document.querySelector("#sourceList");
  const output = document.querySelector("#sourceConfigOutput");
  const status = document.querySelector("#sourceConfigStatus");
  let currentConfigs = [];
  let sourceRanges = new Map();

  const persistSaved = () => {
    saved = mergeSourceConfigs(saved).filter((item) => item && item.id && item.name);
    localStorage.setItem("paperDailySourceConfigs", JSON.stringify(saved));
  };

  const formatSourceConfig = (items) => {
    sourceRanges = new Map();
    if (!items.length) return "[]";
    let cursor = 2;
    const blocks = items.filter((item) => !item.virtual).map((item) => {
      const block = JSON.stringify(item, null, 2)
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n");
      sourceRanges.set(sourceKey(item), { start: cursor, end: cursor + block.length });
      cursor += block.length + 2;
      return block;
    });
    return `[\n${blocks.join(",\n")}\n]`;
  };

  const locateSource = (key, message = "已定位到 sources.json 对应条目，可在文本框中手动修改。") => {
    const range = sourceRanges.get(key);
    if (!range) return;
    output.scrollIntoView({ behavior: "smooth", block: "center" });
    output.focus();
    output.setSelectionRange(range.start, range.end);
    status.textContent = message;
  };

  const sourceRow = (item) => `
    <article class="card source-item compact-source-item">
      <div class="source-main">
        <strong>${item.name}</strong>
        <span>${item.typeLabel} · 权重 ${item.weight} · 信源分 ${item.sourceScore}/30 · ${item.recentCount ? `近5日 ${item.recentCount} 条` : item.urlLabel}</span>
      </div>
      <div class="source-actions">
        ${
          item.virtual
            ? `<span class="source-local">本地</span>`
            : `<button class="btn" data-source-action="edit" data-source-key="${encodeURIComponent(item.key)}">修改</button>`
        }
      </div>
    </article>
  `;

  const draw = (items) => {
    currentConfigs = mergeSourceConfigs(items);
    const displayItems = currentConfigs.map(sourceConfigToDisplay);
    const labels = {
      comprehensive: "综合期刊",
      professional: "专业期刊 RSS",
      news: "新闻报道 RSS",
      wechat: "微信公众号"
    };

    list.innerHTML = Object.entries(labels)
      .map(([key, label]) => {
        const group = displayItems.filter((item) => item.category === key);
        const volume = group.reduce((sum, item) => sum + Number(item.daily || item.recentCount || 0), 0);
        const rows =
          key === "wechat"
            ? Object.entries(
                group.reduce((acc, item) => {
                  const subgroup = item.subgroup || "综合/其他";
                  if (!acc[subgroup]) acc[subgroup] = [];
                  acc[subgroup].push(item);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => a.localeCompare(b, "zh-Hans-CN"))
                .map(
                  ([subgroup, entries]) => `
                    <div class="source-subgroup">
                      <div class="source-subgroup-title">${subgroup}</div>
                      ${entries.sort((a, b) => b.recentCount - a.recentCount || a.name.localeCompare(b.name, "zh-Hans-CN")).map(sourceRow).join("")}
                    </div>
                  `
                )
                .join("")
            : group.sort((a, b) => b.sourceScore - a.sourceScore || a.name.localeCompare(b.name)).map(sourceRow).join("");
        return `
          <section class="source-cluster">
            <div class="cluster-head">
              <strong>${label}</strong>
              <span>${group.length} 个信源 · ${key === "wechat" ? `近5日 ${volume} 条` : `约 ${volume} 条/日`}</span>
            </div>
            <div class="source-list compact-source-list">${rows || `<div class="empty-row">暂无信源</div>`}</div>
          </section>
        `;
      })
      .join("");
    output.value = formatSourceConfig(currentConfigs);
  };

  Promise.all([loadBaseSourceConfigs(), loadWechatSourceConfigs()]).then(([baseConfigs, wechatConfigs]) => {
    currentConfigs = mergeSourceConfigs([...wechatConfigs, ...baseConfigs, ...saved]);
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
    const itemKey = sourceKey(item);
    const existing = currentConfigs.find((entry) => sourceKey(entry) === itemKey);
    if (existing) {
      if (existing.virtual) {
        status.textContent = `已存在本地公众号订阅：${existing.name}。公众号订阅请在本地 we-mp-rss 中管理。`;
        return;
      }
      locateSource(
        sourceKey(existing),
        `已存在同名信源：${existing.name}。请在 sources.json 对应条目中手动修改。`
      );
      return;
    }
    saved.push(item);
    persistSaved();
    draw([...currentConfigs, item]);
    locateSource(itemKey, `已添加新信源：${item.name}。请检查后下载 sources.json。`);
    event.target.reset();
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-source-action]");
    if (!button) return;
    const key = decodeURIComponent(button.dataset.sourceKey || "");
    locateSource(key);
  });

  document.querySelector("#copySourcesConfig").addEventListener("click", async () => {
    await navigator.clipboard?.writeText(output.value);
  });

  document.querySelector("#copyWechatCommand").addEventListener("click", async () => {
    await navigator.clipboard?.writeText("cd /Users/xcli/Documents/Codex/prj_paper-daily && node scripts/import-wechat-local.mjs");
    status.textContent = "已复制本地导入命令。请在 Mac 终端中运行；静态网页不能直接执行本地脚本。";
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
              <div class="log-body">${log.body
                .split("\\n")
                .map((line) => `<p>${line}</p>`)
                .join("")}</div>
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
