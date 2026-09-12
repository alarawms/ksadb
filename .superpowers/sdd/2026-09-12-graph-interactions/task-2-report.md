# Task 2 Report: Extract GraphCanvas with zoom/pan, node drag, hover highlight

Date: 2026-09-12
Branch: `podman-local`

## What was done

1. **Step 1 — deps**: `npm install d3-zoom d3-drag` failed with an unrelated
   ERESOLVE peer conflict (`wrangler@4.129.0` peerOptional
   `@cloudflare/workers-types@^5.x` vs installed `@4.20260702.1`). Retried with
   `--legacy-peer-deps`, which succeeded and added `d3-zoom@^3.0.0` and
   `d3-drag@^3.0.0` (and transitive `d3-selection`). The wrangler conflict is
   pre-existing on the branch; no dependency versions were otherwise changed.

   `npm run typecheck` then reported missing declarations for `d3-zoom`,
   `d3-drag`, `d3-selection` (d3 v3 line does not ship types), so per the
   brief's contingency I ran
   `npm install -D @types/d3-zoom @types/d3-drag @types/d3-selection --legacy-peer-deps`.
   No tsc errors after that.

2. **Step 2 — new `components/graph/GraphCanvas.tsx`**: created per the
   brief's Step 2 code with two deliberate deviations (see below):
   - `zoomRef` (holding the `ZoomBehavior`) and a `zoomK` state are at the top
     level of `GraphCanvas` as required for Task 3.
   - Per the task's note, unused imports from the brief snippet were omitted:
     `zoomIdentity`, `Selection` (d3-selection), and `NodeType` were never
     referenced; Task 3 can re-add them.
   - One further unused-import cleanup during self-review: `DragBehavior` was
     imported then dropped when the drag-behavior ref was typed as
     `ReturnType<typeof drag<SVGGElement, SimNode>>` instead (the 3-generic
     form mismatches d3-drag's default subject type `Datum | SubjectPosition`).

3. **Step 3 — slim `components/graph/GraphHub.tsx`**: deleted the inline
   `GraphCanvas` function, the `SimNode`/`SimEdge` types, the `nodeColor`
   helper (moved into `GraphCanvas.tsx`), and the now-unused imports
   (`d3-force` pieces, `useRef`, `isDimmed`, `GraphEdge`). Added
   `import GraphCanvas from "./GraphCanvas";` and render it in the same spot.
   Default-export signature of `GraphHub` unchanged; fetch effect, filter
   state, legend, and `onNodeClick` untouched.

## Deviation from the brief (functional fix)

The brief's code binds d3-drag inside the mount effect via
`select(g).selectAll("g.graph-node")`. At effect time the simulation has not
ticked yet, so `nodes` state is `[]` and **no `g.graph-node` elements exist in
the DOM** — the selection is empty and drag would silently never bind (d3-drag
attaches listeners to the selected elements directly; there is no delegation).

Fix, keeping the brief's structure and handler logic verbatim:
- The drag behavior is built in the main `[data]` effect and stored in
  `dragRef` (its closures capture that effect run's `sim`, so it must be
  rebuilt per simulation).
- A small second effect on `[nodes]` calls
  `select(g).selectAll("g.graph-node").call(dragRef.current)` once, the first
  time nodes are non-empty (`dragBoundRef` guard), i.e. after the first tick.
- The main effect's cleanup resets `dragBoundRef`/`dragRef`, so a `data` change
  (focus navigation) re-binds drag against the new simulation on its first
  tick. d3's `.on(".drag", ...)` typenames mean rebinding replaces rather than
  duplicates listeners.

## Verification (all commands run in repo root)

- `npx vitest run` → **23 files passed, 108/108 tests green** (same count as
  before the change).
- `npm run typecheck` → clean (tsc --noEmit, no output).
- `npm run build` → static export succeeded, `/graph` prerendered.
- `rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out`
  → done; `deploy/podman/pages-root` is gitignored (nothing under it shows in
  `git status`), nothing committed there.
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/graph` →
  **200**.

## Self-review notes

- No unused imports remain in either file (`zoomIdentity`, `Selection`,
  `NodeType`, `DragBehavior` all omitted with reasons above).
- Effect cleanup correctness: main effect stops the simulation, nulls
  `simRef`/`zoomRef`/`dragRef`, resets `dragBoundRef`, and calls
  `svgSel.on(".zoom", null)` which removes all d3-zoom listeners (wheel,
  mousedown, dblclick, touch) since they all use the `.zoom` typename. Drag
  listeners live on React-rendered node elements and are replaced (not
  stacked) on rebind via d3's typename-based `.on`.
- Per the brief, per-tick state updates only `setNodes` (edges' endpoint
  objects are mutated in place by the link force).
- No new global styles; the canvas uses existing `card`/`badge` classes and CSS
  variables (`--surface`, `--border`, `--text`), plus `touchAction: "none"` on
  the svg inline so d3-zoom owns touch pan/pinch.
- `<title>` element retained (Task 3 replaces it with an HTML tooltip).
- Minor known transient (pre-existing pattern, not introduced here): between a
  `data` change and the new simulation's first tick, a drag on a stale node
  would briefly restart the old (stopped) simulation; it self-corrects on the
  first tick of the new simulation.

## Files touched

- `components/graph/GraphCanvas.tsx` (new)
- `components/graph/GraphHub.tsx` (slimmed)
- `package.json`, `package-lock.json` (d3-zoom, d3-drag + @types)

Commit: `feat(graph): zoom, pan, node drag, and hover neighbor highlight`

---

## Fix round 1 (review findings)

Findings from review of commit `9a2fc65`, all originating in the brief's
snippet; fixed in `components/graph/GraphCanvas.tsx` only:

1. **CRITICAL — edges state never populated**: the tick handler only called
   `setNodes`, and nothing ever called `setEdges`, so no edges rendered and
   hover highlighting had nothing to work with. Fix: `setEdges(simEdges)` once
   when the simulation is created in the `[data]` effect (per-tick updates are
   unnecessary — the link force mutates the same edge objects in place and the
   per-tick `setNodes` re-render already re-reads them).

2. **CRITICAL — hover neighborhoods fed mutated link objects**:
   `forceLink.initialize()` replaces each simulation edge's string
   `source`/`target` with node object references, so `neighborIds`' string
   comparison (`e.source === id`) silently fails after the first tick.
   Fix: compute `neighbors` and `labels` from `data.edges` (the original
   string-endpoint array, immune to force mutation); the `edges` state is now
   render-only (line coordinates via the existing `coord()` helper, which
   accepts both string and object endpoints). The `as GraphEdge[]` casts at
   these call sites are gone since `data.edges` is already `GraphEdge[]`.

3. **IMPORTANT — node drag fought canvas pan**: the mousedown on a node
   bubbled to d3-zoom's listener on the `<svg>`, panning the canvas while
   dragging a node. Fix: `ev.sourceEvent.stopPropagation()` as the first
   statement of the drag `start` handler.

### Verification

- `npm run typecheck` → clean.
- `npx vitest run` → 23 files passed, 108/108 tests green.
- `npm run build` → static export ok (`/graph` prerendered); republished via
  `rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out`;
  `curl http://localhost:8788/graph` → 200. Nothing committed under
  `deploy/podman/pages-root/` (gitignored).

Commit: `fix(graph): populate edges state, compute hover neighborhoods from data.edges, stop drag pan-propagation`
