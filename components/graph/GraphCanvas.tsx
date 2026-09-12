"use client";

import { useEffect, useRef, useState } from "react";
import { drag, type D3DragEvent } from "d3-drag";
import { select } from "d3-selection";
import "d3-transition";
import { zoom as d3zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from "d3-zoom";
import {
  forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";

import {
  filterNodes, HUMAN_COLORS, isDimmed, neighborIds, NODE_COLORS, visibleLabelIds, ZOOM_EXTENT,
  type GraphData, type GraphEdge, type GraphNode, type HumanClass,
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
  const dragRef = useRef<ReturnType<typeof drag<SVGGElement, SimNode>> | null>(null);
  const dragBoundRef = useRef(false);
  const transformRef = useRef<string>("");

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
    setEdges(simEdges);

    const zoom = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent(ZOOM_EXTENT)
      .on("zoom", (ev: D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.setAttribute("transform", ev.transform.toString());
        transformRef.current = ev.transform.toString();
        setZoomK(ev.transform.k);
      });
    zoomRef.current = zoom;
    const svgSel = select(svg).call(zoom);

    dragRef.current = drag<SVGGElement, SimNode>()
      .on("start", (ev: D3DragEvent<SVGGElement, SimNode, SimNode>, d) => {
        // Keep the mousedown from reaching d3-zoom's svg listener, or the
        // canvas pans while the node is being dragged.
        ev.sourceEvent.stopPropagation();
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
      });

    return () => {
      sim.stop();
      simRef.current = null;
      dragRef.current = null;
      dragBoundRef.current = false;
      svgSel.on(".zoom", null);
      zoomRef.current = null;
    };
  }, [data]);

  // Nodes only enter the DOM after the simulation's first tick, so drag must
  // be bound once they exist (d3-drag attaches listeners to the selection's
  // elements directly; selecting here at mount time would match nothing).
  useEffect(() => {
    const g = gRef.current;
    if (!g || !dragRef.current || dragBoundRef.current || nodes.length === 0) return;
    select(g).selectAll<SVGGElement, SimNode>("g.graph-node").call(dragRef.current);
    dragBoundRef.current = true;
  }, [nodes]);

  // Hover neighborhoods must be computed from data.edges (original string
  // endpoints): the link force mutates the simulation's edge objects in place,
  // replacing source/target strings with node references, which would break
  // neighborIds' string comparison. The state's edges are render-only.
  const neighbors = hoverId ? neighborIds(data.edges, hoverId) : null;

  const [query, setQuery] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);
  const matches = filterNodes(nodes, query);
  const matchIds = query.trim() ? new Set(matches.map((n) => n.id)) : null;
  const labels = visibleLabelIds(nodes, data.edges, { hoverId, zoomK, matchIds });

  // Convert simulation coordinates to svg viewBox coordinates by parsing the
  // current translate/scale out of the <g> transform (maintained by the zoom
  // handler in transformRef).
  const svgPoint = (x: number, y: number): { x: number; y: number } => {
    const m = /translate\(([-\d.e]+)[, ]+([-\d.e]+)\)\s*scale\(([-\d.e]+)\)/.exec(transformRef.current);
    if (!m) return { x, y };
    const [, tx, ty, k] = m.map(Number) as [never, number, number, number];
    return { x: x * k + tx, y: y * k + ty };
  };

  const jumpTo = (n: SimNode) => {
    const svg = svgRef.current;
    const zoom = zoomRef.current;
    if (!svg || !zoom || n.x == null || n.y == null) return;
    const k = Math.max(zoomK, 1.8);
    const t = zoomIdentity.translate(400 - n.x * k, 300 - n.y * k).scale(k);
    select(svg).transition().duration(600).call(zoom.transform, t);
    setFlashId(n.id);
    setTimeout(() => setFlashId((f) => (f === n.id ? null : f)), 1600);
  };

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

  const handleClick = (n: GraphNode) => {
    if (draggedRef.current) return;
    onNodeClick(n);
  };

  const coord = (p: string | SimNode): { x: number; y: number } =>
    typeof p === "object" ? { x: p.x ?? 0, y: p.y ?? 0 } : { x: 0, y: 0 };

  const hovered = hoverId ? nodes.find((n) => n.id === hoverId) ?? null : null;
  const tipPos = hovered && hovered.x != null && hovered.y != null
    ? svgPoint(hovered.x, hovered.y) : null;

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
                    {flashId === n.id && (
                      <circle r={16} fill="none" stroke="var(--accent)"
                        className="graph-flash" />
                    )}
                    {labels.has(n.id) && (
                      <text dy={-10 - Math.min(14, Math.log2(n.count ?? 1))}
                        textAnchor="middle" fontSize={10} fill="var(--text)"
                        style={{ pointerEvents: "none" }}>
                        {n.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
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
}
