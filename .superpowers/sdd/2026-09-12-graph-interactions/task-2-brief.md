### Task 2: Extract GraphCanvas with zoom/pan, node drag, hover highlight

**Files:**
- Create: `components/graph/GraphCanvas.tsx`
- Modify: `components/graph/GraphHub.tsx` (remove the inline `GraphCanvas` function and `SimNode`/`SimEdge` types; import the new component)
- Modify: `package.json` (add `d3-zoom`, `d3-drag` dependencies)

**Interfaces:**
- Consumes: `neighborIds`, `visibleLabelIds`, `ZOOM_EXTENT` from `./graph-layout`; `GraphData`, `GraphNode` types; existing `nodeColor`, `Filter`, `isDimmed` logic as-is.
- Produces: `export default function GraphCanvas({ data, filter, onNodeClick }: { data: GraphData; filter: "all" | HumanClass; onNodeClick: (n: GraphNode) => void })` — rendered by `GraphHub` exactly where the old inline canvas was.
- Produces (used by Task 3): inside `GraphCanvas`, a state `zoomK: number` (current zoom scale, updated on every zoom event) and a `zoomRef` holding the d3 zoom behavior so Task 3 can add programmatic zoom. Keep both at the top level of `GraphCanvas`.

- [ ] **Step 1: Install d3 modules**

```bash
npm install d3-zoom d3-drag
```

If `npm run typecheck` later reports missing type declarations for `d3-zoom` or `d3-drag`, also run `npm install -D @types/d3-zoom @types/d3-drag` (d3 modules usually ship types; only add @types if tsc errors).

- [ ] **Step 2: Write the new GraphCanvas component**

