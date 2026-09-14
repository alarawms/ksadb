import { cachedDetail } from "../_lib/cache";
import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  // Path params may arrive percent-encoded (wrangler pages dev does not
  // decode them); decode defensively — a no-op when already decoded.
  let name = String(params.name);
  try {
    name = decodeURIComponent(name);
  } catch {
    // leave as-is on malformed input
  }
  return cachedDetail(request, async () => {
    const inst = await env.DB.prepare(
      "SELECT name, is_saudi FROM institutions WHERE name = ?"
    ).bind(name).first<{ name: string; is_saudi: number }>();
    if (!inst) {
      // Local star-schema stacks have no v1 institutions row — match a
      // submitter by center_name and aggregate from the star schema.
      const star = await env.DB.prepare(
        "SELECT sub.center_name AS name, COUNT(r.run_accession) AS runs, " +
        "COALESCE(SUM(r.bytes), 0) AS total_bases, " +
        "COUNT(DISTINCT st.accession) AS unique_bioprojects " +
        "FROM submitters sub " +
        "JOIN studies st ON st.submitter_id = sub.id " +
        "JOIN ena_runs r ON r.study_accession = st.accession " +
        "WHERE sub.center_name = ? GROUP BY sub.center_name"
      ).bind(name).first<{ name: string; runs: number; total_bases: number; unique_bioprojects: number }>();
      if (!star) {
        return json({ error: "institution not found", message: `Institution not found: ${name}` }, 404);
      }
      return json({ is_saudi: true, ...star });
    }
    const agg = await env.DB.prepare(
      "SELECT COUNT(*) AS runs, COALESCE(SUM(total_bases), 0) AS total_bases, " +
      "COUNT(DISTINCT bioproject_accession) AS unique_bioprojects " +
      "FROM runs WHERE institution_name = ?"
    ).bind(name).first();
    return json({ name: inst.name, is_saudi: !!inst.is_saudi, ...agg });
  });
};
