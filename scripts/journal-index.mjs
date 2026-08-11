import fs from "node:fs";
import path from "node:path";

const INDEX_PATH = path.join(process.cwd(), "data", "journal-index.local.json");
const DOI_METADATA_CACHE_PATH = path.join(process.cwd(), "data", "doi-metadata-cache.json");
const DOI_PATTERN_PATH = path.join(process.cwd(), "data", "doi-journal-patterns.local.json");
const JOURNAL_GRADES_PATH = path.join(process.cwd(), "config", "journal-grades.json");

let cachedIndex = null;
let cachedDoiMetadata = null;
let cachedDoiPatterns = null;
let cachedJournalGrades = null;

const CURATED_JOURNALS = [
  "Science",
  "Nature",
  "PNAS Nexus",
  "PNAS",
  "Current Biology",
  "One Earth",
  "The Innovation",
  "Science Advances",
  "National Science Review",
  "Science Bulletin",
  "Journal of Cleaner Production",
  "Landscape and Urban Planning",
  "Remote Sensing of Environment",
  "International Journal of Applied Earth Observation and Geoinformation",
  "Nature Communications",
  "Nature Ecology & Evolution",
  "Nature Reviews Biodiversity",
  "Nature Reviews Earth & Environment",
  "Nature Reviews Microbiology",
  "Nature Reviews Chemistry",
  "Nature Climate Change",
  "Nature Geoscience",
  "Nature Food",
  "Nature Plants",
  "Nature Sustainability",
  "Scientific Data",
  "npj Urban Sustainability",
  "npj Climate and Atmospheric Science",
  "New Phytologist",
  "Global Change Biology",
  "Ecology Letters",
  "Journal of Ecology",
  "Journal of Animal Ecology",
  "Journal of Applied Ecology",
  "Functional Ecology",
  "Ecography",
  "Global Ecology and Biogeography",
  "Ecology",
  "Ecological Applications",
  "Ecological Monographs",
  "Catena",
  "Environmental Science & Technology",
  "Geochimica et Cosmochimica Acta",
  "Limnology and Oceanography",
  "Plant, Cell & Environment",
  "Frontiers in Ecology and the Environment",
  "Earth System Science Data",
  "Annual Review of Ecology, Evolution, and Systematics",
  "Biological Reviews",
  "Trends in Ecology & Evolution",
  "Advanced Functional Materials",
  "Agricultural and Forest Meteorology",
  "Soil Biology and Biochemistry",
  "Soil & Tillage Research",
  "Science of the Total Environment",
  "Applied Geography",
  "One Earth",
  "Journal of Environmental Economics and Management",
  "Journal of Environmental Management",
  "Communications Earth & Environment",
  "Microbiome"
];

