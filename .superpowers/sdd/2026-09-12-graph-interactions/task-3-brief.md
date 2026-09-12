### Task 3: Tooltip, label declutter wiring, search/jump-to-node, zoom controls

**Files:**
- Modify: `components/graph/GraphCanvas.tsx`

**Interfaces:**
- Consumes: `filterNodes` from `./graph-layout`; `zoomRef`, `zoomK`/`setZoomK`, `hoverId` state from Task 2's `GraphCanvas`; d3 `zoom`, `zoomIdentity`, `select`, `ZoomTransform`.
- Produces: none (leaf task — the component is the deliverable).

- [ ] **Step 1: Add the search state and zoom-control helpers inside `GraphCanvas`**

Add above the return statement (after the `neighbors`/`labels` computation):

```tsx
const [query, setQuery] = useState("");
const [flashId, setFlashId] = useState<string | null>(null);
const matches = filterNodes(nodes, query);
const matchIds = query.trim() ? new Set(matches.map((n) => n.id)) : null;
// recompute labels with matchIds (replaces the Task 2 `matchIds: null` call):
const labels = visibleLabelIds(nodes, edges as GraphEdge[], { hoverId, zoomK, matchIds });
const transformRef = useRef<string>("");
```

In the Task 2 zoom effect's `"zoom"` handler, also record `transformRef.current = ev.transform.toString()`.

Add a helper to convert simulation coordinates to svg viewBox coordinates for tooltip placement:

```tsx
const svgPoint = (x: number, y: number): { x: number; y: number } => {
  // parse the current translate/scale out of the <g> transform
  const m = /translate\(([-\d.e]+)[, ]+([-\d.e]+)\)\s*scale\(([-\d.e]+)\)/.exec(transformRef.current);
  if (!m) return { x, y };
  const [, tx, ty, k] = m.map(Number) as [never, number, number, number];
  return { x: x * k + tx, y: y * k + ty };
};
```

Add jump-to-node:

```tsx
const jumpTo = (n: GraphNode & SimulationNodeDatum) => {
  const svg = svgRef.current;
  const zoom = zoomRef.current;
  if (!svg || !zoom || n.x == null || n.y == null) return;
  const k = Math.max(zoomK, 1.8);
  const t = zoomIdentity.translate(400 - n.x * k, 300 - n.y * k).scale(k);
  select(svg).transition().duration(600).call(zoom.transform, t);
  setFlashId(n.id);
  setTimeout(() => setFlashId((f) => (f === n.id ? null : f)), 1600);
};
```

Add fit-to-view (used by the reset button):

```tsx
const fitView = () => {
  const svg = svgRef.current;
  const zoom = zoomRef.current;
  if (!svg || !zoom) return;
  const pts = nodes.filter((n) => n.x != null && n.y != null);
  if (!pts.length) return;
  const xs = pts.map((n) => n.x as number);
  const ys = pts.map((n) => n.y as number);
  const pad = 60;
  const x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad;
  const y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  const k = Math.min(800 / (x1 - x0), 600 / (y1 - y0), 2.5);
  const t = zoomIdentity
    .translate(400 - (k * (x0 + x1)) / 2, 300 - (k * (y0 + y1)) / 2)
    .scale(k);
  select(svg).transition().duration(600).call(zoom.transform, t);
};
```

- [ ] **Step 2: Render the toolbar, tooltip, and flash ring**

Replace the outer `<div className="card ...">` return with this structure (the existing `<svg>` block stays inside, unchanged except where noted):

