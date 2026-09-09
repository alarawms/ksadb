import { Env, json } from "../_lib/db";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { query } = (await request.json()) as { query?: string };
  if (!query || !query.trim()) return json({ error: "query required" }, 400);
  try {
    const emb = await env.AI.run("@cf/baai/bge-small-en-v1.5", { text: [query.trim()] });
    const vector = (emb as { data: number[][] }).data[0];
    const { matches } = await env.STUDIES_INDEX.query(vector, {
      topK: 20,
      returnMetadata: "all",
    });
    const accs = matches.map((m) => String(m.metadata?.accession ?? m.id));
    if (!accs.length) return json({ matches: [] });
    const placeholders = accs.map(() => "?").join(",");
    const { results } = await env.DB.prepare(
      "SELECT st.accession, st.title, sub.center_name AS submitter, " +
      "(SELECT COUNT(*) FROM ena_runs r WHERE r.study_accession = st.accession) AS runs " +
      `FROM studies st LEFT JOIN submitters sub ON sub.id = st.submitter_id WHERE st.accession IN (${placeholders})`
    ).bind(...accs).all();
    const byAcc = new Map(results.map((r) => [r.accession, r]));
    return json({
      matches: matches
        .map((m) => {
          const row = byAcc.get(String(m.metadata?.accession ?? m.id));
          return row && {
            accession: row.accession, title: row.title,
            submitter: row.submitter, runs: row.runs, score: m.score,
          };
        })
        .filter(Boolean),
    });
  } catch {
    return json({ error: "temporarily_unavailable",
      message: "Semantic search is temporarily unavailable. Retry in a few minutes." }, 503);
  }
};
