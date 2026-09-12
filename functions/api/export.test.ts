import { describe, expect, it, vi } from "vitest";
import { onRequestGet as exportGet } from "./export";

function stubDb() {
  const prepared: { sql: string; binds: unknown[] }[] = [];
  const stmt = {
    bind: (...binds: unknown[]) => {
      prepared.push({ sql: stmt.sql, binds });
      return stmt;
    },
    all: async () => ({ results: [{ run_accession: "ERRLOC1", country: "SA" }] }),
    sql: "",
  };
  const db = { prepare: (sql: string) => { stmt.sql = sql; return stmt; } };
  return { db, prepared };
}

describe("GET /api/export", () => {
  it("v2 branch queries the star schema with v2 filters", async () => {
    const { db, prepared } = stubDb();
    const res = await exportGet({
      request: new Request("http://x/api/export?format=csv&v2=1&country=SA"),
      env: { DB: db },
    } as never);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/csv");
    expect(prepared[0].sql).toContain("FROM ena_runs");
    expect(prepared[0].binds).toContain("SA");
    const header = (await res.text()).split("\n")[0];
    expect(header).toContain("run_accession");
    expect(header).toContain("study_title");
  });

  it("v1 branch keeps querying the legacy runs table", async () => {
    const { db, prepared } = stubDb();
    await exportGet({
      request: new Request("http://x/api/export?format=csv"),
      env: { DB: db },
    } as never);
    expect(prepared[0].sql).toContain("FROM runs");
  });

  it("v2 json format returns rows as JSON", async () => {
    const { db } = stubDb();
    const res = await exportGet({
      request: new Request("http://x/api/export?format=json&v2=1"),
      env: { DB: db },
    } as never);
    expect(await res.json()).toEqual([{ run_accession: "ERRLOC1", country: "SA" }]);
  });
});
