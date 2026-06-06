import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "data", "wechat-candidates.json");
const LOCAL_DB = process.env.WECHAT_DB_PATH || "/Users/xcli/data/db.db";
const LOOKBACK_DAYS = Number(process.env.PAPER_DAILY_LOOKBACK_DAYS || 5);
const MAX_PER_SOURCE = Number(process.env.PAPER_DAILY_MAX_PER_SOURCE || 30);

function decodeEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function inferType(title = "", abstract = "") {
  const text = `${title} ${abstract}`.toLowerCase();
  if (/review|综述/.test(text)) return "Review";
  if (/method|protocol|dataset|database|方法|数据/.test(text)) return "Methods";
  if (/comment|opinion|观点|评论|letter|correspondence/.test(text)) return "Comment";
  return "News";
}

function readWechatDb() {
  const script = `
import json, sqlite3, sys, time
db_path, lookback_days, max_per_source = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
cutoff = int(time.time()) - lookback_days * 24 * 60 * 60
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()
feeds = {row["id"]: row["mp_name"] for row in cur.execute("select id, mp_name from feeds where status != 0")}
counts = {}
items = []
for row in cur.execute("""
  select id, mp_id, title, url, description, publish_time
  from articles
  where status != 1000 and title is not null and title != '' and publish_time >= ?
  order by publish_time desc
""", (cutoff,)):
    mp_id = row["mp_id"] or ""
    if mp_id not in feeds:
        continue
    if counts.get(mp_id, 0) >= max_per_source:
        continue
    counts[mp_id] = counts.get(mp_id, 0) + 1
    items.append({
      "id": row["id"],
      "mp_id": mp_id,
      "mp_name": feeds[mp_id],
      "title": row["title"],
      "url": row["url"],
      "description": row["description"] or "",
      "publish_time": row["publish_time"] or 0
    })
print(json.dumps({"feeds": feeds, "items": items}, ensure_ascii=False))
`;
  const result = spawnSync("python3", ["-", LOCAL_DB, String(LOOKBACK_DAYS), String(MAX_PER_SOURCE)], {
    input: script,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || "Failed to read local we-mp-rss database.");
  }
  return JSON.parse(result.stdout);
}

function toIsoDate(seconds) {
  if (!seconds) return "";
  const date = new Date(Number(seconds) * 1000);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function toCandidate(row) {
  const title = decodeEntities(row.title || "");
  const abstract = decodeEntities(row.description || "");
  const doiMatch = `${title} ${abstract} ${row.url || ""}`.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  const doi = doiMatch ? doiMatch[0].replace(/[.,;)\]]+$/, "") : "";
  return {
    id: `wechat-${row.id}`,
    title,
    abstract,
    journal: row.mp_name,
    type: inferType(title, abstract),
    doi,
    url: row.url,
    date: toIsoDate(row.publish_time),
    sourceSignals: [
      {
        type: "wechat",
        name: row.mp_name,
        url: row.url
      }
    ]
  };
}

async function main() {
  try {
    await fs.access(LOCAL_DB);
  } catch {
    console.error(`Cannot find local we-mp-rss database: ${LOCAL_DB}`);
    console.error("If your data folder is elsewhere, run with WECHAT_DB_PATH=/path/to/db.db.");
    process.exit(1);
  }

  const data = readWechatDb();
  const items = data.items.map(toCandidate);
  await fs.writeFile(
    OUTPUT,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), source: "local-we-mp-rss-db", items }, null, 2)}\n`
  );
  console.log(`Found ${Object.keys(data.feeds).length} WeChat account(s).`);
  console.log(`Wrote ${OUTPUT} with ${items.length} WeChat candidate(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
