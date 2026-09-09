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
});
