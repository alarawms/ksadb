import { cachedJson, STATS_TTL } from "../_lib/cache";
import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  return cachedJson(request, STATS_TTL, async () => {
    const { results } = await env.DB.prepare(
      "SELECT biosample_accession AS accession, COUNT(*) AS runs, " +
      "COUNT(DISTINCT bioproject_accession) AS projects " +
      "FROM runs WHERE biosample_accession IS NOT NULL " +
      "GROUP BY biosample_accession ORDER BY runs DESC LIMIT 200"
    ).all();
    return json({ items: results });
  });
};
