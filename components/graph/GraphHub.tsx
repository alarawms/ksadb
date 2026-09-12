"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";

import {
  HUMAN_COLORS, isDimmed, NODE_COLORS,
  type GraphData, type GraphEdge, type GraphNode, type HumanClass, type NodeType,
} from "./graph-layout";

type Filter = "all" | HumanClass;

type SimNode = GraphNode & SimulationNodeDatum;
type SimEdge = Omit<GraphEdge, "source" | "target"> & {
  source: string | SimNode;
  target: string | SimNode;
};

const NODE_TYPES: NodeType[] = [
  "submitter", "study", "sample", "organism", "taxon",
  "platform", "strategy", "region", "publication", "term",
];
const HUMAN_CLASSES: HumanClass[] = ["human", "human_associated", "other"];

function nodeColor(n: GraphNode): string {
  if (n.type === "organism" && n.human_class) return HUMAN_COLORS[n.human_class];
  return NODE_COLORS[n.type];
}

export default function GraphHub({ focus }: { focus: string | null }) {
  const router = useRouter();
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = `/api/v2/graph${focus ? `?focus=${encodeURIComponent(focus)}` : ""}`;
    fetch(url, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API /v2/graph -> ${res.status}`);
        return res.json() as Promise<GraphData>;
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [focus]);

  const onNodeClick = (n: GraphNode) => {
    if (n.link) router.push(n.link);
    else router.push(`/graph?focus=${encodeURIComponent(n.id)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Knowledge graph</h1>
          {focus && <p className="text-sm text-[var(--text-dim)]">{focus}</p>}
        </div>
        {focus && (
          <button className="btn ml-auto shrink-0" onClick={() => router.push("/graph")}>
            ← Back to overview
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {NODE_TYPES.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 text-[var(--text-dim)]">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: NODE_COLORS[t] }}
            />
            {t}
          </span>
        ))}
        <span className="mx-1 text-[var(--text-dim)]">|</span>
        {(["all", ...HUMAN_CLASSES] as Filter[]).map((f) => (
          <button
            key={f}
            className={`badge ${filter === f ? "badge-accent" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f !== "all" && (
              <span
                className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle"
                style={{ background: HUMAN_COLORS[f as HumanClass] }}
              />
            )}
            {f === "all" ? "all" : f}
          </button>
        ))}
      </div>

      {error && <p className="text-danger">{error}</p>}
      {loading && <p className="text-dim">Loading graph…</p>}
      {data && !loading && <GraphCanvas data={data} filter={filter} onNodeClick={onNodeClick} />}
    </div>
  );
}

function GraphCanvas({
  data, filter, onNodeClick,
}: {
  data: GraphData;
  filter: Filter;
  onNodeClick: (n: GraphNode) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [edges, setEdges] = useState<SimEdge[]>([]);

  useEffect(() => {
    const simNodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const simEdges: SimEdge[] = data.edges.map((e) => ({ ...e }));
    const sim = forceSimulation(simNodes)
      .force("link", forceLink(simEdges).id((d) => (d as SimNode).id).distance(90))
      .force("charge", forceManyBody().strength(-260))
      .force("center", forceCenter(400, 300))
      .force("collide", forceCollide(28))
      .on("tick", () => {
        setNodes([...simNodes]);
        setEdges([...simEdges]);
      });
    return () => {
      sim.stop();
    };
  }, [data]);

  const coord = (p: string | SimNode): { x: number; y: number } =>
    typeof p === "object" ? { x: p.x ?? 0, y: p.y ?? 0 } : { x: 0, y: 0 };

  return (
    <div className="card overflow-hidden p-0">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        className="block h-auto w-full"
        style={{ background: "var(--surface)" }}
        role="img"
      >
        <g>
          {edges.map((e, i) => {
            const s = coord(e.source);
            const t = coord(e.target);
            return (
              <line
                key={i}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="var(--border)"
                strokeOpacity={0.6}
              />
            );
          })}
        </g>
        <g>
          {nodes.map((n) => {
            const dimmed = isDimmed(n, filter);
            return (
              <g
                key={n.id}
                transform={`translate(${n.x ?? 0}, ${n.y ?? 0})`}
                opacity={dimmed ? 0.15 : 1}
                style={{ cursor: "pointer" }}
                onClick={() => onNodeClick(n)}
              >
                <circle
                  r={6 + Math.min(14, Math.log2(n.count ?? 1))}
                  fill={nodeColor(n)}
                  fillOpacity={0.9}
                  stroke="var(--surface)"
                />
                <text
                  dy={-10 - Math.min(14, Math.log2(n.count ?? 1))}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--text)"
                  style={{ pointerEvents: "none" }}
                >
                  {n.label}
                </text>
                <title>{`${n.label}${n.count != null ? ` (${n.count.toLocaleString()})` : ""}`}</title>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
