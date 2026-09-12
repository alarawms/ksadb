"use client";

import { useEffect, useRef, useState } from "react";
import { drag, type D3DragEvent } from "d3-drag";
import { select } from "d3-selection";
import { zoom as d3zoom, type D3ZoomEvent, type ZoomBehavior } from "d3-zoom";
import {
  forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";

import {
  HUMAN_COLORS, isDimmed, neighborIds, NODE_COLORS, visibleLabelIds, ZOOM_EXTENT,
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

    dragRef.current = drag<SVGGElement, SimNode>()
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
