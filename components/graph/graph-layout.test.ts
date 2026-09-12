import { describe, expect, it } from "vitest";
import { isDimmed, NODE_COLORS, HUMAN_COLORS, type NodeType } from "./graph-layout";

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
