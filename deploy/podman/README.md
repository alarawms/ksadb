# Podman local stack

A fully local replacement for the Cloudflare services the ksadb pipeline and
Pages functions talk to, so the whole loop — sync → aggregate → embed → query —
runs on one machine with zero credentials.

```
ENA ──pull──▶ sync ──push──▶ d1-shim (SQLite) ──▶ aggregate ──▶ aggregates volume
                                    │                                    │
                                    │◀────────────── shim HTTP :8789 ◀───┘
                                    │                                    │
                              embed │──▶ embedder (bge-small vectors)   │
                                    │         ▲                          │
                                    └─────────┴─────────── pages:dev :8788 (stats + semantic query)
```

- `d1-shim` — stdlib Python HTTP shim speaking the D1 REST surface
  (`/accounts/*/d1/database/*/query`) over a SQLite file, plus
  `/aggregates/<name>.json` file serving and `/admin/apply-sql?dir=...` for
  bulk-fixture application.
- `embedder` — FastAPI sidecar hosting the `@cf/baai/bge-small-en-v1.5` model
  (`/ai/run/...`) and a Vectorize-compatible index
  (`/vectorize/v2/indexes/studies-vec/...`). It ignores the account segment;
  literal account `local` is used everywhere.
- `sync` — the same container image as CI, with the env seams
  (`CF_API_BASE_URL`, `AI_BASE_URL`, `VECTORIZE_BASE_URL`) pointed at the two
  sidecars.

## Prereqs

- podman + the `podman compose` plugin (rootless is fine).
- Rootless podman socket running: `systemctl --user start podman.socket`.
- A host Python venv with `pytest` for the test suite (`../.venv`).
- node/npm for `pages:dev` and the Next build.

## Smoke loop (fixtures, no ENA access needed)

```bash
cd ksadb-podman-local   # this worktree
podman compose -f deploy/podman/compose.yml up -d d1-shim embedder
cp .dev.vars.example .dev.vars   # in the worktree root, for pages:dev
# seed fixture data (mounted read-only at /fixtures in d1-shim):
curl -s "http://localhost:8789/admin/apply-sql?dir=/fixtures"   # GET, not POST
podman compose -f deploy/podman/compose.yml run --rm sync aggregate --out-dir /aggregates
curl -s http://localhost:8789/aggregates/summary.json    # expect {"runs": 3, ...}
podman compose -f deploy/podman/compose.yml run --rm sync embed
# expect: embedded 1 study, 2 sample, 2 run entities (SAMLOC3/ERRLOC3 are
# non-Saudi and must be excluded; re-running embed prints "nothing to embed")
```

Expected with `deploy/podman/fixtures/minimal.sql`:

- `summary.json` reports 3 runs (aggregate counts everything).
- `sync embed` prints `embedded 1 study entities`, `embedded 2 sample
  entities`, `embedded 2 run entities` — proving the Saudi-only filter
  (`samples.country = 'SA'`), because the fixture deliberately includes a
  non-Saudi sample+run.

Direct vector check (optional; grab a 384-float vector from the embedder and
query the index):

```bash
VEC=$(curl -s -X POST http://localhost:8790/accounts/local/ai/run/@cf/baai/bge-small-en-v1.5 \
  -H 'content-type: application/json' -d '{"text": ["camel gut metagenome"]}' \
  | python3 -c 'import json,sys; print(json.dumps(json.load(sys.stdin)["result"]["data"][0]))')
curl -s -X POST http://localhost:8790/accounts/local/vectorize/v2/indexes/studies-vec/query \
  -H 'content-type: application/json' \
  -d "{\"vector\": $VEC, \"topK\": 10}"
# expect SAMLOC1 / ERRLOC1 among the matches, no SAMLOC3
```

### pages:dev against the local stack

`wrangler pages dev` cannot run from the worktree root without Cloudflare
credentials: wrangler 4 always proxies the `[ai]` binding through Cloudflare
(even in local dev) and refuses to start without `CLOUDFLARE_API_TOKEN`.
`deploy/podman/pages-root/` is a tiny Pages project root that works around
this — its `wrangler.toml` is the root config minus the `[ai]` binding (the
functions never touch `env.AI` when `AI_BASE_URL` is set), and its
`package.json` anchors wrangler's Pages project-root detection so the local
state and config reloads stay inside this directory. `functions` and
`.dev.vars` are symlinks back to the worktree.

