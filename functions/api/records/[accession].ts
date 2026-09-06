import { cachedDetail } from "../_lib/cache";
import { Env, json } from "../_lib/db";
import { RECORD_COLUMNS } from "../_lib/columns";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const acc = String(params.accession);
  return cachedDetail(request, async () => {
    const row = await env.DB.prepare(
      `SELECT ${RECORD_COLUMNS} FROM runs WHERE run_accession = ?`
    ).bind(acc).first();
    if (!row) return json({ error: "run not found", message: `Run ${acc} not found.` }, 404);
    return json({
      ...row,
      ncbi_url: `https://www.ncbi.nlm.nih.gov/sra/${acc}`,
      ena_url: `https://www.ebi.ac.uk/ena/browser/view/${acc}`,
    });
  });
};
