import { cachedJson, STATS_TTL } from "../_lib/cache";
import { Env, json, parsePage } from "../_lib/db";
import { parseV2Filters } from "./_lib/filters";

const SELECT = `
  SELECT r.run_accession, r.study_accession, r.biosample_accession, r.bytes, r.spots,
         r.platform, r.instrument_model, r.library_strategy, r.submitted_date,
         r.fastq_ftp, r.fastq_bytes,
         s.organism, s.country, s.region, s.host, sub.center_name AS submitter,
         st.title AS study_title
  FROM ena_runs r
  JOIN samples s ON s.biosample_accession = r.biosample_accession
  JOIN studies st ON st.accession = r.study_accession
  LEFT JOIN submitters sub ON sub.id = st.submitter_id`;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const { clause, params } = parseV2Filters(url);
  const { page, pageSize } = parsePage(url);
  try {
    return await cachedJson(request, STATS_TTL, async () => {
      const total = await env.DB.prepare(
        `SELECT COUNT(*) AS c FROM ena_runs r
         JOIN samples s ON s.biosample_accession = r.biosample_accession
         JOIN studies st ON st.accession = r.study_accession
         LEFT JOIN submitters sub ON sub.id = st.submitter_id${clause}`
      )
        .bind(...params)
        .first<{ c: number }>();
      const { results } = await env.DB.prepare(
        `${SELECT}${clause} ORDER BY r.submitted_date DESC, r.run_accession LIMIT ? OFFSET ?`
      )
        .bind(...params, pageSize, (page - 1) * pageSize)
        .all();
      return json({
        total: total?.c ?? 0,
        page,
        page_size: pageSize,
        items: results,
      });
    });
  } catch {
    return json(
      {
        error: "temporarily_unavailable",
        message:
          "Search is temporarily unavailable (daily database quota). Retry in a few minutes.",
      },
      503
    );
  }
};
