import { describe, expect, it, vi } from "vitest";
import { onRequestGet as statsGet } from "./stats/[aggregate]";

function stubEnv(objectBody: string | null, name = "by-country") {
  return {
    request: new Request(`http://x/api/v2/stats/${name}`),
    env: { AGGREGATES: { get: async () => objectBody ? new Response(objectBody) : null } },
    params: { aggregate: name },
  } as never;
}

function stubLocalEnv(name: string, baseUrl: string) {
  return {
    request: new Request(`http://x/api/v2/stats/${name}`),
    env: {
      AGGREGATES: { get: async () => null },
      AGGREGATES_BASE_URL: baseUrl,
    },
    params: { aggregate: name },
  } as never;
}

describe("GET /api/v2/stats/:aggregate", () => {
  it("serves the R2 aggregate JSON", async () => {
    const res = await statsGet(stubEnv('[{"name":"SA","runs":100}]'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ name: "SA", runs: 100 }]);
  });
  it("404s unknown aggregates without touching R2", async () => {
    const res = await statsGet(stubEnv(null, "evil"));
    expect(res.status).toBe(404);
  });
  it("serves aggregates from AGGREGATES_BASE_URL when set", async () => {
    const payload = [{ month: "2024-01", runs: 3 }];
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await statsGet(stubLocalEnv("by-month", "http://localhost:8789"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8789/aggregates/by-month.json");
    vi.unstubAllGlobals();
  });
  it("returns 404 from AGGREGATES_BASE_URL when the file is missing", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("not found", { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await statsGet(stubLocalEnv("summary", "http://localhost:8789"));
    expect(res.status).toBe(404);
    vi.unstubAllGlobals();
  });
});
