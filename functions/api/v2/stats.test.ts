import { describe, expect, it } from "vitest";
import { onRequestGet as statsGet } from "./stats/[aggregate]";

function stubEnv(objectBody: string | null, name = "by-country") {
  return {
    request: new Request(`http://x/api/v2/stats/${name}`),
    env: { AGGREGATES: { get: async () => objectBody ? new Response(objectBody) : null } },
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
});
