# Final fix report — graph interactions (final-review fix wave)

Branch: `podman-local` (base HEAD `0ac8a08`). Scope: `components/graph/GraphCanvas.tsx`
plus test/dependency plumbing. No unrelated refactors.

## Finding 1 (CRITICAL) — drag handlers receive `datum === undefined`

- `components/graph/GraphCanvas.tsx:40` — added `simNodesRef` (`useRef<SimNode[]>`).
- `components/graph/GraphCanvas.tsx:53` — `[data]` effect stores the simulation node
  array in `simNodesRef.current` (same object references React renders, in render order).
- `components/graph/GraphCanvas.tsx:105-114` — the `[nodes]` drag-binding effect now
  joins data before calling drag:
  `select(g).selectAll<SVGGElement, SimNode>("g.graph-node").data(simNodesRef.current).call(dragRef.current)`.
  Index join is safe because render order equals `simNodes` order. Drag start no longer
  throws on `d.fx`, and the end handler's `setTimeout` reset of `draggedRef` runs, so
  node clicks are no longer permanently swallowed.

## Finding 2 (MAJOR) — tooltip positioned in viewBox units, not CSS px

- `components/graph/GraphCanvas.tsx:283-296` — tooltip render now computes
  `const s = (svgRef.current?.clientWidth ?? 800) / 800;` and positions with
  `left: tipPos.x * s, top: tipPos.y * s` (uniform scale; aspect preserved by `h-auto`).

## Finding 3 (MAJOR) — no component test per spec's Testing section

- New `components/graph/GraphCanvas.test.tsx` (6 tests, happy-dom via
  `// @vitest-environment happy-dom` docblock, `@testing-library/react`):
  - nodes/edges render from a fixture `GraphData` (study + sample + one edge);
  - search input filters and shows matches;
  - Enter selects `matches[0]` (query cleared), Escape clears the query;
  - tooltip content appears on hover and disappears on mouse leave;
  - zoom-in button exists and mutates the `<g>` transform (async via `waitFor`);
  - drag regression pin: `mousedown`+`mousemove`+`mouseup` on a node must not throw
    (window `error` events collected) and a subsequent click must fire `onNodeClick`
    (proves `draggedRef` was reset — the exact failure mode of finding 1).
- `package.json` devDependencies: added `happy-dom@^20.14.5`,
  `@testing-library/react@^16.3.3`, `@testing-library/dom@^10.4.1`
  (installed with `npm install --legacy-peer-deps`; React 18 / vitest 2.1 compatible).
- `vitest.config.ts:4-7` — added `esbuild: { jsx: "automatic", jsxImportSource: "react" }`.
  Required because the repo tsconfig uses `jsx: "preserve"` (for Next's SWC); without
  this, vitest's esbuild pass compiles JSX to the classic `React.createElement` runtime
  and components that don't import React fail under test. Scoped to vitest only.
- Test-env notes: explicit `afterEach(cleanup)` (vitest globals are off, so RTL
  auto-cleanup doesn't register); the drag test stubs `svg.createSVGPoint`/`getScreenCTM`
  (happy-dom's `SVGPoint` lacks `matrixTransform`) and passes `view: window` on synthetic
  mouse events (happy-dom leaves `event.view` null); the click after mouseup awaits one
  macrotask, matching the browser's task ordering for the end handler's `setTimeout(0)`.
- Regression-pin validation: temporarily removing the `.data(simNodesRef.current)` join
  makes the drag test fail (`onNodeClick` never called), confirming the test guards
  finding 1.

## Finding 4 (MINOR) — phantom runtime deps

- `package.json:14-15` — added `"d3-selection": "^3.0.0"` and `"d3-transition": "^3.0.1"`
  to `dependencies`, matching installed versions 3.0.0 / 3.0.1 (both already imported by
  `GraphCanvas.tsx:5-6`).

## Finding 5 (MINOR) — Enter/Escape on search input

- `components/graph/GraphCanvas.tsx:191-199` — added `onKeyDown` on the search input:
  Enter jumps to `matches[0]` (`jumpTo` + clear query, same as click); Escape clears the
  query (closes the dropdown).

## Verification

- `npx vitest run` — **24 files, 114 tests, all passed** (was 108 before; +6 new).
- `npm run typecheck` — clean (`tsc --noEmit`).
- `npm run build` + republish + smoke — `rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out`, then `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/graph` → **200**. Nothing committed under `deploy/podman/pages-root/`.
