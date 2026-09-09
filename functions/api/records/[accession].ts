import { cachedDetail } from "../_lib/cache";
import { Env, json } from "../_lib/db";
import { RECORD_COLUMNS } from "../_lib/columns";

// Runs that only exist in the v2 star schema (ENA bootstrap) have no v1 row
// — fall back to ena_runs so /run?id= works from /explore links too.
const V2_FALLBACK_SQL = `
  SELECT r.run_accession, r.biosample_accession, r.bytes AS total_bases,
         r.spots AS total_spots, r.platform, r.instrument_model,
         r.library_strategy, r.library_source, r.submitted_date AS published_dt,
         s.organism, s.country AS geo_loc_name, sub.center_name
  FROM ena_runs r
  LEFT JOIN samples s ON s.biosample_accession = r.biosample_accession
  LEFT JOIN studies st ON st.accession = r.study_accession
  LEFT JOIN submitters sub ON sub.id = st.submitter_id
  WHERE r.run_accession = ?`;

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const acc = String(params.accession);
  return cachedDetail(request, async () => {
    const row = await env.DB.prepare(
      `SELECT ${RECORD_COLUMNS} FROM runs WHERE run_accession = ?`
    ).bind(acc).first();
    if (row) {
      return json({
        ...row,
        ncbi_url: `https://www.ncbi.nlm.nih.gov/sra/${acc}`,
        ena_url: `https://www.ebi.ac.uk/ena/browser/view/${acc}`,
      });
    }
    const v2 = await env.DB.prepare(V2_FALLBACK_SQL).bind(acc).first();
    if (!v2) return json({ error: "run not found", message: `Run ${acc} not found.` }, 404);
    const year = v2.published_dt ? Number(String(v2.published_dt).slice(0, 4)) : null;
    return json({
      run_accession: v2.run_accession,
      bioproject_accession: null,
      biosample_accession: v2.biosample_accession ?? null,
      total_bases: v2.total_bases ?? null,
      platform: v2.platform ?? null,
      instrument_model: v2.instrument_model ?? null,
      library_strategy: v2.library_strategy ?? null,
      library_source: v2.library_source ?? null,
      organism: v2.organism ?? null,
      center_name: v2.center_name ?? null,
      institution_name: v2.center_name ?? null,
      geo_loc_name: v2.geo_loc_name ?? null,
      source: "ena",
      year: Number.isFinite(year) ? year : null,
      published_dt: v2.published_dt ?? null,
      is_saudi_submitter: v2.geo_loc_name === "SA",
      is_pathogen: false,
      is_wgs: v2.library_strategy === "WGS",
      total_spots: v2.spots ?? null,
      file_size_mb: null,
      organization_name: null,
      ncbi_url: `https://www.ncbi.nlm.nih.gov/sra/${acc}`,
      ena_url: `https://www.ebi.ac.uk/ena/browser/view/${acc}`,
    });
  });
};
