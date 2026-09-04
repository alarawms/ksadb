import { Env, json } from "../_lib/db";
import { RUN_COLUMNS } from "../_lib/columns";

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const acc = String(params.accession);
  const { results } = await env.DB.prepare(
    `SELECT ${RUN_COLUMNS} FROM runs WHERE biosample_accession = ? ` +
    "ORDER BY published_dt IS NULL, published_dt DESC LIMIT 500"
  ).bind(acc).all<{ bioproject_accession: string | null }>();
  if (!results.length) return json({ error: "sample not found" }, 404);
  const projects = [
    ...new Set(results.map((r) => r.bioproject_accession).filter(Boolean)),
  ];
  return json({ biosample_accession: acc, projects, runs: results });
};
