import { cachedJson, STATS_TTL } from "./_lib/cache";
import { Env, json } from "./_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  return cachedJson(request, STATS_TTL, async () => {
    const top = await env.DB.prepare(
      "SELECT organism AS name, COUNT(*) AS runs, " +
      "COALESCE(SUM(total_bases), 0) AS total_bases " +
      "FROM runs WHERE is_pathogen = 1 AND organism IS NOT NULL " +
      "GROUP BY organism ORDER BY runs DESC LIMIT 50"
    ).all();
    const byYear = await env.DB.prepare(
      "SELECT year, COUNT(*) AS runs, COALESCE(SUM(total_bases), 0) AS total_bases " +
      "FROM runs WHERE is_pathogen = 1 AND year IS NOT NULL " +
      "GROUP BY year ORDER BY year"
    ).all();
    return json({ top: top.results, by_year: byYear.results });
  });
};
