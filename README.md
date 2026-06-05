# Paper Daily

Static prototype for a paper daily website.

## Pages

- `index.html`: all paper updates
- `daily.html`: daily top 10 recommendations
- `sources.html`: source management prototype
- `changelog.html`: version notes

## Deployment

Upload all files in this folder to a GitHub repository, then enable GitHub Pages from the repository settings.

The GitHub Actions workflow updates the site automatically every day at 04:00 Beijing time. Manual `Run workflow` is only needed when you want to refresh immediately or after changing source/feedback configuration.

## DeepSeek scoring

Do not put your API key in `app.js` or any frontend file.

Add a repository secret:

`Settings -> Secrets and variables -> Actions -> New repository secret`

Name:

`DEEPSEEK_API_KEY`

Value:

your DeepSeek API key.

The workflow `.github/workflows/update-daily.yml` runs a two-stage scoring pipeline:

1. `deepseek-v4-flash` prescreens title, abstract, and metadata for topic relevance.
2. `deepseek-v4-pro` scores passed candidates and generates the daily summary.

It writes the result to `data/latest.json`. The current display window is the most recent 5 days, and the daily page selects the top 10 papers from that window.

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

## Feedback config

The like/dislike buttons are stored in the browser first. To make feedback affect future GitHub Actions scoring, use the `导出反馈` button on `index.html`, then upload the downloaded file to:

`config/topic-feedback.json`

The scoring script reads this file and applies topic preference adjustments after a topic has at least 3 feedback samples.
