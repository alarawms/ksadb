import { cachedJson } from "../_lib/cache";
import { Env, json } from "../_lib/db";

const DIMENSIONS: Record<string, string> = {
  organism: "organism",
  platform: "platform",
  institution: "institution_name",
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const dimension = url.searchParams.get("dimension") ?? "organism";
  const n = Math.min(50, Math.max(1, Number(url.searchParams.get("n") ?? "15") || 15));
  const column = DIMENSIONS[dimension];
  if (!column) return json({ error: `unknown dimension: ${dimension}` }, 400);
  return cachedJson(request, 3600, async () => {
    const { results } = await env.DB.prepare(
      `SELECT ${column} AS name, COUNT(*) AS runs, ` +
      "COALESCE(SUM(total_bases), 0) AS total_bases " +
      `FROM runs WHERE ${column} IS NOT NULL ` +
      "GROUP BY " + column + " ORDER BY runs DESC LIMIT ?"
    ).bind(n).all();
    return json(results);
  });
};
