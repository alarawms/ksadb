import { describe, expect, it } from "vitest";
import { onRequestGet } from "./detail";

const store = new Map<string, Response>();
globalThis.caches = {
  default: {
    async match(key: Request | string) {
      const k = typeof key === "string" ? key : key.url;
      const hit = store.get(k);
      return hit ? new Response(hit.body, { status: hit.status, headers: hit.headers }) : undefined;
    },
    async put(key: Request | string, value: Response) {
      store.set(typeof key === "string" ? key : key.url, value);
    },
  },
} as never;

// rows returned per SQL substring; the stub asserts Saudi scope the way D1 would
function stubEnv(path: string) {
  const prepared: string[] = [];
  const ctx = {
    request: new Request(path),
    env: {
      DB: {
        prepare: (sql: string) => {
          prepared.push(sql);
          const all = async () => {
            if (sql.includes("GROUP BY s.organism"))
              return { results: [{ name: "Homo sapiens", runs: 3 }] };
            if (sql.includes("COUNT(DISTINCT st.accession)"))
              return { results: [{ name: "KAUST", studies: 1, runs: 3 }] };
            if (sql.includes("FROM studies"))
              return { results: [{ accession: "PRJNA1249945", title: "T", abstract: "A", submitter: "KAUST", date_min: "2020", date_max: "2024", samples: 2, runs: 3, bytes: 100 }] };
            if (sql.includes("GROUP BY r.study_accession"))
              return { results: [{ accession: "PRJNA1249945", runs: 2 }] };
            if (sql.includes("SELECT DISTINCT r.platform"))
              return { results: [{ name: "ILLUMINA" }] };
            if (sql.includes("GROUP BY r.platform"))
              return { results: [{ name: "ILLUMINA", runs: 3 }] };
            if (sql.includes("st.field = 'tissue'"))
              return { results: [{ term_id: "UBERON:0000059" }] };
            if (sql.includes("COUNT(DISTINCT s.biosample_accession)"))
              return { results: [{ samples: 2, runs: 3, label: "intestine" }] };
            if (sql.includes("COUNT(DISTINCT r.study_accession)"))
              return { results: [{ studies: 1, runs: 3, tax_id: 9606 }] };
            if (sql.includes("COUNT(DISTINCT s.organism)"))
              return { results: [{ organisms: 2, runs: 3 }] };
            if (sql.includes("LEFT JOIN taxonomy"))
              return { results: [{ accession: "SRS27212955", organism: "Homo sapiens", host: null, tissue: "lung", region: "Riyadh", collection_date: "2024-01-01", genus: "Homo", family: "Hominidae", phylum: "Chordata", runs: 2, bytes: 50 }] };
            if (sql.includes("JOIN taxonomy t"))
              return { results: [{ genus: "Homo", family: "Hominidae", phylum: "Chordata" }] };
            return { results: [] };
          };
          return { bind: () => ({ all, first: async () => (await all()).results[0] ?? null }) };
        },
      },
    },
  } as never;
  return { ctx, prepared };
}

const SA = "s.country = 'SA'";

