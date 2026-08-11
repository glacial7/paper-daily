import assert from "node:assert/strict";
import fs from "node:fs";

const ALLOWED_SOURCE_TYPES = new Set(["topJournal", "reviewJournal", "professionalJournal"]);
const FORBIDDEN_PATHS = [
  "config/wechat-local.example.json",
  "data/wechat-candidates.json",
  "data/wechat-sources.js",
  "scripts/import-wechat-local.mjs",
  "scripts/prescreen-wechat-local.mjs",
  "scripts/sync-wechat-api.mjs"
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assertRssItem(item, location) {
  assert.ok(Array.isArray(item.sourceSignals) && item.sourceSignals.length, `${location} has no RSS source signal`);
  assert.ok(
    item.sourceSignals.every((signal) => ALLOWED_SOURCE_TYPES.has(signal.type)),
    `${location} contains a non-journal RSS source`
  );
  assert.ok(
    !(item.sourceUrls || []).some((source) =>
      /mp\.weixin\.qq\.com|wechat|微信公众号/i.test(`${source?.url || ""} ${source?.label || ""}`)
    ),
    `${location} contains a WeChat source URL`
  );
}

const sources = readJson("config/sources.json");
assert.ok(sources.length > 0, "sources.json must contain public journal feeds");
sources.forEach((source, index) => {
  assert.ok(ALLOWED_SOURCE_TYPES.has(source.type), `source ${index} is not a journal source`);
  assert.ok(
    source.feedUrl || (Array.isArray(source.feedUrls) && source.feedUrls.length),
    `source ${index} has no explicit RSS feed`
  );
});

for (const file of ["data/rss-candidates.json", "data/candidates.json"]) {
  readJson(file).forEach((item, index) => assertRssItem(item, `${file}[${index}]`));
}

const latest = readJson("data/latest.json");
assert.equal(latest.sourceMode, "public-journal-rss-only");
assert.ok((latest.items || []).length > 0, "latest.json must contain visible daily papers");
const latestPapers = [...(latest.items || []), ...(latest.dynamicItems || [])];
latestPapers.forEach((item, index) => assertRssItem(item, `data/latest.json item ${index}`));

FORBIDDEN_PATHS.forEach((file) => assert.ok(!fs.existsSync(file), `${file} must not be published`));

const researchProfile = readJson("config/research-profile.json");
assert.equal(researchProfile.profileName, "General ecology starter profile");
assert.deepEqual(researchProfile.researchQuestions, []);
assert.ok(Array.isArray(researchProfile.coreTopics));
const allowedTopicTags = new Set(Object.keys(researchProfile.topicLabels || {}));
latestPapers.forEach((item, index) => {
  assert.ok(
    (item.tags || []).every((tag) => allowedTopicTags.has(tag)),
    `data/latest.json item ${index} contains a non-template topic tag`
  );
});
const personalizedReading = /(?:用户|维护者|你的|您).{0,24}(?:研究|课题|方向|兴趣)|(?:当前|核心|个人).{0,12}(?:研究方向|课题|任务)/;
latestPapers.forEach((item, index) => {
  assert.doesNotMatch(
    [item.oneLine, item.summary, item.reason, item.citation].filter(Boolean).join(" "),
    personalizedReading,
    `data/latest.json item ${index} contains a personalized reading judgment`
  );
});
assert.doesNotMatch(
  fs.readFileSync("data/paper-cache.json", "utf8"),
  personalizedReading,
  "paper-cache.json contains a personalized reading judgment"
);
const topicFeedback = readJson("config/topic-feedback.json");
assert.deepEqual(topicFeedback.feedback, []);
assert.deepEqual(topicFeedback.watchlist, []);

const personalizationFiles = ["app.js", "config/research-profile.json", "config/topic-feedback.json"];
const personalMarkers = /光伏工程与植物入侵|干热河谷植物入侵|河谷萨王纳|麋鹿|互花米草|鼠兔|潮间带微藻|pv_invasion|dry_valley_savanna|saltmarsh_milu_spartina/;
personalizationFiles.forEach((file) => {
  assert.doesNotMatch(fs.readFileSync(file, "utf8"), personalMarkers, `${file} contains a maintainer-specific profile`);
});
assert.doesNotMatch(
  fs.readFileSync("scripts/score-papers.mjs", "utf8"),
  /pv_invasion|dry_valley_savanna|saltmarsh_milu_spartina|当前核心任务来自|用户研究画像依据/,
  "score-papers.mjs contains a hard-coded maintainer profile"
);

const workflow = fs.readFileSync(".github/workflows/update-daily.yml", "utf8");
assert.match(workflow, /PAPER_DAILY_STRICT_JOURNAL_RSS:\s*1/);
assert.match(workflow, /PAPER_DAILY_INCLUDE_WECHAT:\s*0/);
assert.match(workflow, /PAPER_DAILY_RSS_ONLY:\s*1/);
assert.match(workflow, /file_pattern:.*data\/rss-candidates\.json/);

const fetchSources = fs.readFileSync("scripts/fetch-sources.mjs", "utf8");
assert.match(fetchSources, /STRICT_JOURNAL_RSS[\s\S]*fs\.writeFile\(PUBLIC_RSS_CANDIDATES/);
const scorePapers = fs.readFileSync("scripts/score-papers.mjs", "utf8");
assert.match(scorePapers, /entry\.version !== SCORING_VERSION/);
assert.match(scorePapers, /researchProfile: preferences\.researchProfile/);

const sourcesHtml = fs.readFileSync("sources.html", "utf8");
assert.doesNotMatch(sourcesHtml, /wechat-sources\.js/i);
for (const html of ["index.html", "daily.html", "updates.html", "sources.html", "customize.html", "changelog.html"]) {
  assert.match(fs.readFileSync(html, "utf8"), /data-nav="customize"/);
}
const app = fs.readFileSync("app.js", "utf8");
assert.doesNotMatch(app, /data-filter=["'](?:wechat|news)["']/i);
assert.doesNotMatch(app, /loadWechatSourceConfigs\(\).*loadSourceUpdateStats/i);
assert.match(app, /loadResearchProfile\(\)/);
assert.match(app, /class="project-overview"/);
assert.match(app, /仅公开期刊 RSS/);

console.log("Public journal RSS-only boundary verified.");
