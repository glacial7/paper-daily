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
  novel_ecosystems_resilience: "新型生态系统/韧性",
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

const initialThemeWeights = {
  novel_ecosystems_resilience: 2,
  modeling_methods: 2,
  community_ecosystem: 2,
  population_traits: 1,
  biogeochemistry: 1,
  genetics_evolution: 0,
  landscape_macroecology: 1,
  species_distribution: 1,
  climate_anthropogenic: 2,
  disturbance: 3,
  invasion: 3,
  conservation_management: 1,
  plant_agroecology: 3,
  aquatic_microbe: 0
};

const topicPreferenceProfile = {
  primary: [
    "植物入侵",
    "植被群落火烧与火后恢复",
    "干热河谷生态系统",
    "光伏工程影响植物群落",
    "农业生态安全"
  ],
  secondary: [
    "动植物种间关系与群落生态学",
    "生态学统计分析方法",
    "植被遥感技术应用"
  ],
  crossCutting: [
    "新型生态系统与韧性未来：弃耕地、火烧或入侵地、干热河谷及光伏/新能源人造场地"
  ],
  updatedAt: "2026-07-15"
};

const sources = [
  ["期刊/页面", "Science", "comprehensive", 5, 30],
  ["期刊 RSS", "Nature", "comprehensive", 5, 30],
  ["期刊/页面", "Nature Reviews Biodiversity", "comprehensive", 4, 4],
  ["期刊/页面", "Nature Reviews Earth & Environment", "comprehensive", 4, 4],
  ["期刊/页面", "Annual Review of Ecology, Evolution, and Systematics", "comprehensive", 4, 3],
  ["期刊 RSS", "Biological Reviews", "comprehensive", 4, 3],
  ["期刊/页面", "Trends in Ecology & Evolution", "comprehensive", 4, 8],
  ["期刊/页面", "Frontiers in Ecology and the Environment", "professional", 3, 8],
  ["期刊 RSS", "Nature Ecology & Evolution", "professional", 3, 12],
  ["期刊/页面", "Ecology Letters", "professional", 3, 10],
  ["新闻报道 RSS", "ScienceDaily Ecology", "news", 2, 18],
  ["微信公众号", "生态学者（Ecologist-all）", "wechat", 1, 2]
];

const embeddedSourceConfigs = [
  {
    id: "science",
    name: "Science",
    type: "topJournal",
    category: "comprehensive",
    pageUrl: "https://www.science.org/",
    status: "feed configured",
    weight: 5,
    feedUrl: "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science",
    feedUrls: [
      "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=science",
      "https://www.science.org/action/showFeed?type=axatoc&feed=rss&jc=science"
    ],
    crossrefIssn: "0036-8075",
    crossrefAugment: true,
    crossrefWindowDays: 15,
    crossrefRows: 100
  },
  {
    id: "nature",
    name: "Nature",
    type: "topJournal",
    category: "comprehensive",
    pageUrl: "https://www.nature.com/",
    feedUrl: "https://www.nature.com/nature.rss",
    status: "feed configured",
    weight: 5,
    crossrefIssn: "0028-0836",
    crossrefAugment: true,
    crossrefWindowDays: 15,
    crossrefRows: 80
  },
  {
    id: "pnas",
    name: "PNAS",
    type: "topJournal",
    category: "comprehensive",
    pageUrl: "https://www.pnas.org/",
    feedUrl: "https://www.pnas.org/action/showFeed?type=etoc&feed=rss&jc=PNAS",
    status: "feed configured",
    weight: 5,
    crossrefIssn: "1091-6490",
    crossrefAugment: true,
    crossrefWindowDays: 15,
    crossrefRows: 120
  },
  {
    id: "current-biology",
    name: "Current Biology",
    type: "topJournal",
    category: "comprehensive",
    pageUrl: "https://www.cell.com/current-biology/home",
    feedUrl: "https://www.cell.com/current-biology/inpress.rss",
    feedUrls: [
      "https://www.cell.com/current-biology/current.rss",
      "https://www.cell.com/current-biology/inpress.rss"
    ],
    status: "feed configured",
    weight: 5,
    crossrefIssn: "0960-9822"
  },
  {
    id: "one-earth",
    name: "One Earth",
    type: "topJournal",
    category: "comprehensive",
    pageUrl: "https://www.cell.com/one-earth/home",
    feedUrl: "https://www.cell.com/one-earth/current.rss",
    feedUrls: [
      "https://www.cell.com/one-earth/current.rss",
      "https://www.cell.com/one-earth/inpress.rss"
    ],
    status: "feed configured",
    weight: 5
  },
  {
    id: "the-innovation",
    name: "The Innovation",
    type: "topJournal",
    category: "comprehensive",
    pageUrl: "https://www.cell.com/the-innovation/home",
    feedUrl: "https://www.cell.com/the-innovation/inpress.rss",
    status: "feed configured",
    weight: 5,
    crossrefIssn: "2666-6758"
  },
  {
    id: "nature-reviews-biodiversity",
    name: "Nature Reviews Biodiversity",
    type: "reviewJournal",
    category: "comprehensive",
    pageUrl: "https://www.nature.com/nrbd/",
    status: "feed configured",
    weight: 4,
    feedUrl: "https://www.nature.com/nrbd.rss"
  },
  {
    id: "nature-reviews-earth-environment",
    name: "Nature Reviews Earth & Environment",
    type: "reviewJournal",
    category: "comprehensive",
    pageUrl: "https://www.nature.com/natrevearthenviron/",
    status: "feed configured",
    weight: 4,
    feedUrl: "https://www.nature.com/natrevearthenviron.rss"
  },
  {
    id: "annual-review-ecology-evolution-systematics",
    name: "Annual Review of Ecology, Evolution, and Systematics",
    type: "reviewJournal",
    category: "comprehensive",
    pageUrl: "https://www.annualreviews.org/content/journals/ecolsys",
    status: "crossref fallback",
    weight: 4,
    crossrefIssn: "1545-2069",
    feedDisabledReason: "Annual Reviews RSS returns 403 to automated local fetch; use Crossref ISSN lookup for DOI metadata."
  },
  {
    id: "biological-reviews",
    name: "Biological Reviews",
    type: "reviewJournal",
    category: "comprehensive",
    pageUrl: "https://onlinelibrary.wiley.com/journal/1469185x",
    feedUrl: "https://onlinelibrary.wiley.com/feed/1469185x/most-recent",
    status: "feed configured",
    weight: 4,
    crossrefIssn: "1469-185X",
    crossrefAugment: true,
    crossrefWindowDays: 15,
    crossrefRows: 80
  },
  {
    id: "trends-ecology-evolution",
    name: "Trends in Ecology & Evolution",
    type: "reviewJournal",
    category: "comprehensive",
    pageUrl: "https://www.cell.com/trends/ecology-evolution/home",
    status: "feed configured",
    weight: 4,
    feedUrl: "https://www.cell.com/trends/ecology-evolution/current.rss",
    feedUrls: [
      "https://www.cell.com/trends/ecology-evolution/current.rss",
      "https://www.cell.com/trends/ecology-evolution/inpress.rss"
    ]
  },
  {
    id: "frontiers-ecology-environment",
    name: "Frontiers in Ecology and the Environment",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://esajournals.onlinelibrary.wiley.com/journal/15409309",
    status: "feed configured",
    weight: 3,
    feedUrl: "https://esajournals.onlinelibrary.wiley.com/feed/15409309/most-recent",
    crossrefIssn: "1540-9309"
  },
  {
    id: "nature-ecology-evolution",
    name: "Nature Ecology & Evolution",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://www.nature.com/natecolevol/",
    feedUrl: "https://www.nature.com/natecolevol.rss",
    status: "feed configured",
    weight: 3
  },
  {
    id: "ecology-letters",
    name: "Ecology Letters",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://onlinelibrary.wiley.com/journal/14610248",
    status: "feed configured",
    weight: 3,
    feedUrl: "https://onlinelibrary.wiley.com/feed/14610248/most-recent"
  },
  {
    id: "sciencedaily-ecology",
    name: "ScienceDaily Ecology",
    type: "scienceDaily",
    category: "news",
    pageUrl: "https://www.sciencedaily.com/news/earth_climate/ecology/",
    feedUrl: "https://www.sciencedaily.com/rss/earth_climate/ecology.xml",
    status: "feed configured",
    weight: 2
  },
  {
    id: "science-news",
    name: "Science News",
    type: "natureScienceNews",
    category: "news",
    feedUrl: "https://www.science.org/rss/news_current.xml",
    weight: 2,
    status: "feed configured",
    pageUrl: "https://www.science.org/news"
  },
  {
    id: "science-advances",
    name: "Science Advances",
    type: "topJournal",
    category: "comprehensive",
    feedUrl: "https://www.science.org/action/showFeed?type=etoc&feed=rss&jc=sciadv",
    weight: 4,
    status: "feed configured",
    pageUrl: "https://www.science.org/journal/sciadv",
    crossrefIssn: "2375-2548",
    crossrefAugment: true,
    crossrefWindowDays: 15,
    crossrefRows: 120
  },
  {
    id: "journal-of-ecology",
    name: "Journal of Ecology",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://besjournals.onlinelibrary.wiley.com/journal/13652745",
    feedUrl: "https://besjournals.onlinelibrary.wiley.com/feed/13652745/most-recent",
    status: "feed configured",
    weight: 3
  },
  {
    id: "journal-animal-ecology",
    name: "Journal of Animal Ecology",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://besjournals.onlinelibrary.wiley.com/journal/13652656",
    feedUrl: "https://besjournals.onlinelibrary.wiley.com/feed/13652656/most-recent",
    status: "feed configured",
    weight: 3,
    crossrefIssn: "1365-2656"
  },
  {
    id: "journal-applied-ecology",
    name: "Journal of Applied Ecology",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://besjournals.onlinelibrary.wiley.com/journal/13652664",
    feedUrl: "https://besjournals.onlinelibrary.wiley.com/feed/13652664/most-recent",
    status: "feed configured",
    weight: 3,
    crossrefIssn: "1365-2664"
  },
  {
    id: "functional-ecology",
    name: "Functional Ecology",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://besjournals.onlinelibrary.wiley.com/journal/13652435",
    feedUrl: "https://besjournals.onlinelibrary.wiley.com/feed/13652435/most-recent",
    status: "feed configured",
    weight: 3,
    crossrefIssn: "1365-2435"
  },
  {
    id: "ecography",
    name: "Ecography",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://www.ecography.org/",
    feedUrl: "https://nsojournals.onlinelibrary.wiley.com/feed/16000587/most-recent",
    status: "feed configured",
    weight: 3,
    crossrefIssn: "1600-0587",
    crossrefAugment: true,
    crossrefWindowDays: 15,
    crossrefRows: 50
  },
  {
    id: "global-ecology-biogeography",
    name: "Global Ecology and Biogeography",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://onlinelibrary.wiley.com/journal/14668238",
    feedUrl: "https://onlinelibrary.wiley.com/feed/14668238/most-recent",
    status: "feed configured",
    weight: 3,
    crossrefIssn: "1466-8238"
  },
  {
    id: "ecology",
    name: "Ecology",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://esajournals.onlinelibrary.wiley.com/journal/19399170",
    feedUrl: "https://esajournals.onlinelibrary.wiley.com/feed/19399170/most-recent",
    status: "feed configured",
    weight: 3,
    crossrefIssn: "1939-9170"
  },
  {
    id: "ecological-applications",
    name: "Ecological Applications",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://esajournals.onlinelibrary.wiley.com/journal/19395582",
    feedUrl: "https://esajournals.onlinelibrary.wiley.com/feed/19395582/most-recent",
    status: "feed configured",
    weight: 3,
    crossrefIssn: "1939-5582"
  },
  {
    id: "ecological-monographs",
    name: "Ecological Monographs",
    type: "professionalJournal",
    category: "professional",
    pageUrl: "https://esajournals.onlinelibrary.wiley.com/journal/15577015",
    feedUrl: "https://esajournals.onlinelibrary.wiley.com/feed/15577015/most-recent",
    status: "feed configured",
    weight: 3,
    crossrefIssn: "1557-7015"
  }
];

