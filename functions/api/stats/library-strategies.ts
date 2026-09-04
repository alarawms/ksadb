import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT library_strategy AS name, COUNT(*) AS runs, " +
    "COALESCE(SUM(total_bases), 0) AS total_bases " +
    "FROM runs WHERE library_strategy IS NOT NULL " +
    "GROUP BY library_strategy ORDER BY runs DESC"
  ).all();
  return json(results);
};
