import { describe, expect, it } from "vitest";

import type { CacheLike } from "./cache";
import { cachedJson } from "./cache";

function makeCache(): CacheLike & { store: Map<string, Response>; puts: number } {
  const store = new Map<string, Response>();
  return {
    store,
    puts: 0,
    async match(key) {
      const k = typeof key === "string" ? key : key.url;
      const hit = store.get(k);
      // Return a fresh clone so both the cached copy and the caller can read.
      return hit ? new Response(hit.body, { status: hit.status, headers: hit.headers }) : undefined;
    },
    async put(key, value) {
      this.puts += 1;
      const k = typeof key === "string" ? key : key.url;
      store.set(k, value);
    },
  };
}

const req = new Request("http://x/api/stats/summary");

describe("cachedJson", () => {
  it("calls producer on miss and caches the response", async () => {
    const cache = makeCache();
    let calls = 0;
    const producer = async () => {
      calls += 1;
      return new Response(JSON.stringify({ ok: calls }), {
        headers: { "content-type": "application/json" },
      });
    };
    const first = await cachedJson(req, 3600, producer, cache);
    expect(await first.json()).toEqual({ ok: 1 });
    expect(calls).toBe(1);
    expect(cache.puts).toBe(1);

    const second = await cachedJson(req, 3600, producer, cache);
    expect(await second.json()).toEqual({ ok: 1 });
    expect(calls).toBe(1); // producer not called again
  });

  it("does not cache non-OK responses", async () => {
    const cache = makeCache();
    let calls = 0;
    const producer = async () => {
      calls += 1;
      return new Response("boom", { status: 500 });
    };
    await cachedJson(req, 3600, producer, cache);
    await cachedJson(req, 3600, producer, cache);
    expect(calls).toBe(2);
    expect(cache.puts).toBe(0);
  });

  it("rejects errors thrown by the producer when no fallback exists", async () => {
    const cache = makeCache();
    const producer = async () => {
      throw new Error("d1 down");
    };
    const uncached = new Request("http://x/api/does-not-exist");
    await expect(cachedJson(uncached, 3600, producer, cache)).rejects.toThrow("d1 down");
    expect(cache.puts).toBe(0);
  });

  it("serves the baked-in snapshot when the producer throws", async () => {
    const cache = makeCache();
    const producer = async () => {
      throw new Error("quota closed");
    };
    const res = await cachedJson(req, 3600, producer, cache);
    expect(res.ok).toBe(true);
    expect(res.headers.get("x-ksadb-cache")).toBe("FALLBACK");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(cache.puts).toBe(0);
  });
});
