import { describe, expect, it } from "vitest";

import { onRequestGet as searchGet } from "./search";

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

function throwingEnv(path: string) {
  return {
    request: new Request(path),
    env: {
      DB: {
        prepare: () => ({
          bind: () => ({
            first: async () => {
              throw new Error("D1 error: quota exceeded");
            },
            all: async () => {
              throw new Error("D1 error: quota exceeded");
            },
          }),
          first: async () => {
            throw new Error("D1 error: quota exceeded");
          },
          all: async () => {
            throw new Error("D1 error: quota exceeded");
          },
        }),
      },
    },
  } as never;
}

describe("GET /api/search degraded mode", () => {
  it("serves the baked-in snapshot for the default page 1 view", async () => {
    const res = await searchGet(throwingEnv("http://x/api/search?page=1"));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-ksadb-cache")).toBe("FALLBACK");
  });

  it("returns a graceful 503 with an explanatory message for unsnapshotted queries", async () => {
    const res = await searchGet(
      throwingEnv("http://x/api/search?organism=Homo+sapiens&page=1")
    );
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error?: string; message?: string };
    expect(body.error).toBe("temporarily_unavailable");
    expect(typeof body.message).toBe("string");
  });
});
