# Final whole-branch review — fix report (3 findings)

Branch: `podman-local` — base `6fe3b1c`, fixes landed as three commits on top.
Date: 2026-09-14

## Commits

| Commit  | Subject |
|---------|---------|
| `2ce2d82` | fix(graph): bind sample_terms to samples in study-focus tissue/term queries (Finding 1) |
| `9538061` | fix(graph): return child-organism studies from taxon focus (Finding 2) |
| `44ade43` | fix(graph): show study filter control on search page (Finding 3) |

---

## Finding 1 — study-focus term counts inflated

**Root cause:** both `sample_terms`-anchored queries in `focusStudy` interpolated
`${SAMPLES_RUNS}` (`JOIN samples s ON s.biosample_accession = r.biosample_accession`).
`r` is not in scope in the `sample_terms st` anchor, so `st` was never bound to `s`:
a cross product. `COUNT(*)` became `study_runs × global term frequency` and the
term set was the whole table (capped at 50 by `CAP`).

**Fix** (`functions/api/v2/graph.ts`, commit `2ce2d82`):
- Tissue query (feeds `tissueByOrganism` → `classifyHuman`): now
  `FROM sample_terms st ${TERMS_SAMPLES} JOIN ena_runs r ON r.biosample_accession = s.biosample_accession`
  — exactly the pattern ancestor `61f16dc` established for term/sample focus.
- Term-neighborhood query: same `${TERMS_SAMPLES}` swap.
- Confirmed the tissue result now feeds `classifyHuman` only the study's actual
  tissue annotations (the join restricts `st` rows to the study's samples via
  its runs; live + direct-DB checks below).

**Test** (`functions/api/v2/graph.test.ts`): new case
"study focus term queries join sample_terms to samples via st alias" — every
`FROM sample_terms st` query in study focus must contain
`JOIN samples s ON s.biosample_accession = st.biosample_accession`, the existing
dangling-`r` guard, and Saudi scope. Verified the test **fails against pre-fix
`graph.ts`** (2 failed / 7 passed) and passes against the fix. Existing stub
branches unchanged for this commit.

**Live evidence (port 8788):**
- `curl localhost:8788/graph` → **200**.
- `curl 'localhost:8788/api/v2/graph?focus=study:PRJNA1249945&t=fix1'` → 1 term node
  (`NCBITaxon_9838`, count 4) — matches the corrected SQL run directly against the
  local D1 state (`SELECT … JOIN samples s ON s.biosample_accession=st.biosample_accession …`
  → exactly `('NCBITaxon_9838','host',4)`). Note: 4 is trivially a multiple of the
  study's 4 runs (its one annotation is on all 4 samples), so for the
  "not all multiples" criterion a study with ≥2 terms is the honest witness:
- `curl 'localhost:8788/api/v2/graph?focus=study:PRJEB18736&t=fix1c'` (uncached) →
  **28 runs, 8 terms with counts 5,5,3,3,3,3,3,3 — zero multiples of 28.**
  The old buggy SQL against the same DB returns 50 global terms with counts
  28, 28, 1008 (=28×36), 168, 392, 84, 2996 (=28×107), … — the inflation is gone.

## Finding 2 — taxon focus omits study nodes

**Fix** (`functions/api/v2/graph.ts` `focusTaxon`, commit `9538061`): added a
study-neighborhood query mirroring `focusOrganism`'s — `FROM studies st JOIN
ena_runs r ON r.study_accession = st.accession ${SAMPLES_RUNS} JOIN taxonomy t
ON t.tax_id = s.tax_id WHERE t.${rank} = ? AND ${SA} GROUP BY st.accession
ORDER BY runs DESC LIMIT ${CAP}` — with `taxon→study` edges of kind `"studies"`
(same kind/link convention `focusOrganism` uses for organism→study). Rank
interpolation stays safe: the regex `^(genus|family|phylum):(.+)$` validates it
(comment carried over).

**Test**: new case "taxon focus returns studies of its child organisms" — asserts
a `study` node and a `taxon:genus:Camelus → study:*` edge of kind `"studies"`,
plus Saudi scope on every prepared SQL. Stub change: the `FROM studies` branch
now precedes the `JOIN taxonomy t` branch, because the new query's SQL contains
both substrings and needs study-shaped rows (no existing branch's matches
change: previously no query contained both). Verified the test **fails against
pre-fix code** (no study nodes) and passes with the fix.

**Live evidence:** `curl 'localhost:8788/api/v2/graph?focus=genus:Camelus&t=fix1b'`
→ node types `{taxon:1, organism:1, study:4}` — `study:PRJNA234474`,
`PRJNA1219399`, `PRJEB66318`, `PRJEB75021` — edge kinds `['classifies','studies']`.

## Finding 3 — study filter invisible on search page

**Fix** (`components/V2Filters.tsx`, commit `44ade43`): added
`{text("study", "Study", "e.g. PRJNA1249945")}` to the filter grid, next to the
Submitter select, mirroring the existing `q`/`region`/`host` text inputs. The
`?study=` param was already applied by `parseV2Filters`
(`functions/api/v2/_lib/filters.ts:35`, `eq("r.study_accession", …)`) and passed
through by `app/search/page.tsx` (all non-`page` URL params seed the filter
state), so the control now shows/clears it. No new styling — reuses the `text()`
helper and `input` class (CSS-variables-only constraint untouched).

## Verification summary

- `npm run test` → **27 files / 147 tests passed** (was 26/145 pre-fix; +2 new pins).
- `npm run typecheck` (`tsc --noEmit`) → clean.
- `npm run build` → succeeded; `rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out` done; `git check-ignore` confirms `out` and `.wrangler` stay untracked. Existing background wrangler (`pages dev out --port 8788`) hot-reloaded the functions — no restart or cache clear needed (smoke used fresh `t=` cache-busters).
- Live smoke: `/graph` → 200; uncached study-focus term counts no longer run-count multiples (see Finding 1); taxon focus returns studies (Finding 2).

## Notes / follow-up

- The spec file `docs/superpowers/specs/2026-09-13-graph-discovery-design.md` does not exist in this repo (spec content was cross-checked via `.superpowers/sdd/2026-09-13-graph-discovery/task-1-brief.md`, which quotes the "child organisms + studies" interface bullet).
- `PRJNA1249945` genuinely has a single sample_term annotation, so its corrected count (4 = 1×4 runs) is a trivial multiple; `PRJEB18736` is the stronger regression witness and is cited in the Finding 1 smoke evidence.
