# PaperDaily Public RSS

PaperDaily is a research-focused literature tracker. This repository hosts the public GitHub Pages edition, which follows explicitly configured journal RSS feeds and applies DOI-aware metadata repair, ecology relevance screening, and a narrow daily reading queue.

Live site: https://glacial7.github.io/paper-daily/

## Public Source Boundary

The GitHub Pages edition accepts only public RSS feeds from journals listed in `config/sources.json`:

- comprehensive and selective journals;
- review journals;
- professional ecology journals.

It does not publish or process:

- WeChat subscriptions, articles, account lists, cookies, or local WeRSS data;
- news aggregators or institutional news feeds;
- private model credentials or local caches;
- local macOS app controls.

RSS provides discovery. DOI and article metadata are used to confirm paper identity, journal, and article type. A source count is not treated as a paper-quality score.

## Reader

- `index.html`: narrow daily reading queue;
- `updates.html`: broader recent candidate pool;
- `sources.html`: configured journal RSS feeds and recent counts;
- `changelog.html`: public-edition strategy changes.

The static reader uses `data/latest.json`, with `data/latest.js` as an offline fallback.

## Local Preview

Requires Node.js 20+ and Python 3.

```bash
npm run prepare:public
npm run verify
npm run serve
```

Open http://localhost:8080.

## RSS Update

The GitHub Actions workflow is manual. It:

1. fetches the most recent 14 days from explicit journal RSS URLs;
2. does not use Crossref or page discovery as a substitute source when RSS fails;
3. scores eligible ecology papers with the configured model secret;
4. verifies that candidates, recommendations, source configuration, and published files remain RSS-only;
5. commits the generated reader snapshot.

Repository secret:

```text
DEEPSEEK_API_KEY
```

Run the workflow from **Actions > Update Paper Daily (Journal RSS Only) > Run workflow**.

## Public Data Preparation

`npm run prepare:public` filters a local PaperDaily snapshot before publication. It removes non-journal source signals, private-source fields, non-RSS source configuration, and cache entries unrelated to the current RSS candidate set.

`npm run verify:rss-only` fails if forbidden subscription files exist or if any published candidate lacks an explicit journal RSS source signal.

## Privacy

Never commit API keys, `.env.local`, cookies, WeChat subscription data, local WeRSS databases, private research materials, or personal model caches.
