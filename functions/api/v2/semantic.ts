import { Env, json } from "../_lib/db";

interface VecMatch {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

// Saudi-only at query time: each resolution query restricts samples.country =
// 'SA' (non-Saudi rows have country = NULL), so matches that fail it are dropped.
function resolutionSql(type: string, placeholders: string): string | null {
  if (type === "study") {
    return (
      "SELECT st.accession, st.title, NULL AS organism, sub.center_name AS submitter, " +
      "(SELECT COUNT(*) FROM ena_runs r WHERE r.study_accession = st.accession) AS runs " +
      "FROM studies st LEFT JOIN submitters sub ON sub.id = st.submitter_id " +
      `WHERE st.accession IN (${placeholders}) AND EXISTS (SELECT 1 FROM ena_runs r ` +
      "JOIN samples s ON s.biosample_accession = r.biosample_accession " +
      "WHERE r.study_accession = st.accession AND s.country = 'SA')"
    );
  }
  if (type === "sample") {
    return (
      "SELECT s.biosample_accession AS accession, s.organism, " +
      "(SELECT COUNT(*) FROM ena_runs r WHERE r.biosample_accession = s.biosample_accession) AS runs, " +
      "(SELECT sub.center_name FROM ena_runs r " +
      "JOIN studies st ON st.accession = r.study_accession " +
      "LEFT JOIN submitters sub ON sub.id = st.submitter_id " +
      "WHERE r.biosample_accession = s.biosample_accession LIMIT 1) AS submitter " +
      `FROM samples s WHERE s.biosample_accession IN (${placeholders}) AND s.country = 'SA'`
    );
  }
  if (type === "run") {
    return (
      "SELECT r.run_accession AS accession, st.title AS label, s.organism, " +
      // a run match is a single run by definition; keep the shared match shape
      "sub.center_name AS submitter, 1 AS runs " +
      "FROM ena_runs r " +
      "JOIN studies st ON st.accession = r.study_accession " +
      "LEFT JOIN submitters sub ON sub.id = st.submitter_id " +
      "JOIN samples s ON s.biosample_accession = r.biosample_accession " +
      `WHERE r.run_accession IN (${placeholders}) AND s.country = 'SA'`
    );
  }
  return null; // unknown type: skip
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { query } = (await request.json()) as { query?: string };
  if (!query || !query.trim()) return json({ error: "query required" }, 400);
  try {
    const emb = await env.AI.run("@cf/baai/bge-small-en-v1.5", { text: [query.trim()] });
    const vector = (emb as { data: number[][] }).data[0];
    const { matches } = (await env.STUDIES_INDEX.query(vector, {
      topK: 20,
      returnMetadata: "all",
    })) as { matches: VecMatch[] };

    const groups = new Map<string, VecMatch[]>();
    for (const m of matches) {
      const type = String(m.metadata?.type ?? "");
      if (!groups.has(type)) groups.set(type, []);
      groups.get(type)!.push(m);
    }

    const out: Record<string, unknown>[] = [];
    for (const [type, group] of groups) {
      const sql = resolutionSql(type, group.map(() => "?").join(","));
      if (!sql) continue;
      const accs = group.map((m) => String(m.metadata?.accession ?? m.id));
      const { results } = await env.DB.prepare(sql).bind(...accs).all();
      const byAcc = new Map(results.map((r) => [String(r.accession), r]));
      for (const m of group) {
        const row = byAcc.get(String(m.metadata?.accession ?? m.id));
        if (!row) continue; // failed SA-restricted resolution → drop
        const base = {
          type, accession: row.accession, score: m.score,
          organism: row.organism ?? null, submitter: row.submitter ?? null,
          runs: row.runs ?? 0,
        };
        if (type === "study") {
          out.push({ ...base, title: row.title ?? null });
        } else {
          const label = row.label ?? (type === "sample" ? row.organism : null);
          out.push({ ...base, label: label ?? null });
        }
      }
    }
    out.sort((a, b) => Number(b.score) - Number(a.score));
    return json({ matches: out });
  } catch {
    return json({ error: "temporarily_unavailable",
      message: "Semantic search is temporarily unavailable. Retry in a few minutes." }, 503);
  }
};
