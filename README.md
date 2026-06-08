# Paper Daily

Static prototype for a paper daily website.

## Pages

- `index.html`: daily top 5 recommendations
- `updates.html`: all paper updates
- `daily.html`: compatibility copy for daily recommendations
- `sources.html`: source management prototype
- `changelog.html`: version notes

## Deployment

Upload all files in this folder to a GitHub repository, then enable GitHub Pages from the repository settings.

The GitHub Actions workflow is manual-only. Use `Run workflow` when you want to refresh Paper Daily after updating WeChat candidates, sources, or feedback configuration.

## DeepSeek scoring

Do not put your API key in `app.js` or any frontend file.

For local Mac-only runs, copy `.env.local.example` to `.env.local` and fill in:

`DEEPSEEK_API_KEY=your_deepseek_key`

`.env.local` is ignored by Git and should not be uploaded to GitHub. The local WeChat prescreen and local scoring scripts will read it automatically.

To check whether the value is actually saved, run:

`grep -E "^(DEEPSEEK_API_KEY|DEEPSEEK_WECHAT_PRESCREEN_MODEL)=" .env.local`

Typing `DEEPSEEK_API_KEY=...` directly in Terminal only sets a temporary shell variable unless you also write it into `.env.local`.

Add a repository secret:

`Settings -> Secrets and variables -> Actions -> New repository secret`

Name:

`DEEPSEEK_API_KEY`

Value:

your DeepSeek API key.

The workflow `.github/workflows/update-daily.yml` runs a two-stage scoring pipeline:

1. `deepseek-v4-flash` first checks whether the item is broad ecology research, then prescreens title, abstract, and metadata for topic relevance.
2. `deepseek-v4-pro` scores passed candidates and generates the daily summary.

It writes the result to `data/latest.json`. The current display window is the most recent 5 days. The daily page keeps these days separated and selects the top 5 papers for each day.

To avoid repeated token spending, the scoring script also writes:

`data/paper-cache.json`

The workflow still fetches recent 5-day candidates, but DeepSeek is only called for papers that are new or whose title, abstract, source signals, scoring version, model mode, or feedback weights have changed. Previously scored papers are reused from the cache.

For WeChat candidates, you can move the cheap prescreening step to your Mac before uploading to GitHub. This is useful when many official-account posts are ads, meetings, calls for papers, or institution news.

Run:

`node scripts/import-wechat-local.mjs`

Then run a local cheap-model prescreen:

`DEEPSEEK_API_KEY=your_key node scripts/prescreen-wechat-local.mjs --apply`

The prescreen keeps ecology research, datasets, methods/tools, reviews, and commentary/news reports about concrete studies. It rejects obvious non-research posts and writes type labels into each kept WeChat candidate. After that, upload `data/wechat-candidates.json` to GitHub and run the workflow manually.

## Hidden `.github` folder

`.github/workflows/update-daily.yml` is required for GitHub Actions.

On macOS Finder, folders beginning with `.` are hidden by default. Press:

`Command + Shift + .`

to show hidden files before dragging this folder into GitHub.

If you use GitHub's web upload and cannot see `.github`, create it manually:

1. Open your repository on GitHub.
2. Click `Add file -> Create new file`.
3. Type this as the file name:

`.github/workflows/update-daily.yml`

4. Paste the contents from the local `.github/workflows/update-daily.yml` file.
5. Click `Commit changes`.

## Scoring prompts

The two prompts are in:

`scripts/score-papers.mjs`

- `PRESCREEN_PROMPT`: cheap model topic prescreening.
- `SCORE_PROMPT`: high-quality model scoring and summary generation.

Current scoring:

- Source quality: 30
- Topic relevance: 50
- Paper type: 20

## Source links

The links in `config/sources.json` can be journal homepages, news pages, or RSS feeds.

For each source:

- `pageUrl`: normal webpage URL, such as a journal homepage.
- `feedUrl`: optional RSS/Atom URL.

If `feedUrl` is missing, `scripts/fetch-sources.mjs` tries to discover an RSS/Atom feed from the page HTML. If no feed is discovered, the source is skipped and a warning is printed. Some publisher pages block bots or do not expose RSS feeds, so they may need a manually supplied feed URL later.

The source form on `sources.html` cannot write to GitHub directly because GitHub Pages is static. It generates a real `sources.json` configuration. Download it and upload it to:

`config/sources.json`

After that, GitHub Actions will use the new source in the next run.

