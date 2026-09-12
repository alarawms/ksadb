export type NodeType = "submitter" | "study" | "sample" | "organism" | "taxon"
  | "platform" | "strategy" | "region" | "publication" | "term";
export type HumanClass = "human" | "human_associated" | "other";
export interface GraphNode {
  id: string; type: NodeType; label: string; count?: number;
  human_class?: HumanClass; link?: string | null;
}
export interface GraphEdge { source: string; target: string; kind: string; count?: number }
export interface GraphData { nodes: GraphNode[]; edges: GraphEdge[] }

// Theme-independent hues per node type. These hexes are intentional
// exceptions to the CSS-variable rule: SVG canvas colors can't follow
// `data-theme` without re-running the simulation/re-render.
export const NODE_COLORS: Record<NodeType, string> = {
  submitter: "#6366f1", study: "#2563eb", sample: "#0ea5e9",
  organism: "#2dd4bf", taxon: "#14b8a6", platform: "#a855f7",
  strategy: "#c084fc", region: "#84cc16", publication: "#64748b", term: "#f97316",
};

// Human-class overrides for organism nodes; distinct in both themes.
// Same documented hex exception as NODE_COLORS.
export const HUMAN_COLORS: Record<HumanClass, string> = {
  human: "#e11d48", human_associated: "#f59e0b", other: "#2dd4bf",
};

export function isDimmed(
  n: Pick<GraphNode, "type" | "human_class">,
  filter: "all" | HumanClass
): boolean {
  if (filter === "all") return false;
  if (n.type !== "organism" && n.type !== "sample" && n.type !== "taxon") return false;
  return n.human_class !== filter;
}
