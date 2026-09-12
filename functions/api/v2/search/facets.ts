import { cachedJson, STATS_TTL } from "../../_lib/cache";
import { Env, json } from "../../_lib/db";

const QUERIES: Record<string, string> = {
  countries:
    "SELECT s.country AS name, COUNT(*) AS runs FROM ena_runs r JOIN samples s ON s.biosample_accession = r.biosample_accession WHERE s.country = 'SA' GROUP BY s.country ORDER BY runs DESC LIMIT 50",
  platforms:
    "SELECT r.platform AS name, COUNT(*) AS runs FROM ena_runs r JOIN samples s ON s.biosample_accession = r.biosample_accession WHERE s.country = 'SA' AND r.platform IS NOT NULL GROUP BY r.platform ORDER BY runs DESC LIMIT 50",
  strategies:
    "SELECT r.library_strategy AS name, COUNT(*) AS runs FROM ena_runs r JOIN samples s ON s.biosample_accession = r.biosample_accession WHERE s.country = 'SA' AND r.library_strategy IS NOT NULL GROUP BY r.library_strategy ORDER BY runs DESC LIMIT 50",
  submitters:
    "SELECT sub.center_name AS name, COUNT(*) AS runs FROM ena_runs r JOIN samples s ON s.biosample_accession = r.biosample_accession JOIN studies st ON st.accession = r.study_accession JOIN submitters sub ON sub.id = st.submitter_id WHERE s.country = 'SA' GROUP BY sub.center_name ORDER BY runs DESC LIMIT 50",
  organisms:
    "SELECT s.organism AS name, COUNT(*) AS runs FROM ena_runs r JOIN samples s ON s.biosample_accession = r.biosample_accession WHERE s.country = 'SA' AND s.organism IS NOT NULL GROUP BY s.organism ORDER BY runs DESC LIMIT 50",
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) =>
  cachedJson(request, STATS_TTL, async () => {
    const out: Record<string, unknown> = {};
    for (const [key, sql] of Object.entries(QUERIES)) {
      out[key] = (await env.DB.prepare(sql).all()).results;
    }
    return json(out);
  });
