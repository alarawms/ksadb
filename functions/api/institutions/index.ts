import { cachedJson, STATS_TTL } from "../_lib/cache";
import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  return cachedJson(request, STATS_TTL, async () => {
    const { results } = await env.DB.prepare(
      "SELECT i.name, i.is_saudi, COUNT(r.run_accession) AS runs " +
      "FROM institutions i LEFT JOIN runs r ON r.institution_name = i.name " +
      "GROUP BY i.name ORDER BY runs DESC LIMIT 200"
    ).all<{ name: string; is_saudi: number; runs: number }>();
    if (results.length) {
      return json({
        items: results.map((r) => ({
          name: r.name,
          is_saudi: !!r.is_saudi,
          runs: r.runs,
        })),
      });
    }
    // Local star-schema stacks have no v1 institutions rows — build the
    // leaderboard from submitters instead (same shape, is_saudi unknown → 1).
    const star = await env.DB.prepare(
      "SELECT sub.center_name AS name, 1 AS is_saudi, COUNT(r.run_accession) AS runs " +
      "FROM submitters sub " +
      "JOIN studies st ON st.submitter_id = sub.id " +
      "JOIN ena_runs r ON r.study_accession = st.accession " +
      "GROUP BY sub.center_name ORDER BY runs DESC LIMIT 200"
    ).all<{ name: string; is_saudi: number; runs: number }>();
    return json({
      items: star.results.map((r) => ({
        name: r.name,
        is_saudi: !!r.is_saudi,
        runs: r.runs,
      })),
    });
  });
};
