import { cachedJson } from "./_lib/cache";
import { Env, json, parsePage } from "./_lib/db";
import { RUN_COLUMNS } from "./_lib/columns";
import { buildWhere, parseFilters } from "./_lib/filters";

// Search results are cached briefly: the count query scans the runs table,
// and explorer-style filtering can generate many requests per minute.
const SEARCH_TTL = 60;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const { clause, params } = buildWhere(parseFilters(url));
  const { page, pageSize } = parsePage(url);

  return cachedJson(request, SEARCH_TTL, async () => {
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
};
