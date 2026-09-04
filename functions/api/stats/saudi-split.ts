import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare(
    "SELECT is_saudi_submitter, COUNT(*) AS runs, " +
    "COALESCE(SUM(total_bases), 0) AS total_bases " +
    "FROM runs GROUP BY is_saudi_submitter"
  ).all<{ is_saudi_submitter: number; runs: number; total_bases: number }>();
  const side = (flag: number) => {
    const r = results.find((x) => Number(x.is_saudi_submitter) === flag);
    return r ? { runs: r.runs, total_bases: r.total_bases } : null;
  };
  return json({ saudi: side(1), non_saudi: side(0) });
};
