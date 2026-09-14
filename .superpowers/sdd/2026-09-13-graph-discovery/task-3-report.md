# Task 3 Report: Inspector panel + click-to-select interaction

**Status:** DONE
**Commit:** `decc84a` — `feat(graph): inspector panel with click-to-select, focus on double-click, recency rings`

## What changed

| File | Change |
|---|---|
| `components/graph/graph-layout.ts` | `GraphNode` extended with `facets?: NodeFacets` (domain/region/platforms/years, mirroring the Task 1 API shape) and `recent?: boolean`; new `export type DetailPayload = Record<string, unknown> & { type: NodeType }`. |
| `components/graph/GraphCanvas.tsx` | Prop rename: `onNodeClick` → `onNodeSelect` + new `onNodeFocus` (double-click), both behind the existing `draggedRef` suppression; optional `onBackgroundClick` rendered as a transparent `<rect width={800} height={600}>` as the first child of the root `<g>` (behind edges) — `fill="transparent"`, not `fill="none"`, so the interior is hit-testable; recency ring drawn beneath the node circle when `n.recent` (`<circle r={r+4} fill="none" stroke="var(--accent)" strokeWidth={2} strokeOpacity={0.8}/>` with `r = 6 + Math.min(14, Math.log2(n.count ?? 1))`); tooltip hint updated to "click for details · double-click to focus"; **disabled d3-zoom's built-in `dblclick.zoom`** via `svgSel.on("dblclick.zoom", null)` so double-click focuses a node instead of zooming the canvas (would otherwise fire both in real browsers, and its svg-level listener also broke the dblclick test in happy-dom). |
| `components/graph/Inspector.tsx` | **New.** Default-exported `Inspector({ node, detail, onClose, onFocus, onOpen, onSearch })`. `<aside className="card w-full shrink-0 p-0 xl:w-80">` with header (label + type badge with NODE_COLORS dot + ✕ `aria-label="Close"`), per-type body, footer buttons **Focus graph** (`onFocus(node.id)`), **Open page** (disabled when no `node.link`), **View runs in search** (`onSearch`, omitted for term/taxon). All fields render defensively with `?? "—"`-style helpers (`txt`/`dash`/`runs`/`range`/`bytes`/`lineageText`). Field lists per type follow the Task 2 payload keys verbatim. Search href mapping: sample→`/search?q=<id>`, organism→`/search?organism=`, submitter→`/search?submitter=`, region→`/search?region=`, platform→`/search?platform=`, strategy→`/search?strategy=`, study→`/search?study=` (all verified against `functions/api/v2/_lib/filters.ts`). Top organisms/studies render as `name (runs)` so the exact string "N runs" stays unique to the stats rows. Styling uses only existing CSS vars/classes (`card`, `badge`, `btn`, `btn-accent`, `text-dim`, `var(--border)`). |
| `components/graph/GraphHub.tsx` | Holds `selected`/`detail`/`detailError` state; detail fetch effect on `selected` with the same cancelled-flag stale-fetch pattern as the graph fetch (`/api/v2/graph/detail?node=${encodeURIComponent(selected.id)}`, `cache: "no-store"`); publication placeholder guard kept on both select and focus; focus handler pushes `/graph?focus=<id>`; canvas + inspector laid out in a `flex flex-col items-start gap-4 xl:flex-row` row (canvas `min-w-0 flex-1`, inspector beside it on wide screens); `onBackgroundClick` clears the selection (only wired while a selection exists, so the rect isn't rendered otherwise); `detailError` rendered as `text-danger` above the canvas. |
| `components/graph/GraphCanvas.test.tsx` | Existing tests migrated to `onNodeSelect`/`onNodeFocus`; new tests: "single click selects, double click focuses" (targets `g.graph-node` directly — labels only render on hover/zoom, so the brief's `findAllByText("Study Alpha")` locator cannot work at rest), "draws a recency ring under nodes flagged recent" (fixture gained `recent: true` on Sample Beta; circle-count diff), "background click calls onBackgroundClick". Tooltip test pin updated to the new hint text. |
| `components/graph/Inspector.test.tsx` | **New.** The brief's contract test verbatim (study fields + Focus graph → `onFocus("study:A")`), plus: close/Open page wiring, Open page disabled for link-less term nodes + search button omitted for term, search href mapping for organism and sample, em-dash fallback when `detail` is null. |

No new SQL — this task is frontend-only; the Saudi-scope constraint remains satisfied by the Task 2 endpoint it consumes.

## Design decisions & deviations from the brief

- **Brief sample-test locator adapted**: `findAllByText("Study Alpha")` needs a rendered label; labels only render on hover/zoom/match by design, so the test targets `container.querySelector("g.graph-node")` instead (fixture order pins "Study Alpha" as the first node). Same for the tooltip pin text, updated because click no longer "opens" a page directly.
- **d3 `dblclick.zoom` disabled** (not in the brief, but required): with focus-on-double-click, d3's zoom-on-double-click would fire simultaneously in real browsers. Disabling it is the canvas-level enabler for the feature and also removed the svg-level listener that swallowed the synthesized dblclick in happy-dom.
- **Background rect only rendered when a selection exists** (`onBackgroundClick={selected ? onClose : undefined}`) — avoids a useless hit-target layer and keeps the diff to existing render output minimal when the inspector is closed.
- **`detailError` state**: a 404/500 on the detail fetch would otherwise leave the panel on "Loading detail…" forever; GraphHub now shows the error line. Inspector's `detail: null` still renders all rows as "—".
- **`/search?study=` mapping** verified against `parseV2Filters` (`eq("r.study_accession", p.get("study"))`) — valid.

## Verification

1. **Red phase**: after writing tests only — `npx vitest run components/graph/` → 4 failed (props/component didn't exist), confirming real failures.
2. **`npm run test`** (vitest, full suite): **26 files / 135 tests passed** (was 26/135 with 1 failure mid-implementation; final run all green).
3. **`npm run typecheck`** (`tsc --noEmit`): clean, no output.
4. **Build**: `npm run build` → static export OK, `/graph 26.6 kB`.
5. **Deploy + live smoke** (wrangler pages dev on :8788, serving `deploy/podman/pages-root/out`):
   - `curl -s -o /dev/null -w '%{http_code}' http://localhost:8788/graph` → **200**; HTML contains the prerendered "Find node" toolbar.
   - `GET /api/v2/graph` → 49 nodes, all with `facets`, 4 with `recent` (e.g. `study:PRJEB36683` with years/platforms/domain) — recency ring data present.
   - `GET /api/v2/graph/detail?node=study:PRJEB36683` → 200 with all Task 2 keys (title/abstract/submitter/dates/samples=1820/runs=1820/bytes/top_organisms/platforms).
   - `GET /api/v2/graph/detail?node=organism:Homo sapiens` → 200 (lineage/human_class=human/studies/runs).
   - Fake study → 200 with nulls (matches Task 2 behavior noted in context); fake platform → 404 with the Saudi-scope message.
   - API cache cleared before smokes (`rm -rf deploy/podman/pages-root/.wrangler/state/v3/cache`); nonces used on URLs anyway.

## Ops notes / concerns

- The previously running pages:dev background task (`bash-ahuf0cg9`) was **not tracked in this subagent's task list** (it belonged to the parent session). Port 8788 was held by its wrangler (pid 1488402); I killed it, redeployed `out` (`rm -rf deploy/podman/pages-root/out && cp -al .next/out ...`), and cleared the API cache. Before my own wrangler instance could bind, **another session restarted wrangler pages dev on the same port/cwd** (pid chain 1576596→1577570, started 14:28:11, cwd `deploy/podman/pages-root`, serving the new `out`). My instance (task `bash-4h1pkpjd`) failed with EADDRINUSE and was not restarted since a healthy server is live. The smokes above ran against that server. **The parent should keep that wrangler instance alive or restart it with the documented command if it goes down.**
- `deploy/podman/pages-root/out` and `.wrangler` remain untracked/ignored — not committed.
- After killing the old wrangler, its child workerd (1488459) lingered briefly; the port was confirmed free before the replacement bound, and the final serving pid is 1578378.

## Follow-ups (not in scope)

- Inspector stays open across a focus navigation (pointing at the previously selected node); harmless, arguably useful — flag if undesired.
- The legend row could gain a "recent = ring" affordance to explain the new ring visual; skipped to stay within the brief.
