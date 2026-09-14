// lib/semanticMatch.test.ts
import { describe, expect, it } from "vitest";

import { matchHref, semanticBadge, semanticTitle, type SemanticMatch } from "./semanticMatch";

const base = {
  accession: "SAMN00000001",
  organism: "Camelus dromedarius",
  submitter: "KAUST",
  runs: 3,
  score: 0.87,
};

describe("semanticBadge", () => {
  it("labels each match type", () => {
    expect(semanticBadge("study")).toBe("Study");
    expect(semanticBadge("sample")).toBe("Sample");
    expect(semanticBadge("run")).toBe("Run");
  });
});

describe("semanticTitle", () => {
  it("uses the title for a study match", () => {
    const m: SemanticMatch = { ...base, type: "study", title: "Camel WGS project", label: null };
    expect(semanticTitle(m)).toBe("Camel WGS project");
  });

  it("falls back to the label for a sample match with no title", () => {
    const m: SemanticMatch = { ...base, type: "sample", title: null, label: "Camelus dromedarius" };
    expect(semanticTitle(m)).toBe("Camelus dromedarius");
  });

  it("falls back to the label for a run match with no title", () => {
    const m: SemanticMatch = { ...base, type: "run", title: null, label: "Camel WGS project" };
    expect(semanticTitle(m)).toBe("Camel WGS project");
  });

  it("falls back to the accession when title and label are both absent", () => {
    const m: SemanticMatch = { ...base, type: "sample", title: null, label: null };
    expect(semanticTitle(m)).toBe("SAMN00000001");
  });

  it("routes study matches to the study page", () => {
    expect(matchHref({ ...base, type: "study", title: null })).toBe("/study?id=SAMN00000001");
  });

  it("routes run matches to the run page", () => {
    expect(matchHref({ ...base, type: "run", title: null })).toBe("/run?id=SAMN00000001");
  });

  it("routes sample matches to a biosample search", () => {
    expect(matchHref({ ...base, type: "sample", title: null })).toBe("/search?q=SAMN00000001");
  });
});
