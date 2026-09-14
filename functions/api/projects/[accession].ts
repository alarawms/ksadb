import { cachedDetail } from "../_lib/cache";
import { Env, json } from "../_lib/db";
import { RUN_COLUMNS } from "../_lib/columns";

// Studies that only exist in the v2 star schema (ENA bootstrap) have no v1
// bioprojects row — serve them from studies/ena_runs so /project?id= works.
const V2_RUN_COLUMNS =
  "r.run_accession, r.study_accession AS bioproject_accession, " +
  "r.biosample_accession, r.bytes AS total_bases, r.platform, " +
  "r.instrument_model, r.library_strategy, s.organism, " +
  "sub.center_name, sub.center_name AS institution_name, " +
  "s.country AS geo_loc_name, r.source, " +
  "CAST(strftime('%Y', r.submitted_date) AS INTEGER) AS year, " +
  "r.submitted_date AS published_dt";

const V2_PROJECT_SQL =
  "SELECT st.accession, st.title, sub.center_name AS institution_name " +
  "FROM studies st LEFT JOIN submitters sub ON sub.id = st.submitter_id " +
  "WHERE st.accession = ?";

const V2_RUNS_SQL =
  `SELECT ${V2_RUN_COLUMNS} FROM ena_runs r ` +
  "LEFT JOIN samples s ON s.biosample_accession = r.biosample_accession " +
  "LEFT JOIN studies st ON st.accession = r.study_accession " +
  "LEFT JOIN submitters sub ON sub.id = st.submitter_id " +
  "WHERE r.study_accession = ? " +
  "ORDER BY r.submitted_date IS NULL, r.submitted_date DESC LIMIT 200";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const acc = String(params.accession);
  return cachedDetail(request, async () => {
    const project = await env.DB.prepare(
      "SELECT * FROM bioprojects WHERE bioproject_accession = ?"
    ).bind(acc).first();
    if (project) {
      const { results } = await env.DB.prepare(
        `SELECT ${RUN_COLUMNS} FROM runs WHERE bioproject_accession = ? ` +
        "ORDER BY published_dt IS NULL, published_dt DESC LIMIT 200"
      ).bind(acc).all();
      return json({ ...project, runs: results });
    }
    const study = await env.DB.prepare(V2_PROJECT_SQL).bind(acc).first<{
      accession: string; title: string | null; institution_name: string | null;
    }>();
    if (!study) {
      return json({ error: "project not found", message: `Project ${acc} not found.` }, 404);
    }
    const { results } = await env.DB.prepare(V2_RUNS_SQL).bind(acc).all();
    const total_bases = results.reduce(
      (sum: number, r) => sum + Number((r as { total_bases: number | null }).total_bases ?? 0),
      0,
    );
    return json({
      bioproject_accession: study.accession,
      title: study.title,
      institution_name: study.institution_name,
      runs_count: results.length,
      total_bases,
      runs: results,
    });
  });
};
