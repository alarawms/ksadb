import { cachedJson, STATS_TTL } from "../../_lib/cache";
import { Env, json } from "../../_lib/db";

const ALLOWED = new Set([
  "summary", "by-month", "by-country", "by-region", "by-organism",
  "by-submitter", "by-platform", "by-strategy",
]);

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const name = String(params.aggregate);
  if (!ALLOWED.has(name)) return json({ error: "unknown aggregate" }, 404);
  try {
    return await cachedJson(request, STATS_TTL, async () => {
      if (env.AGGREGATES_BASE_URL) {
        const r = await fetch(`${env.AGGREGATES_BASE_URL}/aggregates/${name}.json`);
        if (!r.ok) return json({ error: "aggregate not built yet" }, 404);
        return new Response(r.body, {
          headers: { "content-type": "application/json" },
        });
      }
      const obj = await env.AGGREGATES.get(`aggregates/${name}.json`);
      if (!obj) return json({ error: "aggregate not built yet" }, 404);
      return new Response(obj.body, {
        headers: { "content-type": "application/json" },
      });
    });
  } catch {
    return json({ error: "temporarily_unavailable",
      message: "Stats are temporarily unavailable (daily quota). Retry in a few minutes." }, 503);
  }
};
