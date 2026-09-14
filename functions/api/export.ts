import { Env, json } from "./_lib/db";
import { RUN_FIELDS } from "./_lib/columns";
import { buildWhere, parseFilters } from "./_lib/filters";
import { parseV2Filters } from "./v2/_lib/filters";

const MAX_EXPORT_ROWS = 50_000;

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";
  if (format !== "csv" && format !== "json") {
    return json({ error: "format must be csv or json" }, 400);
  }
  if (url.searchParams.has("v2")) {
    const { clause, params } = parseV2Filters(url);
    const FIELDS = [
      "run_accession", "study_accession", "biosample_accession", "bytes", "spots",
      "platform", "instrument_model", "library_strategy", "library_source",
      "submitted_date", "organism", "country", "submitter", "study_title",
    ] as const;
    const { results } = await env.DB.prepare(
      "SELECT r.run_accession, r.study_accession, r.biosample_accession, r.bytes, " +
      "r.spots, r.platform, r.instrument_model, r.library_strategy, " +
      "r.library_source, r.submitted_date, s.organism, s.country, " +
      "sub.center_name AS submitter, st.title AS study_title " +
      "FROM ena_runs r " +
      "JOIN samples s ON s.biosample_accession = r.biosample_accession " +
      "JOIN studies st ON st.accession = r.study_accession " +
      "LEFT JOIN submitters sub ON sub.id = st.submitter_id" +
      `${clause} ORDER BY r.run_accession LIMIT ?`
    ).bind(...params, MAX_EXPORT_ROWS).all();

    if (format === "json") return json(results);

    const lines = (results as Record<string, unknown>[]).map((r) =>
      FIELDS.map((f) => csvCell(r[f])).join(","));
    const csv = [FIELDS.join(","), ...lines].join("\n") + "\n";
    return new Response(csv, {
      headers: {
        "content-type": "text/csv",
        "content-disposition": "attachment; filename=ksadb_export.csv",
      },
    });
  }
  const { clause, params } = buildWhere(parseFilters(url));
  const { results } = await env.DB.prepare(
    `SELECT ${RUN_FIELDS.join(", ")} FROM runs${clause} ` +
    "ORDER BY run_accession LIMIT ?"
  ).bind(...params, MAX_EXPORT_ROWS).all();

  if (format === "json") return json(results);

  const lines = (results as Record<string, unknown>[]).map((r) =>
    RUN_FIELDS.map((f) => csvCell(r[f])).join(",")
  );
  const csv = [RUN_FIELDS.join(","), ...lines].join("\n") + "\n";
  return new Response(csv, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": "attachment; filename=ksadb_export.csv",
    },
  });
};