const NATURE_INDEX_PUBLICATIONS_2026 = [
  "Academy of Management Journal",
  "ACS Nano",
  "Acta Biomaterialia",
  "Advanced Functional Materials",
  "Advanced Materials",
  "American Economic Review",
  "American Journal of Clinical Nutrition",
  "American Journal of Epidemiology",
  "American Journal of Human Genetics",
  "American Journal of Obstetrics and Gynecology",
  "American Journal of Pathology",
  "American Journal of Political Science",
  "American Journal of Respiratory and Critical Care Medicine",
  "American Journal of Sociology",
  "American Political Science Review",
  "American Sociological Review",
  "Analytical Chemistry",
  "Anesthesiology",
  "Angewandte Chemie International Edition",
  "Annals of Emergency Medicine",
  "Annals of Family Medicine",
  "Annals of Internal Medicine",
  "Annals of Mathematics",
  "Annals of Neurology",
  "Annals of Surgery",
  "Annals of the Rheumatic Diseases",
  "Applied Energy",
  "Applied Physics Letters",
  "Archives of Physical Medicine and Rehabilitation",
  "Arthritis & Rheumatology",
  "Astronomy & Astrophysics",
  "Blood",
  "Brain",
  "British Journal of Surgery",
  "Cancer Cell",
  "Cancer Research",
  "Cell",
  "Cell Host & Microbe",
  "Cell Metabolism",
  "Cell Stem Cell",
  "Chemical Communications",
  "Chemical Science",
  "Chest",
  "Circulation",
  "Cities",
  "Clinical Infectious Diseases",
  "Computers & Education",
  "Computers in Human Behavior",
  "Critical Care Medicine",
  "Current Biology",
  "Developmental Cell",
  "Diabetes Care",
  "Earth and Planetary Science Letters",
  "Ecology Letters",
  "Econometrica",
  "Energy",
  "Energy & Environmental Science",
  "Environmental Health Perspectives",
  "Environmental Pollution",
  "Environmental Research",
  "Environmental Science and Technology",
  "European Heart Journal",
  "European Physical Journal C",
  "European Urology",
  "Gastroenterology",
  "Genes & Development",
  "Genome Research",
  "Geochimica et Cosmochimica Acta",
  "Geology",
  "Geophysical Research Letters",
  "Gut",
  "Hepatology",
  "Higher Education",
  "Human Reproduction",
  "IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)",
  "Immunity",
  "Inorganic Chemistry",
  "International Journal of Epidemiology",
  "International Journal of Obesity",
  "Inventiones mathematicae",
  "JAMA Internal Medicine",
  "JAMA Pediatrics",
  "JAMA Psychiatry",
  "JAMA Surgery",
  "JAMA: The Journal of the American Medical Association",
  "Journal of Biological Chemistry",
  "Journal of Bone and Joint Surgery-American Volume",
  "Journal of Cell Biology",
  "Journal of Cleaner Production",
  "Journal of Clinical Endocrinology & Metabolism",
  "Journal of Clinical Investigation",
  "Journal of Clinical Oncology",
  "Journal of Experimental Medicine",
  "Journal of Financial Economics",
  "Journal of Geophysical Research: Atmospheres",
  "Journal of Geophysical Research: Solid Earth",
  "Journal of Hepatology",
  "Journal of High Energy Physics",
  "Journal of Infectious Diseases",
  "Journal of Neuroscience",
  "Journal of Physiology",
  "Journal of Political Economy",
  "Journal of the American Academy of Child and Adolescent Psychiatry",
  "Journal of the American Academy of Dermatology",
  "Journal of the American Chemical Society",
  "Journal of the American College of Cardiology",
  "Journal of the American Geriatrics Society",
  "Journal of the American Society of Nephrology",
  "Journal of the National Cancer Institute",
  "Journal of the Royal Statistical Society Series B: Statistical Methodology",
  "Journal of Thoracic and Cardiovascular Surgery",
  "Kidney International",
  "Macromolecules",
  "Management Science",
  "Molecular Cell",
  "Molecular Psychiatry",
  "Monthly Notices of the Royal Astronomical Society",
  "Nano Letters",
  "Nature",
  "Nature Biotechnology",
  "Nature Cell Biology",
  "Nature Chemical Biology",
  "Nature Chemistry",
  "Nature Climate Change",
  "Nature Communications",
  "Nature Energy",
  "Nature Genetics",
  "Nature Geoscience",
  "Nature Human Behaviour",
  "Nature Immunology",
  "Nature Materials",
  "Nature Medicine",
  "Nature Methods",
  "Nature Nanotechnology",
  "Nature Neuroscience",
  "Nature Photonics",
  "Nature Physics",
  "Nature Structural & Molecular Biology",
  "Nature Sustainability",
  "Neuron",
  "Ophthalmology",
  "Organic Letters",
  "Pediatrics",
  "Physical Review A",
  "Physical Review B",
  "Physical Review D",
  "Physical Review Letters",
  "Physical Review X",
  "Plant Biotechnology Journal",
  "PLOS Biology",
  "PLOS Genetics",
  "PLOS Medicine",
  "Proceedings of the National Academy of Sciences of the United States of America",
  "Proceedings of the Royal Society B",
  "Radiology",
  "Science",
  "Science Advances",
  "Science Translational Medicine",
  "Sustainable Cities and Society",
  "The Astrophysical Journal Letters",
  "The BMJ",
  "The EMBO Journal",
  "The ISME Journal: Multidisciplinary Journal of Microbial Ecology",
  "The Journal of Allergy and Clinical Immunology",
  "The Journal of Physical Chemistry Letters",
  "The Lancet",
  "The Lancet Diabetes & Endocrinology",
  "The Lancet Global Health",
  "The Lancet Neurology",
  "The Lancet Oncology",
  "The Lancet Psychiatry",
  "The New England Journal of Medicine",
  "The Plant Cell",
  "The Quarterly Journal of Economics",
  "The Review of Economic Studies",
  "Thorax",
  "Water Research",
  "World Development"
];

