import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "data", "wechat-candidates.json");
const LOCAL_DB = process.env.WECHAT_DB_PATH || "/Users/xcli/data/db.db";
const LOOKBACK_DAYS = Number(process.env.PAPER_DAILY_LOOKBACK_DAYS || 5);
const MAX_PER_SOURCE = Number(process.env.PAPER_DAILY_MAX_PER_SOURCE || 30);
const MAX_ABSTRACT_CHARS = Number(process.env.PAPER_DAILY_WECHAT_TEXT_CHARS || 2500);

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

function stripHtml(value = "") {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function compactText(value = "") {
  return stripHtml(value)
    .replace(/图片|点击蓝字关注我们|欢迎关注|免责声明|END\s*$/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value = "", maxChars = MAX_ABSTRACT_CHARS) {
  const text = value.trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trim()}...`;
}

function mergeDescriptionAndBody(description = "", body = "") {
  if (!description) return body;
  if (!body) return description;
  if (body.includes(description) || body.slice(0, 300).includes(description.slice(0, 80))) {
    return body;
  }
  if (description.includes(body)) return description;
  return `${description}\n\n${body}`;
}

function inferType(title = "", abstract = "") {
  const text = `${title} ${abstract}`.toLowerCase();
  if (/systematic review|meta[- ]analysis|系统综述|荟萃/.test(text)) return "SystematicReview";
  if (/review|综述/.test(text)) return "Review";
  if (/data descriptor|dataset|database|resource|software|数据论文|数据集|数据库|资源|软件/.test(text)) return "Dataset";
  if (/method|protocol|方法|实验方案/.test(text)) return "Methods";
  if (/spotlight|聚焦/.test(text)) return "Spotlight";
  if (/\bforum\b|\bessay\b|论坛|随笔/.test(text)) return "Forum";
  if (/perspective|viewpoint|opinion|观点/.test(text)) return "Perspective";
  if (/commentary|comment|评论/.test(text)) return "Comment";
  if (/correspondence|letter|通讯|来信|信件/.test(text)) return "Correspondence";
  if (/news\s*&\s*views|news and views/.test(text)) return "NewsAndViews";
  if (/research highlight|研究亮点/.test(text)) return "ResearchHighlight";
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
  select
    id,
    mp_id,
    title,
    url,
    description,
    substr(coalesce(content, ''), 1, 12000) as content,
    substr(coalesce(content_html, ''), 1, 12000) as content_html,
    has_content,
    publish_time
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
      "content": row["content"] or "",
      "content_html": row["content_html"] or "",
      "has_content": row["has_content"] or 0,
      "publish_time": row["publish_time"] or 0
    })
print(json.dumps({"feeds": feeds, "items": items}, ensure_ascii=False))
`;
  const result = spawnSync("python3", ["-", LOCAL_DB, String(LOOKBACK_DAYS), String(MAX_PER_SOURCE)], {
    input: script,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20
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
  const description = compactText(row.description || "");
  const body = compactText(row.content || row.content_html || "");
  const abstract = truncateText(mergeDescriptionAndBody(description, body));
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
    wechatTextStatus: {
      hasContent: Boolean(row.has_content),
      descriptionChars: description.length,
      bodyChars: body.length,
      usedChars: abstract.length
    },
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
