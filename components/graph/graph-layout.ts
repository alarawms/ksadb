export type NodeType = "submitter" | "study" | "sample" | "organism" | "taxon"
  | "platform" | "strategy" | "region" | "publication" | "term";
export type HumanClass = "human" | "human_associated" | "other";
// Mirrors the facets/recent fields Task 1 added to the graph API response.
export interface NodeFacets {
  domain?: HumanClass; region?: string; platforms?: string[]; years?: [number, number];
}
export interface GraphNode {
  id: string; type: NodeType; label: string; count?: number;
  human_class?: HumanClass; facets?: NodeFacets; recent?: boolean;
  link?: string | null;
}
// Task 2 detail payload: type-specific keys plus the node type. Renderers
// read fields defensively (`?? "—"`), so unknown values are fine.
export type DetailPayload = Record<string, unknown> & { type: NodeType };
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

// ---- facet rail dimming: every set facet ANDed against the node's facets ----

export interface ActiveFacets { domain?: string; region?: string; platform?: string; year?: number }

// True when the node passes every set facet. Nodes without facet info fail
// as soon as any facet is active; platforms match by intersection; a node's
// years range must include the active year.
export function facetMatch(
  f: GraphNode["facets"] | undefined,
  active: ActiveFacets
): boolean {
  if (Object.values(active).every((v) => v === undefined)) return true;
  if (!f) return false;
  if (active.domain !== undefined && f.domain !== active.domain) return false;
  if (active.region !== undefined && f.region !== active.region) return false;
  if (active.platform !== undefined && !(f.platforms ?? []).includes(active.platform)) return false;
  if (active.year !== undefined) {
    const [y0, y1] = f.years ?? [];
    if (y0 === undefined || y1 === undefined) return false;
    if (active.year < y0 || active.year > y1) return false;
  }
  return true;
}

export const ZOOM_LABEL_THRESHOLD = 1.5;
export const ZOOM_EXTENT: [number, number] = [0.2, 8];

export function neighborIds(edges: GraphEdge[], id: string): Set<string> {
  const out = new Set<string>([id]);
  for (const e of edges) {
    if (e.source === id) out.add(e.target);
    if (e.target === id) out.add(e.source);
  }
  return out;
}

export function visibleLabelIds(
  nodes: GraphNode[],
  edges: GraphEdge[],
  opts: { hoverId: string | null; zoomK: number; matchIds: Set<string> | null },
): Set<string> {
  if (opts.zoomK >= ZOOM_LABEL_THRESHOLD) return new Set(nodes.map((n) => n.id));
  const ids = new Set<string>();
  if (opts.hoverId) for (const n of neighborIds(edges, opts.hoverId)) ids.add(n);
  if (opts.matchIds) for (const n of opts.matchIds) ids.add(n);
  return ids;
}

export function filterNodes(nodes: GraphNode[], query: string): GraphNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return nodes.filter((n) => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)).slice(0, 10);
}
