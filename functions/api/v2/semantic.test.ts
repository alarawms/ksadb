import { describe, expect, it } from "vitest";

import { onRequestPost } from "./semantic";

const VECTOR = Array.from({ length: 384 }, (_, i) => i / 384);

function stubEnv({
  matches = [
    { id: "PRJEB1", score: 0.9, metadata: { accession: "PRJEB1" } },
  ] as unknown[],
  rows = [
    { accession: "PRJEB1", title: "T", submitter: "KAUST", runs: 3 },
  ] as unknown[],
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
            return { all: async () => ({ results: rows }) };
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
    const env = stubEnv();
    const res = await post(env, { query: "camel" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      matches: [
        { accession: "PRJEB1", title: "T", submitter: "KAUST", runs: 3, score: 0.9 },
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
    // D1 lookup is restricted to matched accessions
    expect(env.sql[0]).toContain("st.accession IN (?)");
    expect(env.bindArgs[0]).toEqual(["PRJEB1"]);
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
