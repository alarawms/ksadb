import { cachedJson } from "../_lib/cache";
import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  return cachedJson(request, 3600, async () => {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS total_runs, " +
      "COUNT(DISTINCT bioproject_accession) AS unique_bioprojects, " +
      "COUNT(DISTINCT biosample_accession) AS unique_biosamples, " +
      "COALESCE(SUM(total_bases), 0) AS total_bases, " +
      "MIN(published_dt) AS date_min, MAX(published_dt) AS date_max " +
      "FROM runs"
    ).first();
    return json(row);
  });
};
