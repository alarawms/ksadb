import { describe, expect, it } from "vitest";
import { onRequestGet } from "./graph";

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
            if (sql.includes("submitters") && sql.includes("GROUP BY"))
              return { results: [{ name: "KAUST", runs: 10 }] };
            if (sql.includes("FROM studies"))
              return { results: [{ accession: "PRJNA1249945", title: "Camel Microbiome", runs: 4 }] };
            if (sql.includes("FROM samples") && sql.includes("organism"))
              return { results: [{ name: "Homo sapiens", tax_id: 9606, n: 1 }] };
            if (sql.includes("sample_terms"))
              return { results: [{ term_id: "UBERON:0000059", field: "tissue" }] };
            return { results: [] };
          };
          return { bind: () => ({ all, first: async () => (await all()).results[0] ?? null }) };
        },
      },
    },
  } as never;
  return { ctx, prepared };
}

describe("GET /api/v2/graph", () => {
  it("default hub lists top Saudi submitters and their studies, Saudi-scoped", async () => {
    const { ctx, prepared } = stubEnv("http://x/api/v2/graph?hub=1");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { nodes: { id: string; type: string }[] };
    const types = new Set(body.nodes.map((n) => n.type));
    expect(types.has("submitter")).toBe(true);
    expect(types.has("study")).toBe(true);
    for (const sql of prepared) expect(sql).toContain("s.country = 'SA'");
  });

  it("study focus returns typed neighborhood incl. publication placeholder", async () => {
    const { ctx } = stubEnv("http://x/api/v2/graph?focus=study:PRJNA1249945&t=1");
    const res = await onRequestGet(ctx);
    const body = (await res.json()) as {
      nodes: { id: string; type: string; human_class?: string }[];
    };
    const types = new Set(body.nodes.map((n) => n.type));
    expect(types.has("publication")).toBe(true);
    expect(types.has("term")).toBe(true);
    expect(body.nodes.find((n) => n.type === "organism")?.human_class).toBe("human");
  });

  it("rejects a malformed focus", async () => {
    const { ctx } = stubEnv("http://x/api/v2/graph?focus=bogus&t=2");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(400);
  });
});