Create `components/graph/GraphCanvas.tsx`. It is the current inline `GraphCanvas` from `GraphHub.tsx` (copy it, then apply these changes). Full structure the implementer should end with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { drag, type D3DragEvent } from "d3-drag";
import { select, type Selection } from "d3-selection";
import { zoom as d3zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from "d3-zoom";
import {
  forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";

import {
  HUMAN_COLORS, isDimmed, neighborIds, NODE_COLORS, visibleLabelIds, ZOOM_EXTENT,
  type GraphData, type GraphEdge, type GraphNode, type HumanClass, type NodeType,
} from "./graph-layout";

type Filter = "all" | HumanClass;
type SimNode = GraphNode & SimulationNodeDatum;
type SimEdge = Omit<GraphEdge, "source" | "target"> & { source: string | SimNode; target: string | SimNode };

function nodeColor(n: GraphNode): string {
  if (n.type === "organism" && n.human_class) return HUMAN_COLORS[n.human_class];
  return NODE_COLORS[n.type];
}

export default function GraphCanvas({ data, filter, onNodeClick }: {
  data: GraphData;
  filter: Filter;
  onNodeClick: (n: GraphNode) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [edges, setEdges] = useState<SimEdge[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [zoomK, setZoomK] = useState(1);
  const draggedRef = useRef(false);
  const simRef = useRef<ReturnType<typeof forceSimulation<SimNode>> | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!svg || !g) return;

    const simNodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const simEdges: SimEdge[] = data.edges.map((e) => ({ ...e }));
    const sim = forceSimulation(simNodes)
      .force("link", forceLink(simEdges).id((d) => (d as SimNode).id).distance(90))
      .force("charge", forceManyBody().strength(-260))
      .force("center", forceCenter(400, 300))
      .force("collide", forceCollide(28))
      .on("tick", () => setNodes([...simNodes]));
    simRef.current = sim;

    const zoom = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent(ZOOM_EXTENT)
      .on("zoom", (ev: D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.setAttribute("transform", ev.transform.toString());
        setZoomK(ev.transform.k);
      });
    zoomRef.current = zoom;
    const svgSel = select(svg).call(zoom);

    const nodeSel = select(g).selectAll<SVGGElement, SimNode>("g.graph-node");
    nodeSel.call(
      drag<SVGGElement, SimNode>()
        .on("start", (ev: D3DragEvent<SVGGElement, SimNode, SimNode>, d) => {
          draggedRef.current = false;
          if (!ev.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (ev: D3DragEvent<SVGGElement, SimNode, SimNode>, d) => {
          draggedRef.current = true;
          d.fx = ev.x; d.fy = ev.y;
        })
        .on("end", (ev: D3DragEvent<SVGGElement, SimNode, SimNode>, d) => {
          if (!ev.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
          setTimeout(() => { draggedRef.current = false; }, 0);
        }),
    );

    return () => {
      sim.stop();
      simRef.current = null;
      svgSel.on(".zoom", null);
      zoomRef.current = null;
    };
  }, [data]);

  const neighbors = hoverId ? neighborIds(edges as GraphEdge[], hoverId) : null;
  const labels = visibleLabelIds(nodes, edges as GraphEdge[], { hoverId, zoomK, matchIds: null });

  const handleClick = (n: GraphNode) => {
    if (draggedRef.current) return;
    onNodeClick(n);
  };

  const coord = (p: string | SimNode): { x: number; y: number } =>
    typeof p === "object" ? { x: p.x ?? 0, y: p.y ?? 0 } : { x: 0, y: 0 };

  return (
    <div className="card overflow-hidden p-0">
      <svg ref={svgRef} viewBox="0 0 800 600" className="block h-auto w-full"
        style={{ background: "var(--surface)", touchAction: "none" }} role="img">
        <g ref={gRef}>
          <g>
            {edges.map((e, i) => {
              const s = coord(e.source);
              const t = coord(e.target);
              const dimmed = neighbors !== null &&
                !(neighbors.has(String(typeof e.source === "object" ? e.source.id : e.source)) &&
                  neighbors.has(String(typeof e.target === "object" ? e.target.id : e.target)));
              return (
                <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                  stroke="var(--border)" strokeOpacity={dimmed ? 0.08 : 0.6} />
              );
            })}
          </g>
          <g>
            {nodes.map((n) => {
              const dimFilter = isDimmed(n, filter);
              const dimHover = neighbors !== null && !neighbors.has(n.id);
              const dimmed = dimFilter || dimHover;
              return (
                <g key={n.id} className="graph-node"
                  transform={`translate(${n.x ?? 0},${n.y ?? 0})`}
                  opacity={dimmed ? 0.15 : 1}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleClick(n)}
                  onMouseEnter={() => setHoverId(n.id)}
                  onMouseLeave={() => setHoverId((h) => (h === n.id ? null : h))}>
                  <circle r={6 + Math.min(14, Math.log2(n.count ?? 1))}
                    fill={nodeColor(n)} fillOpacity={0.9} stroke="var(--surface)" />
                  {labels.has(n.id) && (
                    <text dy={-10 - Math.min(14, Math.log2(n.count ?? 1))}
                      textAnchor="middle" fontSize={10} fill="var(--text)"
                      style={{ pointerEvents: "none" }}>
                      {n.label}
                    </text>
                  )}
                  <title>{`${n.label}${n.count != null ? ` (${n.count.toLocaleString()})` : ""}`}</title>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
```

Notes for the implementer:
- `neighborIds` takes `GraphEdge[]` where source/target are strings; the state's `SimEdge` has object-or-string endpoints, hence the casts at the call sites (edges are stringified by id after the simulation's first tick, but cast defensively as shown).
- Per-tick state is only `setNodes` (edges read endpoint objects, which the link force mutates in place — same as before).
- `touchAction: "none"` on the svg lets d3-zoom handle touch pan/pinch instead of the browser.
- Keep the existing `<title>` element; Task 3 replaces it with an HTML tooltip.

- [ ] **Step 3: Slim GraphHub.tsx**

In `components/graph/GraphHub.tsx`: delete the inline `GraphCanvas` function, the `SimNode`/`SimEdge` type declarations, now-unused imports (`forceCenter`, `forceCollide`, `forceLink`, `forceManyBody`, `forceSimulation`, `SimulationNodeDatum`, `useRef`), and the unused `svgRef`. Keep `NODE_TYPES`, `HUMAN_CLASSES`, `nodeColor` (move `nodeColor` into `GraphCanvas.tsx` — it is already included in the Task 2 Step 2 code), the fetch effect, filter state, legend, and `onNodeClick`. Add `import GraphCanvas from "./GraphCanvas";` and render `<GraphCanvas data={data} filter={filter} onNodeClick={onNodeClick} />` where the old inline one was. The default export signature of `GraphHub` must not change.

- [ ] **Step 4: Verify tests, typecheck, build, live smoke**

Run:
```bash
npx vitest run && npm run typecheck
npm run build && rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/graph
```
Expected: all tests green, typecheck clean, build succeeds, curl prints 200.

- [ ] **Step 5: Commit**

```bash
git add components/graph/GraphCanvas.tsx components/graph/GraphHub.tsx package.json package-lock.json
git commit -m "feat(graph): zoom, pan, node drag, and hover neighbor highlight"
```

---

