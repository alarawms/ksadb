import { describe, expect, it } from "vitest";
import {
  filterNodes, isDimmed, neighborIds, NODE_COLORS, HUMAN_COLORS,
  visibleLabelIds, ZOOM_LABEL_THRESHOLD, type GraphEdge, type GraphNode, type NodeType,
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

describe("graph-layout helpers", () => {
  it("dims organism/sample/taxon nodes that don't match the human filter", () => {
    expect(isDimmed({ type: "organism", human_class: "human" }, "other")).toBe(true);
    expect(isDimmed({ type: "organism", human_class: "human" }, "all")).toBe(false);
    expect(isDimmed({ type: "study" }, "other")).toBe(false);
    expect(isDimmed({ type: "sample", human_class: "other" }, "other")).toBe(false);
  });

  it("has a color for every node type and human class", () => {
    const types: NodeType[] = ["submitter", "study", "sample", "organism", "taxon",
                     "platform", "strategy", "region", "publication", "term"];
    for (const t of types)
      expect(NODE_COLORS[t]).toMatch(/^#/);
    expect(Object.keys(HUMAN_COLORS)).toEqual(["human", "human_associated", "other"]);
  });
});
