import { cachedJson, STATS_TTL } from "../_lib/cache";
import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  return cachedJson(request, STATS_TTL, async () => {
    const { results } = await env.DB.prepare(
      "SELECT COALESCE(platform, 'Unknown') AS name, COUNT(*) AS runs " +
      "FROM runs GROUP BY platform ORDER BY runs DESC"
    ).all<{ name: string; runs: number }>();
    return json({ platforms: results });
  });
};
