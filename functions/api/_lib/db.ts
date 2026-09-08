/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  AGGREGATES: R2Bucket;
  STUDIES_INDEX: VectorizeIndex;
  AI: Ai;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function parsePage(url: URL): { page: number; pageSize: number } {
  const rawPage = Number(url.searchParams.get("page") ?? "1") || 1;
  const rawSize = Number(url.searchParams.get("page_size") ?? "50") || 50;
  return {
    page: Math.max(1, rawPage),
    pageSize: Math.min(200, Math.max(1, rawSize)),
  };
}