const NATURE_INDEX_ALIAS_TARGETS_2026 = [
  ["PNAS", "Proceedings of the National Academy of Sciences of the United States of America"],
  ["Environmental Science & Technology", "Environmental Science and Technology"],
  ["JAMA", "JAMA: The Journal of the American Medical Association"],
  ["The ISME Journal", "The ISME Journal: Multidisciplinary Journal of Microbial Ecology"],
  ["ISME Journal", "The ISME Journal: Multidisciplinary Journal of Microbial Ecology"],
  ["New England Journal of Medicine", "The New England Journal of Medicine"],
  ["BMJ", "The BMJ"]
];

const A2_JOURNALS = new Set(
  [
    "Nature Reviews Earth & Environment",
    "Nature Reviews Biodiversity",
    "Annual Review of Ecology, Evolution, and Systematics",
    "Biological Reviews",
    "Trends in Ecology & Evolution"
  ].map(normalizeJournalTitle)
);

function isNatureReviewsJournalTitle(title = "") {
  return title === "nature reviews" || title.startsWith("nature reviews ");
}

const A3_JOURNALS = new Set(
  [
    "Cell",
    "PNAS",
    "Proceedings of the National Academy of Sciences of the United States of America",
    "One Earth",
    "Nature Communications",
    "Nature Climate Change",
    "Nature Ecology & Evolution",
    "Nature Geoscience",
    "Nature Sustainability",
    "Science Advances",
    "PNAS Nexus",
    "Current Biology",
    "The Innovation",
    "Science Bulletin",
    "National Science Review",
    "Nature Plants",
    "Nature Food",
    "Earth System Science Data",
    "New Phytologist",
    "Remote Sensing of Environment"
  ].map(normalizeJournalTitle)
);

