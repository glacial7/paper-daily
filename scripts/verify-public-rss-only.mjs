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
[...(latest.items || []), ...(latest.dynamicItems || [])].forEach((item, index) =>
  assertRssItem(item, `data/latest.json item ${index}`)
);

FORBIDDEN_PATHS.forEach((file) => assert.ok(!fs.existsSync(file), `${file} must not be published`));

const workflow = fs.readFileSync(".github/workflows/update-daily.yml", "utf8");
assert.match(workflow, /PAPER_DAILY_STRICT_JOURNAL_RSS:\s*1/);
assert.match(workflow, /PAPER_DAILY_INCLUDE_WECHAT:\s*0/);
assert.match(workflow, /PAPER_DAILY_RSS_ONLY:\s*1/);

const sourcesHtml = fs.readFileSync("sources.html", "utf8");
assert.doesNotMatch(sourcesHtml, /wechat-sources\.js/i);
const app = fs.readFileSync("app.js", "utf8");
assert.doesNotMatch(app, /data-filter=["'](?:wechat|news)["']/i);
assert.doesNotMatch(app, /loadWechatSourceConfigs\(\).*loadSourceUpdateStats/i);

console.log("Public journal RSS-only boundary verified.");
