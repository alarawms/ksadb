import { Env, json } from "../_lib/db";

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const name = String(params.name);
  const inst = await env.DB.prepare(
    "SELECT name, is_saudi FROM institutions WHERE name = ?"
  ).bind(name).first<{ name: string; is_saudi: number }>();
  if (!inst) return json({ error: "institution not found" }, 404);
  const agg = await env.DB.prepare(
    "SELECT COUNT(*) AS runs, COALESCE(SUM(total_bases), 0) AS total_bases, " +
    "COUNT(DISTINCT bioproject_accession) AS unique_bioprojects " +
    "FROM runs WHERE institution_name = ?"
  ).bind(name).first();
  return json({ name: inst.name, is_saudi: !!inst.is_saudi, ...agg });
};
