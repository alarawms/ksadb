import { describe, expect, it } from "vitest";

import { formatBases, formatMb } from "./format";

describe("formatBases", () => {
  it("handles null and scales", () => {
    expect(formatBases(null)).toBe("—");
    expect(formatBases(500)).toBe("500 bp");
    expect(formatBases(12_340)).toBe("12.3 kb");
    expect(formatBases(5_600_000)).toBe("5.6 Mb");
    expect(formatBases(9_600_000_000)).toBe("9.6 Gb");
  });
});

describe("formatMb", () => {
  it("handles null and scales", () => {
    expect(formatMb(null)).toBe("—");
    expect(formatMb(12.34)).toBe("12.3 MB");
    expect(formatMb(2345)).toBe("2.3 GB");
  });
});
