# Paper Daily

Static prototype for a paper daily website.

## Pages

- `index.html`: all paper updates
- `daily.html`: daily top 10 recommendations
- `sources.html`: source management prototype
- `changelog.html`: version notes

## Deployment

Upload all files in this folder to a GitHub repository, then enable GitHub Pages from the repository settings.

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

It writes the result to `data/latest.json`.

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
