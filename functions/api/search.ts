import { cachedJson, SEARCH_TTL } from "./_lib/cache";
import { Env, json, parsePage } from "./_lib/db";
import { RUN_COLUMNS } from "./_lib/columns";
import { buildWhere, parseFilters } from "./_lib/filters";

// Search results are cached briefly: the count query scans the runs table,
// and explorer-style filtering can generate many requests per minute.

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const { clause, params } = buildWhere(parseFilters(url));
  const { page, pageSize } = parsePage(url);

  try {
    return await cachedJson(request, SEARCH_TTL, async () => {
      const total = await env.DB.prepare(`SELECT COUNT(*) AS c FROM runs${clause}`)
        .bind(...params)
        .first<{ c: number }>();

      const { results } = await env.DB.prepare(
        `SELECT ${RUN_COLUMNS} FROM runs${clause} ` +
        "ORDER BY published_dt IS NULL, published_dt DESC, run_accession " +
        "LIMIT ? OFFSET ?"
      ).bind(...params, pageSize, (page - 1) * pageSize).all();

      return json({
        total: total?.c ?? 0,
        page,
        page_size: pageSize,
        items: results,
      });
    });
  } catch (err) {
    // cachedJson already tried the snapshot fallback for this URL; nothing
    // baked in means this filter combination has no snapshot. Degrade to a
    // clear 503 instead of a bare 500 so the UI can explain the situation.
    return json({
      error: "temporarily_unavailable",
      message:
        "Run search is temporarily unavailable: the daily database read quota " +
        "is exhausted and resets at midnight UTC. The default run list and " +
        "all aggregate dashboards still serve from snapshot.",
    }, 503);
  }
};