```tsx
const hovered = hoverId ? nodes.find((n) => n.id === hoverId) ?? null : null;
const tipPos = hovered && hovered.x != null && hovered.y != null ? svgPoint(hovered.x, hovered.y) : null;

return (
  <div className="card overflow-hidden p-0">
    <div className="flex flex-wrap items-center gap-2 border-b p-2"
      style={{ borderColor: "var(--border)" }}>
      <div className="relative">
        <input
          className="input w-56"
          placeholder="Find node…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Find node"
        />
        {matches.length > 0 && (
          <ul className="absolute left-0 top-full z-10 mt-1 max-h-56 w-56 overflow-auto rounded border bg-[var(--surface)] text-sm shadow"
            style={{ borderColor: "var(--border)" }}>
            {matches.map((n) => (
              <li key={n.id}>
                <button className="block w-full px-2 py-1 text-left hover:opacity-80"
                  onClick={() => { jumpTo(n as SimNode); setQuery(""); }}>
                  <span className="mr-1 inline-block h-2 w-2 rounded-full align-middle"
                    style={{ background: nodeColor(n) }} />
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        {query.trim() && matches.length === 0 && (
          <p className="absolute left-0 top-full z-10 mt-1 w-56 rounded border bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-dim)]"
            style={{ borderColor: "var(--border)" }}>
            No match
          </p>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button className="btn" aria-label="Zoom in" onClick={() => {
          const svg = svgRef.current; const z = zoomRef.current;
          if (svg && z) select(svg).transition().duration(200).call(z.scaleBy, 1.4);
        }}>+</button>
        <button className="btn" aria-label="Zoom out" onClick={() => {
          const svg = svgRef.current; const z = zoomRef.current;
          if (svg && z) select(svg).transition().duration(200).call(z.scaleBy, 1 / 1.4);
        }}>−</button>
        <button className="btn" onClick={fitView}>Fit</button>
      </div>
    </div>

    <div className="relative">
      {/* existing <svg> block, unchanged */}
      {tipPos && hovered && (
        <div className="pointer-events-none absolute z-10 max-w-56 rounded border px-2 py-1 text-xs shadow"
          style={{ left: tipPos.x, top: tipPos.y, transform: "translate(-50%, -120%)",
                   background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}>
          <div className="font-semibold">{hovered.label}</div>
          <div className="text-[var(--text-dim)]">
            {hovered.type}
            {hovered.count != null && ` · ${hovered.count.toLocaleString()} runs`}
            {hovered.human_class && ` · ${hovered.human_class}`}
          </div>
          <div className="text-[var(--text-dim)]">
            {hovered.link ? "click to open" : "click to explore"}
          </div>
        </div>
      )}
    </div>
  </div>
);
```

Notes for the implementer:
- Tooltip coordinates are in the svg's 800×600 viewBox space; the tooltip div is absolutely positioned inside the same relatively-positioned wrapper as the svg, so they align as the svg scales with the container.
- If the `input` CSS class does not exist in `app/globals.css`, use inline styles matching the portal's look (`background: var(--surface)`, `border: 1px solid var(--border)`, `color: var(--text)`, `border-radius` like other inputs — check how the search page input is styled and match it).
- Remove the now-redundant `<title>` element from node groups (the HTML tooltip replaces it).
- The flash ring: inside the node `<g>` render, when `flashId === n.id`, an extra `<circle>` with a CSS keyframe animation (add a small `<style>` block or extend globals.css with a `@keyframes graph-flash { from { stroke-opacity: 0.9 } to { stroke-opacity: 0 } }` and `animation: graph-flash 1.6s ease-out`) using `r={16}`, `fill="none"`, `stroke="var(--accent)"`. Prefer adding the keyframes to `app/globals.css`.
- Labels now use the `matchIds`-aware `labels` set from Step 1.

- [ ] **Step 3: Verify tests, typecheck, build, live smoke**

Run:
```bash
npx vitest run && npm run typecheck
npm run build && rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/graph
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8788/api/v2/graph"
```
Expected: all green; both curls print 200.

- [ ] **Step 4: Manual smoke checklist** (verify in the served page; ask the user to confirm or verify via curl-rendered HTML that the page contains the new toolbar — full pointer interaction can only be confirmed in a browser)

- [ ] **Step 5: Commit**

```bash
git add components/graph/GraphCanvas.tsx app/globals.css
git commit -m "feat(graph): tooltip, label declutter, search/jump, and zoom controls"
```

---

## Self-Review Notes

- Spec coverage: zoom/pan (T2), drag (T2), hover highlight (T2), rich tooltips (T3), label declutter (T1 helpers + T2/T3 wiring), search/jump (T1 helper + T3), theming via CSS variables (T2/T3), component split (T2), testing (T1 unit tests; jsdom interaction tests explicitly out of scope per spec).
- No placeholders; all code shown verbatim. Types (`SimNode`, `GraphData`, etc.) are defined where first used.
- Known deliberate simplification: `svgPoint` parses the `<g>` transform string rather than threading a ZoomTransform through state — acceptable because the transform string is already maintained in `transformRef` by the zoom handler.