// Only include DOI prefixes that contain explicit journal slugs or abbreviations
// (for example 10.1016/j.tree or 10.1111/ele). Springer Nature sNNNNN article
// series are not journal identifiers and must be resolved from DOI metadata,
// sourceSignals, or page/RSS metadata instead.
const DOI_JOURNAL_PREFIXES = [
  ["10.1126/science", "Science"],
  ["10.1126/sciadv", "Science Advances"],
  ["10.1016/j.scib", "Science Bulletin"],
  ["10.1073/pnas", "PNAS"],
  ["10.1016/j.cub", "Current Biology"],
  ["10.1016/j.xinn", "The Innovation"],
  ["10.1016/j.jclepro", "Journal of Cleaner Production"],
  ["10.1016/j.landurbplan", "Landscape and Urban Planning"],
  ["10.1016/j.rse", "Remote Sensing of Environment"],
  ["10.1016/j.jag", "International Journal of Applied Earth Observation and Geoinformation"],
  ["10.1093/pnasnexus", "PNAS Nexus"],
  ["10.1111/nph", "New Phytologist"],
  ["10.1111/gcb", "Global Change Biology"],
  ["10.1111/ele", "Ecology Letters"],
  ["10.1111/1365-2745", "Journal of Ecology"],
  ["10.1111/1365-2656", "Journal of Animal Ecology"],
  ["10.1111/1365-2664", "Journal of Applied Ecology"],
  ["10.1111/1365-2435", "Functional Ecology"],
  ["10.1111/ecog", "Ecography"],
  ["10.1111/geb", "Global Ecology and Biogeography"],
  ["10.1002/ecy", "Ecology"],
  ["10.1002/eap", "Ecological Applications"],
  ["10.1002/ecm", "Ecological Monographs"],
  ["10.1016/j.catena", "Catena"],
  ["10.1021/acs.est", "Environmental Science & Technology"],
  ["10.1016/j.gca", "Geochimica et Cosmochimica Acta"],
  ["10.3389/fpls", "Frontiers in Plant Science"],
  ["10.1002/lno", "Limnology and Oceanography"],
  ["10.1111/pce", "Plant, Cell & Environment"],
  ["10.1002/fee", "Frontiers in Ecology and the Environment"],
  ["10.1146/annurev-ecolsys", "Annual Review of Ecology, Evolution, and Systematics"],
  ["10.1111/brv", "Biological Reviews"],
  ["10.5194/essd", "Earth System Science Data"],
  ["10.1016/j.tree", "Trends in Ecology & Evolution"],
  ["10.1002/adfm", "Advanced Functional Materials"],
  ["10.1016/j.agrformet", "Agricultural and Forest Meteorology"],
  ["10.1016/j.soilbio", "Soil Biology and Biochemistry"],
  ["10.1016/j.still", "Soil & Tillage Research"],
  ["10.1016/j.scitotenv", "Science of the Total Environment"],
  ["10.1016/j.apgeog", "Applied Geography"],
  ["10.1016/j.oneear", "One Earth"],
  ["10.1016/j.jeem", "Journal of Environmental Economics and Management"],
  ["10.1016/j.jenvman", "Journal of Environmental Management"],
  ["10.1186/s40168", "Microbiome"]
];

