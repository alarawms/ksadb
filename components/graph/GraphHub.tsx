"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  HUMAN_COLORS, NODE_COLORS,
  type GraphData, type GraphNode, type HumanClass, type NodeType,
} from "./graph-layout";
import GraphCanvas from "./GraphCanvas";

type Filter = "all" | HumanClass;

const NODE_TYPES: NodeType[] = [
  "submitter", "study", "sample", "organism", "taxon",
  "platform", "strategy", "region", "publication", "term",
];
const HUMAN_CLASSES: HumanClass[] = ["human", "human_associated", "other"];

// Stable empty input so the canvas (and its toolbar) can render while the
// graph data is still being fetched, without re-running the effect below.
const EMPTY_DATA: GraphData = { nodes: [], edges: [] };

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
      <GraphCanvas data={data ?? EMPTY_DATA} filter={filter} onNodeClick={onNodeClick} />
    </div>
  );
}
