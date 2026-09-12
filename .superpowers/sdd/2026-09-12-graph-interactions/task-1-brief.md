### Task 1: Pure interaction helpers in graph-layout.ts

**Files:**
- Modify: `components/graph/graph-layout.ts`
- Test: `components/graph/graph-layout.test.ts` (create)

**Interfaces:**
- Consumes: existing types `GraphNode`, `GraphEdge` from `./graph-layout` (fields: `id: string`, `type: NodeType`, `label: string`, `count?: number`, `human_class?: HumanClass`, `link?`).
- Produces (used by Tasks 2 and 3):
  - `neighborIds(edges: GraphEdge[], id: string): Set<string>` — returns the set containing `id` plus every node id directly connected to it by an edge.
  - `visibleLabelIds(nodes: GraphNode[], edges: GraphEdge[], opts: { hoverId: string | null; zoomK: number; matchIds: Set<string> | null }): Set<string>` — ids that should render a text label: hovered node + its neighbors, nodes in `matchIds`, or all nodes when `zoomK >= ZOOM_LABEL_THRESHOLD`.
  - `filterNodes(nodes: GraphNode[], query: string): GraphNode[]` — case-insensitive substring match on `label` and `id`, empty query returns `[]`, max 10 results.
  - `ZOOM_LABEL_THRESHOLD: number` (value `1.5`).
  - `ZOOM_EXTENT: [number, number]` (value `[0.2, 8]`).

- [ ] **Step 1: Write the failing test**

Create `components/graph/graph-layout.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  filterNodes, neighborIds, visibleLabelIds, ZOOM_LABEL_THRESHOLD,
  type GraphEdge, type GraphNode,
} from "./graph-layout";

const nodes: GraphNode[] = [
  { id: "study:A", type: "study", label: "Camel Microbiome" },
  { id: "sample:S1", type: "sample", label: "SRR1" },
  { id: "organism:O1", type: "organism", label: "Camelus dromedarius" },
];
const edges: GraphEdge[] = [
  { source: "study:A", target: "sample:S1", kind: "samples" },
  { source: "sample:S1", target: "organism:O1", kind: "classifies" },
];

describe("neighborIds", () => {
  it("returns self plus direct neighbors", () => {
    expect(neighborIds(edges, "sample:S1")).toEqual(new Set(["sample:S1", "study:A", "organism:O1"]));
  });
  it("returns only self for isolated or unknown node", () => {
    expect(neighborIds(edges, "term:T1")).toEqual(new Set(["term:T1"]));
  });
});

describe("visibleLabelIds", () => {
  it("shows all labels when zoomed past threshold", () => {
    const ids = visibleLabelIds(nodes, edges, { hoverId: null, zoomK: ZOOM_LABEL_THRESHOLD, matchIds: null });
    expect(ids.size).toBe(nodes.length);
  });
  it("shows only hover neighborhood when zoomed out", () => {
    const ids = visibleLabelIds(nodes, edges, { hoverId: "sample:S1", zoomK: 1, matchIds: null });
    expect(ids).toEqual(new Set(["sample:S1", "study:A", "organism:O1"]));
  });
  it("includes search matches even when zoomed out", () => {
    const ids = visibleLabelIds(nodes, edges, { hoverId: null, zoomK: 1, matchIds: new Set(["study:A"]) });
    expect(ids.has("study:A")).toBe(true);
    expect(ids.has("sample:S1")).toBe(false);
  });
});

describe("filterNodes", () => {
  it("matches label case-insensitively, max 10, empty query gives nothing", () => {
    expect(filterNodes(nodes, "camel").map((n) => n.id)).toEqual(["study:A", "organism:O1"]);
    expect(filterNodes(nodes, "srr1")[0].id).toBe("sample:S1");
    expect(filterNodes(nodes, "")).toEqual([]);
    const many = Array.from({ length: 15 }, (_, i) => ({ id: `study:X${i}`, type: "study" as const, label: `same ${i}` }));
    expect(filterNodes(many, "same")).toHaveLength(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/graph/graph-layout.test.ts`
Expected: FAIL — `neighborIds is not exported` (or similar import error).

- [ ] **Step 3: Implement the helpers**

Append to `components/graph/graph-layout.ts` (read the file first to match its existing export style; it currently exports types, `NODE_COLORS`, `HUMAN_COLORS`, `isDimmed`):

```ts
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
```

- [ ] **Step 4: Run tests and typecheck**

Run: `npx vitest run components/graph/graph-layout.test.ts && npm run typecheck`
Expected: new test file passes; typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add components/graph/graph-layout.ts components/graph/graph-layout.test.ts
git commit -m "feat(graph): pure interaction helpers (neighbors, label visibility, search)"
```

---

