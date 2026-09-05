import { describe, expect, it } from "vitest";

import { onRequestGet as facetsGet } from "./facets";
import { onRequestGet as institutionsGet } from "../institutions/index";

function stubEnv(rows: unknown[]) {
  return {
    env: {
      DB: {
        prepare: () => ({ all: async () => ({ results: rows }) }),
      },
    } as never,
  };
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
    const res = await facetsGet(stubEnv(rows) as never);
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
    const res = await institutionsGet(stubEnv(rows) as never);
    expect(res.status).toBe(200);
    expect(await body(res)).toEqual({
      items: [
        { name: "KAUST", is_saudi: true, runs: 25001 },
        { name: "Other Lab", is_saudi: false, runs: 3 },
      ],
    });
  });
});
