import {
  canonicalJournalName,
  journalNameFromDoiMetadata,
  journalNameFromDoiPattern,
  matchJournal,
  normalizeJournalTitle,
  paperAbstractFromDoi,
  paperTitleFromDoi
} from "./journal-index.mjs";

const STOP_TITLE_WORDS =
  /^(the|and|for|with|from|into|over|under|using|use|via|are|was|were|that|this|these|those|new|study|research|paper|based|while)$/;

const JOURNAL_ALIASES = [
  ["Advanced Functional Materials", /\bAdvanced Functional Materials\b/i],
  ["Agricultural and Forest Meteorology", /\bAgricultural\s+(?:and|&)\s+Forest Meteorology\b/i],
  ["Trends in Ecology & Evolution", /\bTrends in Ecology\s*(?:&|and)\s*Evolution\b/i],
  ["Nature Ecology & Evolution", /\bNature Ecology\s*&\s*Evolution\b/i],
  ["Nature Reviews Biodiversity", /\bNature Reviews Biodiversity\b|\bNat\.?\s*Rev\.?\s*Biodivers\.?\b/i],
  ["Nature Reviews Earth & Environment", /\bNature Reviews Earth\s*&\s*Environment\b|\bNat\.?\s*Rev\.?\s*Earth\s*&\s*Environ\.?\b/i],
  ["Nature Reviews Microbiology", /\bNature Reviews Microbiology\b|\bNat\.?\s*Rev\.?\s*Microbiol\.?\b/i],
  ["Nature Reviews Chemistry", /\bNature Reviews Chemistry\b|\bNat\.?\s*Rev\.?\s*Chem\.?\b/i],
  ["Nature Communications", /\bNature Communications\b|《\s*Nature Communications\s*》|\bNat(?:ure)?\s+Commun\b/i],
  ["Nature Climate Change", /\bNature Climate Change\b/i],
  ["Nature Geoscience", /\bNature Geoscience\b/i],
  ["Nature Food", /\bNature Food\b/i],
  ["Nature Sustainability", /\bNature Sustainability\b/i],
  ["Nature Plants", /\bNature Plants\b/i],
  ["Nature", /《\s*Nature\s*》|\bNature正刊\b|\bNature\s*[:：]|\bNature\s*,\s*(?:\d|published online)/],
  ["Science Advances", /\bScience Advances\b|\bSci(?:ence)?\s+Adv(?:ances)?\b/i],
  ["Science Bulletin", /\bScience Bulletin\b|\bSci(?:ence)?\s+Bull(?:etin)?\b/i],
  ["Frontiers in Plant Science", /\bFrontiers in Plant Science\b|\bFront\.?\s*Plant Sci\.?\b/i],
  ["Science", /《\s*Science\s*》|\bScience正刊\b|\bScience\s*[:：]|\bScience\s*,\s*(?:\d|published online)/],
  ["PNAS Nexus", /\bPNAS Nexus\b/i],
  ["PNAS", /\bPNAS\b|Proceedings of the National Academy of Sciences/i],
  ["npj Urban Sustainability", /\bnpj\s+Urban Sustainability\b/i],
  ["npj Climate and Atmospheric Science", /\bnpj\s+Climate and Atmospheric Science\b/i],
  ["Journal of Cleaner Production", /\bJournal of Cleaner Production\b|\bJCP\b/i],
  ["Global Change Biology", /\bGlobal Change Biology\b|\bGCB\b/i],
  ["Journal of Ecology", /\bJournal of Ecology\b/i],
  ["Ecology Letters", /\bEcology Letters\b/i],
  ["New Phytologist", /\bNew Phytologist\b|\bNew Phytol\b/i],
  ["Plant Physiology", /\bPlant Physiology\b/i],
  ["Remote Sensing of Environment", /\bRemote Sensing of Environment\b|\bRSE\b/i],
  ["ISPRS Journal of Photogrammetry and Remote Sensing", /\bISPRS Journal of Photogrammetry and Remote Sensing\b|\bISPRS\b/i],
  ["Earth System Science Data", /\bEarth System Science Data\b|\bESSD\b/i],
  ["Scientific Data", /\bScientific Data\b/i],
  ["Field Crops Research", /\bField Crops Research\b|\bFCR\b/i],
  ["Forest Ecology and Management", /\bForest Ecology and Management\b|\bFEM\b/i],
  ["Soil Biology and Biochemistry", /\bSoil Biology\s*(?:&|and)\s*Biochemistry\b|\bSBB\b/i],
  ["Soil & Tillage Research", /\bSoil\s*&\s*Tillage Research\b|\bSoil and Tillage Research\b|\bSTR\b/i],
  ["Science of the Total Environment", /\bScience of the Total Environment\b|\bSTOTEN\b/i],
  ["Functional Ecology", /\bFunctional Ecology\b/i],
  ["Frontiers in Ecology and the Environment", /\bFrontiers in Ecology and the Environment\b|\bFEE\b/i],
  ["Ecological Indicators", /\bEcological Indicators\b/i],
  ["Ecological Modelling", /\bEcological Modelling\b/i],
  ["Applied Geography", /\bApplied Geography\b/i],
  ["Catena", /\bCatena\b/i],
  ["One Earth", /\bOne Earth\b/i],
  ["Microbiome", /\bMicrobiome\b/i],
  ["Communications Earth & Environment", /\bCommunications Earth\s*&\s*Environment\b/i],
  ["Journal of Environmental Management", /\bJournal of Environmental Management\b/i],
  ["Journal of Environmental Economics and Management", /\bJournal of Environmental Economics and Management\b|\bJEEM\b/i]
];

