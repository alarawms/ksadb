import { Env, json } from "../_lib/db";

const ALLOWED = ["organism", "country", "region", "host", "platform", "strategy", "submitter", "from", "to"];

const PROMPT = (q: string) =>
  `Extract search filters from the user query for a sequence-run database. ` +
  `Reply with ONLY a JSON object using these keys (omit what is not stated): ` +
  `organism (scientific name), country (ISO code like SA, AE), region, host, ` +
  `platform (e.g. ILLUMINA, OXFORD_NANOPORE), strategy (library strategy like WGS, AMPLICON), ` +
  `submitter (center name), from and to (YYYY-MM-DD). ` +
  `If nothing matches reply with {}. Query: "${q.replace(/"/g, "'")}"`;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { query } = (await request.json()) as { query?: string };
  if (!query || !query.trim()) return json({ error: "query required" }, 400);
  try {
    const out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [{ role: "user", content: PROMPT(query.trim()) }],
      max_tokens: 200,
    });
    const text = (out as { response: string }).response.trim();
    const jsonText = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonText || "{}") as Record<string, unknown>;
    const filters: Record<string, string> = {};
    for (const key of ALLOWED) {
      const v = parsed[key];
      if (typeof v === "string" && v.trim()) filters[key] = v.trim();
    }
    // country must be a 2-letter ISO code we serve — else drop it
    if (filters.country && !/^[A-Z]{2}$/.test(filters.country)) delete filters.country;
    return json({ filters });
  } catch {
    return json({ filters: {} });
  }
};
