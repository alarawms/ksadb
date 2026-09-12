# Task 1 Report: Pure interaction helpers in graph-layout.ts

## Status
DONE

## What I did

Followed the brief's steps in order:

1. **Step 1 — Failing test.** The brief said to *create* `components/graph/graph-layout.test.ts`, but the file already existed with two tests for the pre-existing helpers (`isDimmed`, `NODE_COLORS`, `HUMAN_COLORS`). To avoid destroying existing coverage, I kept those tests and appended the brief's verbatim test code (fixtures `nodes`/`edges` and the three new `describe` blocks for `neighborIds`, `visibleLabelIds`, `filterNodes`), merging the new imports into the existing import line. All test logic is byte-for-byte the brief's; only the placement (append vs. create) differs.

2. **Step 2 — Verify failure.** Ran `npx vitest run components/graph/graph-layout.test.ts` — failed as expected: 6 new tests failed with `TypeError: filterNodes is not a function` / `neighborIds is not a function`; the 2 pre-existing tests still passed.

3. **Step 3 — Implement.** Appended the brief's verbatim helper code to `components/graph/graph-layout.ts` (after `isDimmed`, matching the file's existing export style — plain `export function` / `export const`, no default exports):
   - `ZOOM_LABEL_THRESHOLD = 1.5`, `ZOOM_EXTENT: [number, number] = [0.2, 8]`
   - `neighborIds(edges, id)` — self + direct neighbors via both edge directions
   - `visibleLabelIds(nodes, edges, opts)` — all ids at/above zoom threshold, else hover neighborhood ∪ matchIds
   - `filterNodes(nodes, query)` — case-insensitive substring on `label` and `id`, empty query → `[]`, capped at 10

4. **Step 4 — Verify pass + typecheck.**
   - `npx vitest run components/graph/graph-layout.test.ts` → 8 passed (2 pre-existing + 6 new).
   - `npx vitest run` (whole suite) → 23 files, 108 tests, all passed.
   - `npm run typecheck` → clean (no output).

5. **Step 5 — Commit.**
   - `git add components/graph/graph-layout.ts components/graph/graph-layout.test.ts`
   - Commit `d53d56a4875b7f484af4bdb87de1954795e19cdb` on branch `podman-local`: `feat(graph): pure interaction helpers (neighbors, label visibility, search)`
   - Nothing under `deploy/podman/pages-root/` was staged or committed; `git status --porcelain` after commit was empty.

## Test commands run

| Command | Outcome |
|---|---|
| `npx vitest run components/graph/graph-layout.test.ts` (pre-impl) | FAIL (6 new tests, expected) |
| `npx vitest run components/graph/graph-layout.test.ts` (post-impl) | PASS, 8/8 |
| `npx vitest run` (full suite) | PASS, 23 files / 108 tests |
| `npm run typecheck` | clean |

## Deviations from the brief

- Only one: the test file already existed, so the brief's test code was appended (with imports merged) rather than creating the file from scratch. No test assertions were changed, added, or removed. This seemed clearly safer than deleting the two pre-existing tests; flagged here in case the orchestrator expected a fresh file.

## Self-review notes

- Exports and signatures match the brief exactly — Tasks 2 and 3 can import `neighborIds`, `visibleLabelIds`, `filterNodes`, `ZOOM_LABEL_THRESHOLD`, `ZOOM_EXTENT` from `./graph-layout` unchanged.
- Implementation is byte-for-byte the brief's code; no improvisation.
- Edge cases covered by the brief's tests: unknown node id in `neighborIds` returns just `{id}`; `zoomK === ZOOM_LABEL_THRESHOLD` shows all labels (>= comparison); matchIds included even when zoomed out; query trimming/empty handled.
- Diff is minimal: +79/-1 across the two files, no unrelated changes.
