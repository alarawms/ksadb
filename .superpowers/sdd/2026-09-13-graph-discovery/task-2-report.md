# Task 2 Report: Graph detail endpoint for the inspector

**Status:** DONE
**Branch:** `podman-local`
**Commit:** `c78d682` — `feat(graph): /api/v2/graph/detail inspector payload endpoint` (parent: Task 1 @ `791a3e1`)
**Files:** `functions/api/v2/graph/detail.ts` (new), `functions/api/v2/graph/detail.test.ts` (new). No other files touched.

## What was built

`GET /api/v2/graph/detail?node=<type>:<id>` — one `onRequestGet` in
`functions/api/v2/graph/detail.ts`, wrapped in `cachedJson(request, STATS_TTL, ...)`
(6 h, matching graph.ts). Malformed `node` param, unknown type, or `taxon:` id
without a `genus|family|phylum` rank prefix → `{ error: "invalid node" }` + 400
(returned before the cache wrapper, so 400s are never cached). Well-formed node
with no Saudi-scoped rows → `{ error: "not found", message: "<type> <id> not found in Saudi scope." }` + 404 (not cached: `cachedJson` only caches `response.ok`). DB errors → the same 503 shape graph.ts uses. Every count query carries `s.country = 'SA'` via the same `SA` / `SAMPLES_RUNS` / `TERMS_SAMPLES` join constants graph.ts defines (redeclared locally in detail.ts — they are not exported from graph.ts, and the file-to-file import would couple the two handlers).

Payloads per type (all keys verbatim for Task 3):

- `study` — 3 queries: header+stats (`studies` LEFT JOIN `submitters` + `ena_runs`+`samples`; `MIN/MAX(r.submitted_date)`, `COUNT(DISTINCT r.biosample_accession)` samples, `COUNT(*)` runs, `COALESCE(SUM(r.bytes),0)` → `Number()` coerced), top-5 organisms by runs, distinct platforms.
- `sample` — 2 queries: main row joins `taxonomy` (LEFT, on `s.tax_id`) so lineage rides along without multiplying runs (`GROUP BY s.biosample_accession`); primary study = study with most of this sample's Saudi runs. `lineage: { genus, family, phylum }` keys always present (null when taxonomy has no row).
- `organism` — 3 queries: run/study aggregates (`MAX(s.tax_id)` as the classify input), lineage (`LIMIT 1`), tissue term_ids feeding `classifyHuman(name, tax_id, null, tissue)` — same classification inputs as graph.ts focus handlers (host deliberately not used at organism scope).
- `submitter` — 2 queries: study/run aggregates + top-5 organisms.
- `platform` | `strategy` | `region` — one shared `attributeDetail` dispatching on the column (`r.platform` / `r.library_strategy` / `s.region`): runs + top-5 studies.
- `term` — 2 queries. Runs/samples use `COUNT(DISTINCT r.run_accession)` / `COUNT(DISTINCT s.biosample_accession)` because `sample_terms` can hold the same term_id under multiple fields per sample (plain `COUNT(*)` would inflate). The ontology label is a scalar subquery in the SELECT list — `ontology_terms` is keyed by `(field, value_norm)`, so a real join on `term_id` would multiply rows and corrupt the DISTINCT counts. Falls back to the raw term_id when no label row exists.
- `taxon` — id must be `<rank>:<value>`; `t.${rank}` is interpolated only after the regex capture validates it (same pattern + comment as graph.ts `focusTaxon`): distinct organism count + runs.

## Design decisions / deviations from the brief

1. **Study query uses `LEFT JOIN submitters`** where the brief's example used plain `JOIN`. `studies/[accession].ts` (the /study page) deliberately LEFT-joins this dim, so some studies plausibly lack submitters; INNER would 404 them. All other SQL follows the brief's example shape.
2. **Fake study accession returns 200 with keys present**, exactly as the brief's Step 5 expects: the aggregate-without-GROUP-BY main query always returns one row, so an unknown study yields `{accession: null, …, runs: 0, top_organisms: [], platforms: []}`. Other types 404 on empty (their queries have GROUP BY / explicit zero guards) — the asymmetry is a direct consequence of the brief's smoke expectation for studies.
3. **`sample.study` is the primary study** (most Saudi runs), not an arbitrary `MIN` — a sample can span studies; the inspector wants the dominant one.
4. **No `genus:`/`family:`/`phylum:` shortcuts** — detail accepts only the 9 types the brief lists (`taxon:genus:…` spelled with the `taxon:` prefix).

