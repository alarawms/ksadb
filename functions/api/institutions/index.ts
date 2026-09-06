import { cachedJson, STATS_TTL } from "../_lib/cache";
import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  return cachedJson(request, STATS_TTL, async () => {
    const { results } = await env.DB.prepare(
      "SELECT i.name, i.is_saudi, COUNT(r.run_accession) AS runs " +
      "FROM institutions i LEFT JOIN runs r ON r.institution_name = i.name " +
      "GROUP BY i.name ORDER BY runs DESC LIMIT 200"
    ).all<{ name: string; is_saudi: number; runs: number }>();
    return json({
      items: results.map((r) => ({
        name: r.name,
        is_saudi: !!r.is_saudi,
        runs: r.runs,
      })),
    });
  });
};
