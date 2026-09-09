import { describe, expect, it } from "vitest";

import { onRequestPost } from "./semantic";

const VECTOR = Array.from({ length: 384 }, (_, i) => i / 384);

function stubEnv({
  matches = [
    { id: "PRJEB1", score: 0.9, metadata: { type: "study", accession: "PRJEB1" } },
  ] as unknown[],
  rowsFor = (_sql: string, _bindArgs: unknown[]) => [] as unknown[],
  failAi = false,
} = {}) {
  const aiCalls: unknown[] = [];
  const vecCalls: unknown[] = [];
  const env = {
    AI: {
      run: async (...args: unknown[]) => {
        aiCalls.push(args);
        if (failAi) throw new Error("ai down");
        return { data: [VECTOR] };
      },
    },
    STUDIES_INDEX: {
      query: async (vector: unknown, options?: unknown) => {
        vecCalls.push({ vector, options });
        return { matches };
      },
    },
    DB: {
      prepare: (sql: string) => {
        env.sql.push(sql);
        return {
          bind: (...bindArgs: unknown[]) => {
            env.bindArgs.push(bindArgs);
            return { all: async () => ({ results: rowsFor(sql, bindArgs) }) };
          },
        };
      },
    },
    aiCalls,
    vecCalls,
    sql: [] as string[],
    bindArgs: [] as unknown[][],
  };
  return env as unknown as Omit<typeof env, never> & {
    aiCalls: unknown[][];
    vecCalls: unknown[];
    sql: string[];
    bindArgs: unknown[][];
  };
}

const STUDY_ROW = { accession: "PRJEB1", title: "T", organism: null, submitter: "KAUST", runs: 3 };
const SAMPLE_ROW = { accession: "SAMEA1", organism: "Camelus dromedarius", runs: 2, submitter: "KAUST" };
const RUN_ROW = { accession: "ERR1", label: "T", organism: "Camelus dromedarius", runs: 1, submitter: "KAUST" };

function routeRows(sql: string): unknown[] {
  if (sql.includes("FROM studies st")) return [STUDY_ROW];
  if (sql.includes("FROM samples s")) return [SAMPLE_ROW];
  if (sql.includes("FROM ena_runs r")) return [RUN_ROW];
  return [];
}

function post(env: ReturnType<typeof stubEnv>, body: unknown) {
  return onRequestPost({
    request: new Request("http://x/api/v2/semantic", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    env,
  } as never);
}

describe("POST /api/v2/semantic", () => {
  it("embeds the query, searches Vectorize, and joins D1 rows", async () => {
    const env = stubEnv({ rowsFor: routeRows });
    const res = await post(env, { query: "camel" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      matches: [
        { type: "study", accession: "PRJEB1", title: "T", organism: null,
          submitter: "KAUST", runs: 3, score: 0.9 },
      ],
    });
    // Workers AI got the trimmed query text
    expect(env.aiCalls[0][0]).toBe("@cf/baai/bge-small-en-v1.5");
    expect(env.aiCalls[0][1]).toEqual({ text: ["camel"] });
    // Vectorize got the embedding with topK 20
    expect(env.vecCalls[0]).toEqual({
      vector: VECTOR,
      options: { topK: 20, returnMetadata: "all" },
    });
    // study resolution is restricted to studies with SA samples
    expect(env.sql[0]).toContain("st.accession IN (?)");
    expect(env.sql[0]).toContain("s.country = 'SA'");
    expect(env.bindArgs[0]).toEqual(["PRJEB1"]);
  });

  it("resolves mixed-type matches into typed results", async () => {
    const env = stubEnv({
      matches: [
        { id: "ERR1", score: 0.7, metadata: { type: "run", accession: "ERR1" } },
        { id: "PRJEB1", score: 0.95, metadata: { type: "study", accession: "PRJEB1" } },
        { id: "SAMEA1", score: 0.8, metadata: { type: "sample", accession: "SAMEA1" } },
      ],
      rowsFor: routeRows,
    });
    const res = await post(env, { query: "camel" });
    expect(res.status).toBe(200);
    const body = await res.json() as { matches: Record<string, unknown>[] };
    // one SA-restricted query per type
    expect(env.sql).toHaveLength(3);
    expect(env.sql.filter((s) => s.includes("FROM studies st LEFT JOIN submitters"))).toHaveLength(1);
    expect(env.sql.filter((s) => s.includes("FROM samples s WHERE"))).toHaveLength(1);
    expect(env.sql.filter((s) => s.includes("r.run_accession IN ("))).toHaveLength(1);
    // merged results are sorted by score, each carrying its type
    expect(body.matches).toEqual([
      { type: "study", accession: "PRJEB1", title: "T", organism: null,
        submitter: "KAUST", runs: 3, score: 0.95 },
      { type: "sample", accession: "SAMEA1", label: "Camelus dromedarius",
        organism: "Camelus dromedarius", submitter: "KAUST", runs: 2, score: 0.8 },
      { type: "run", accession: "ERR1", label: "T", organism: "Camelus dromedarius",
        submitter: "KAUST", runs: 1, score: 0.7 },
    ]);
  });

  it("drops matches that fail SA-restricted resolution", async () => {
    const env = stubEnv({
      matches: [
        { id: "SAMEA1", score: 0.8, metadata: { type: "sample", accession: "SAMEA1" } },
        { id: "SAMEA9", score: 0.85, metadata: { type: "sample", accession: "SAMEA9" } },
      ],
      rowsFor: (sql, bindArgs) =>
        sql.includes("FROM samples s") && bindArgs[0] === "SAMEA1" ? [SAMPLE_ROW] : [],
    });
    const res = await post(env, { query: "camel" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      matches: [
        { type: "sample", accession: "SAMEA1", label: "Camelus dromedarius",
          organism: "Camelus dromedarius", submitter: "KAUST", runs: 2, score: 0.8 },
      ],
    });
  });

  it("skips matches with unknown or missing metadata.type", async () => {
    const env = stubEnv({
      matches: [
        { id: "X1", score: 0.9, metadata: { accession: "X1" } },
        { id: "X2", score: 0.8, metadata: { type: "bogus", accession: "X2" } },
      ],
    });
    const res = await post(env, { query: "camel" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ matches: [] });
    expect(env.sql).toHaveLength(0);
  });

  it("returns 400 when query is missing or blank", async () => {
    const res = await post(stubEnv(), { query: "   " });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "query required" });
  });

  it("returns an empty match list when Vectorize has no matches", async () => {
    const res = await post(stubEnv({ matches: [] }), { query: "camel" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ matches: [] });
  });

  it("returns 503 when the AI or Vectorize call fails", async () => {
    const res = await post(stubEnv({ failAi: true }), { query: "camel" });
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ error: "temporarily_unavailable" });
  });
});
