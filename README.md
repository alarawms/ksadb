# KSADB — KSA sequencing database

Serverless dashboard for Saudi Arabia genomics submissions across NCBI SRA and ENA.

- Frontend: Next.js 14 static export (Cloudflare Pages)
- API: Pages Functions (`functions/api/`) on Cloudflare D1 (serverless SQLite)
- Sync: Python ETL (`sync/`) run daily by GitHub Actions, pushing batch upserts to D1

## Layout

- `app/ components/ lib/` — Next.js app (client-rendered, fetches same-origin `/api/*`)
- `functions/api/` — Pages Functions (one file per endpoint)
- `sync/` — Python ETL: `fetch.py` (NCBI/ENA), `normalize.py`, `institutions.py`,
  `loader.py` (`rows_from_csv`), `d1_push.py` (D1 write path), `cli.py`
- `sync/seed.csv` — seed snapshot (44,543 runs)
- `migrations/` — D1 schema migrations
- `tests/` — pytest (sync, offline, fake HTTP)

## Local development

```bash
npm install
npm run dev            # next dev (frontend only)
npm run build          # static export to .next/out
npx wrangler d1 migrations apply ksadb-db --local
KSADB_D1_SQL_OUT=.tmp-sql .venv/bin/python -m sync.cli seed --csv sync/seed.csv
for f in .tmp-sql/*.sql; do npx wrangler d1 execute ksadb-db --local --file "$f"; done
npm run pages:dev      # site + functions + local D1 on http://127.0.0.1:8788
```

## Tests

```bash
.venv/bin/python -m pytest tests/ -v   # Python sync (offline)
npm test                                # vitest (_lib SQL builders)
npm run typecheck && npm run build
```

## Deployment

1. `npx wrangler login`, then `npx wrangler d1 create ksadb-db` and put the
   returned `database_id` into `wrangler.toml`.
2. Push to `main` — `.github/workflows/deploy.yml` applies migrations and deploys.
3. GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
   `D1_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN` (needs D1 edit permission).
4. Run the `sync` workflow once (Actions → sync → Run workflow) to populate D1;
   it then re-syncs daily at 03:23 UTC.

## API

`GET /api/search` · `/api/records/{acc}` · `/api/projects/{acc}` · `/api/institutions/{name}` ·
`/api/samples/{acc}` · `/api/export?format=csv|json` ·
`/api/stats/summary` · `/api/stats/timeseries` · `/api/stats/top?dimension=` ·
`/api/stats/saudi-split` · `/api/stats/library-strategies` · `/api/stats/wgs-trend` · `/api/stats/human` · `/api/pathogens`
