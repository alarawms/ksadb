/// <reference types="@cloudflare/workers-types" />

import { json } from "./db";

/**
 * Response cache for aggregate endpoints, backed by the runtime Cache API.
 *
 * The D1 free tier meters rows read per day; every uncached dashboard load
 * full-scans the runs table ~8 times. Caching hot GET endpoints for a short
 * TTL removes that multiplication (data only changes via the daily sync).
 */

import { fallbackFor } from "./fallback";

/** TTL for aggregate endpoints (stats, pathogens, facets, institutions). */
export const STATS_TTL = 21600; // 6h — data only changes via the daily sync
/** TTL for search listing responses (30 min — data only changes via the daily sync). */
export const SEARCH_TTL = 1800;

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

  let response: Response;
  try {
    response = await producer();
  } catch (err) {
    // D1 quota limiter closed: degrade to the baked-in snapshot when we have
    // one for this endpoint instead of surfacing a 500.
    const fb = fallbackFor(request.url);
    if (fb) return fb;
    throw err;
  }
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

export const DEGRADED_MESSAGE =
  "Temporarily unavailable: the daily database read quota is exhausted and " +
  "resets at midnight UTC. Please retry in a few minutes — aggregate " +
  "dashboards keep serving from snapshot in the meantime.";

/**
 * Cache wrapper for detail endpoints (run record, project, sample,
 * institution). Detail lookups have no baked-in snapshot, so when D1 rejects
 * the query (daily quota closed) degrade to a clear 503 instead of a 500.
 */
export async function cachedDetail(
  request: Request,
  producer: () => Promise<Response>,
): Promise<Response> {
  try {
    return await cachedJson(request, STATS_TTL, producer);
  } catch {
    return json(
      { error: "temporarily_unavailable", message: DEGRADED_MESSAGE },
      503,
    );
  }
}
