import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT COALESCE(platform, 'Unknown') AS name, COUNT(*) AS runs " +
    "FROM runs GROUP BY platform ORDER BY runs DESC"
  ).all<{ name: string; runs: number }>();
  return json({ platforms: results });
};
