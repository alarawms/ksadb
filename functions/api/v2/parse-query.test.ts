import { describe, expect, it } from "vitest";

import { onRequestPost } from "./parse-query";

function stubEnv({
  response = '{"organism":"influenza A virus","country":"SA","from":"2022-01-01"}',
} = {}) {
  const aiCalls: unknown[] = [];
  const env = {
    AI: {
      run: async (...args: unknown[]) => {
        aiCalls.push(args);
        return { response };
      },
    },
    aiCalls,
  };
  return env as unknown as Omit<typeof env, never> & { aiCalls: unknown[][] };
}

function post(env: ReturnType<typeof stubEnv>, body: unknown) {
  return onRequestPost({
    request: new Request("http://x/api/v2/parse-query", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    env,
  } as never);
}

describe("POST /api/v2/parse-query", () => {
  it("parses the LLM JSON into allowed filters", async () => {
    const env = stubEnv();
    const res = await post(env, { query: "avian flu in Saudi since 2022" });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { filters: Record<string, string> };
    expect(body.filters.organism).toBe("influenza A virus");
    expect(body.filters.country).toBe("SA");
    expect(body.filters.from).toBe("2022-01-01");
    // Workers AI got the llama model with the trimmed query
    expect(env.aiCalls[0][0]).toBe("@cf/meta/llama-3.1-8b-instruct-fp8");
    const opts = env.aiCalls[0][1] as {
      max_tokens: number;
      messages: { role: string; content: string }[];
    };
    expect(opts).toMatchObject({ max_tokens: 200, messages: [{ role: "user" }] });
    expect(opts.messages[0].content).toContain("avian flu in Saudi since 2022");
  });

  it("returns empty filters when the LLM output is not a JSON object", async () => {
    const res = await post(stubEnv({ response: "I cannot do that" }), {
      query: "avian flu in Saudi since 2022",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ filters: {} });
  });

  it("returns 400 when query is missing or blank", async () => {
    const res = await post(stubEnv(), { query: "   " });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "query required" });
  });

  it("drops unknown fields and non-ISO country codes", async () => {
    const res = await post(
      stubEnv({
        response: '{"organism":"SARS-CoV-2","evil":"x","country":"Saudi Arabia"}',
      }),
      { query: "covid" },
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ filters: { organism: "SARS-CoV-2" } });
  });

  it("returns empty filters when the AI call fails", async () => {
    const env = stubEnv();
    env.AI.run = async () => {
      throw new Error("ai down");
    };
    const res = await post(env, { query: "flu" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ filters: {} });
  });
});
