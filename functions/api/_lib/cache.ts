/// <reference types="@cloudflare/workers-types" />

/**
 * Response cache for aggregate endpoints, backed by the runtime Cache API.
 *
 * The D1 free tier meters rows read per day; every uncached dashboard load
 * full-scans the runs table ~8 times. Caching hot GET endpoints for a short
 * TTL removes that multiplication (data only changes via the daily sync).
 */

export interface CacheLike {
  match(key: Request | string): Promise<Response | undefined>;
  put(key: Request | string, value: Response): Promise<void>;
}

// `caches.default` exists in the Workers runtime but not in the DOM
// CacheStorage type that Next.js pulls in; resolve it defensively so the
// function also degrades to no-cache outside the runtime.
function getDefaultCache(): CacheLike | undefined {
  if (typeof caches === "undefined") return undefined;
  return (caches as unknown as { default?: CacheLike }).default;
}

export async function cachedJson(
  request: Request,
  ttlSec: number,
  producer: () => Promise<Response>,
  cache?: CacheLike,
): Promise<Response> {
  const c = cache ?? getDefaultCache();
  if (c) {
    const hit = await c.match(request);
    if (hit) return hit;
  }

  const response = await producer();
  if (!response.ok || !c) return response;

  const headers = new Headers(response.headers);
  headers.set("cache-control", `public, max-age=${ttlSec}`);
  headers.set("x-ksadb-cache", "MISS");
  await c.put(
    request,
    new Response(response.clone().body, { status: response.status, headers }),
  );
  return new Response(response.body, { status: response.status, headers });
}