```bash
npm ci --legacy-peer-deps   # if node_modules is incomplete
npm run build               # export the static site
cp .dev.vars.example .dev.vars                # worktree root, if not already present
ln -sfn ../../../.dev.vars deploy/podman/pages-root/.dev.vars   # symlink is gitignored
cp -al .next/out deploy/podman/pages-root/out   # hardlink copy (fast); re-copy after each build
cd deploy/podman/pages-root
npx wrangler pages dev out
```

Then:

```bash
curl -s http://localhost:8788/api/v2/stats/summary          # {"runs": 3, ...}
curl -s -X POST http://localhost:8788/api/v2/semantic \
  -H 'content-type: application/json' \
  -d '{"query": "camel gut metagenome"}'
# typed matches resolve PRJLOC1 / ERRLOC1 / SAMLOC1 — and never SAMLOC3
```

Note: match resolution (`env.DB`) and `/explore` search use the wrangler D1
binding, which has no env seam. Mirror the star schema + fixtures into the
pages-root wrangler's local D1 first (run from `deploy/podman/pages-root` so
the state lands in its `.wrangler/`, which the dev server reads):

```bash
cd deploy/podman/pages-root
for f in ../../../migrations/0003_star_schema.sql ../../../migrations/0004_star_indexes.sql \
         ../../../migrations/0006_sync_meta.sql ../../../migrations/0007_embedded_entities.sql \
         ../fixtures/minimal.sql; do
  npx wrangler d1 execute ksadb-db --local --file "$f"
done
```

## Full local pull (real ENA data, optional)

```bash
mkdir -p deploy/podman/.local-sql
podman compose -f deploy/podman/compose.yml run --rm -e KSADB_D1_SQL_OUT=/sql sync pull-v2
curl -s "http://localhost:8789/admin/apply-sql?dir=/sql"
# mirror into wrangler local D1 (needed for /explore search + match resolution;
# run from deploy/podman/pages-root so pages:dev sees it):
cd deploy/podman/pages-root
for f in ../.local-sql/*.sql; do
  npx wrangler d1 execute ksadb-db --local --file "$f"
done
```

## Ports

| Host port | Service   | Purpose                                        |
|-----------|-----------|------------------------------------------------|
| 8789      | d1-shim   | D1 REST shim, `/aggregates/*.json`, `/admin/apply-sql` |
| 8790      | embedder  | Workers AI run + Vectorize-compatible index    |
| 8788      | pages:dev | wrangler pages dev (Next static export + functions) |

## Env contract

| Variable           | Where           | Points at (local)                  |
|--------------------|-----------------|------------------------------------|
| `CF_API_BASE_URL`  | sync            | `http://d1-shim:8000`              |
| `AI_BASE_URL`      | sync, functions | `http://embedder:8000` / `http://localhost:8790` |
| `VECTORIZE_BASE_URL` | sync, functions | same as `AI_BASE_URL`            |
| `AGGREGATES_BASE_URL` | functions only | `http://localhost:8789`          |
| `D1_ACCOUNT_ID` / `D1_DATABASE_ID` / `D1_API_TOKEN` / `CF_API_TOKEN` | sync | literal `local` (sidecars ignore them, but the CLI requires them set) |

Functions read the `*_BASE_URL` seams from `.dev.vars` (see
`.dev.vars.example`); sync gets them from `compose.yml`.

## Troubleshooting

- `podman compose -f deploy/podman/compose.yml down -v` wipes **all** state
  (SQLite db, vectors, aggregates) — the nuclear reset.
- Embedder first build downloads torch (~GB); subsequent builds are cached.
- If `pages:dev` is already running on 8788 from another worktree, stop it
  first or expect a port-bind error.
- Migration drift (e.g. after editing migration files) → wipe the `dbdata`
  volume (`down -v` or `podman volume rm ksadb-local_dbdata`); the shim
  re-applies migrations on boot.
- `pull-v2` needs real ENA access; the fixtures path above needs none.
- `wrangler pages dev` failing with "it's necessary to set a CLOUDFLARE_API_TOKEN"
  means you ran from the worktree root (the `[ai]` binding forces a Cloudflare
  remote-proxy session in wrangler 4) — use `deploy/podman/pages-root` instead.
- If sync hits `https://api.cloudflare.com` despite the compose env seams, the
  `sync` image predates the seams — rebuild: `podman compose -f deploy/podman/compose.yml build sync`.
