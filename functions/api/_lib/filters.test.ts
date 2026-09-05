import { describe, expect, it } from "vitest";

import { parsePage } from "./db";
import { buildWhere, parseFilters } from "./filters";

describe("buildWhere", () => {
  it("returns empty clause with no filters", () => {
    expect(buildWhere({})).toEqual({ clause: "", params: [] });
  });

  it("builds LIKE clause for q with 4 params", () => {
    const { clause, params } = buildWhere({ q: "kaust" });
    expect(clause).toBe(
      " WHERE (run_accession LIKE ? OR bioproject_accession LIKE ? OR organism LIKE ? OR center_name LIKE ?)"
    );
    expect(params).toEqual(["%kaust%", "%kaust%", "%kaust%", "%kaust%"]);
  });

  it("combines filters with AND and keeps saudi_only paramless", () => {
    const { clause, params } = buildWhere({
      organism: "Homo sapiens", yearFrom: 2020, saudiOnly: true,
    });
    expect(clause).toBe(" WHERE organism = ? AND year >= ? AND is_saudi_submitter = 1");
    expect(params).toEqual(["Homo sapiens", 2020]);
  });

  it("supports year_to, platform, institution, source", () => {
    const { clause, params } = buildWhere({
      platform: "ILLUMINA", institution: "KAUST", source: "ENA", yearTo: 2023,
    });
    expect(clause).toBe(
      " WHERE platform = ? AND institution_name = ? AND year <= ? AND source = ?"
    );
    expect(params).toEqual(["ILLUMINA", "KAUST", 2023, "ENA"]);
  });

  it("supports bioproject, biosample, pathogen, wgs and platforms IN", () => {
    const { clause, params } = buildWhere({
      bioproject: "PRJNA1", biosample: "SAMN1",
      pathogen: true, wgs: true,
      platforms: ["ILLUMINA", "OXFORD_NANOPORE"],
    });
    expect(clause).toBe(
      " WHERE platform IN (?, ?) AND bioproject_accession = ?" +
      " AND biosample_accession = ? AND is_pathogen = 1 AND is_wgs = 1"
    );
    expect(params).toEqual(["ILLUMINA", "OXFORD_NANOPORE", "PRJNA1", "SAMN1"]);
  });
});

describe("parseFilters", () => {
  it("parses all params", () => {
    const url = new URL(
      "http://x/api/search?q=srr&organism=o&platform=p&institution=i" +
      "&year_from=2019&year_to=2024&source=ENA&saudi_only=true"
    );
    expect(parseFilters(url)).toEqual({
      q: "srr", organism: "o", platform: "p", platforms: undefined,
      institution: "i", bioproject: undefined, biosample: undefined,
      source: "ENA", yearFrom: 2019, yearTo: 2024,
      saudiOnly: true, pathogen: false, wgs: false,
    });
  });

  it("parses new params: bioproject, biosample, pathogen, wgs, platforms", () => {
    const url = new URL(
      "http://x/api/search?bioproject=PRJNA1&biosample=SAMN1" +
      "&pathogen=true&wgs=true&platforms=ILLUMINA,OXFORD_NANOPORE"
    );
    expect(parseFilters(url)).toEqual({
      q: undefined, organism: undefined, platform: undefined,
      platforms: ["ILLUMINA", "OXFORD_NANOPORE"],
      institution: undefined, bioproject: "PRJNA1", biosample: "SAMN1",
      source: undefined, yearFrom: undefined, yearTo: undefined,
      saudiOnly: false, pathogen: true, wgs: true,
    });
  });

  it("drops empty platforms list", () => {
    const url = new URL("http://x/api/search?platforms=,,");
    expect(parseFilters(url).platforms).toBeUndefined();
  });

  it("defaults to empty and saudi_only only on literal 'true'", () => {
    const url = new URL("http://x/api/search");
    expect(parseFilters(url)).toEqual({
      q: undefined, organism: undefined, platform: undefined, platforms: undefined,
      institution: undefined, bioproject: undefined, biosample: undefined,
      source: undefined, yearFrom: undefined, yearTo: undefined,
      saudiOnly: false, pathogen: false, wgs: false,
    });
  });
});

describe("parsePage", () => {
  it("defaults to page 1 size 50", () => {
    expect(parsePage(new URL("http://x/"))).toEqual({ page: 1, pageSize: 50 });
  });

  it("clamps page_size to 1..200 and sanitizes garbage", () => {
    expect(parsePage(new URL("http://x/?page=0&page_size=999"))).toEqual({ page: 1, pageSize: 200 });
    expect(parsePage(new URL("http://x/?page=abc&page_size=xy"))).toEqual({ page: 1, pageSize: 50 });
  });
});