const sourceQualityScores = {
  topJournal: 5,
  reviewJournal: 4,
  professionalJournal: 3
};

const embeddedJournalGrades = [
  ["Science", "A1", 97, 25, "a1_nature_science", "A1 Nature/Science 正刊"],
  ["Nature", "A1", 97, 25, "a1_nature_science", "A1 Nature/Science 正刊"],
  ["Nature Reviews Biodiversity", "A2", 90, 23.5, "a2_top_selective", "A2 高影响综述期刊"],
  ["Nature Reviews Earth & Environment", "A2", 90, 23.5, "a2_top_selective", "A2 高影响综述期刊"],
  ["Nature Reviews Microbiology", "A2", 90, 23.5, "a2_top_selective", "A2 高影响综述期刊"],
  ["Nature Reviews Chemistry", "A2", 90, 23.5, "a2_top_selective", "A2 高影响综述期刊"],
  ["Annual Review of Ecology, Evolution, and Systematics", "A2", 90, 23.5, "a2_top_selective", "A2 高影响综述期刊"],
  ["Biological Reviews", "A2", 90, 23.5, "a2_top_selective", "A2 高影响综述期刊"],
  ["Trends in Ecology & Evolution", "A2", 90, 23.5, "a2_top_selective", "A2 高影响综述期刊"],
  ["PNAS", "A3", 82, 22, "a3_high_impact_selective", "A3 综合期刊/大子刊"],
  ["Current Biology", "A3", 82, 22, "a3_high_impact_selective", "A3 综合期刊/大子刊"],
  ["One Earth", "A3", 82, 22, "a3_high_impact_selective", "A3 综合期刊/大子刊"],
  ["The Innovation", "A3", 82, 22, "a3_high_impact_selective", "A3 综合期刊/大子刊"],
  ["Science Advances", "A3", 82, 22, "a3_high_impact_selective", "A3 综合期刊/大子刊"],
  ["Nature Ecology & Evolution", "A3", 82, 22, "a3_high_impact_selective", "A3 综合期刊/大子刊"],
  ["Nature Sustainability", "A3", 82, 22, "a3_high_impact_selective", "A3 综合期刊/大子刊"],
  ["Nature Geoscience", "A3", 82, 22, "a3_high_impact_selective", "A3 综合期刊/大子刊"],
  ["Nature Microbiology", "B1", 72, 18, "b1_user_override", "B1 手工关注 Nature 子刊"],
  ["Nature Cities", "B1", 72, 18, "b1_user_override", "B1 手工关注 Nature 子刊"],
  ["Ecology Letters", "B1", 72, 18, "b1_nature_index", "B1 Nature Index/生态小类/环境生态大类一区"],
  ["Frontiers in Ecology and the Environment", "B1", 72, 18, "b1_nature_index", "B1 Nature Index/生态小类/环境生态大类一区"],
  ["Journal of Ecology", "B2", 62, 15, "b2_cas_small_or_large_q1", "B2 CAS 小类/大类一区"],
  ["Journal of Animal Ecology", "B2", 62, 15, "b2_cas_small_or_large_q1", "B2 CAS 小类/大类一区"],
  ["Journal of Applied Ecology", "B2", 62, 15, "b2_cas_small_or_large_q1", "B2 CAS 小类/大类一区"],
  ["Ecography", "B2", 62, 15, "b2_cas_small_or_large_q1", "B2 CAS 小类/大类一区"],
  ["Global Ecology and Biogeography", "B2", 62, 15, "b2_cas_small_or_large_q1", "B2 CAS 小类/大类一区"],
  ["Global Change Biology", "B2", 62, 15, "b2_cas_small_or_large_q1", "B2 CAS 小类/大类一区"],
  ["Functional Ecology", "B2", 62, 15, "b2_cas_small_or_large_q1", "B2 CAS 小类/大类一区"],
  ["Ecology", "B1", 72, 18, "b1_nature_index", "B1 Nature Index/生态小类/环境生态大类一区"],
  ["Ecological Applications", "B2", 62, 15, "b2_cas_small_or_large_q1", "B2 CAS 小类/大类一区"],
  ["Ecological Monographs", "B1", 72, 18, "b1_nature_index", "B1 Nature Index/生态小类/环境生态大类一区"]
].map(([title, subgrade, displayScore, partitionScore, tier, label]) => ({
  title,
  subgrade,
  displayScore,
  partitionScore,
  tier,
  label
}));

const projectGoal = [
  "目标：PaperDaily 是一个面向个人课题和兴趣的文献追踪系统，优先发现真正值得阅读、能服务当前研究任务的论文。",
  "日报：聚焦高相关、高价值文章，每日取 top 10% 且最多 5 篇；无推荐时显示今日休息。",
  "全部动态：保留更宽的新鲜论文流，避免过早错过潜在有价值的新方向。",
  "信源：公开版只跟踪配置中明确列出的期刊 RSS，不接入公众号、新闻聚合或私人订阅。",
  "当前主题：一级优先植物入侵、植被群落火烧、干热河谷、光伏工程影响植物群落、农业生态安全；二级关注种间关系/群落生态、生态统计方法和植被遥感。",
  "上位框架：关注弃耕地、火烧或入侵地、干热河谷及光伏等人造场地中的新型生态系统形成、群落重组、韧性与生态系统服务。",
  "主题判据：优先识别生态系统、生物群落、动植物种群、物种、栖息地和生物多样性等明确生态相关目标。",
  "评分：日报按 theme-first 分层排序；theme 默认整体降低一档，只有命中两个以上主题/兴趣/泛生态/方法数据维度时才提档；右上角显示 theme 分，journal 以 A3/XX 等期刊标签展示。",
  "期刊分档：A 档沿用既有手工分档；B1 为 Nature Index/生态小类一区/环境科学与生态学大类一区，B2 为其它 CAS 一区，B3 为 JCR Q1 且 CAS 二区，C 为剩余 JCR Q1。",
  "原则：RSS 负责发现，DOI 元数据负责确认论文身份；信源数量不能替代论文质量和个人研究相关性。",
  "反馈：后续扩展为主题、质量、信源、元数据错误和关注 PI 团队等可解释校准信号；关注团队只在 theme 中小幅加权。"
];

