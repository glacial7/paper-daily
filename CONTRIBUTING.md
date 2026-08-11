# Contributing to Paper Daily

Paper Daily is a public, RSS-only literature-tracking template. Contributions
should preserve its research-focused workflow, source boundaries, and privacy
defaults.

## Before You Start

- Search existing issues and pull requests before opening a new one.
- Use an issue to discuss changes that affect source collection, metadata
  repair, scoring behavior, generated data, or the public data boundary.
- Do not include API keys, cookies, private subscription lists, personal
  research materials, or local application data in an issue or pull request.

## Development

Requirements:

- Node.js 20 or newer
- Python 3 for the local static server

Run the public verification suite before submitting a pull request:

```bash
npm run verify
```

Preview the static reader locally:

```bash
npm run serve
```

Then open <http://localhost:8080> and check the affected pages at desktop and
mobile widths.

## Pull Requests

- Keep each pull request focused on one behavior or maintenance task.
- Explain the user-facing change and the verification performed.
- Add or update regression coverage when changing metadata, journal, article
  type, topic, cache, or RSS-only filtering behavior.
- Keep hand-authored changes separate from broad generated snapshot updates
  when practical.
- Do not weaken the journal RSS-only checks to make a failing fixture pass.

## Public Data Boundary

The public repository accepts journal RSS feeds configured in
`config/sources.json`. It must not publish WeChat subscription data, news
aggregator feeds, cookies, credentials, private feedback, or local Paper Daily
application data.

Use `config/research-profile.json` for a public research profile and review
`config/topic-feedback.json` before committing exported feedback. Both files
are visible to everyone once pushed.

## Security Reports

Do not open a public issue for a vulnerability or accidental secret exposure.
Follow [SECURITY.md](SECURITY.md) to report it privately.
