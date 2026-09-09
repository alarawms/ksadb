import { describe, expect, it } from "vitest";

import { formatBases, formatGb, formatMb, parseFastqBytes } from "./format";

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

describe("parseFastqBytes", () => {
  it("handles null and plain strings", () => {
    expect(parseFastqBytes(null)).toBe(0);
    expect(parseFastqBytes("100")).toBe(100);
  });

  it("sums semicolon-delimited per-file sizes", () => {
    expect(parseFastqBytes("100;200;50")).toBe(350);
  });

  it("returns 0 for unparseable input", () => {
    expect(parseFastqBytes("")).toBe(0);
    expect(parseFastqBytes("abc")).toBe(0);
  });
});

describe("formatGb", () => {
  it("handles zero and scales", () => {
    expect(formatGb(0)).toBe("—");
    expect(formatGb(null)).toBe("—");
    expect(formatGb(500_000)).toBe("0.5 MB");
    expect(formatGb(2_500_000_000)).toBe("2.5 GB");
  });
});
