import { describe, expect, it } from "vitest";
import { classifyHuman } from "./human";

describe("classifyHuman", () => {
  it("classifies direct human samples", () => {
    expect(classifyHuman("Homo sapiens", 9606, null)).toBe("human");
    expect(classifyHuman("Homo sapiens", null, null)).toBe("human");
  });

  it("classifies human body-site metagenomes as human_associated", () => {
    expect(classifyHuman("human gut metagenome", 408170, "Homo sapiens")).toBe("human_associated");
    expect(classifyHuman("human virome", null, null)).toBe("human_associated");
    expect(classifyHuman("gut metagenome", null, "Homo sapiens")).toBe("human_associated");
  });

  it("classifies animal, plant and environmental samples as other", () => {
    expect(classifyHuman("Camelus dromedarius", 9838, null)).toBe("other");
    expect(classifyHuman("Arabian oryx", 97363, null)).toBe("other");
    expect(classifyHuman("gut metagenome", null, null)).toBe("other");
    expect(classifyHuman("soil metagenome", null, null)).toBe("other");
  });

  it("reinforces via UBERON anatomy terms", () => {
    expect(classifyHuman("metagenome", null, null, ["UBERON:0000059"])).toBe("human_associated");
    expect(classifyHuman("metagenome", null, null, ["ENVO:00001998"])).toBe("other");
  });

  it("human wins over human_associated signals", () => {
    expect(classifyHuman("Homo sapiens", 9606, "Homo sapiens")).toBe("human");
  });
});