const logs = [
  {
    version: "2026-08-11",
    date: "公开版更新",
    title: "GitHub Pages 切换为期刊 RSS-only",
    body:
      "1. 信源：公开版仅保留配置了公开 RSS 的综合、综述和专业期刊。\\n2. 边界：移除公众号订阅、公众号候选和新闻聚合入口；本地 app 的私人信源能力不发布到 GitHub Pages。\\n3. 校验：抓取、评分和页面展示均执行 RSS-only 门控，避免旧缓存重新带回非期刊来源。"
  },
  {
    version: "2026-07-15",
    date: "今日更新",
    title: "新型生态系统研究框架",
    body:
      "1. 主题：将“新型生态系统与韧性未来”纳入研究画像，重点关联弃耕、火烧或入侵地、干热河谷及光伏等人造场地。\\n2. 评分：该框架单独出现仅作为支撑兴趣；只有同时具备具体生态对象或过程并连接当前课题时才进入高分路径，避免泛化的韧性、治理或公平表述抬高分数。"
  },
  {
    version: "2026-06-28",
    date: "今日更新",
    title: "抓取与预筛效率优化",
    body:
      "1. 抓取：新增可选 Firecrawl 兜底层；默认关闭，开启后只在 RSS/新闻详情页本地 HTML 抓取或 DOI/Reference/栏目类型解析不足时使用，并受每次运行调用上限和本地缓存保护。\\n2. 预筛：公众号 DOI 角色预筛改为低并发并行，默认并发 2，可在模型设置中按网络情况调整为 1-4。\\n3. 跳过：明确命中历史/RSS 论文的公众号线索会直接复用已知论文信息；无 DOI 且明显属于征稿、会议、招聘、课程或广告的信息会本地快速排除。\\n4. 缓存：放宽公众号预筛缓存指纹，日期、抓取窗口或少量正文变化不再轻易触发全量重跑；运行报告会显示缓存、宽松缓存、本地跳过和模型调用数量。"
  },
  {
    version: "2026-06-22",
    date: "今日更新",
    title: "导出信息与模型设置",
    body:
      "1. 更新：侧边栏“更新动态”改为“更新”；弹窗中的“完整更新”保留默认完整流程，继续由 app 完成抓取、清理、合并、评分和日报生成。\\n2. 抓取导出：只执行信息抓取、预筛、DOI 补全、信源合并和候选期刊分区/IF 补全，然后把候选与运行报告打包为单个 zip 保存到 Downloads，不执行评分，也不刷新日报/全部动态。\\n3. 导入更新：读取之前导出的 zip，只运行后半段评分、推荐和日报/全部动态生成，不重复前期抓取和期刊补全。\\n4. 模型：新增“模型设置”，支持配置 OpenAI-compatible API Base URL、API key、预筛模型、解读模型、公众号预筛模型和评分并发，便于从 DeepSeek 切换到其它兼容模型。"
  },
  {
    version: "2026-06-17",
    date: "今日更新",
    title: "期刊分级与 IF 口径调整",
    body:
      "1. 期刊：A 档沿用既有手工分档，所有 Nature Reviews 系列归 A2；B1 为 Nature Index、CAS 小类生态学一区或环境科学与生态学大类一区，并将 Nature Microbiology、Nature Cities 作为 B1 手工关注子刊；B2 为其它 CAS 大类/小类一区；B3 为 JCR Q1 且 CAS 大类/小类二区；C 为剩余 JCR Q1。\\n2. IF：优先使用 2026 JCR 表中的正式 2025 5 Year JIF；表中缺失时用 JustScience 最新 5年平均分兜底，只用于同档排序和展示，不参与升档。\\n3. 流程：完整更新和抓取导出都会在评分前扫描候选期刊，缺少明确 CAS 分区或最新 JustScience 分区字段的期刊会先精确补全；导入更新则复用 zip 中已补全的候选。\\n4. 元数据：期刊识别按精确 DOI 元数据优先、明确文本其次、DOI pattern 兜底，减少多 DOI 公众号文章和 Nature 系列前缀带来的期刊误判。"
  },
  {
    version: "2026-06-15",
    date: "今日更新",
    title: "个人研究画像与 Theme 分校准",
    body:
      "1. 推荐：根据 Zotero 与课题材料沉淀个人研究画像，优先服务光伏-入侵、干热河谷入侵-火、火-食草动物-地形、新能源生物多样性风险等当前任务。\\n2. 评分：theme 改为更保守的分档上限，单一核心主题、支撑兴趣、泛生态对象或方法数据命中不再轻易进入 90+。\\n3. 降权：镉胁迫、植物修复、植物激素和泛根际/土壤/微生物方向降为背景兴趣，除非连接当前任务或来自 A 档期刊。\\n4. 依据：预筛与评分统一读取研究画像和 theme 设计文档，避免旧关键词配置继续主导日报推荐。"
  },
  {
    version: "2026-06-14",
    date: "今日更新",
    title: "期刊分档、信源展示与类型识别",
    body:
      "1. 期刊：journal 改为 A/B/C 100 分分层，A1 为 Nature/Science，A2 为高影响综述，A3 为综合期刊和大子刊。\\n2. 信源：信源页展示每个期刊的 ABC 档位/分值，并在组内按评级排序，便于后续人工校准。\\n3. RSS：Nature/Science 混合 feed 按 Research Article、Research Highlight、News & Views、Comment、Editorial 等类型区分，避免统一按研究论文评分。\\n4. 类型：Ecology Letters 的 Letter 按该刊 research article 处理；新增 Biological Reviews 等综述信源并归入综合/综述期刊。"
  },
  {
    version: "2026-06-13",
    date: "今日更新",
    title: "ABC 期刊分档与 Theme-first 门控",
    body:
      "1. 日报：从固定 Top 5 改为每日 top 10% 且最多 5 篇；没有达到门槛的日期显示“今日休息”。\\n2. 排序：日报改为 theme-first 分层，theme 先判断是否值得看，journal 再判断阅读投入优先级，type 只做同档微调。\\n3. 显示：右上角分值显示 theme，期刊标签展示 A3/XX 与 IF，source 只作为 DOI 合并、信息质量和多来源热度信号。\\n4. 反馈：记录后续结构化反馈目标，包含主题、质量、信源、元数据错误和关注 PI/team 校准。"
  },
  {
    version: "2026-06-12",
    date: "今日更新",
    title: "RSS 历史缓存与 DOI 合并",
    body:
      "1. RSS：Science 同时保存 axatoc 与 etoc feed，并优先使用 online date；RSS 条目前置 DOI 识别，服务后续合并和评分。\\n2. 历史：新增近 14 日 RSS 发现历史，避免未按日更新时遗漏较早条目。\\n3. 报告：更新流程输出 RSS、DOI 元数据、评分和总运行报告，便于定位失败信源与未解析 DOI。"
  },
  {
    version: "2026-06-10",
    date: "今日更新",
    title: "项目信源页与目标文档整理",
    body:
      "1. 项目：统一仓库目标文档，明确日报、全部动态和期刊 RSS 信源的角色。\\n2. 信源：信源页改为只读紧凑概览，保留顶部“修改信源”下载 sources.json。\\n3. 统计：按本次更新窗口展示各信源近 X 日篇数，不再区分日/月。\\n4. Git：完成统一仓库迁移后的版本管理整理。"
  },
  {
    version: "2026-06-09",
    date: "今日更新",
    title: "增量识别与本地刷新完善",
    body:
      "1. 更新：页面按本次抓取天数展示结果。\\n2. 流程：先抓 RSS 建立论文底库，再按 DOI 和英文题名合并重复论文。\\n3. 推荐：只对真正新增论文进入高质量评分，重复论文重算信源分。\\n4. 阅读：统一日报和全部动态标签顺序，减少辅助状态对阅读的干扰。\\n5. 稳定性：模型失败会自动重试，仍失败才降级并保留错误原因。"
  },
  {
    version: "2026-06-07",
    date: "今日更新",
    title: "阅读与交互增强",
    body:
      "1. 稳定性：增强模型返回格式的容错，单条候选解析失败时降级处理，不再中断整次日报更新。\\n2. 页面：日报增加 like/dislike 与反馈导出；动态页标记已进入日报推荐的论文，并折叠往日超出 3 条的动态。\\n3. 交互：动态页点击 like/dislike 不再重绘整页，已展开的详细内容和折叠状态会保持。"
  },
  {
    version: "2026-06-06",
    date: "今日更新",
    title: "信源与筛选策略完善",
    body:
      "1. 信源：补齐目标期刊 RSS，并修正综合期刊与专业期刊分类。\\n2. 推荐：参考生态学主题演变研究，将主题扩展为生态学主题组；日报改为按日期分别展示每日 Top 5。\\n3. 成本：新增评分缓存，页面仍展示近 5 日，但模型只处理新增或发生变化的论文，减少重复 token 消耗。\\n4. 类型：加强文章类型识别，Spotlight、Forum、Comment、Perspective 等栏目不再按 Research Article 处理。\\n5. 页面：标题优先使用英文论文题名；标签压缩为年份、期刊/来源、文章类型和少量主题；参考文献只显示作者与 DOI；全部动态用一句话介绍并可就地展开详细摘要。"
  },
  {
    version: "2026-06-05",
    date: "今日更新",
    title: "Paper Daily 原型上线",
    body:
      "1. 页面：建立日报、全部动态、信源页和更新日志。\\n2. 信源：支持综合期刊和专业期刊 RSS 分类。\\n3. 推荐：按信源、主题和论文类型计算质量分，并支持 like/不喜欢反馈。"
  }
];

const page = document.body.dataset.page || "updates";
const root = document.querySelector("#pageContent");
const PUBLIC_JOURNAL_RSS_TYPES = new Set(["topJournal", "reviewJournal", "professionalJournal"]);

function publicJournalRssPaper(item = {}) {
  const sourceSignals = (item.sourceSignals || []).filter((signal) =>
    PUBLIC_JOURNAL_RSS_TYPES.has(signal?.type)
  );
  if (!sourceSignals.length) return null;
  return {
    ...item,
    sourceSignals,
    sourceType: sourceSignals.some((signal) => signal.type === "professionalJournal")
      ? "professional"
      : "comprehensive",
    sourceUrls: (item.sourceUrls || []).filter(
      (source) => !/mp\.weixin\.qq\.com|wechat|微信公众号/i.test(`${source?.url || ""} ${source?.label || ""}`)
    )
  };
}

function publicJournalRssConfig(item = {}) {
  const hasFeed = Boolean(item.feedUrl || (Array.isArray(item.feedUrls) && item.feedUrls.length));
  return PUBLIC_JOURNAL_RSS_TYPES.has(item.type) && hasFeed;
}

papers.splice(0, papers.length, ...papers.map(publicJournalRssPaper).filter(Boolean));
const dynamicPapers = [];
let activeFeedFilter = "all";
const DEFAULT_RECENT_DAYS = 7;
const DAILY_RECOMMEND_RATIO = 0.1;
const DAILY_RECOMMEND_MAX = 5;
const RANKING_SYSTEM = "theme_journal_layered_daily_v2";
const THEME_SCORE_100_SYSTEMS = [
  "theme_journal_layered_v1",
  "theme_journal_layered_v2",
  "theme_journal_research_profile_v3"
];
const JOURNAL_SCORE_100_SYSTEMS = [
  "theme_journal_quality_v4",
  "theme_journal_layered_v1",
  "theme_journal_layered_v2",
  "theme_journal_research_profile_v3"
];
const LAYERED_TYPE_SCORE_SYSTEMS = [
  "theme_journal_quality_v2",
  "theme_journal_quality_v3",
  "theme_journal_quality_v4",
  "theme_journal_layered_v1",
  "theme_journal_layered_v2",
  "theme_journal_research_profile_v3"
];
const DAILY_RELATED_THEME_MIN = 45;
const DAILY_STRONG_THEME_MIN = 65;
const DAILY_CORE_THEME_MIN = 80;
const DAILY_RELATED_JOURNAL_MIN = 82;
const DAILY_STRONG_JOURNAL_MIN = 62;
const DAILY_CORE_JOURNAL_MIN = 62;
const DAILY_EXCEPTIONAL_B3_THEME_MIN = 92;
const DAILY_EXCEPTIONAL_B3_JOURNAL_MIN = 52;
let latestDataMeta = {
  generatedAt: "",
  lookbackDays: DEFAULT_RECENT_DAYS,
  dailySelectionApplied: false
};
let journalGradeOverrides = new Map();

