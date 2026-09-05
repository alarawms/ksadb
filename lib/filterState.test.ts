import { describe, expect, it } from "vitest";

import type { RunItem } from "./api";
import {
  chipsFromState, countActiveFilters, EMPTY_FILTERS, filterRuns,
  paramsFromState, removeFilter, stateFromParams,
} from "./filterState";

function run(partial: Partial<RunItem>): RunItem {
  return {
    run_accession: "ERR1", bioproject_accession: null, biosample_accession: null,
    total_bases: 1000, platform: "ILLUMINA", instrument_model: null,
    library_strategy: null, organism: null, center_name: null,
    institution_name: null, geo_loc_name: null, source: "NCBI",
    year: 2020, published_dt: null,
    is_saudi_submitter: false, is_pathogen: false, is_wgs: false,
    ...partial,
  };
}

describe("state <-> params round trip", () => {
  it("empty state produces no params", () => {
    expect(paramsFromState(EMPTY_FILTERS).toString()).toBe("");
    expect(stateFromParams(new URLSearchParams())).toEqual(EMPTY_FILTERS);
  });

  it("round-trips every facet", () => {
    const state = {
      q: "sars", organism: "Homo sapiens", platforms: ["ILLUMINA", "OXFORD_NANOPORE"],
      institution: "KAUST", yearFrom: "2019", yearTo: "2024", source: "ENA",
      saudiOnly: true, pathogen: true, wgs: false,
    };
    const restored = stateFromParams(paramsFromState(state));
    expect(restored).toEqual(state);
  });

  it("maps to API param names", () => {
    const sp = paramsFromState({
      ...EMPTY_FILTERS, yearFrom: "2019", yearTo: "2024",
      saudiOnly: true, pathogen: true, wgs: true, platforms: ["ILLUMINA"],
    });
    expect(sp.get("year_from")).toBe("2019");
    expect(sp.get("year_to")).toBe("2024");
    expect(sp.get("saudi_only")).toBe("true");
    expect(sp.get("pathogen")).toBe("true");
    expect(sp.get("wgs")).toBe("true");
    expect(sp.get("platforms")).toBe("ILLUMINA");
  });
});

describe("chips", () => {
  it("lists active facets and counts them", () => {
    const state = {
      ...EMPTY_FILTERS, q: "abc", platforms: ["ILLUMINA", "PACBIO_SMRT"],
      saudiOnly: true,
    };
    const chips = chipsFromState(state);
    expect(chips.map((c) => c.key)).toEqual(["q", "platform:ILLUMINA", "platform:PACBIO_SMRT", "saudi_only"]);
    expect(countActiveFilters(state)).toBe(4);
  });

  it("removeFilter clears single facets, ranges and platforms", () => {
    const state = {
      ...EMPTY_FILTERS, q: "abc", platforms: ["A", "B"],
      yearFrom: "2019", yearTo: "2024", saudiOnly: true,
    };
    expect(removeFilter(state, "q").q).toBe("");
    expect(removeFilter(state, "platform:A").platforms).toEqual(["B"]);
    const noYears = removeFilter(state, "year");
    expect(noYears.yearFrom).toBe("");
    expect(noYears.yearTo).toBe("");
    expect(removeFilter(state, "saudi_only").saudiOnly).toBe(false);
  });
});

describe("filterRuns", () => {
  const runs = [
    run({ run_accession: "SRR1", organism: "Homo sapiens", platform: "ILLUMINA", year: 2021, is_saudi_submitter: true, is_wgs: true }),
    run({ run_accession: "ERR2", organism: "Severe acute respiratory syndrome coronavirus 2", platform: "OXFORD_NANOPORE", year: 2020, is_pathogen: true }),
    run({ run_accession: "DRR3", organism: null, platform: "ILLUMINA", year: 2018, source: "ENA" }),
  ];

  it("returns all runs for empty filters", () => {
    expect(filterRuns(runs, EMPTY_FILTERS)).toHaveLength(3);
  });

  it("filters by text, platform multi, year range and flags", () => {
    expect(filterRuns(runs, { ...EMPTY_FILTERS, q: "srr" })[0].run_accession).toBe("SRR1");
    expect(filterRuns(runs, { ...EMPTY_FILTERS, platforms: ["ILLUMINA"] })).toHaveLength(2);
    expect(filterRuns(runs, { ...EMPTY_FILTERS, yearFrom: "2020", yearTo: "2021" })).toHaveLength(2);
    expect(filterRuns(runs, { ...EMPTY_FILTERS, saudiOnly: true })).toHaveLength(1);
    expect(filterRuns(runs, { ...EMPTY_FILTERS, pathogen: true })).toHaveLength(1);
    expect(filterRuns(runs, { ...EMPTY_FILTERS, source: "ENA" })).toHaveLength(1);
  });

  it("combines facets with AND semantics", () => {
    const result = filterRuns(runs, { ...EMPTY_FILTERS, platforms: ["ILLUMINA"], yearFrom: "2019" });
    expect(result.map((r) => r.run_accession)).toEqual(["SRR1"]);
  });
});
