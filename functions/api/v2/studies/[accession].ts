import { cachedDetail } from "../../_lib/cache";
import { Env, json } from "../../_lib/db";

const RUN_SELECT = `
  SELECT r.run_accession, r.study_accession, r.biosample_accession, r.bytes, r.spots,
         r.platform, r.instrument_model, r.library_strategy, r.submitted_date,
         r.fastq_ftp, r.fastq_bytes,
         s.organism, s.country, s.region, s.host, sub.center_name AS submitter,
         st.title AS study_title
  FROM ena_runs r
  JOIN samples s ON s.biosample_accession = r.biosample_accession
  JOIN studies st ON st.accession = r.study_accession
  LEFT JOIN submitters sub ON sub.id = st.submitter_id`;

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const acc = String(params.accession);
  return cachedDetail(request, async () => {
    const study = await env.DB.prepare(
      `SELECT st.accession, st.title, st.abstract, st.submitted_date,
              sub.center_name AS submitter
       FROM studies st
       LEFT JOIN submitters sub ON sub.id = st.submitter_id
       WHERE st.accession = ?`
    ).bind(acc).first();
    if (!study) {
      return json({ error: "study not found", message: `Study ${acc} not found.` }, 404);
    }
    const { results } = await env.DB.prepare(
      `${RUN_SELECT} WHERE r.study_accession = ?
       ORDER BY r.submitted_date DESC, r.run_accession LIMIT 500`
    ).bind(acc).all<Record<string, unknown>>();
    // Coerce run bytes/spots to numbers (D1 can hand back strings via some
    // bindings); keep null when absent.
    const runs = results.map((r) => ({
      ...r,
      bytes: r.bytes == null ? null : Number(r.bytes),
      spots: r.spots == null ? null : Number(r.spots),
    }));
    return json({ ...study, runs });
  });
};