function recentDays() {
  const days = Number(latestDataMeta.lookbackDays || DEFAULT_RECENT_DAYS);
  return Number.isFinite(days) && days > 0 ? Math.round(days) : DEFAULT_RECENT_DAYS;
}

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

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanReaderNoise(value = "") {
  return cleanDisplayText(value)
    .replace(
      /在小说阅读器读本章|去阅读|在小说阅读器中沉浸阅读|点击蓝字，?关注我们|欢迎点击上方名片关注|继续滑动看下一个|向上滑动看下一个|打开此内容|使用完整服务|微信扫一扫|轻点两下取消赞|取消 允许|视频 小程序|分享 留言 收藏 听过|预览时标签不可点/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function truncateDisplayText(value = "", limit = 320) {
  const text = cleanReaderNoise(value);
  if (text.length <= limit) return text;
  const boundary = Math.max(
    text.lastIndexOf("。", limit),
    text.lastIndexOf("；", limit),
    text.lastIndexOf("，", limit),
    text.lastIndexOf(".", limit),
    text.lastIndexOf(";", limit),
    text.lastIndexOf(",", limit)
  );
  const sliced = text.slice(0, boundary > 80 ? boundary + 1 : limit).trim();
  return /[。！？.!?]$/.test(sliced) ? sliced : `${sliced}。`;
}

function compactDisplaySummary(value = "", limit = 320) {
  const text = cleanReaderNoise(value);
  if (text.length <= limit) return text;
  const sentences = text
    .split(/(?<=[。！？!?])\s*/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 12)
    .filter((sentence) => !/原创|作者|公众号|关注|扫码|二维码|加群|菜单栏|小说阅读器|小程序|点赞|转发|留言|收藏|广告|课程|报名|会议|招聘/.test(sentence));
  const research = sentences.filter((sentence) =>
    /研究|结果|发现|表明|显示|揭示|基于|利用|分析|模拟|评估|提出|数据|模型|机制|影响|变化|study|result|show|reveal|using|based/i.test(sentence)
  );
  const pool = research.length ? research : sentences;
  let summary = "";
  for (const sentence of pool) {
    if ((summary + sentence).length > limit && summary.length >= 80) break;
    summary += sentence;
    if (summary.length >= 180) break;
  }
  return truncateDisplayText(summary || text, limit);
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
  const quotedEnglish = text.match(/[“"《]\s*([A-Z][A-Za-z0-9,;:'’()\-–—&/ ]{24,220})\s*[”"》]/);
  if (quotedEnglish?.[1] && /[a-z]/.test(quotedEnglish[1]) && /\s/.test(quotedEnglish[1])) {
    return quotedEnglish[1].replace(/\s+/g, " ").trim();
  }
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

function isEnglishPaperTitle(value = "") {
  const text = cleanDisplayText(value);
  if (text.length < 18) return false;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  return latin > 18 && latin > cjk * 4 && /\s/.test(text);
}

function displayTitle(paper) {
  const candidates = [
    paper.originalTitle,
    paper.rawTitle,
    inferTitleFromText(`${paper.abstract || ""} ${paper.summary || ""}`, paper.source, paper.doi),
    paper.title
  ];
  const english = candidates.find(isEnglishPaperTitle);
  return cleanDisplayText(english || paper.title || "");
}

function normalizePaperUrl(url = "", doi = "") {
  const fallback = doi ? `https://doi.org/${doi}` : "#";
  if (!url || /\.(rss|xml|atom)($|\?)/i.test(url) || /\/rss\/|feed=rss|current\.rss/i.test(url)) {
    return fallback;
  }
  const cleaned = cleanDisplayText(url);
  try {
    const parsed = new URL(cleaned, window.location.href);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : fallback;
  } catch {
    return fallback;
  }
}

const journalAliases = [
  ["Advanced Functional Materials", /\bAdvanced Functional Materials\b/i],
  ["Agricultural and Forest Meteorology", /\bAgricultural\s+(?:and|&)\s+Forest Meteorology\b/i],
  ["Current Biology", /\bCurrent Biology\b/i],
  ["The Innovation", /\bThe Innovation\b/i],
  ["Trends in Ecology & Evolution", /\bTrends in Ecology\s*(?:&|and)\s*Evolution\b/i],
  ["Nature Ecology & Evolution", /\bNature Ecology\s*&\s*Evolution\b/i],
  ["Nature Reviews Biodiversity", /\bNature Reviews Biodiversity\b|\bNat\.?\s*Rev\.?\s*Biodivers\.?\b/i],
  ["Nature Reviews Earth & Environment", /\bNature Reviews Earth\s*&\s*Environment\b|\bNat\.?\s*Rev\.?\s*Earth\s*&\s*Environ\.?\b/i],
  ["Nature Reviews Microbiology", /\bNature Reviews Microbiology\b|\bNat\.?\s*Rev\.?\s*Microbiol\.?\b/i],
  ["Nature Reviews Chemistry", /\bNature Reviews Chemistry\b|\bNat\.?\s*Rev\.?\s*Chem\.?\b/i],
  ["Nature Communications", /\bNature Communications\b|《\s*Nature Communications\s*》/i],
  ["Nature Climate Change", /\bNature Climate Change\b/i],
  ["Nature Geoscience", /\bNature Geoscience\b/i],
  ["Nature Food", /\bNature Food\b/i],
  ["Nature Sustainability", /\bNature Sustainability\b/i],
  ["Nature Plants", /\bNature Plants\b/i],
  ["Nature", /《\s*Nature\s*》|\bNature正刊\b|\bNature\s*[:：]|\bNature\s*,\s*(?:\d|published online)/],
  ["Science Advances", /\bScience Advances\b/i],
  ["Science Bulletin", /\bScience Bulletin\b/i],
  ["Frontiers in Plant Science", /\bFrontiers in Plant Science\b|\bFront\.?\s*Plant Sci\.?\b/i],
  ["Science", /《\s*Science\s*》|\bScience正刊\b|\bScience\s*[:：]|\bScience\s*,\s*(?:\d|published online)/],
  ["PNAS Nexus", /\bPNAS Nexus\b/i],
  ["PNAS", /\bPNAS\b/i],
  ["npj Urban Sustainability", /\bnpj\s+Urban Sustainability\b/i],
  ["npj Climate and Atmospheric Science", /\bnpj\s+Climate and Atmospheric Science\b/i],
  ["Journal of Cleaner Production", /\bJournal of Cleaner Production\b|\bJCP\b/i],
  ["Global Change Biology", /\bGlobal Change Biology\b|\bGCB\b/i],
  ["Global Ecology and Biogeography", /\bGlobal Ecology and Biogeography\b|\bGEB\b/i],
  ["Journal of Ecology", /\bJournal of Ecology\b/i],
  ["Journal of Animal Ecology", /\bJournal of Animal Ecology\b/i],
  ["Journal of Applied Ecology", /\bJournal of Applied Ecology\b/i],
  ["Ecology Letters", /\bEcology Letters\b/i],
  ["Ecography", /\bEcography\b/i],
  ["Ecological Applications", /\bEcological Applications\b/i],
  ["Ecological Monographs", /\bEcological Monographs\b/i],
  ["New Phytologist", /\bNew Phytologist\b|\bNew Phytol\b/i],
  ["Plant Physiology", /\bPlant Physiology\b/i],
  ["Remote Sensing of Environment", /\bRemote Sensing of Environment\b|\bRSE\b/i],
  ["ISPRS Journal of Photogrammetry and Remote Sensing", /\bISPRS\b/i],
  ["Earth System Science Data", /\bEarth System Science Data\b|\bESSD\b/i],
  ["Scientific Data", /\bScientific Data\b/i],
  ["Field Crops Research", /\bField Crops Research\b|\bFCR\b/i],
  ["Forest Ecology and Management", /\bForest Ecology and Management\b|\bFEM\b/i],
  ["Soil Biology and Biochemistry", /\bSoil Biology\s*(?:&|and)\s*Biochemistry\b|\bSBB\b/i],
  ["Soil & Tillage Research", /\bSoil\s*&\s*Tillage Research\b|\bSTR\b/i],
  ["Science of the Total Environment", /\bScience of the Total Environment\b|\bSTOTEN\b/i],
  ["Functional Ecology", /\bFunctional Ecology\b/i],
  ["Frontiers in Ecology and the Environment", /\bFrontiers in Ecology and the Environment\b|\bFEE\b/i],
  ["Ecology", /(?:^|[^A-Za-z])Ecology(?:$|[^A-Za-z])/i],
  ["Ecological Indicators", /\bEcological Indicators\b/i],
  ["Ecological Modelling", /\bEcological Modelling\b/i],
  ["Applied Geography", /\bApplied Geography\b/i],
  ["Catena", /\bCatena\b/i],
  ["One Earth", /\bOne Earth\b/i],
  ["Microbiome", /\bMicrobiome\b/i],
  ["Communications Earth & Environment", /\bCommunications Earth\s*&\s*Environment\b/i],
  ["Journal of Environmental Management", /\bJournal of Environmental Management\b/i]
];

let doiJournalPrefixes = [
  ["10.1016/j.agrformet", "Agricultural and Forest Meteorology"],
  ["10.1016/j.tree", "Trends in Ecology & Evolution"],
  ["10.1016/j.cub", "Current Biology"],
  ["10.1016/j.xinn", "The Innovation"],
  ["10.1073/pnas", "PNAS"],
  ["10.1126/science", "Science"],
  ["10.1126/sciadv", "Science Advances"],
  ["10.1016/j.landurbplan", "Landscape and Urban Planning"],
  ["10.1111/ele", "Ecology Letters"],
  ["10.1111/gcb", "Global Change Biology"],
  ["10.1111/1365-2656", "Journal of Animal Ecology"],
  ["10.1111/1365-2664", "Journal of Applied Ecology"],
  ["10.1111/1365-2745", "Journal of Ecology"],
  ["10.1111/1365-2435", "Functional Ecology"],
  ["10.1111/ecog", "Ecography"],
  ["10.1111/geb", "Global Ecology and Biogeography"],
  ["10.1002/ecy", "Ecology"],
  ["10.1002/eap", "Ecological Applications"],
  ["10.1002/ecm", "Ecological Monographs"],
  ["10.1016/j.catena", "Catena"],
  ["10.3389/fpls", "Frontiers in Plant Science"],
  ["10.1002/lno", "Limnology and Oceanography"],
  ["10.1146/annurev-ecolsys", "Annual Review of Ecology, Evolution, and Systematics"]
];

function normalizeDoiJournalPattern(entry = {}) {
  const prefix = String(entry.prefix || "").trim().toLowerCase();
  const journal = cleanDisplayText(entry.journal || "");
  if (!prefix || !journal) return null;
  return [prefix, journal];
}

async function loadDoiJournalPatterns() {
  if (document.body.dataset.edition === "public-rss-only") return;
  try {
    const response = await fetch(`./data/doi-journal-patterns.local.json?v=${Date.now()}`, { cache: "reload" });
    if (!response.ok) throw new Error(`doi-journal-patterns.local.json ${response.status}`);
    const data = await response.json();
    const learned = (data.patterns || []).map(normalizeDoiJournalPattern).filter(Boolean);
    const merged = [...doiJournalPrefixes, ...learned].sort((a, b) => b[0].length - a[0].length);
    const seen = new Set();
    doiJournalPrefixes = merged.filter(([prefix]) => {
      if (seen.has(prefix)) return false;
      seen.add(prefix);
      return true;
    });
  } catch {
    // Keep embedded DOI prefixes for WebView/file loading.
  }
}

function journalNameFromDoi(value = "") {
  const match = String(value || "").match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  if (!match) return "";
  const doi = match[0]
    .replace(/[。；;，,、\s"'<>()[\]{}]+$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
  return doiJournalPrefixes.find(([prefix]) => doi.startsWith(prefix))?.[1] || "";
}

function aliasJournalName(value = "") {
  const alias = journalAliases.find(([, pattern]) => pattern.test(value));
  return alias ? alias[0] : "";
}

function removeTrailingRoundupText(value = "") {
  return cleanDisplayText(value).split(
    /\s*(?:往期推荐|相关阅读|相关论文|延伸阅读|更多阅读|推荐阅读|参考阅读|历史推荐|往期文章|猜你喜欢)\s*[:：]/u
  )[0] || "";
}

function textWindowAroundNeedle(text = "", needle = "", radius = 1200) {
  const cleaned = cleanDisplayText(text);
  const query = cleanDisplayText(needle);
  if (!cleaned || !query) return "";
  const index = cleaned.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return "";
  return cleaned.slice(Math.max(0, index - radius), Math.min(cleaned.length, index + query.length + radius));
}

function sourceLooksLikeTitle(source = "", title = "") {
  const normalizedSource = cleanDisplayText(source).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const normalizedTitle = cleanDisplayText(title).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return normalizedSource.length > 18 && normalizedTitle.includes(normalizedSource);
}

function inferJournalName(item = {}) {
  const title = cleanDisplayText(item.title || item.originalTitle || "");
  const text = removeTrailingRoundupText(`${item.summary || ""} ${item.abstract || ""}`);
  const scopedText =
    textWindowAroundNeedle(text, item.doi || "", 1400) ||
    textWindowAroundNeedle(text, title, 1400) ||
    text.slice(0, 2400);
  const haystack = cleanDisplayText(`${title} ${scopedText}`);
  const doiJournal = journalNameFromDoi(`${item.doi || ""} ${haystack}`);
  const explicitLabel = haystack.match(/(?:期刊|发表期刊|来源期刊)\s*[:：]\s*([A-Z][A-Za-z0-9&.,:'’() /-]{2,120})/i);
  if (explicitLabel) return aliasJournalName(explicitLabel[1]) || explicitLabel[1].replace(/\s+(?:时间|作者|单位|DOI).*$/i, "").trim();
  const publishedIn = haystack.match(/(?:在|于)\s*《?\s*([A-Z][A-Za-z0-9&.,:'’() /-]{2,120})\s*》?\s*(?:上|中)?\s*(?:发表|发文|刊发|上线)/i);
  if (publishedIn) return aliasJournalName(publishedIn[1]) || publishedIn[1].trim();
  const prefix = cleanDisplayText(item.title || "").split(/\s*[|丨:：]\s*/)[0];
  if (/^[A-Za-z][A-Za-z &.\-:]{2,80}$/.test(prefix)) {
    const alias = aliasJournalName(prefix);
    if (alias) return alias;
  }
  return doiJournal || aliasJournalName(haystack);
}

function displayType(type = "") {
  return String(type || "Article")
    .replace(/ResearchArticle/g, "Research Article")
    .replace(/SystematicReview/g, "Systematic Review")
    .replace(/ResearchBriefing/g, "Research Briefing")
    .replace(/NewsAndViews/g, "News & Views")
    .replace(/ResearchHighlight/g, "Research Highlight")
    .replace(/NewsFeature/g, "News Feature")
    .replace(/WorldView/g, "World View")
    .replace(/InDepth/g, "In Depth")
    .replace(/BooksAndCulture/g, "Books & Culture");
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
  const sourceSignals = orderedSourceSignals(item.sourceSignals || []);
  const firstType = sourceSignals[0]?.type;
  const journalSignal = sourceSignals.find((signal) => ["topJournal", "reviewJournal", "professionalJournal", "rss"].includes(signal.type));
  const rawSource = item.journal || sourceSignals[0]?.name || "Unknown source";
  const isWechat = firstType === "wechat";
  const doiJournal = journalNameFromDoi(`${item.doi || ""} ${item.title || ""} ${item.abstract || ""} ${item.summary || ""}`);
  const inferredJournal = isWechat ? inferJournalName(item) : "";
  const sourceAccount = sourceSignals.find((signal) => signal.type === "wechat")?.name || "";
  const rawSourceAlias = aliasJournalName(rawSource);
  const rawSourceIsTitle = sourceLooksLikeTitle(rawSource, item.title || item.originalTitle || "");
  const suppliedJournal =
    isWechat && rawSource && rawSource !== sourceAccount && !rawSourceIsTitle
      ? rawSourceAlias || cleanDisplayText(rawSource)
      : "";
  let primarySource = journalSignal?.name || suppliedJournal || inferredJournal || rawSource;
  if (
    isWechat &&
    inferredJournal &&
    (!suppliedJournal || suppliedJournal !== inferredJournal || /[\u4e00-\u9fff]/.test(suppliedJournal) || rawSourceIsTitle)
  ) {
    primarySource = inferredJournal;
  }
  if (doiJournal && (!primarySource || primarySource === "Unknown source" || (isWechat && rawSourceIsTitle))) {
    primarySource = doiJournal;
  }
  const cleanedSummary = compactDisplaySummary(item.summary || item.abstract || "", 340);
  const cleanedOneLine = compactDisplaySummary(item.oneLine || item.abstract || item.summary || "", 130);
  const title =
    !item.title || item.title.trim().toLowerCase() === rawSource.toLowerCase()
      ? inferTitleFromText(item.abstract || item.summary || "", primarySource, item.doi) || item.title
      : cleanDisplayText(item.title);
  const paperUrl = normalizePaperUrl(item.url, item.doi);
  return {
    id: item.id || item.doi || `generated-${index}`,
    time: item.generatedAt ? item.generatedAt.slice(11, 16) : "00:00",
    date: normalizeDate(item.date, item.generatedAt ? item.generatedAt.slice(0, 10) : ""),
    publishedAt: item.publishedAt || "",
    generatedAt: item.generatedAt || "",
    title,
    rawTitle: item.rawTitle || item.originalTitle || item.title || "",
    originalTitle: item.originalTitle || item.rawTitle || "",
    authors: item.authors || [],
    journal: primarySource,
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
    generatedBreakdown: item.scoreBreakdown,
    dailyRecommendation: item.dailyRecommendation || null,
    journalImpactFactor: item.journalImpactFactor ?? item.impactFactor ?? null,
    resolutionStatus: item.resolutionStatus || "",
    recommendationEligible: item.recommendationEligible !== false,
    metadataEvidence: item.metadataEvidence || {},
    doiEvidence: item.doiEvidence || null,
    paperTypeGroup: item.paperTypeGroup || ""
  };
}

function isRecentPaper(paper) {
  const reference = new Date(latestDataMeta.generatedAt || Date.now());
  const referenceMs = Number.isNaN(reference.getTime()) ? Date.now() : reference.getTime();
  const cutoffMs = referenceMs - recentDays() * 24 * 60 * 60 * 1000;
  const value = paper.publishedAt || paper.date || paper.generatedAt;
  if (!value) return true;
  let paperMs;
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split("-").map(Number);
    paperMs = new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
  } else {
    const date = new Date(value);
    paperMs = Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
  if (!paperMs) return true;
  return paperMs >= cutoffMs && paperMs <= referenceMs + 60 * 1000;
}

function recentPapers() {
  return papers.filter(isRecentPaper);
}

function feedPapers() {
  return [...papers, ...dynamicPapers];
}

function recentFeedPapers() {
  return feedPapers().filter(isRecentPaper);
}

function dateKeyForPaper(paper) {
  return paper.date || "undated";
}

function dateLabel(date) {
  return date === "undated" ? "未标日期" : date;
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
      entries: [...entries].sort(rankPapers)
    }));
}

function rankPapers(a = {}, b = {}) {
  const aScored = a.recommendationEligible !== false && (a.generatedScore != null || a.score != null || a.generatedBreakdown);
  const bScored = b.recommendationEligible !== false && (b.generatedScore != null || b.score != null || b.generatedBreakdown);
  const aProfile = dailyRecommendationProfile(a);
  const bProfile = dailyRecommendationProfile(b);
  return (
    Number(bScored) - Number(aScored) ||
    Number(bProfile.eligible) - Number(aProfile.eligible) ||
    Number(bProfile.themeTierRank || 0) - Number(aProfile.themeTierRank || 0) ||
    themeScore(b) - themeScore(a) ||
    Number(bProfile.journalTierRank || 0) - Number(aProfile.journalTierRank || 0) ||
    journalScore(b) - journalScore(a) ||
    typeScore(b) - typeScore(a) ||
    impactFactorValue(b) - impactFactorValue(a) ||
    sourceScore(b) - sourceScore(a) ||
    recentTimeForSort(b) - recentTimeForSort(a) ||
    adjustedScore(b) - adjustedScore(a) ||
    String(a.title || "").localeCompare(String(b.title || ""), "en")
  );
}

async function loadGeneratedData() {
  const applyGeneratedData = (data) => {
    const selectedItems = (Array.isArray(data?.items) ? data.items : [])
      .map(publicJournalRssPaper)
      .filter(Boolean);
    const dynamicItems = (Array.isArray(data?.dynamicItems) ? data.dynamicItems : [])
      .map(publicJournalRssPaper)
      .filter(Boolean);
    if (!selectedItems.length && !dynamicItems.length) return false;
    latestDataMeta = {
      generatedAt: data.generatedAt || "",
      lookbackDays: Number(data.lookbackDays || DEFAULT_RECENT_DAYS),
      dailySelectionApplied: Boolean(data.dailySelectionApplied)
    };
    papers.splice(0, papers.length, ...selectedItems.map(normalizeGeneratedItem));
    dynamicPapers.splice(0, dynamicPapers.length, ...dynamicItems.map(normalizeGeneratedItem));
    return true;
  };

  try {
    const response = await fetch(`./data/latest.json?v=${Date.now()}`, { cache: "reload" });
    if (!response.ok) throw new Error(`latest.json ${response.status}`);
    const data = await response.json();
    if (applyGeneratedData(data)) return;
  } catch {
    // Fall back to the script-injected data below.
  }

  applyGeneratedData(globalThis.PAPER_DAILY_LATEST);
}

function displayScoreForSubgrade(subgrade = "") {
  return {
    A1: 97,
    A2: 90,
    A3: 82,
    B1: 72,
    B2: 62,
    B3: 52,
    C: 35,
    C1: 35,
    C2: 18
  }[String(subgrade || "").toUpperCase()] || 0;
}

function normalizeJournalGradeEntry(item = {}) {
  const title = item.title || item.name || "";
  const key = normalizeSignalText(title);
  const subgrade = String(item.subgrade || "").toUpperCase();
  const displayScore = Number(item.displayScore || displayScoreForSubgrade(subgrade));
  if (!key || !subgrade || !displayScore) return null;
  return {
    key,
    title,
    subgrade,
    tier: item.tier || "",
    label: item.label || subgrade,
    partitionScore: Number(item.partitionScore || 0),
    displayScore,
    notes: item.notes || ""
  };
}

function journalGradeMapFromItems(items = []) {
  return new Map(
    (items || [])
      .map(normalizeJournalGradeEntry)
      .filter(Boolean)
      .map((entry) => [entry.key, entry])
  );
}

async function loadJournalGradeOverrides() {
  journalGradeOverrides = journalGradeMapFromItems(embeddedJournalGrades);
  try {
    const response = await fetch(`./config/journal-grades.json?v=${Date.now()}`, { cache: "reload" });
    if (!response.ok) throw new Error(`journal-grades.json ${response.status}`);
    const data = await response.json();
    const loaded = journalGradeMapFromItems(data.journals || []);
    if (loaded.size) journalGradeOverrides = loaded;
  } catch {
    // Keep embedded fallback grades for WebView/file loading.
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
      const base = Number(initialThemeWeights[tag] || 0);
      const stat = feedbackStatsByTopic()[tag];
      if (!stat || stat.count < 3) return [tag, base];
      return [tag, clamp(base + Math.round(stat.total / stat.count), -3, 3)];
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
  if (paper.generatedBreakdown?.source != null) {
    return clamp(Number(paper.generatedBreakdown.source || 0), 0, 10);
  }
  const signals = dedupeSourceSignals(paper.sourceSignals || []);
  const sourceWeight = signals.length
    ? Math.max(...signals.map((signal) => sourceQualityForSignal(signal)))
    : 0;
  const base = Math.min(sourceWeight, 3);
  const wechatCount = signals.filter((signal) => signal.type === "wechat").length;
  const distinctNames = new Set(signals.map((signal) => `${signal.type || ""}:${normalizeSignalText(signal.name || signal.url || "")}`)).size;
  const crossSourceTypes = new Set(signals.map((signal) => signal.type || "")).size;
  const repeatBoost = Math.min(Math.max(distinctNames - 1, 0) * 1.2, 3);
  const crossTypeBoost = Math.min(Math.max(crossSourceTypes - 1, 0) * 1.5, 3);
  const wechatBoost = Math.min(Math.max(wechatCount - 1, 0) * 0.8, 2);
  return clamp(Math.round((base + repeatBoost + crossTypeBoost + wechatBoost) * 10) / 10, 0, 10);
}

function normalizedJournalName(paper = {}) {
  const journalSignal = paper.sourceSignals?.find((signal) => ["topJournal", "reviewJournal", "professionalJournal", "rss"].includes(signal.type))?.name;
  return normalizeSignalText(journalSignal || paper.journal || paper.inferredJournal || paper.originalSource || paper.source || journalNameFromDoi(paper.doi || "") || "");
}

function journalGradeOverrideByName(value = "") {
  const key = normalizeSignalText(value);
  return key ? journalGradeOverrides.get(key) || null : null;
}

function journalGradeOverrideForPaper(paper = {}) {
  const doiJournal = journalNameFromDoi(paper.doi || "");
  const candidates = [
    paper.sourceSignals?.find((signal) => ["topJournal", "reviewJournal", "professionalJournal", "rss"].includes(signal.type))?.name,
    paper.journal,
    paper.inferredJournal,
    paper.originalSource,
    paper.source,
    doiJournal
  ].filter(Boolean);
  for (const value of candidates) {
    const override = journalGradeOverrideByName(value);
    if (override) return override;
  }
  return null;
}

function isNatureScienceJournal(paper = {}) {
  return ["nature", "science"].includes(normalizedJournalName(paper));
}

function isNatureIndexFallbackJournal(paper = {}) {
  const journal = normalizedJournalName(paper);
  return [
    "advanced functional materials",
    "applied energy",
    "cities",
    "current biology",
    "ecology letters",
    "environmental pollution",
    "environmental research",
    "environmental science and technology",
    "journal of cleaner production",
    "nature climate change",
    "nature communications",
    "nature geoscience",
    "nature sustainability",
    "pnas",
    "proceedings of the national academy of sciences of the united states of america",
    "science advances",
    "sustainable cities and society",
    "the isme journal",
    "the isme journal multidisciplinary journal of microbial ecology",
    "water research"
  ].includes(journal);
}

function impactFactorValue(paper = {}) {
  const impact = Number(paper.journalImpactFactor ?? paper.impactFactor ?? 0);
  return Number.isFinite(impact) && impact > 0 ? impact : 0;
}

function sourceQualityForSignal(signal = {}) {
  const name = normalizeSignalText(signal.name || "");
  if (name === "science advances") return 4;
  return sourceQualityScores[signal.type] || 0;
}

function normalizeSignalText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sourceSignalKey(signal) {
  const type = signal.type || "";
  const name = normalizeSignalText(signal.name || "");
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
  return signals.filter((signal) => {
    const key = sourceSignalKey(signal);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function orderedSourceSignals(signals = []) {
  return dedupeSourceSignals(signals)
    .map((signal, index) => ({ signal, index }))
    .sort((a, b) => sourceSignalPriority(a.signal) - sourceSignalPriority(b.signal) || a.index - b.index)
    .map((item) => item.signal);
}

function themeScore(paper) {
  if (paper.generatedBreakdown?.theme != null) {
    const theme = Number(paper.generatedBreakdown.theme || 0);
    if (THEME_SCORE_100_SYSTEMS.includes(paper.generatedBreakdown?.scoringSystem)) {
      return clamp(Math.round(theme), 0, 100);
    }
    if (["theme_journal_quality_v2", "theme_journal_quality_v3", "theme_journal_quality_v4"].includes(paper.generatedBreakdown?.scoringSystem)) {
      return clamp(Math.round((theme * 100) / 55), 0, 100);
    }
    return clamp(Math.round((theme * 100) / (paper.generatedBreakdown?.type == null ? 50 : 43)), 0, 100);
  }
  if (!paper.tags.length) return 0;
  const themeWeights = getThemeWeights();
  const initialScore = 78;
  const multiTopicBonus = Math.min(Math.max(paper.tags.length - 1, 0) * 4, 9);
  const preferenceBonus = paper.tags.reduce(
    (sum, tag) => sum + Number(themeWeights[tag] || 0) * 3,
    0
  );
  return clamp(Math.round(initialScore + multiTopicBonus + preferenceBonus), 0, 100);
}

function journalScore(paper) {
  const manualGrade = journalGradeOverrideForPaper(paper);
  if (manualGrade) {
    return clamp(Math.round((manualGrade.displayScore + typeAdjustment(paper)) * 10) / 10, 0, 100);
  }
  if (
    paper.generatedBreakdown?.journal != null &&
    ["theme_journal_quality_v2", "theme_journal_quality_v3"].includes(paper.generatedBreakdown?.scoringSystem)
  ) {
    return clamp(Math.round((Number(paper.generatedBreakdown.journal || 0) * 100) / 45), 0, 100);
  }
  if (
    paper.generatedBreakdown?.journal != null &&
    JOURNAL_SCORE_100_SYSTEMS.includes(paper.generatedBreakdown?.scoringSystem)
  ) {
    return clamp(Number(paper.generatedBreakdown.journal || 0), 0, 100);
  }
  if (paper.generatedBreakdown?.journal != null) {
    return journalQualityFromPartition(Number(paper.generatedBreakdown.journal || 0), paper);
  }
  const journal = normalizedJournalName(paper);
  let partition = 0;
  if (["nature", "science"].includes(journal)) partition = 25;
  else if (/review|annual|trends/.test(journal) || journal === "biological reviews") partition = 23.5;
  else if ([
    "science advances",
    "pnas",
    "proceedings of the national academy of sciences of the united states of america",
    "pnas nexus",
    "one earth",
    "national science review",
    "nature communications",
    "current biology",
    "the innovation",
    "science bulletin",
    "nature plants",
    "nature food",
    "earth system science data",
    "new phytologist",
    "remote sensing of environment"
  ].includes(journal) || journal.startsWith("nature ")) partition = 22;
  else if (isNatureIndexFallbackJournal(paper)) partition = 18;
  return journalQualityFromPartition(partition, paper);
}

function journalQualityFromPartition(partitionScore = 0, paper = {}) {
  const score = Number(partitionScore || 0);
  let base = 0;
  if (score >= 25) base = 97;
  else if (score >= 23.5) base = 90;
  else if (score >= 22) base = 82;
  else if (score >= 18) base = 72;
  else if (score >= 15) base = 62;
  else if (score >= 12) base = 52;
  else if (score >= 10) base = 35;
  else if (score >= 5) base = 18;
  if (base <= 0) return 0;
  return clamp(Math.round((base + typeAdjustment(paper)) * 10) / 10, 0, 100);
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
  if (/commentary|comment|perspective|opinion|editorial|correspondence|forum|spotlight|research\s*briefing|briefing|news|view|highlight|in[-\s]?depth|career|books?|culture|podcast|video|观点|评论|通讯|来信|社论|新闻|深度|职业/.test(text)) {
    return "commentary";
  }
  if (/research article|original research|originalpaper|original paper|brief communication|report|研究论文|原创研究|论文/.test(text)) {
    return "research";
  }
  if (text === "article") return "research";
  return "other";
}

function typeScore(paper = {}) {
  if (
    paper.generatedBreakdown?.type != null &&
    LAYERED_TYPE_SCORE_SYSTEMS.includes(paper.generatedBreakdown?.scoringSystem)
  ) {
    return Number(paper.generatedBreakdown.type || 0);
  }
  if (paper.generatedBreakdown?.type != null) {
    const legacy = Number(paper.generatedBreakdown.type || 0);
    if (legacy >= 12) return 3;
    if (legacy >= 10) return 2;
    if (legacy >= 8) return 1;
    return 0;
  }
  const group = paper.paperTypeGroup || articleTypeGroup(paper.type || paper.paperType || "");
  if (group === "review") return 3;
  if (group === "research") return 2;
  if (group === "data") return 1;
  return 0;
}

function typeAdjustment(paper = {}) {
  return typeScore(paper);
}

function scoreBreakdown(paper) {
  return {
    scoringSystem: "theme_journal_layered_v2",
    source: sourceScore(paper),
    theme: themeScore(paper),
    journal: journalScore(paper),
    type: typeScore(paper),
    themeRaw: paper.generatedBreakdown?.themeRaw,
    themeCap: paper.generatedBreakdown?.themeCap,
    themeCapReason: paper.generatedBreakdown?.themeCapReason,
    themeDimensions: paper.generatedBreakdown?.themeDimensions,
    themeDimensionCount: paper.generatedBreakdown?.themeDimensionCount
  };
}

function adjustedScore(paper) {
  const score = scoreBreakdown(paper);
  return clamp(score.theme, 0, 100);
}

function themeTier(theme = 0) {
  const score = Number(theme || 0);
  if (score >= 80) return { rank: 4, key: "core" };
  if (score >= 65) return { rank: 3, key: "strong" };
  if (score >= 45) return { rank: 2, key: "related" };
  if (score >= 25) return { rank: 1, key: "weak" };
  return { rank: 0, key: "irrelevant" };
}

function journalTier(journal = 0) {
  const score = Number(journal || 0);
  if (score >= 97) return { rank: 8, key: "a1" };
  if (score >= 90) return { rank: 7, key: "a2" };
  if (score >= 82) return { rank: 6, key: "a3" };
  if (score >= 72) return { rank: 5, key: "b1" };
  if (score >= 62) return { rank: 4, key: "b2" };
  if (score >= 52) return { rank: 3, key: "b3" };
  if (score >= 35) return { rank: 2, key: "c" };
  return { rank: 0, key: "unknown" };
}

function dailyRecommendationProfile(paper = {}) {
  if (paper.dailyRecommendation?.rankingSystem === RANKING_SYSTEM) {
    return paper.dailyRecommendation;
  }
  const score = scoreBreakdown(paper);
  const theme = Number(score.theme || 0);
  const journal = Number(score.journal || 0);
  const themeLevel = themeTier(theme);
  const journalLevel = journalTier(journal);
  const scoreable = paper.recommendationEligible !== false && (paper.generatedScore != null || paper.score != null || paper.generatedBreakdown);
  const dimensions = score.themeDimensions || paper.scoreBreakdown?.themeDimensions || {};
  const dimensionCount = Number(score.themeDimensionCount ?? paper.scoreBreakdown?.themeDimensionCount ?? 0);
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
    type: Number(score.type || 0),
    source: Number(score.source || 0),
    themeTier: themeLevel.key,
    themeTierRank: themeLevel.rank,
    journalTier: journalLevel.key,
    journalTierRank: journalLevel.rank
  };
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
  if (latestDataMeta.dailySelectionApplied) {
    return new Set(recentPapers().map((paper) => paper.id));
  }
  const ids = new Set();
  groupPapersByDate(recentPapers()).forEach((group) => {
    dailyRecommendedEntries(group.entries).forEach((paper) => ids.add(paper.id));
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

function sourceOriginTag(paper) {
  const signals = orderedSourceSignals(paper.sourceSignals || []);
  if (signals.some((signal) => ["topJournal", "reviewJournal", "professionalJournal"].includes(signal.type))) {
    return "RSS";
  }
  if (signals.some((signal) => signal.type === "scienceDaily" || signal.type === "natureScienceNews")) {
    return "新闻报道";
  }
  if (signals.some((signal) => signal.type === "wechat")) return "微信公众号";
  if (paper.sourceType === "news") return "新闻报道";
  if (signals.length) return "RSS";
  return "";
}

function formatImpactFactor(value) {
  const impact = Number(value);
  if (!Number.isFinite(impact) || impact <= 0) return "";
  return `IF=${impact.toFixed(3).replace(/\.?0+$/, "")}`;
}

function formatScoreValue(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return "";
  return Number.isInteger(score) ? String(score) : score.toFixed(1).replace(/\.?0+$/, "");
}

function journalGradeTag(paper) {
  const score = journalScore(paper);
  const tier = journalTier(score);
  if (!score || tier.key === "unknown") return "";
  return `${tier.key.toUpperCase()}/${formatScoreValue(score)}`;
}

function journalGradeOnlyTag(paper) {
  const score = journalScore(paper);
  const tier = journalTier(score);
  if (!score || tier.key === "unknown") return "";
  return tier.key.toUpperCase();
}

function paperMetaTags(paper) {
  const year = (paper.date || "").slice(0, 4);
  const labels = [
    paper.source,
    journalGradeTag(paper),
    formatImpactFactor(paper.journalImpactFactor),
    paper.type,
    ...(paper.tags || []).slice(0, 5).map((tag) => topicLabels[tag] || tag),
    sourceOriginTag(paper),
    year
  ];
  return [...new Set(labels.filter(Boolean))];
}

function referenceBlock(paper, options = {}) {
  const authors = referenceAuthors(paper);
  const sourceMarkup = options.showSource ? sourceInline(paper, "reference-source") : "";
  if (options.inline) {
    const chunks = [
      authors ? `<span>${authors}</span>` : "",
      paper.doi ? `<span>DOI: ${paper.doi}</span>` : "",
      sourceMarkup
    ].filter(Boolean);
    if (!chunks.length) return "";
    return `
      <div class="reference-block reference-inline">
        <div class="reference-text">
          <p class="reference-line">${chunks.join('<span class="reference-sep"> · </span>')}</p>
        </div>
      </div>
    `;
  }
  if (!authors && !paper.doi) return "";
  return `
    <div class="reference-block">
      <div class="reference-text">
        ${authors ? `<p>${authors}</p>` : ""}
        ${paper.doi ? `<div class="doi-line">DOI: ${paper.doi}</div>` : ""}
      </div>
    </div>
  `;
}

function sourceLinks(paper) {
  const links = (paper.sourceUrls || [])
    .filter((item) => item.url && item.url !== "#")
    .map((item) => ({ label: cleanDisplayText(item.label), url: normalizePaperUrl(item.url, paper.doi) }))
    .filter((item) => item.url && item.url !== "#");
  if (paper.paperUrl && paper.paperUrl !== "#" && !links.some((item) => item.url === paper.paperUrl)) {
    links.unshift({ label: cleanDisplayText(paper.source || "来源"), url: normalizePaperUrl(paper.paperUrl, paper.doi) });
  }
  return links;
}

function sourceDetails(paper, extraClass = "") {
  const signals = orderedSourceSignals(paper.sourceSignals || []);
  const links = sourceLinks(paper);
  if (!links.length && !signals.length) return "";
  return `
    <details class="source-fold source-inline ${extraClass}">
      <summary>来源 ${links.length || signals.length}</summary>
      <div class="source-signal-list">
        ${links
          .map((item) => `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`)
          .join("")}
        ${!links.length ? signals.map((signal) => `<span>${sourceSignalLabel(signal.type || signal)}</span>`).join("") : ""}
      </div>
    </details>
  `;
}

function sourceItemsMarkup(paper) {
  const signals = orderedSourceSignals(paper.sourceSignals || []);
  const links = sourceLinks(paper);
  return {
    count: links.length || signals.length,
    body: links.length
      ? links
          .map((item) => `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`)
          .join("")
      : signals.map((signal) => `<span>${sourceSignalLabel(signal.type || signal)}</span>`).join("")
  };
}

function sourceInline(paper, extraClass = "") {
  const sourceItems = sourceItemsMarkup(paper);
  if (!sourceItems.count) return "";
  return `
    <span class="source-inline-pop ${extraClass}">
      <button type="button" class="source-inline-button" data-source-inline aria-expanded="false">来源 ${sourceItems.count}</button>
      <span class="source-inline-list" hidden>${sourceItems.body}</span>
    </span>
  `;
}

function toggleSourceInline(button) {
  const wrapper = button.closest(".source-inline-pop");
  const list = wrapper?.querySelector(".source-inline-list");
  if (!wrapper || !list) return;
  const isOpen = wrapper.classList.toggle("is-open");
  list.hidden = !isOpen;
  button.setAttribute("aria-expanded", String(isOpen));
}

function scoreClass(score) {
  if (score < 45) return "score-low";
  if (score < 65) return "score-mid";
  if (score < 80) return "score-high";
  return "score-top";
}

function scoreBadge(score) {
  const label = formatScoreValue(score);
  return `<div class="score ${scoreClass(score)}" aria-label="主题分 ${label}">${label}</div>`;
}

function detailBlock(paper, mode = "block") {
  return `
    <details class="research-details ${mode === "inline" ? "inline-detail" : ""}">
      <summary>详细</summary>
      <div class="detail-text">${paper.summary || paper.oneLine || ""}</div>
    </details>
  `;
}

function paperCard(paper, options = {}) {
  const score = adjustedScore(paper);
  const showOneLine = options.showOneLine !== false;
  const feedback = options.showFeedback ? getFeedback() : null;
  const title = displayTitle(paper);
  const sourceMarkup = sourceInline(paper, "desc-source");
  return `
    <article class="card paper">
      <div class="paper-top">
        <div>
          <h2><a href="${paper.paperUrl}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
          <div class="tag-row">
            ${paperMetaTags(paper).map((label) => `<span class="tag">${label}</span>`).join("")}
          </div>
        </div>
        <div class="paper-side">
          ${scoreBadge(score)}
          ${options.showFeedback ? feedbackControls(paper, feedback) : ""}
        </div>
      </div>
      ${
        showOneLine
          ? `<div class="paper-desc">${paper.oneLine} ${detailBlock(paper, "inline")} ${sourceMarkup}</div>`
          : `<div class="paper-desc">${paper.summary} ${sourceMarkup}</div>`
      }
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
  const pool = recentFeedPapers();
  root.innerHTML = `
    ${renderHead(
      "全部动态",
      `近 ${recentDays()} 日 · ${pool.length} candidates · 手动更新`,
      '<button class="btn" id="exportFeedback">导出反馈</button>'
    )}
    <section class="theme-panel card" id="themePanel"></section>
    <div class="tabs">
      <button class="tab active" data-filter="all">全部</button>
      <button class="tab" data-filter="comprehensive">综合/综述期刊</button>
      <button class="tab" data-filter="professional">专业期刊</button>
    </div>
    <section class="grid" id="feed"></section>
  `;
  bindFeed();
}

function renderFeed(filter = activeFeedFilter) {
  activeFeedFilter = filter;
  const pool = recentFeedPapers();
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
      const renderItem = (paper) => {
        const isScored = paper.recommendationEligible !== false && paper.generatedScore != null;
        return `
        <article class="card feed-item ${recommended.has(paper.id) ? "is-recommended" : ""}">
          <div class="feed-main">
            <div class="paper-top">
              <div>
                <div class="feed-title">
                  <span class="feed-title-copy">
                    ${recommended.has(paper.id) ? `<span class="recommended-badge">已推荐</span>` : ""}
                    <a href="${paper.paperUrl}" target="_blank" rel="noopener noreferrer">${displayTitle(paper)}</a>
                  </span>
                </div>
              </div>
              ${isScored ? `<div class="paper-side">${scoreBadge(adjustedScore(paper))}${feedbackControls(paper, feedback)}</div>` : ""}
            </div>
            <div class="feed-desc">${paper.oneLine} ${detailBlock(paper, "inline")}</div>
            <div class="tag-row feed-tags">
              ${paperMetaTags(paper)
                .map((label) => `<span class="tag">${label}</span>`)
                .join("")}
            </div>
            ${referenceBlock(paper, { inline: true, showSource: true })}
          </div>
        </article>
      `;
      };
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
  const pool = recentFeedPapers();
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
    .slice(0, recentDays())
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
      <span>近 ${recentDays()} 日 ${pool.length} 条动态</span>
    </div>
    <div class="theme-summary">
      ${dailyStats.join("<br />")}
    </div>
  `;
}

function feedbackConfig() {
  const feedback = getFeedback();
  return {
    weights: initialThemeWeights,
    preferenceProfile: topicPreferenceProfile,
    watchlistBonusMax: 6,
    watchlist: [],
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

function dailyRecommendedEntries(entries = []) {
  const eligible = entries
    .filter((paper) => dailyRecommendationProfile(paper).eligible)
    .sort(rankPapers);
  const limit = Math.min(DAILY_RECOMMEND_MAX, Math.ceil(entries.length * DAILY_RECOMMEND_RATIO));
  return limit > 0 ? eligible.slice(0, limit) : [];
}

function dailySectionGroups() {
  if (latestDataMeta.dailySelectionApplied) {
    const selectedByDate = new Map(
      groupPapersByDate(recentPapers()).map((group) => [group.date, group.entries])
    );
    return groupPapersByDate(recentFeedPapers()).map((group) => ({
      date: group.date,
      totalEntries: group.entries.length,
      entries: selectedByDate.get(group.date) || []
    }));
  }

  return groupPapersByDate(recentFeedPapers()).map((group) => ({
    ...group,
    totalEntries: group.entries.length,
    entries: dailyRecommendedEntries(group.entries)
  }));
}

function saveTextFile(filename, content, type = "text/plain") {
  const nativeSave = window.webkit?.messageHandlers?.paperDailySaveFile;
  if (nativeSave) {
    nativeSave.postMessage({ filename, content });
    return;
  }
  const blob = new Blob([content], {
    type: `${type};charset=utf-8`
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadJson(filename, data) {
  saveTextFile(filename, `${JSON.stringify(data, null, 2)}\n`, "application/json");
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
    const sourceButton = event.target.closest("[data-source-inline]");
    if (sourceButton) {
      toggleSourceInline(sourceButton);
      return;
    }
    const button = event.target.closest("[data-feedback]");
    if (!button) return;
    setFeedback(button.dataset.paper, button.dataset.feedback);
    refreshFeedbackControls(button.dataset.paper);
  });
  renderFeed();
}

function renderDaily() {
  const groups = dailySectionGroups();
  const dailySections = groups.length
    ? groups
        .map(
          (group) => `
            <section class="date-section">
              <div class="date-heading">
                <strong>${dateLabel(group.date)}</strong>
                <span>${
                  group.entries.length
                    ? latestDataMeta.dailySelectionApplied
                      ? `推荐 ${group.entries.length}`
                      : `推荐 ${group.entries.length}/${group.totalEntries}`
                    : "今日休息"
                }</span>
              </div>
              <div class="grid">${
                group.entries.length
                  ? group.entries.map((paper) => paperCard(paper, { showFeedback: true })).join("")
                  : `<div class="empty-row">今日休息</div>`
              }</div>
            </section>
          `
        )
        .join("")
    : `<div class="empty-row">今日休息</div>`;
  root.innerHTML = `
    ${renderHead("日报", `近 ${recentDays()} 日 · 每日 top 10% · 最多 ${DAILY_RECOMMEND_MAX} 篇`, '<button class="btn" id="exportFeedback">导出反馈</button>')}
    <section class="grid" id="dailyList">
      ${dailySections}
    </section>
  `;
  document.querySelector("#exportFeedback").addEventListener("click", () => {
    downloadJson("topic-feedback.json", feedbackConfig());
  });
  document.querySelector("#dailyList").addEventListener("click", (event) => {
    const sourceButton = event.target.closest("[data-source-inline]");
    if (sourceButton) {
      toggleSourceInline(sourceButton);
      return;
    }
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
  if (/review|annual|trends/.test(key)) return { category: "comprehensive", type: "reviewJournal" };
  if (item.category === "news") return { category: "news", type: item.type || "natureScienceNews" };
  if (item.category === "comprehensive") return { category: "comprehensive", type: "topJournal" };
  return { category: "professional", type: item.type || "professionalJournal" };
}

function sourceWeightForConfig(item) {
  const key = sourceKey(item);
  const canonical = canonicalSourceFields(item);
  if (canonical.category === "wechat") return 1;
  if (canonical.category === "news") return 2;
  if (key === "science advances") return 4;
  if (canonical.type === "reviewJournal") return 4;
  if (canonical.category === "comprehensive") return 5;
  if (canonical.type === "professionalJournal") return 3;
  return Number(item.weight) || 3;
}

function normalizeSourceConfig(item) {
  const canonical = canonicalSourceFields(item);
  return {
    ...item,
    ...canonical,
    id: item.id || slugify(item.name || item.feedUrl || item.pageUrl || "source"),
    weight: sourceWeightForConfig({ ...item, ...canonical })
  };
}

function journalRatingForSource(item = {}) {
  const canonical = canonicalSourceFields(item);
  const isJournal = ["topJournal", "reviewJournal", "professionalJournal"].includes(item.type || canonical.type);
  if (!isJournal) return null;
  const manualGrade = journalGradeOverrideByName(item.name);
  if (manualGrade) {
    return {
      label: `${manualGrade.subgrade}/${formatScoreValue(manualGrade.displayScore)}`,
      tier: manualGrade.subgrade,
      score: manualGrade.displayScore,
      type: item.type || canonical.type,
      manualOverride: true
    };
  }
  const score = journalScore({ journal: item.name, type: "" });
  const tier = journalTier(score);
  if (!score || tier.key === "unknown") return null;
  return {
    label: `${tier.key.toUpperCase()}/${formatScoreValue(score)}`,
    tier: tier.key.toUpperCase(),
    score,
    type: item.type || canonical.type
  };
}

function sourceConfigRating(item = {}) {
  const journalRating = journalRatingForSource(item);
  return journalRating
    ? {
        label: journalRating.label,
        tier: journalRating.tier,
        score: journalRating.score
      }
    : null;
}

function sourceConfigWithRating(item = {}) {
  return {
    ...item,
    _rating: sourceConfigRating(item)
  };
}

function sourceConfigToDisplay(item) {
  const canonical = canonicalSourceFields(item);
  const isJournal = ["topJournal", "reviewJournal", "professionalJournal"].includes(item.type || canonical.type);
  const journalRating = journalRatingForSource({ ...item, ...canonical });
  const sourceScore = Math.max(0, Math.min(Number(item.weight || 0), 5)) || sourceQualityScores[item.type || canonical.type] || 0;
  return {
    key: sourceKey(item),
    name: item.name,
    category: item.category,
    type: item.type || canonical.type,
    journalGrade: isJournal && journalRating ? journalRating.label : "",
    weight: item.weight || 3,
    sourceScore,
    recentCount: item.recentCount || 0,
    subgroup: item.subgroup || "",
    virtual: Boolean(item.virtual)
  };
}

function sourceJournalSortScore(item = {}) {
  const match = String(item.journalGrade || "").match(/\/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function rankSourceRows(a = {}, b = {}) {
  const aJournalScore = sourceJournalSortScore(a);
  const bJournalScore = sourceJournalSortScore(b);
  return (
    bJournalScore - aJournalScore ||
    b.sourceScore - a.sourceScore ||
    String(a.name || "").localeCompare(String(b.name || ""), "zh-Hans-CN")
  );
}

function candidateItems(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.items) ? payload.items : [];
}

async function loadJsonFile(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function addSourceStatsFromItems(stats, items, predicate) {
  items.forEach((item) => {
    const signals = Array.isArray(item.sourceSignals) ? item.sourceSignals : [];
    const keys = new Set();
    signals.forEach((signal) => {
      if (!signal?.name || (predicate && !predicate(signal))) return;
      keys.add(normalizeSourceName(signal.name));
    });
    if (!keys.size && item.journal) keys.add(normalizeSourceName(item.journal));
    keys.forEach((key) => {
      if (!key) return;
      stats.set(key, (stats.get(key) || 0) + 1);
    });
  });
}

async function loadSourceUpdateStats() {
  const [rssPayload, mergedPayload] = await Promise.all([
    loadJsonFile("./data/rss-candidates.json"),
    loadJsonFile("./data/candidates.json")
  ]);
  const rssItems = candidateItems(rssPayload);
  const mergedItems = candidateItems(mergedPayload);
  const stats = new Map();
  addSourceStatsFromItems(stats, rssPayload ? rssItems : mergedItems, (signal) =>
    PUBLIC_JOURNAL_RSS_TYPES.has(signal.type)
  );
  return stats;
}

function sourceUpdateCount(item, stats) {
  return stats.get(sourceKey(item)) || Number(item.recentCount || 0) || 0;
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
    return mergeSourceConfigs((await response.json()).filter(publicJournalRssConfig));
  } catch {
    const fallback = embeddedSourceConfigs.length
      ? embeddedSourceConfigs
      : sources.map(([typeLabel, name, category, weight, daily]) => ({
          id: slugify(name),
          name,
          type: category === "comprehensive" ? "topJournal" : "professionalJournal",
          category,
          weight,
          daily,
          status: typeLabel
        }));
    return mergeSourceConfigs(fallback.filter(publicJournalRssConfig));
  }
}

function sourceRoleNote(category) {
  return {
    comprehensive: "综合/综述：A1 正刊、A2 高影响综述、A3 综合期刊与大子刊。",
    professional: "专业补全：B1 Nature Index/生态小类/环境生态大类一区，B2 其它 CAS 一区，B3 JCR Q1 + CAS 二区，C 剩余 JCR Q1。"
  }[category] || "";
}

function renderSources() {
  const sourceActions = `
    <button class="btn" id="downloadSourcesConfig">查看 / 下载信源</button>
  `;
  root.innerHTML = `
    ${renderHead("信源", "公开版仅跟踪已配置的期刊 RSS", sourceActions)}
    <section id="sourceConfigPanel" hidden></section>
    <section id="sourceList"></section>
  `;
  bindSources();
}

function bindSources() {
  localStorage.removeItem("paperDailySourceConfigs");
  localStorage.removeItem("paperDailyDeletedSources");
  const list = document.querySelector("#sourceList");
  const configPanel = document.querySelector("#sourceConfigPanel");
  let currentConfigs = [];
  let editableConfigs = [];
  let configPanelOpen = false;

  const renderConfigPanel = () => {
    if (!configPanelOpen) {
      configPanel.hidden = true;
      configPanel.innerHTML = "";
      return;
    }
    const content = `${JSON.stringify(editableConfigs.map(sourceConfigWithRating), null, 2)}\n`;
    configPanel.hidden = false;
    configPanel.innerHTML = `
      <section class="source-config-panel">
        <div class="source-config-head">
          <strong>sources.json</strong>
          <button class="btn" id="saveSourcesConfig">下载 sources.json</button>
        </div>
        <pre class="source-config-code"><code>${escapeHtml(content)}</code></pre>
      </section>
    `;
  };

  const sourceRow = (item) => `
    <article class="source-row">
      <div class="source-name">
        <strong>${item.name}</strong>
        ${item.journalGrade ? `<span class="source-grade-tag">${item.journalGrade}</span>` : ""}
      </div>
      <div class="source-metrics">
        <span>${item.recentCount} 篇 / 近 ${recentDays()} 日</span>
      </div>
    </article>
  `;

  const draw = (items, stats) => {
    currentConfigs = mergeSourceConfigs(items);
    const displayItems = currentConfigs.map((item) => {
      const display = sourceConfigToDisplay(item);
      return { ...display, recentCount: sourceUpdateCount(display, stats) };
    });
    const labels = {
      comprehensive: "综合/综述期刊",
      professional: "专业期刊"
    };

    list.innerHTML = Object.entries(labels)
      .map(([key, label]) => {
        const group = displayItems.filter((item) => item.category === key);
        const volume = group.reduce((sum, item) => sum + Number(item.recentCount || 0), 0);
        const rows = group.sort(rankSourceRows).map(sourceRow).join("");
        return `
          <section class="source-cluster">
            <div class="cluster-head">
              <strong>${label}</strong>
              <span>${group.length} 个信源 · ${volume} 篇 / 近 ${recentDays()} 日</span>
            </div>
            <p class="source-role-note">${sourceRoleNote(key)}</p>
            <div class="source-list compact-source-list">${rows || `<div class="empty-row">暂无信源</div>`}</div>
          </section>
        `;
      })
      .join("");
  };

  Promise.all([loadBaseSourceConfigs(), loadSourceUpdateStats()]).then(([baseConfigs, stats]) => {
    editableConfigs = baseConfigs.filter((item) => !item.virtual);
    currentConfigs = mergeSourceConfigs(baseConfigs);
    draw(currentConfigs, stats);
    renderConfigPanel();
  });

  document.querySelector("#downloadSourcesConfig").addEventListener("click", () => {
    configPanelOpen = !configPanelOpen;
    renderConfigPanel();
  });

  configPanel.addEventListener("click", (event) => {
    if (!event.target.closest("#saveSourcesConfig")) return;
    downloadJson("sources.json", editableConfigs.map(sourceConfigWithRating));
  });
}

function renderChangelog() {
  const publicLogs = logs
    .filter((log) => !/公众号|微信|wechat/i.test(log.title))
    .map((log) => ({
      ...log,
      body: log.body
        .split("\\n")
        .filter((line) => !/公众号|微信|wechat|新闻聚合|新闻报道/i.test(line))
        .join("\\n")
    }))
    .filter((log) => log.body.trim());
  root.innerHTML = `
    ${renderHead("更新日志", "version history")}
    <section class="log-list">
      <article class="card log-item project-goal-card">
        <div class="log-meta">置顶 · 项目目标</div>
        <strong>PaperDaily 文献追踪目标</strong>
        <div class="log-body">
          ${projectGoal.map((line) => `<p>${line}</p>`).join("")}
        </div>
      </article>
      ${publicLogs
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

Promise.all([loadJournalGradeOverrides(), loadDoiJournalPatterns()])
  .then(loadGeneratedData)
  .finally(() => {
    renderers[page]?.();
  });
