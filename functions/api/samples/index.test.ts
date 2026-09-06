import { describe, expect, it } from "vitest";

import { onRequestGet as samplesListGet } from "./index";

function stubCache() {
  const store = new Map<string, Response>();
  return {
    async match(key: Request | string) {
      const k = typeof key === "string" ? key : key.url;
      const hit = store.get(k);
      return hit ? new Response(hit.body, { status: hit.status, headers: hit.headers }) : undefined;
    },
    async put(key: Request | string, value: Response) {
      const k = typeof key === "string" ? key : key.url;
      store.set(k, value);
    },
  };
}

// Endpoints read request + caches.default from the worker runtime context.
globalThis.caches = { default: stubCache() } as never;

function stubEnv(rows: unknown[], path = "http://x/api/samples") {
  return {
    request: new Request(path),
    env: {
      DB: {
        prepare: () => ({ all: async () => ({ results: rows }) }),
      },
    },
  } as never;
}

describe("GET /api/samples", () => {
  it("returns top biosamples by run count", async () => {
    const rows = [
      { accession: "SAMN48462333", runs: 12, projects: 2 },
      { accession: "SAMN00000001", runs: 3, projects: 1 },
    ];
    const res = await samplesListGet(stubEnv(rows));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ items: rows });
  });
});
