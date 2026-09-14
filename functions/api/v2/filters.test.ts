import { describe, expect, it } from "vitest";
import { parseV2Filters } from "./_lib/filters";

describe("parseV2Filters", () => {
  it("builds a WHERE clause across joined dims", () => {
    const { clause, params } = parseV2Filters(
      new URL("http://x/api/v2/search?organism=Camelus&country=SA&platform=ILLUMINA&from=2024-01-01&to=2024-12-31&q=metagenome")
    );
    expect(clause).toContain("s.country = 'SA'");
    expect(clause).toContain("s.organism = ?");
    expect(clause).toContain("s.country = ?");
    expect(clause).toContain("r.platform = ?");
    expect(clause).toContain("r.submitted_date >= ?");
    expect(clause).toContain("r.submitted_date <= ?");
    expect(clause).toContain("LIKE ?");
    expect(params).toEqual(["Camelus", "SA", "ILLUMINA", "2024-01-01", "2024-12-31~", "%metagenome%", "%metagenome%", "%metagenome%", "%metagenome%", "%metagenome%"]);
  });

  it("always enforces the Saudi default, even with no filters", () => {
    const { clause, params } = parseV2Filters(new URL("http://x/api/v2/search?page=2"));
    expect(clause).toBe(" WHERE s.country = 'SA'");
    expect(params).toEqual([]);
  });

  it("a contradictory non-Saudi country param yields an empty result, not a leak", () => {
    const { clause } = parseV2Filters(new URL("http://x/api/v2/search?country=QA"));
    expect(clause).toContain("s.country = 'SA'");
    expect(clause).toContain("s.country = ?");
  });
});