On `sources.html`, the source list's `修改` button locates the matching entry in the `sources.json` text area for manual editing. If you add a source with an existing journal or account name, the page will not duplicate it; it locates the existing JSON entry instead.

To update sources on GitHub after exporting `/Users/xcli/Documents/Codex/prj_paper-daily/sources.json`:

1. Open the GitHub repository.
2. Open the `config` folder.
3. Open `sources.json`.
4. Click the pencil edit button.
5. Replace all content with the exported `sources.json` content.
6. Commit the change.
7. Go to `Actions -> Update Paper Daily -> Run workflow` when you want to refresh the site.

## Feedback config

The like/dislike buttons are stored in the browser first. To make feedback affect future GitHub Actions scoring, use the `导出反馈` button on `index.html`, then upload the downloaded file to:

`config/topic-feedback.json`

The scoring script reads this file and applies topic preference adjustments after a topic has at least 3 feedback samples.

## Local WeChat import

This project supports a low-cost WeChat workflow:

1. Run `we-mp-rss` on your Mac.
2. Subscribe to WeChat public accounts locally.
3. Fetch recent WeChat articles into `data/wechat-candidates.json`.
4. Upload `data/wechat-candidates.json` to GitHub.
5. Run `Actions -> Update Paper Daily -> Run workflow`.

Daily app buttons:

- `公众号订阅`: batch-add new subscriptions from `/Users/xcli/Documents/Codex/prj_we-mp-rss/wechat-subscriptions.csv`. Use this only when you have new public-account article URLs to import. It reads `WERSS_USERNAME`, `WERSS_PASSWORD`, and `WERSS_BASE_URL` from `.env.local`, so it does not need manual password input after setup.
- `公众号爬虫`: call the local `we-mp-rss` API to update subscribed accounts and export recent article candidates.
- `信息筛选`: use the cheap DeepSeek model to filter and label WeChat candidates locally.

API setup:

Put your local we-mp-rss login in `.env.local`:

`WERSS_BASE_URL=http://127.0.0.1:8001`

`WERSS_USERNAME=admin`

`WERSS_PASSWORD=your_we_mprss_password`

After this one-time setup, the macOS app buttons can run without asking for a password.

Then run:

`node scripts/sync-wechat-api.mjs`

This calls:

- `/api/v1/wx/mps`: get subscribed public accounts.
- `/api/v1/wx/mps/update/{mp_id}`: update account articles.
- `/api/v1/wx/articles`: list recent articles.
- `/api/v1/wx/articles/{article_id}?content=true`: fetch article detail/content.

It creates:

`data/wechat-candidates.json`

Fallback database import:

If API sync fails, you can still run:

`node scripts/import-wechat-local.mjs`

This reads the local SQLite database directly and creates:

`data/wechat-candidates.json`

If you want to reduce GitHub-side DeepSeek calls for WeChat posts, run:

`DEEPSEEK_API_KEY=your_key node scripts/prescreen-wechat-local.mjs --apply`

If you already created `.env.local`, you can simply run:

`node scripts/prescreen-wechat-local.mjs --apply`

This uses the cheap DeepSeek model locally to filter and label WeChat candidates. It also writes:

- `data/wechat-candidates.prescreened.json`: preview output when `--apply` is not used.
- `data/wechat-prescreen-report.json`: rejected items and text-quality statistics.
- `data/wechat-prescreen-cache.json`: local cache to avoid paying again for unchanged WeChat posts.

GitHub Actions will merge the resulting `data/wechat-candidates.json` with journal/news RSS candidates during the next scoring run. WeChat items that already have `localPrescreen.pass=true` skip GitHub's first cheap prescreen and go straight to unified scoring.

By default, the script reads:

`/Users/xcli/data/db.db`

If your `we-mp-rss` data folder changes, run:

`WECHAT_DB_PATH=/path/to/db.db node scripts/import-wechat-local.mjs`

This command must be run in the Mac Terminal from the project folder. A static GitHub Pages website cannot run local scripts or read the local `we-mp-rss` database.

## we-mp-rss API keys

we-mp-rss Access Key and Secret Key are only for programmatic access to the local WeChat RSS service. They are not DeepSeek keys.

- `Access Key`: public identifier, shown in the Access Key table.
- `Secret Key`: private credential, shown only when the key is created. Treat it like a password.

If a future script calls the we-mp-rss HTTP API directly, put these in `.env.local`:

`WERSS_ACCESS_KEY=...`

`WERSS_SECRET_KEY=...`

Do not upload `.env.local` to GitHub.