## Verification

- `npx vitest run functions/api/v2/graph/detail.test.ts` — pre-implementation: FAIL (module not found), as required. Post: **10/10 pass**.
- `npm run test` — **25 files / 127 tests, all green** (117 pre-Task-2 + 10 new).
- `npm run typecheck` (`tsc --noEmit`) — **clean, exit 0**.
- Tests assert response-contract keys; every test asserts Saudi scope (`s.country = 'SA'`) on all prepared SQL, which holds for all detail queries (the term label lookup is a scalar subquery inside the Saudi-scoped query, so no unscoped dim query exists — unlike `studies/[accession].ts`, which does have one).

## Live smoke (wrangler local :8788)

Stack restarted per the caveat: stopped the stale Sep-12 `pages:dev`, `rm -rf deploy/podman/pages-root/.wrangler/state/v3/cache`, `npm run build`, `rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out`, relaunched `npx wrangler pages dev out --port 8788` from `deploy/podman/pages-root`. The harness subsequently terminated both task-launched instances (`bash-ahuf0cg9`, `bash-a83wyjq2`) without error after all smokes passed — their wrangler process trees kept serving detached, and the stack is currently up under a separately-started `npx wrangler pages dev out --port 8788` (not owned by this task) running the c78d682 build. Verified: `detail?node=study:PRJEB36683` → 200 with the real payload. All URLs below were previously unfetched (fresh nonce) or served after the cache clear.

| Smoke | Result |
|---|---|
| `detail?node=study:PRJEB36683` | 200 — full payload: title+abstract, submitter "King Abdullah University of Science and Technology;KAUST", dates 2020-02-10→2025-09-19, samples/runs 1820, bytes 2104336798078, 5 top_organisms, platforms [ILLUMINA, OXFORD_NANOPORE, DNBSEQ] |
| `detail?node=study:PRJNA9999997` (fake) | 200 with all keys present, nulls + empty arrays (brief Step 5 expectation) |
| `detail?node=sample:ERS26792942` | 200 — organism Klebsiella pneumoniae 11227-1, host Homo sapiens, lineage Klebsiella/Enterobacteriaceae/Pseudomonadota, study PRJEB36683, runs 1 |
| `detail?node=organism:Klebsiella pneumoniae` | 200 — lineage, human_class "other", studies 5, runs 255 |
| `detail?node=submitter:WDRC KAUST` | 200 — studies 54, runs 2498, top_organisms incl. wastewater metagenome 1101 |
| `detail?node=platform:DNBSEQ` / `strategy:RNA-Seq` / `region:GCC` | 200 — runs 5183 / 3380 / 43098, real top_studies |
| `detail?node=term:NCBITaxon_9606` | 200 — label "Homo sapiens", runs 10129, samples 10022, top 5 studies |
| `detail?node=taxon:genus:Klebsiella` | 200 — rank genus, organisms 11, runs 2277 |
| `detail?node=bogus` / `node=foo:bar` / `node=taxon:bogus` | 400 `{error:"invalid node"}` (unit tests + live 400 verified) |
| `/api/v2/graph` (hub) | still 200 |

## Concerns / observations for follow-up (not Task 2 scope)

- **Data quirk:** `detail?node=term:BTO:0000545` returns 404. That term's single `sample_terms` row (2 of 19,129 rows total) points at synthetic placeholder biosample `SAMLOC1`, which exists in `samples` (country SA) but has **zero runs** in `ena_runs`, so the honest Saudi-scoped join yields 0 runs. Real terms (e.g. NCBITaxon_9606) return full payloads.
- **Task 1 join quirk (pre-existing):** graph.ts `focusStudy`/`focusTerm` interpolate `SAMPLES_RUNS` (`ON s.biosample_accession = r.biosample_accession`) into `FROM sample_terms st …` where alias `r` is only joined *later*; SQLite's forward-reference leniency makes that ON clause bind oddly, so graph **term node counts are inflated** (e.g. BTO:0000545 shows n=1820 = the study's whole run count) and term↔sample linkage is effectively dropped. detail.ts is unaffected (joins in correct order, honest counts). Flagging in case Task 1 wants the constant split into per-anchor variants.
- **Behavioral asymmetry** (fake id → 200-nulls for study vs 404 elsewhere) is intentional per the brief's smoke expectation; revisit if the inspector wants uniform 404s.