describe("GET /api/v2/graph/detail", () => {
  it("study detail returns the inspector payload, Saudi-scoped", async () => {
    const { ctx, prepared } = stubEnv("http://x/api/v2/graph/detail?node=study:PRJNA1249945");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      accession: string; title: string; abstract: string; submitter: string;
      date_min: string; date_max: string; samples: number; runs: number; bytes: number;
      top_organisms: { name: string; runs: number }[]; platforms: string[];
    };
    expect(body.accession).toBe("PRJNA1249945");
    expect(body.submitter).toBe("KAUST");
    expect(body.samples).toBe(2);
    expect(body.runs).toBe(3);
    expect(body.top_organisms[0]).toEqual({ name: "Homo sapiens", runs: 3 });
    expect(body.platforms).toEqual(["ILLUMINA"]);
    for (const sql of prepared) expect(sql).toContain(SA);
  });

  it("sample detail returns lineage and run stats, Saudi-scoped", async () => {
    const { ctx, prepared } = stubEnv("http://x/api/v2/graph/detail?node=sample:SRS27212955&t=1");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      accession: string; organism: string; lineage: { genus: string; family: string; phylum: string };
      host: string | null; tissue: string; region: string; collection_date: string;
      runs: number; bytes: number; study: string;
    };
    expect(body.accession).toBe("SRS27212955");
    expect(body.lineage).toEqual({ genus: "Homo", family: "Hominidae", phylum: "Chordata" });
    expect(body.study).toBe("PRJNA1249945");
    for (const sql of prepared) expect(sql).toContain(SA);
  });

  it("organism detail returns lineage and human class, Saudi-scoped", async () => {
    const { ctx, prepared } = stubEnv("http://x/api/v2/graph/detail?node=organism:Homo%20sapiens&t=2");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      name: string; lineage: { genus: string }; human_class: string; studies: number; runs: number;
    };
    expect(body.name).toBe("Homo sapiens");
    expect(body.human_class).toBe("human");
    expect(body.studies).toBe(1);
    expect(body.runs).toBe(3);
    for (const sql of prepared) expect(sql).toContain(SA);
  });

  it("submitter detail returns study/org aggregates, Saudi-scoped", async () => {
    const { ctx, prepared } = stubEnv("http://x/api/v2/graph/detail?node=submitter:KAUST&t=3");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      name: string; studies: number; runs: number; top_organisms: { name: string; runs: number }[];
    };
    expect(body.name).toBe("KAUST");
    expect(body.studies).toBe(1);
    expect(body.top_organisms[0]).toEqual({ name: "Homo sapiens", runs: 3 });
    for (const sql of prepared) expect(sql).toContain(SA);
  });

  it("platform detail returns runs and top studies, Saudi-scoped", async () => {
    const { ctx, prepared } = stubEnv("http://x/api/v2/graph/detail?node=platform:ILLUMINA&t=4");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      name: string; runs: number; top_studies: { accession: string; runs: number }[];
    };
    expect(body.name).toBe("ILLUMINA");
    expect(body.runs).toBe(3);
    expect(body.top_studies[0]).toEqual({ accession: "PRJNA1249945", runs: 2 });
    for (const sql of prepared) expect(sql).toContain(SA);
  });

  it("term detail returns label, counts and top studies, Saudi-scoped", async () => {
    const { ctx, prepared } = stubEnv("http://x/api/v2/graph/detail?node=term:UBERON:0000059&t=5");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      id: string; label: string; runs: number; samples: number;
      top_studies: { accession: string; runs: number }[];
    };
    expect(body.id).toBe("UBERON:0000059");
    expect(body.label).toBe("intestine");
    expect(body.samples).toBe(2);
    expect(body.top_studies[0]).toEqual({ accession: "PRJNA1249945", runs: 2 });
    for (const sql of prepared) expect(sql).toContain(SA);
  });

  it("taxon detail returns rank-scoped aggregates, Saudi-scoped", async () => {
    const { ctx, prepared } = stubEnv("http://x/api/v2/graph/detail?node=taxon:genus:Camelus&t=6");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { rank: string; name: string; organisms: number; runs: number };
    expect(body.rank).toBe("genus");
    expect(body.name).toBe("Camelus");
    expect(body.organisms).toBe(2);
    expect(body.runs).toBe(3);
    for (const sql of prepared) expect(sql).toContain(SA);
  });

  it("rejects malformed node ids", async () => {
    const { ctx } = stubEnv("http://x/api/v2/graph/detail?node=bogus&t=7");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(400);
  });

  it("rejects unknown node types", async () => {
    const { ctx } = stubEnv("http://x/api/v2/graph/detail?node=foo:bar&t=8");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(400);
  });

  it("rejects taxon ids without a rank prefix", async () => {
    const { ctx } = stubEnv("http://x/api/v2/graph/detail?node=taxon:bogus&t=9");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(400);
  });
});
