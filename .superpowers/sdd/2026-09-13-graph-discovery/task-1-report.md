# Task 1 Report: Graph API — node facets, taxon focus, study filter

**Status:** DONE
**Commit:** `791a3e1` on branch `podman-local`
**Test summary:** `npm run test` 117/117 passed (24 files), `npm run typecheck` clean; live smoke on :8788 all 200 with expected payloads.

## What changed

### `functions/api/v2/_lib/filters.ts` (+1 line)
- Added `eq("r.study_accession", p.get("study"));` immediately after the `sub.center_name` equality line, per the brief. `?study=<accession>` now ANDs `r.study_accession = ?` into the v2 search WHERE clause (Saudi scope stays first via the mandatory `s.country = 'SA'`).

### `functions/api/v2/graph.ts` (+157 lines, interface extended)
1. **`GraphNode` interface** gained `facets?: { domain?: HumanClass; region?: string; platforms?: string[]; years?: [number, number] }` and `recent?: boolean` (exact shapes from the brief; `HumanClass` = `"human" | "human_associated" | "other"`).
2. **`scopeFacets(db, scopeCol, ids, joinSql?)`** — batched facet aggregation, one query per node group instead of per-node N+1. IN-list built from the ids already at hand, capped by `CAP` (50). SQL verbatim from the brief (MIN/MAX of `substr(r.submitted_date,1,4)` for years, 180-day `recent` flag, `GROUP_CONCAT(DISTINCT r.platform)`, grouped by scope + organism/tax_id/host). `joinSql` adds the minimal dim joins a scope column needs beyond `ena_runs`+`SAMPLES_RUNS` (studies for `st.accession`; studies+submitters for `sub.center_name`). Merge logic in JS: years min/max, platforms union sliced to 5, domain ranked `other < human_associated < human`.
3. **`attachFacets(db, nodes, type, scopeCol, joinSql?)`** — collects node ids of one type from the built node list, runs `scopeFacets`, attaches `{facets, recent}` onto each node. Called in all five node-building functions per the brief:
   - `hubSubmitter`: submitters (`sub.center_name`, both joins) + studies (`st.accession`, studies join)
   - `focusStudy`: study (`st.accession`) + samples (`s.biosample_accession`) + organisms (`s.organism`)
   - `focusSample`: sample (`s.biosample_accession`) + studies (`st.accession`) + organism (`s.organism`)
   - `focusOrganism`: organism (`s.organism`) + studies (`st.accession`) + samples (`s.biosample_accession`)
   - `focusSubmitter`: submitter (`sub.center_name`, both joins) + studies (`st.accession`)
4. **Taxon lineage** — `addTaxonChain(nodes, edges, childId, lineage)` appends `taxon:genus:<g>` → `taxon:family:<f>` → `taxon:phylum:<p>` nodes with `classified_in` edges, omitting missing ranks; duplicate chain nodes/edges deduped so several organisms of one genus share a single taxon node. `linkFor("taxon", …)` returns `undefined` via the existing default branch (no change needed — verified).
   - `focusOrganism`: single query `SELECT t.genus, t.family, t.phylum FROM samples s JOIN taxonomy t … WHERE s.organism = ? AND s.country = 'SA' LIMIT 1` (verbatim from brief), chain hangs off the organism self node.
   - `focusStudy`: the Step-1 test requires taxon nodes in study-focus responses, so lineage is fetched batched for all organism nodes via `WHERE s.organism IN (…) AND s.country = 'SA' GROUP BY s.organism, t.genus, t.family, t.phylum` (first row per organism wins). This is the one place the implementation goes beyond the brief's Step-3 text, which only specified the rollup for `focusOrganism` — the test in Step 1 (`expect(body.nodes.some((n) => n.type === "taxon")).toBe(true)` on `focus=study:…`) is the authoritative requirement.
