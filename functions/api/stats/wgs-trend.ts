import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT year, COUNT(*) AS runs, COALESCE(SUM(total_bases), 0) AS total_bases " +
    "FROM runs WHERE is_wgs = 1 AND year IS NOT NULL " +
    "GROUP BY year ORDER BY year"
  ).all();
  return json(results);
};
