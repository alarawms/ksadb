import { describe, expect, it } from "vitest";

import { onRequestGet as facetsGet } from "./facets";
import { onRequestGet as institutionsGet } from "../institutions/index";

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

function stubEnv(rows: unknown[], path = "http://x/api/search/facets") {
  return {
    request: new Request(path),
    env: {
      DB: {
        prepare: () => ({ all: async () => ({ results: rows }) }),
      },
    },
  } as never;
}

async function body(res: Response) {
  return res.json();
}

describe("GET /api/search/facets", () => {
  it("returns platform buckets", async () => {
    const rows = [
      { name: "ILLUMINA", runs: 40000 },
      { name: "Unknown", runs: 12 },
    ];
    const res = await facetsGet(stubEnv(rows));
    expect(res.status).toBe(200);
    expect(await body(res)).toEqual({ platforms: rows });
  });
});

describe("GET /api/institutions", () => {
  it("returns up to 200 institutions with is_saudi as boolean", async () => {
    const rows = [
      { name: "KAUST", is_saudi: 1, runs: 25001 },
      { name: "Other Lab", is_saudi: 0, runs: 3 },
    ];
    const res = await institutionsGet(
      stubEnv(rows, "http://x/api/institutions")
    );
    expect(res.status).toBe(200);
    expect(await body(res)).toEqual({
      items: [
        { name: "KAUST", is_saudi: true, runs: 25001 },
        { name: "Other Lab", is_saudi: false, runs: 3 },
      ],
    });
  });
});