5. **`focusTaxon(db, id)`** — verbatim from brief: regex `/^(genus|family|phylum):(.+)$/` validates the rank so `t.${rank}` is a fixed column; self taxon node + child organism nodes (COUNT, `human_class` via `classifyHuman(name, tax_id, null, [])`) with `classifies` edges, Saudi-scoped.
6. **Routing** — `FOCUS_TYPES` gains `"taxon"` **and** `"genus" | "family" | "phylum"`. The brief's test URL `?focus=genus:Camelus` parses to type `genus`, so the dispatch maps `genus/family/phylum` → `focusTaxon(db, \`${type}:${id}\`)`, and `taxon:genus:X` also works directly (id passes through). Without this the required test returns 400.
7. `classifyHuman` remains the only classification rule source; tissue terms are intentionally omitted at group scope (comment in `scopeFacets` documents this, per the brief's NOTE).

### `functions/api/v2/graph.test.ts` (+28 lines)
- Stub `all()` gained three branches (checked before the existing ones):
  - SQL containing `MIN(CAST(substr` or `GROUP_CONCAT` → one facet row `{ id: "PRJNA1249945", y0: 2023, y1: 2024, recent: 1, platforms: "ILLUMINA", organism: "Homo sapiens", tax_id: 9606, host: null }` (per-scope facet row, as the brief suggests).
  - SQL containing `JOIN taxonomy t` without `ena_runs` (lineage queries) → `{ name: "Homo sapiens", genus: "Homo", family: "Hominidae", phylum: "Chordata" }`.
  - SQL containing `JOIN taxonomy t` with `ena_runs` (taxon-focus child organisms) → `{ name: "Camelus dromedarius", tax_id: 9838, n: 2 }`.
- Added the two brief-mandated tests verbatim: "study focus nodes carry facets and taxon lineage" and "taxon focus returns child organisms".

### `functions/api/v2/filters.test.ts` (+7 lines)
- The existing filters test file lives at `functions/api/v2/filters.test.ts` (not `_lib` — the brief said "check which exists"), so it was extended there with the brief's "study param adds an equality filter on r.study_accession" test verbatim.

## Saudi scope
Every new/altered query keeps `s.country = 'SA'`: `scopeFacets` ANDs `${SA}` into its WHERE, both lineage queries AND `${SA}`, `focusTaxon` ANDs `${SA}`, and the filters change only appends an equality after the mandatory first condition. The graph tests assert `s.country = 'SA'` on every prepared statement; all pass.

## Verification (exact commands)

1. **Failing-first:** `npx vitest run functions/api/v2/graph.test.ts functions/api/v2/filters.test.ts` → 3 new tests failed as expected (facets undefined; taxon focus 400; study filter clause missing), 8 existing passed.
2. **After implementation:** `npx vitest run functions/api/v2` → 42/42 passed (9 files). `npm run test` → **117/117 passed (24 files)**. `npm run typecheck` (`tsc --noEmit`) → clean, no output.
3. **Build + deploy dir:** `npm run build` (exit 0), then `rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out`. `out/` is gitignored (working tree clean after commit; `git status --short` empty).
4. **Live smoke** (wrangler local on :8788 already running; cache bypassed with never-fetched nonce params — `cachedJson` keys on the full URL):
   - `curl -s -o /dev/null -w '%{http_code}' localhost:8788/graph` → **200**
   - `GET /api/v2/graph?focus=study:PRJNA805399` → study facets `{years: [2022, 2022], platforms: ["ILLUMINA"], domain: "other"}`, `recent: false` (200). No taxon nodes here because this study's organisms are unclassified metagenomes with null ranks — expected.
   - `GET /api/v2/graph?focus=study:PRJEB36683` → study facets `{years: [2020, 2025], platforms: ["DNBSEQ","ILLUMINA","OXFORD_NANOPORE"], domain: "human_associated"}`; taxon chain `organism:Klebsiella pneumoniae 11227-1 → taxon:genus:Klebsiella → taxon:family:Enterobacteriaceae → taxon:phylum:Pseudomonadota` with `classified_in` edges; multiple Klebsiella organisms share one deduped genus node; organism-level facets attached.
   - `GET /api/v2/graph?focus=organism:Homo%20sapiens` → taxon nodes `taxon:genus:Homo / family:Hominidae / phylum:Chordata` with `link: undefined` as designed; organism facets `{years: [2022, 2026], platforms: [ILLUMINA, DNBSEQ, OXFORD_NANOPORE, PACBIO_SMRT, CAPILLARY], domain: "human"}`, `recent: true`.
   - `GET /api/v2/graph?focus=genus:Klebsiella` → 200; taxon self node + child organisms (Klebsiella pneumoniae 11227-1 ×1986, K. pneumoniae ×255, …) with `classifies` edges.
   - `GET /api/v2/search?study=PRJNA1249945&page_size=1` → `{total: 4, items: [{run_accession: SRR33109674, study_accession: PRJNA1249945}]}` — exactly that study's 4 Saudi rows.

## Commit
`791a3e1` — `feat(graph): node facets (domain/platforms/years/recent), taxon focus + lineage, study search filter` (4 files, +193/−2). Branch `podman-local`, not pushed.

## Notes / deviations from the brief (all test-driven)
- **Routing:** `FOCUS_TYPES` also accepts `genus/family/phylum` and dispatches them to `focusTaxon` — required by the brief's own test URL `focus=genus:Camelus` (parses to type `genus`, not `taxon`).
- **Study-focus lineage:** added batched lineage in `focusStudy` because the Step-1 test asserts taxon nodes in study-focus responses while Step-3 only specified the rollup for `focusOrganism`.
- **Stub row shapes:** the lineage stub row includes `name` so the batched study-focus lineage can key by organism (single-organism path in `focusOrganism` ignores it). Documented per the brief's "fix stub return shapes if needed" clause.
- `linkFor` needed no change — `taxon` already falls through to `default: undefined`.
- Taxonomy data is sparse: ~2,146 taxonomy rows vs 43k+ Saudi runs; many studies (e.g. PRJNA805399, metagenomes) legitimately yield no taxon chain. Frontend should tolerate absent lineage.
