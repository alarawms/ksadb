import { describe, expect, it } from "vitest";
import { onRequestGet } from "./facets";

// Endpoints read request + caches.default from the worker runtime context.
const store = new Map<string, Response>();
globalThis.caches = {
  default: {
    async match(key: Request | string) {
      const k = typeof key === "string" ? key : key.url;
      const hit = store.get(k);
      return hit ? new Response(hit.body, { status: hit.status, headers: hit.headers }) : undefined;
    },
    async put(key: Request | string, value: Response) {
      const k = typeof key === "string" ? key : key.url;
      store.set(k, value);
    },
  },
} as never;

describe("GET /api/v2/search/facets", () => {
  it("scopes every facet query to Saudi samples", async () => {
    const prepared: string[] = [];
    const ctx = {
      request: new Request("http://x/api/v2/search/facets?sa=1"),
      env: {
        DB: {
          prepare: (sql: string) => {
            prepared.push(sql);
            return { all: async () => ({ results: [] }) };
          },
        },
      },
    } as never;
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    expect(prepared).toHaveLength(5);
    for (const sql of prepared) {
      expect(sql).toContain("JOIN samples s");
      expect(sql).toContain("s.country = 'SA'");
    }
  });
});