export function cleanMetadataText(value = "") {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function removeUrlLikeJournalNoise(value = "") {
  return cleanMetadataText(value)
    .replace(/\bhttps?:\/\/\S+/gi, " ")
    .replace(/\bwww\.\S+/gi, " ")
    .replace(/\b(?:doi\.org|dx\.doi\.org)\/\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeDoiValue(value = "") {
  const match = String(value || "").match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  if (!match) return "";
  return match[0]
    .replace(/[。；;，,、\s"'<>()[\]{}]+$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
}

export function doiMatches(value = "") {
  return [...String(value || "").matchAll(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi)]
    .map((match) => normalizeDoiValue(match[0]))
    .filter(Boolean);
}

function directInterpretiveType(value = "") {
  return /commentary|comment|perspective|viewpoint|opinion|correspondence|forum|essay|spotlight|editorial|news\s*&\s*views|news and views|research\s*briefing|briefing|观点|评论|评述|通讯|来信|论坛|随笔|社论/.test(
    String(value || "").toLowerCase()
  );
}

function interpretiveContextEvidence(value = "") {
  const text = cleanMetadataText(value).toLowerCase();
  if (!text) return false;
  return /评论文章|评论背景|主要评论观点|评论既|该评论|评述与延伸|进行了评述|对.{0,80}(?:研究|论文|原文).{0,40}(?:评述|评论)|commentary|comment\s+(?:on|about)|perspective|viewpoint|opinion|correspondence|forum|essay|editorial|news\s*&\s*views|news and views/.test(
    text
  );
}

function textForDoiContext(local = {}, doi = "") {
  const normalized = normalizeDoiValue(doi);
  if (!normalized || !Array.isArray(local.doiContexts)) return "";
  return local.doiContexts
    .filter((entry) => normalizeDoiValue(entry?.doi || "") === normalized)
    .map((entry) => entry.context || "")
    .join("\n");
}

export function inferInterpretivePaperType(paper = {}) {
  const local = paper.localPrescreen || {};
  const mention = local.paperMention || {};
  const typeText = [paper.type, paper.paperType, paper.paperTypeGroup, local.category, local.paperType, local.paperTypeGroup, mention.category, mention.paperType, mention.paperTypeGroup]
    .filter(Boolean)
    .join(" ");
  const contextText = [
    textForDoiContext(local, paper.doi || local.doi || mention.doi || ""),
    paper.abstract,
    paper.summary,
    paper.oneLine,
    paper.reason,
    local.summary,
    local.oneLine,
    local.reason,
    mention.summary,
    mention.oneLine,
    mention.reason
  ]
    .filter(Boolean)
    .join("\n");
  if (!directInterpretiveType(typeText) && !interpretiveContextEvidence(contextText)) return null;
  return {
    category: "commentary",
    paperType: "Commentary",
    paperTypeGroup: "commentary",
    evidence: directInterpretiveType(typeText) ? "type_label" : "text_context"
  };
}

export function aliasJournalName(value = "") {
  const text = removeUrlLikeJournalNoise(value);
  const alias = JOURNAL_ALIASES.find(([, pattern]) => pattern.test(text));
  return alias ? alias[0] : "";
}

function cleanJournalCandidate(value = "") {
  return cleanMetadataText(value)
    .replace(/^[《(<（「“"'`]+/g, "")
    .replace(/[》)>）」。，“"'`]+$/g, "")
    .replace(/\s+(?:上)?(?:发表|发文|刊发|上线|的文章|的论文|的研究).*$/i, "")
    .replace(/\s+(?:published|article|paper|research|time|year|authors?|doi)\b.*$/i, "")
    .replace(/\s*[（(]\s*[A-Z]{2,12}\s*[)）]\s*$/g, "")
    .trim();
}

function journalCandidateVariants(value = "") {
  const cleaned = cleanJournalCandidate(value);
  if (!cleaned) return [];
  const variants = [
    cleaned,
    cleaned.replace(/\s+[A-Z]{2,12}$/g, "").trim(),
    cleaned.replace(/^[^A-Za-z]*(?=[A-Za-z])/g, "").trim()
  ];
  for (const part of cleaned.split(/[，,；;]/)) {
    variants.push(cleanJournalCandidate(part));
  }
  return [...new Set(variants.filter(Boolean))];
}

export function canonicalKnownJournal(value = "") {
  for (const candidate of journalCandidateVariants(value)) {
    const matched = matchJournal(candidate);
    if (matched) return matched.title;
    const candidateAlias = aliasJournalName(candidate);
    if (candidateAlias) return canonicalJournalName(candidateAlias);
  }
  const alias = aliasJournalName(value);
  if (alias) return canonicalJournalName(alias);
  return "";
}

function explicitJournalFromTitle(title = "") {
  const text = cleanMetadataText(title);
  const candidates = [
    text.match(/^[【\[]\s*([A-Za-z][A-Za-z0-9&.,:'’() /-]{2,160}?)\s*[】\]]/)?.[1],
    text.match(/^([A-Za-z][A-Za-z0-9&.,:'’() /-]{2,160}?)\s*(?:[:：|｜丨]| - )/)?.[1]
  ].filter(Boolean);
  for (const candidate of candidates) {
    const known = canonicalKnownJournal(candidate);
    if (known) return known;
    const plausible = plausibleUnindexedJournal(candidate, "");
    if (plausible) return plausible;
  }
  return "";
}

function normalizeTitleKey(title = "") {
  return cleanMetadataText(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleTokens(title = "") {
  return normalizeTitleKey(title)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_TITLE_WORDS.test(token));
}

function titleLikeJournal(journal = "", title = "") {
  const normalizedJournal = normalizeTitleKey(journal);
  const normalizedTitle = normalizeTitleKey(title);
  if (!normalizedJournal || !normalizedTitle) return false;
  if (normalizedJournal.length > 18 && normalizedTitle.includes(normalizedJournal)) return true;
  if (normalizedTitle.length > 18 && normalizedJournal.includes(normalizedTitle)) return true;
  const journalTokens = new Set(titleTokens(journal));
  const titleTokenSet = new Set(titleTokens(title));
  if (!journalTokens.size || !titleTokenSet.size) return false;
  let overlap = 0;
  for (const token of journalTokens) {
    if (titleTokenSet.has(token)) overlap += 1;
  }
  return overlap / Math.min(journalTokens.size, titleTokenSet.size) >= 0.72;
}

export function plausibleUnindexedJournal(value = "", title = "") {
  const candidate = cleanJournalCandidate(value);
  if (!candidate || /[\u4e00-\u9fff]/.test(candidate)) return "";
  if (titleLikeJournal(candidate, title)) return "";
  if (
    !/\b(journal|ecology|ecological|environment|environmental|science|sciences|nature|pnas|proceedings|frontiers|functional|global|remote sensing|conservation|biogeochemistry|phytologist|plant|soil|earth|one earth|sustainability|climate|atmospheric|food|bulletin|materials|urban|biochemistry|agriculture|water|hydrology|geography)\b/i.test(
      candidate
    )
  ) {
    return "";
  }
  return candidate;
}

const JOURNAL_TEXT_PATTERNS = [
  /(?:期刊|发表期刊|来源期刊|原刊|journal)\s*[:：]\s*([A-Za-z][A-Za-z0-9&.,:'’() /-]{2,160}?)(?=\s*(?:时间|年份|作者|单位|DOI|题目|摘要|一句话|[。；;\n]|$))/giu,
  /(?:发表于|发表在|刊发于|发布于|published\s+(?:in|on))\s*《?\s*([A-Za-z][A-Za-z0-9&.,:'’() /-]{2,160}?)\s*》?\s*(?:上|in|on)?\s*(?:的(?:文章|论文|研究)|文章|论文|研究|中|发表|发文|刊发|上线|$)/giu,
  /(?:在|于)\s*《?\s*([A-Za-z][A-Za-z0-9&.,:'’() /-]{2,160}?)\s*》?\s*(?:上|中)?\s*(?:发表|发文|刊发|上线)/giu,
  /在\s*《[^》]{2,100}》\s*[（(]\s*([A-Za-z][A-Za-z0-9&.,:'’() /-]{2,160}?)\s*[)）]\s*(?:发表|发文|刊发|上线)/giu,
  /(?:^|[.!?。；;\n])\s*([A-Za-z][A-Za-z0-9&.'’() /-]{2,160}?)\s*,\s*\d+\s*\(\s*(?:19|20)\d{2}\s*\)/giu
];

function removeTrailingRoundupText(value = "") {
  return cleanMetadataText(value).split(
    /\s*(?:往期推荐|相关阅读|相关论文|延伸阅读|更多阅读|推荐阅读|参考阅读|历史推荐|往期文章|猜你喜欢)\s*[:：]/u
  )[0] || "";
}

function textWindowAroundNeedle(text = "", needle = "", radius = 1200) {
  const cleaned = cleanMetadataText(text);
  const query = cleanMetadataText(needle);
  if (!cleaned || !query) return "";
  const index = cleaned.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return "";
  return cleaned.slice(Math.max(0, index - radius), Math.min(cleaned.length, index + query.length + radius));
}

function scopedMetadataText({ title = "", text = "", doi = "" } = {}) {
  const cleaned = removeTrailingRoundupText(text);
  const normalizedDoi = normalizeDoiValue(doi);
  const windows = [
    textWindowAroundNeedle(cleaned, normalizedDoi, 1400),
    textWindowAroundNeedle(cleaned, title, 1400)
  ].filter(Boolean);
  const scoped = windows.length ? windows.join("\n") : cleaned.slice(0, 2400);
  return scoped;
}

export function inferJournalFromMetadataText({ title = "", text = "", journal = "", doi = "" } = {}) {
  const titleText = cleanMetadataText(title);
  const scopedText = scopedMetadataText({ title, text, doi });
  const haystack = cleanMetadataText([title, scopedText, journal].filter(Boolean).join("\n"));
  const doiMetadataJournal = journalNameFromDoiMetadata(doi || haystack);
  if (doiMetadataJournal && !titleLikeJournal(doiMetadataJournal, titleText)) return doiMetadataJournal;

  const titleJournal = explicitJournalFromTitle(titleText);
  if (titleJournal) return titleJournal;
  const leadingTextJournal = explicitJournalFromTitle(haystack);
  if (leadingTextJournal) return leadingTextJournal;

  const prefix = titleText.split(/\s*[|｜丨:：]\s*/)[0];
  if (/^[A-Za-z][A-Za-z0-9 &.,'’()/-]{2,100}$/.test(prefix)) {
    const prefixJournal = canonicalKnownJournal(prefix) || plausibleUnindexedJournal(prefix, titleText);
    if (prefixJournal) return prefixJournal;
  }

  for (const pattern of JOURNAL_TEXT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(haystack))) {
      const value = match[1];
      const known = canonicalKnownJournal(value);
      if (known) return known;
      const plausible = plausibleUnindexedJournal(value, titleText);
      if (plausible) return plausible;
    }
  }

  const doiPatternJournal = journalNameFromDoiPattern(doi || haystack);
  if (doiPatternJournal && !titleLikeJournal(doiPatternJournal, titleText)) return doiPatternJournal;

  const alias = aliasJournalName(haystack);
  if (alias && !titleLikeJournal(alias, titleText)) return canonicalJournalName(alias);

  const known = canonicalKnownJournal(journal);
  if (known && !titleLikeJournal(known, titleText)) return known;
  const plausible = plausibleUnindexedJournal(journal, titleText);
  if (plausible) return plausible;

  return "";
}

function scopedJournalCandidate(value = "", title = "") {
  const known = canonicalKnownJournal(value);
  if (known && !titleLikeJournal(known, title)) return known;
  const plausible = plausibleUnindexedJournal(value, title);
  return plausible && !titleLikeJournal(plausible, title) ? plausible : "";
}

function genericJournalName(value = "") {
  const normalized = normalizeJournalTitle(value);
  return normalized === "nature" || normalized === "science";
}

function sourceAccountNames(paper = {}) {
  return new Set(
    (paper.sourceSignals || [])
      .filter((signal) => signal.type === "wechat")
      .map((signal) => normalizeTitleKey(signal.name || ""))
      .filter(Boolean)
  );
}

function isWechatSourceAccount(value = "", paper = {}) {
  const normalized = normalizeTitleKey(value);
  return normalized && sourceAccountNames(paper).has(normalized);
}

function bestMention(paper = {}) {
  const local = paper.localPrescreen || {};
  const mentions = Array.isArray(local.paperMentions) ? local.paperMentions : [];
  const candidates = [
    local.paperMention && typeof local.paperMention === "object" ? local.paperMention : null,
    ...mentions
  ].filter(Boolean);
  if (!candidates.length) return {};
  return candidates
    .map((mention, index) => ({ mention, index, score: mentionMetadataScore(mention) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0].mention;
}

function mentionMetadataScore(mention = {}) {
  let score = 0;
  if (["primary", "secondary"].includes(mention.role)) score += 2;
  if (normalizeDoiValue(mention.doi || "")) score += 8;
  if (canonicalKnownJournal(mention.journal || "") || plausibleUnindexedJournal(mention.journal || "", mention.title || "")) score += 5;
  if (looksLikeEnglishTitle(mention.title || "")) score += 4;
  if (Array.isArray(mention.authors) && mention.authors.length) score += 2;
  return score;
}

function cleanAuthors(value) {
  return Array.isArray(value) ? value.map((item) => cleanMetadataText(item)).filter(Boolean) : [];
}

export function looksLikeEnglishTitle(value = "") {
  const text = cleanMetadataText(value);
  if (!text || /[\u4e00-\u9fff]/.test(text)) return false;
  const tokens = titleTokens(text).filter((token) => /[a-z]/i.test(token));
  return tokens.length >= 4 && text.length >= 22;
}

function chooseTitle(paper = {}, mention = {}, doiTitle = "") {
  const local = paper.localPrescreen || {};
  const hasDoi = Boolean(normalizeDoiValue(mention.doi || local.doi || paper.doi || ""));
  const isWechat = sourceAccountNames(paper).size > 0;
  const emptyWechatText = local.textStatus === "empty" || paper.wechatTextStatus?.hasContent === false;
  const modelTitleUnsafe = isWechat && emptyWechatText && !hasDoi && !doiTitle;
  const dynamicOnly = paper.resolutionStatus === "dynamic_only" || local.resolutionStatus === "dynamic_only";
  const modelCandidates = [mention.title, local.extractedTitle, local.title];
  const sourceCandidates = [paper.originalTitle, paper.rawTitle, paper.title];
  if (dynamicOnly && !doiTitle) {
    const sourceTitle = sourceCandidates.map(cleanMetadataText).find(Boolean);
    if (sourceTitle) return sourceTitle;
  }
  const candidates = [
    doiTitle,
    ...(modelTitleUnsafe ? sourceCandidates : modelCandidates),
    ...(modelTitleUnsafe ? modelCandidates : sourceCandidates)
  ]
    .map(cleanMetadataText)
    .filter((candidate) => !titleCandidateIsOnlyJournal(candidate));
  const english = candidates.find(looksLikeEnglishTitle);
  return english || candidates.find(Boolean) || "";
}

function titleCandidateIsOnlyJournal(value = "") {
  const text = cleanMetadataText(value);
  if (!text || /[|｜丨:：]/.test(text)) return false;
  const known = canonicalKnownJournal(text);
  if (!known) return false;
  return normalizeJournalTitle(known) === normalizeJournalTitle(text);
}

export function metadataConfidence(paper = {}) {
  const doi = normalizeDoiValue(paper.doi || "");
  const journal = cleanMetadataText(paper.journal || "");
  const title = cleanMetadataText(paper.originalTitle || paper.title || "");
  const authors = cleanAuthors(paper.authors);
  let score = 0;
  const signals = [];
  if (doi) {
    score += 35;
    signals.push("doi");
  }
  if (journal && !isWechatSourceAccount(journal, paper)) {
    score += canonicalKnownJournal(journal) ? 25 : 16;
    signals.push("journal");
  }
  if (looksLikeEnglishTitle(title)) {
    score += 25;
    signals.push("english_title");
  } else if (title) {
    score += 8;
    signals.push("title");
  }
  if (authors.length) {
    score += 10;
    signals.push("authors");
  }
  if ((paper.abstract || "").length >= 500) {
    score += 5;
    signals.push("fuller_text");
  }
  score = Math.max(0, Math.min(score, 100));
  return {
    score,
    status: score >= 70 ? "good" : score >= 45 ? "partial" : "needs_review",
    signals
  };
}

export function metadataFingerprint(paper = {}) {
  const local = paper.localPrescreen || {};
  const mention = bestMention(paper);
  return JSON.stringify({
    doi: normalizeDoiValue(paper.doi || mention.doi || local.doi || ""),
    title: normalizeTitleKey(paper.originalTitle || paper.title || mention.title || local.extractedTitle || ""),
    journal: normalizeJournalTitle(paper.journal || mention.journal || local.journal || ""),
    mentionTitle: normalizeTitleKey(mention.title || ""),
    mentionJournal: normalizeJournalTitle(mention.journal || ""),
    mentionDoi: normalizeDoiValue(mention.doi || ""),
    confidence: paper.metadataConfidence?.status || local.metadataConfidence?.status || ""
  });
}

export function enrichPaperMetadata(paper = {}) {
  const local = paper.localPrescreen || {};
  const hasLocalPrescreen = Object.keys(local).length > 0;
  const mention = bestMention(paper);
  const sourceNames = sourceAccountNames(paper);
  const hasWechatSource = sourceNames.size > 0;
  const hasMultipleMentions = Number(local.paperMentionCount || 0) > 1;
  const doiFallbackText = hasMultipleMentions
    ? [mention.doi, mention.title, mention.oneLine, mention.reason, paper.url].filter(Boolean).join("\n")
    : [paper.url, paper.title, paper.abstract, paper.citation, local.oneLine, local.reason, mention.oneLine, mention.reason]
        .filter(Boolean)
        .join("\n");
  const rawDoi = normalizeDoiValue(
    mention.doi ||
      local.doi ||
      paper.doi ||
      doiMatches(doiFallbackText)[0] ||
      ""
  );
  const title = chooseTitle(paper, mention, paperTitleFromDoi(rawDoi));
  const doiAbstract = paperAbstractFromDoi(rawDoi);
  const doiMetadataJournal = journalNameFromDoiMetadata(rawDoi);
  const doiPatternJournal = journalNameFromDoiPattern(rawDoi);
  const allowSharedLocalJournal = !hasMultipleMentions && !["secondary", "background"].includes(String(mention.role || ""));
  const paperJournal =
    paper.journal && !isWechatSourceAccount(paper.journal, paper) && (!hasWechatSource || allowSharedLocalJournal || mention.journal)
      ? paper.journal
      : "";
  const journalText = [
    mention.journal,
    allowSharedLocalJournal ? local.journal : "",
    paperJournal,
    paper.title,
    paper.abstract,
    local.oneLine,
    local.reason,
    mention.oneLine,
    mention.reason
  ]
    .filter(Boolean)
    .join("\n");
  const scopedMention = scopedJournalCandidate(mention.journal, title);
  const scopedLocal = allowSharedLocalJournal ? scopedJournalCandidate(local.journal, title) : "";
  const scopedPaper = !hasWechatSource ? scopedJournalCandidate(paperJournal, title) : "";
  const nonConflictingScopedMention = doiPatternJournal && genericJournalName(scopedMention) && scopedMention !== doiPatternJournal ? "" : scopedMention;
  const nonConflictingScopedLocal = doiPatternJournal && genericJournalName(scopedLocal) && scopedLocal !== doiPatternJournal ? "" : scopedLocal;
  const nonConflictingScopedPaper = doiPatternJournal && genericJournalName(scopedPaper) && scopedPaper !== doiPatternJournal ? "" : scopedPaper;
  const scopedSourceSignal = (paper.sourceSignals || [])
    .filter((signal) => ["topJournal", "reviewJournal", "professionalJournal", "rss"].includes(signal.type))
    .map((signal) => scopedJournalCandidate(signal.name, title))
    .find(Boolean) || "";
  const allowTextJournal = allowSharedLocalJournal || Boolean(nonConflictingScopedMention);
  const inferredTextJournal = allowTextJournal
    ? inferJournalFromMetadataText({
        title,
        text: journalText,
        journal: [mention.journal, allowSharedLocalJournal ? local.journal : "", paperJournal].filter(Boolean).join("\n"),
        doi: rawDoi
      })
    : "";
  const journal =
    doiMetadataJournal ||
    nonConflictingScopedMention ||
    nonConflictingScopedLocal ||
    scopedSourceSignal ||
    (genericJournalName(nonConflictingScopedPaper) ? "" : nonConflictingScopedPaper) ||
    inferredTextJournal ||
    nonConflictingScopedPaper ||
    doiPatternJournal ||
    (!rawDoi ? paperJournal : "");
  const authors = cleanAuthors(mention.authors).length
    ? cleanAuthors(mention.authors)
    : cleanAuthors(local.authors).length
      ? cleanAuthors(local.authors)
      : cleanAuthors(paper.authors);
  const interpretiveType = inferInterpretivePaperType({
    ...paper,
    doi: rawDoi || paper.doi || "",
    localPrescreen: {
      ...local,
      paperMention: mention
    }
  });
  const paperType = interpretiveType?.paperType || mention.paperType || local.paperType || paper.type;
  const paperTypeGroup = interpretiveType?.paperTypeGroup || paper.paperTypeGroup || local.paperTypeGroup || mention.paperTypeGroup || "";
  const enriched = {
    ...paper,
    title: title || paper.title,
    originalTitle: looksLikeEnglishTitle(title) ? title : paper.originalTitle || "",
    abstract: doiAbstract || paper.abstract || "",
    journal: journal || (!rawDoi ? paper.journal || "" : ""),
    type: paperType || paper.type,
    doi: rawDoi || paper.doi || "",
    authors,
    resolutionStatus: paper.resolutionStatus || local.resolutionStatus || "",
    recommendationEligible: paper.recommendationEligible ?? local.recommendationEligible,
    metadataEvidence: paper.metadataEvidence || local.metadataEvidence,
    doiEvidence: paper.doiEvidence || local.doiEvidence,
    paperTypeGroup,
    localPrescreen: hasLocalPrescreen
      ? {
          ...local,
          category: interpretiveType?.category || local.category,
          paperType,
          paperTypeGroup,
          journal: journal || (!rawDoi ? local.journal || "" : ""),
          doi: rawDoi || local.doi || "",
          extractedTitle: title || local.extractedTitle || "",
          typeEvidence: interpretiveType
            ? {
                type: interpretiveType.evidence,
                value: interpretiveType.paperType
              }
            : local.typeEvidence,
          paperMention: Object.keys(mention).length
            ? {
                ...mention,
                category: interpretiveType?.category || mention.category,
                paperType,
                paperTypeGroup,
                title: mention.title || title || "",
                journal: journal || (!rawDoi ? mention.journal || "" : ""),
                doi: rawDoi || mention.doi || ""
              }
            : local.paperMention
        }
      : paper.localPrescreen
  };
  const confidence = metadataConfidence(enriched);
  return {
    ...enriched,
    metadataConfidence: confidence,
    metadataStatus: confidence.status,
    localPrescreen: enriched.localPrescreen
      ? {
          ...enriched.localPrescreen,
          metadataConfidence: confidence,
          metadataStatus: confidence.status
        }
      : enriched.localPrescreen
  };
}
