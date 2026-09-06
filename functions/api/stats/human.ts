import { cachedJson } from "../_lib/cache";
import { Env, json } from "../_lib/db";

const HUMAN = "organism LIKE 'Homo sapiens%'";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  return cachedJson(request, 3600, async () => {
    const totals = await env.DB.prepare(
      `SELECT COUNT(*) AS total_runs, COALESCE(SUM(total_bases), 0) AS total_bases ` +
      `FROM runs WHERE ${HUMAN}`
    ).first();
    const byYear = await env.DB.prepare(
      "SELECT year, COUNT(*) AS runs, COALESCE(SUM(total_bases), 0) AS total_bases " +
      `FROM runs WHERE ${HUMAN} AND year IS NOT NULL ` +
      "GROUP BY year ORDER BY year"
    ).all();
    const topInstitutions = await env.DB.prepare(
      "SELECT institution_name AS name, COUNT(*) AS runs, " +
      "COALESCE(SUM(total_bases), 0) AS total_bases " +
      `FROM runs WHERE ${HUMAN} AND institution_name IS NOT NULL ` +
      "GROUP BY institution_name ORDER BY runs DESC LIMIT 10"
    ).all();
    return json({
      ...totals,
      by_year: byYear.results,
      top_institutions: topInstitutions.results,
    });
  });
};