function decodeJournalText(value = "") {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function normalizeJournalTitle(value = "") {
  return decodeJournalText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^the\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeDoiFromText(value = "") {
  const match = String(value || "").match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  if (!match) return "";
  return match[0]
    .replace(/[。；;，,、\s"'<>()[\]{}]+$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
}

function readIndex() {
  if (cachedIndex) return cachedIndex;
  try {
    const payload = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
    const byTitle = new Map();
    const byIssn = new Map();
    for (const entry of payload.entries || []) {
      if (entry.normalizedTitle) byTitle.set(entry.normalizedTitle, entry);
      for (const value of [entry.issn, entry.eissn]) {
        if (value) byIssn.set(value.toUpperCase(), entry);
      }
    }
    cachedIndex = { byTitle, byIssn, payload };
  } catch {
    cachedIndex = { byTitle: new Map(), byIssn: new Map(), payload: null };
  }
  for (const title of CURATED_JOURNALS) {
    const key = normalizeJournalTitle(title);
    cachedIndex.byTitle.set(key, { ...(cachedIndex.byTitle.get(key) || {}), title, curated: true });
  }
  for (const title of NATURE_INDEX_PUBLICATIONS_2026) {
    const key = normalizeJournalTitle(title);
    cachedIndex.byTitle.set(key, {
      ...(cachedIndex.byTitle.get(key) || {}),
      title: cachedIndex.byTitle.get(key)?.title || title,
      natureIndex2026: true,
      natureIndexSource: "Nature Index 2026 FAQ"
    });
  }
  for (const [alias, targetTitle] of NATURE_INDEX_ALIAS_TARGETS_2026) {
    const aliasKey = normalizeJournalTitle(alias);
    const target = cachedIndex.byTitle.get(normalizeJournalTitle(targetTitle)) || {};
    cachedIndex.byTitle.set(aliasKey, {
      ...target,
      ...(cachedIndex.byTitle.get(aliasKey) || {}),
      title: alias,
      natureIndex2026: true,
      natureIndexSource: "Nature Index 2026 FAQ",
      natureIndexAliasOf: targetTitle
    });
  }
  return cachedIndex;
}

function readDoiMetadata() {
  if (cachedDoiMetadata) return cachedDoiMetadata;
  cachedDoiMetadata = new Map();
  try {
    const payload = JSON.parse(fs.readFileSync(DOI_METADATA_CACHE_PATH, "utf8"));
    const items = payload.items || payload;
    for (const [doi, entry] of Object.entries(items || {})) {
      const normalized = normalizeDoiFromText(doi);
      const containerTitle = Array.isArray(entry?.containerTitle) ? entry.containerTitle[0] : entry?.containerTitle;
      const journal = entry?.journal || containerTitle || "";
      if (normalized && journal) {
        cachedDoiMetadata.set(normalized, {
          ...entry,
          journal,
          title: Array.isArray(entry?.title) ? entry.title[0] : entry?.title || ""
        });
      }
    }
  } catch {
    // DOI metadata cache is optional and generated by scripts/resolve-doi-metadata.mjs.
  }
  return cachedDoiMetadata;
}

function readDoiPatterns() {
  if (cachedDoiPatterns) return cachedDoiPatterns;
  cachedDoiPatterns = [];
  try {
    const payload = JSON.parse(fs.readFileSync(DOI_PATTERN_PATH, "utf8"));
    const rawPatterns = Array.isArray(payload) ? payload : payload.patterns || [];
    cachedDoiPatterns = rawPatterns
      .map((entry) => [String(entry.prefix || entry[0] || "").toLowerCase(), entry.journal || entry[1] || ""])
      .filter(([prefix, journal]) => prefix && journal)
      .sort((a, b) => b[0].length - a[0].length);
  } catch {
    // Local DOI pattern cache is optional.
  }
  return cachedDoiPatterns;
}

export function matchJournal(value = "") {
  const query = normalizeJournalTitle(value);
  if (!query) return null;
  const { byTitle, byIssn } = readIndex();
  if (byTitle.has(query)) return byTitle.get(query);
  const issn = String(value || "").match(/\b\d{4}-?\d{3}[\dX]\b/i)?.[0]?.replace("-", "").toUpperCase();
  if (issn) {
    const formatted = `${issn.slice(0, 4)}-${issn.slice(4)}`;
    if (byIssn.has(formatted)) return byIssn.get(formatted);
  }
  return null;
}

export function canonicalJournalName(value = "") {
  return matchJournal(value)?.title || decodeJournalText(value).trim();
}

export function journalNameFromDoi(value = "") {
  const doi = normalizeDoiFromText(value);
  if (!doi) return "";
  return journalNameFromDoiMetadata(value) || journalNameFromDoiPattern(value);
}

export function journalNameFromDoiMetadata(value = "") {
  const doi = normalizeDoiFromText(value);
  if (!doi) return "";
  const exact = readDoiMetadata().get(doi);
  if (exact?.journal) return canonicalJournalName(exact.journal);
  return "";
}

export function journalNameFromDoiPattern(value = "") {
  const doi = normalizeDoiFromText(value);
  if (!doi) return "";
  const entry = [...readDoiPatterns(), ...DOI_JOURNAL_PREFIXES].find(([prefix]) => doi.startsWith(prefix));
  return entry ? canonicalJournalName(entry[1]) : "";
}

export function paperTitleFromDoi(value = "") {
  const doi = normalizeDoiFromText(value);
  if (!doi) return "";
  const exact = readDoiMetadata().get(doi);
  return String(exact?.title || "").trim();
}

export function paperAbstractFromDoi(value = "") {
  const doi = normalizeDoiFromText(value);
  if (!doi) return "";
  const exact = readDoiMetadata().get(doi);
  return String(exact?.abstract || "").trim();
}

function quartileRank(value = "") {
  const match = String(value || "").toUpperCase().match(/Q([1-4])/);
  return match ? Number(match[1]) : 0;
}

function impactFactorFromEntry(entry = null) {
  const impact = Number(entry?.fiveYearJif2025 ?? entry?.fiveYearIfJustScienceLatest ?? entry?.fiveYearIf2024 ?? entry?.if2024 ?? entry?.if2022 ?? entry?.casIf2019 ?? 0);
  return Number.isFinite(impact) && impact > 0 ? impact : null;
}

function readJournalGrades() {
  if (cachedJournalGrades) return cachedJournalGrades;
  const map = new Map();
  try {
    const payload = JSON.parse(fs.readFileSync(JOURNAL_GRADES_PATH, "utf8"));
    for (const item of payload.journals || []) {
      const title = normalizeJournalTitle(item.title || item.name || "");
      if (!title) continue;
      map.set(title, item);
    }
  } catch {
    // Optional manual overrides.
  }
  cachedJournalGrades = map;
  return cachedJournalGrades;
}

function journalGradeOverride(title = "", entry = null) {
  const override = readJournalGrades().get(normalizeJournalTitle(title));
  if (!override) return null;
  const subgrade = String(override.subgrade || "").toUpperCase();
  const grade = subgrade.slice(0, 1) || "";
  const partitionScore = Number(override.partitionScore || 0);
  const impactFactor = impactFactorFromEntry(entry);
  const natureIndex = Boolean(entry?.natureIndex2026);
  return {
    score: partitionScore,
    tier: override.tier || "manual_journal_grade",
    label: override.label || subgrade,
    grade,
    subgrade,
    natureIndex,
    impactFactor,
    entry,
    manualOverride: true,
    displayScore: Number(override.displayScore || 0) || null,
    overrideNotes: override.notes || ""
  };
}

function subjectIncludesAny(value = "", terms = []) {
  const text = String(value || "").toUpperCase();
  return terms.some((term) => text.includes(String(term).toUpperCase()));
}

function justScienceSources(entry = {}) {
  return [entry.justScienceLatest, entry.justScience2025, entry.justScience2024].filter(Boolean);
}

function casSmallQ1Includes(entry = {}, terms = []) {
  const subjects = [
    entry.casSmallSubject,
    entry.casSmallCategory,
    ...justScienceSources(entry).flatMap((source) => (Array.isArray(source.casSmallSubjects) ? source.casSmallSubjects : []))
  ].filter(Boolean);
  const zones = [
    entry.casSmallZone,
    entry.casSmallQuartile,
    entry.casCategoryZone,
    ...justScienceSources(entry).flatMap((source) => (Array.isArray(source.casSmallZones) ? source.casSmallZones : []))
  ].filter(Boolean);
  return subjects.some((subject, index) => {
    const zone = zones[index] || entry.casSmallZone || entry.casSmallQuartile || "";
    return quartileRank(zone) === 1 && subjectIncludesAny(subject, terms);
  });
}

function casLargeQ1Includes(entry = {}, terms = []) {
  const subjects = [
    entry.casSubject,
    entry.casCategory,
    ...justScienceSources(entry).map((source) => source.casSubject)
  ].filter(Boolean);
  const zones = [
    entry.casZone,
    entry.casQuartile,
    ...justScienceSources(entry).map((source) => source.casZone)
  ].filter(Boolean);
  return subjects.some((subject, index) => {
    const zone = zones[index] || entry.casZone || entry.casQuartile || "";
    return quartileRank(zone) === 1 && subjectIncludesAny(subject, terms);
  });
}

function casRankIs(entry = {}, rank = 0) {
  const ranks = [
    quartileRank(entry.casZone),
    quartileRank(entry.casQuartile),
    quartileRank(entry.casSmallZone || entry.casSmallQuartile || entry.casCategoryZone),
    ...justScienceSources(entry).flatMap((source) =>
      Array.isArray(source.casSmallZones)
        ? source.casSmallZones.map((zone) => quartileRank(zone))
        : []
    ),
    ...justScienceSources(entry).map((source) => quartileRank(source.casZone))
  ].filter(Boolean);
  return ranks.includes(rank);
}

export function journalPartitionScore(value = "") {
  const doiJournal = journalNameFromDoi(value);
  const manualBeforeIndex = journalGradeOverride(doiJournal || value, null);
  if (manualBeforeIndex) return manualBeforeIndex;
  const entry = matchJournal(doiJournal || value);
  if (!entry) return { score: 0, tier: "unknown", label: "未知期刊", entry: null };

  const casRank = quartileRank(entry.casZone);
  const casSmallRank = quartileRank(entry.casSmallZone || entry.casSmallQuartile || entry.casCategoryZone);
  const jcrRank = quartileRank(entry.bestJcrQuartile || entry.jcrQuartile2024);
  const title = normalizeJournalTitle(entry.title || "");
  const impactFactor = impactFactorFromEntry(entry);
  const natureIndex = Boolean(entry.natureIndex2026);
  const manual = journalGradeOverride(entry.title || doiJournal || value, entry);
  if (manual) return manual;

  if (title === "nature" || title === "science") {
    return { score: 25, tier: "a1_nature_science", label: "A1 Nature/Science 正刊", grade: "A", subgrade: "A1", natureIndex, impactFactor, entry };
  }
  if (A2_JOURNALS.has(title) || isNatureReviewsJournalTitle(title)) {
    return { score: 23.5, tier: "a2_top_selective", label: "A2 高影响综述期刊", grade: "A", subgrade: "A2", natureIndex, impactFactor, entry };
  }
  if (A3_JOURNALS.has(title)) {
    return { score: 22, tier: "a3_high_impact_selective", label: "A3 综合期刊/大子刊", grade: "A", subgrade: "A3", natureIndex, impactFactor, entry };
  }
  if (
    natureIndex ||
    casSmallQ1Includes(entry, ["生态学", "ECOLOGY"]) ||
    casLargeQ1Includes(entry, ["环境科学与生态学", "ENVIRONMENTAL SCIENCES & ECOLOGY"])
  ) {
    return { score: 18, tier: "b1_nature_index_or_env_ecology_q1", label: "B1 Nature Index/生态小类/环境生态大类一区", grade: "B", subgrade: "B1", natureIndex, impactFactor, entry };
  }
  if (casSmallRank === 1 || casRank === 1) {
    return { score: 15, tier: "b2_cas_small_or_large_q1", label: "B2 CAS 小类/大类一区", grade: "B", subgrade: "B2", natureIndex, impactFactor, entry };
  }
  if (jcrRank === 1 && casRankIs(entry, 2)) {
    return { score: 12, tier: "b3_jcr_q1_cas_q2", label: "B3 JCR Q1 + CAS 二区", grade: "B", subgrade: "B3", natureIndex, impactFactor, entry };
  }
  if (jcrRank === 1) {
    return { score: 10, tier: "c_jcr_q1", label: "C JCR Q1", grade: "C", subgrade: "C", natureIndex, impactFactor, entry };
  }
  return { score: 0, tier: "unscored", label: "未评分期刊", grade: "", subgrade: "", natureIndex, impactFactor, entry };
}

export function journalSourceScore(value = "") {
  const partition = journalPartitionScore(value);
  if (partition.tier === "a1_nature_science") return 20;
  if (partition.tier === "a2_top_selective") return 18.5;
  if (partition.tier === "a3_high_impact_selective") return 17;
  if (partition.tier === "b1_nature_index" || partition.tier === "b1_nature_index_or_env_ecology_q1") return 15;
  if (partition.tier === "b2_cas_small_or_large_q1" || partition.tier === "b2_cas_top_or_ecology_q1") return 13;
  if (partition.tier === "b3_jcr_q1_cas_q2" || partition.tier === "b3_jcr_q1" || partition.tier === "b3_other_q1") return 11;
  if (partition.tier === "c_jcr_q1" || partition.tier === "c1_cas_q2" || partition.tier === "c1_mid") return 8;
  return 0;
}

export function journalImpactFactor(value = "") {
  const doiJournal = journalNameFromDoi(value);
  const entry = matchJournal(doiJournal || value);
  if (!entry) return null;
  return impactFactorFromEntry(entry);
}
