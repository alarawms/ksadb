import { cachedDetail } from "../_lib/cache";
import { Env, json } from "../_lib/db";
import { RUN_COLUMNS } from "../_lib/columns";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const acc = String(params.accession);
  return cachedDetail(request, async () => {
    const project = await env.DB.prepare(
      "SELECT * FROM bioprojects WHERE bioproject_accession = ?"
    ).bind(acc).first();
    if (!project) {
      return json({ error: "project not found", message: `Project ${acc} not found.` }, 404);
    }
    const { results } = await env.DB.prepare(
      `SELECT ${RUN_COLUMNS} FROM runs WHERE bioproject_accession = ? ` +
      "ORDER BY published_dt IS NULL, published_dt DESC LIMIT 200"
    ).bind(acc).all();
    return json({ ...project, runs: results });
  });
};
