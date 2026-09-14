import { describe, expect, it } from "vitest";
import { onRequestGet } from "./[accession]";

function stubEnv(v1Row: unknown, v2Row: unknown, acc = "ERR1") {
  const first = async () => ({} as never);
  const prepare = (sql: string) => ({
    bind: (..._params: unknown[]) => ({
      first: async () => (sql.includes("FROM runs") ? v1Row : v2Row),
    }),
  });
  return {
    request: new Request(`http://x/api/records/${acc}`),
    env: { DB: { prepare } },
    params: { accession: acc },
  } as never;
}

describe("GET /api/records/:accession", () => {
  it("serves a v1 row verbatim when present", async () => {
    const v1 = { run_accession: "SRR1", organism: "X", is_pathogen: 1 };
    const res = await onRequestGet(stubEnv(v1, null, "SRR1"));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.organism).toBe("X");
    expect(body.ncbi_url).toContain("SRR1");
  });

  it("falls back to the v2 star schema when no v1 row", async () => {
    const v2 = {
      run_accession: "ERR1", biosample_accession: "SAM1", total_bases: 100,
      total_spots: 2, platform: "ILLUMINA", instrument_model: "MiSeq",
      library_strategy: "WGS", library_source: "GENOMIC",
      published_dt: "2025-03-04", organism: "Camelus", geo_loc_name: "SA",
      center_name: "KAUST",
    };
    const res = await onRequestGet(stubEnv(null, v2));
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.run_accession).toBe("ERR1");
    expect(body.total_bases).toBe(100);
    expect(body.year).toBe(2025);
    expect(body.is_saudi_submitter).toBe(true);
    expect(body.is_wgs).toBe(true);
    expect(body.source).toBe("ena");
  });

  it("404s when neither schema has the run", async () => {
    const res = await onRequestGet(stubEnv(null, null));
    expect(res.status).toBe(404);
  });

  it("does not leak a non-Saudi run through the v2 fallback (store is GCC-wide)", async () => {
    // The stub stands in for D1: the Qatari row exists in the store and is
    // returned only when the query FORGETS the Saudi filter — so this test
    // fails if the filter is ever removed from V2_FALLBACK_SQL.
    const qaRow = {
      run_accession: "SRR34334023", biosample_accession: "SRS25639371",
      total_bases: 1482825, platform: "OXFORD_NANOPORE",
      instrument_model: "GridION", library_strategy: "AMPLICON",
      library_source: "METAGENOMIC", published_dt: "2026-01-01",
      organism: "blood metagenome", geo_loc_name: "QA", center_name: "SUB15446045",
    };
    const prepare = (sql: string) => ({
      bind: (..._params: unknown[]) => ({
        first: async () =>
          sql.includes("FROM runs")
            ? null
            : sql.includes("s.country = 'SA'")
              ? null
              : qaRow,
      }),
    });
    const ctx = {
      request: new Request("http://x/api/records/SRR34334023"),
      env: { DB: { prepare } },
      params: { accession: "SRR34334023" },
    } as never;
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(404);
  });

  it("serves a Saudi run through the v2 fallback", async () => {
    const saRow = {
      run_accession: "ERR1", biosample_accession: "SAM1", total_bases: 100,
      platform: "ILLUMINA", instrument_model: "MiSeq", library_strategy: "WGS",
      library_source: "GENOMIC", published_dt: "2025-03-04",
      organism: "Camelus", geo_loc_name: "SA", center_name: "KAUST",
    };
    const prepare = (sql: string) => ({
      bind: (..._params: unknown[]) => ({
        first: async () =>
          sql.includes("FROM runs")
            ? null
            : sql.includes("s.country = 'SA'")
              ? saRow
              : null,
      }),
    });
    const ctx = {
      request: new Request("http://x/api/records/ERR1"),
      env: { DB: { prepare } },
      params: { accession: "ERR1" },
    } as never;
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.run_accession).toBe("ERR1");
  });
});
