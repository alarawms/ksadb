export interface RunFilters {
  q?: string;
  organism?: string;
  platform?: string;
  institution?: string;
  source?: string;
  yearFrom?: number;
  yearTo?: number;
  saudiOnly?: boolean;
}

function num(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFilters(url: URL): RunFilters {
  const p = (key: string) => url.searchParams.get(key) ?? undefined;
  return {
    q: p("q"),
    organism: p("organism"),
    platform: p("platform"),
    institution: p("institution"),
    source: p("source"),
    yearFrom: num(url.searchParams.get("year_from")),
    yearTo: num(url.searchParams.get("year_to")),
    saudiOnly: url.searchParams.get("saudi_only") === "true",
  };
}

export function buildWhere(f: RunFilters): { clause: string; params: unknown[] } {
  const conds: string[] = [];
  const params: unknown[] = [];
  if (f.q) {
    const like = `%${f.q}%`;
    conds.push(
      "(run_accession LIKE ? OR bioproject_accession LIKE ? OR organism LIKE ? OR center_name LIKE ?)"
    );
    params.push(like, like, like, like);
  }
  if (f.organism) { conds.push("organism = ?"); params.push(f.organism); }
  if (f.platform) { conds.push("platform = ?"); params.push(f.platform); }
  if (f.institution) { conds.push("institution_name = ?"); params.push(f.institution); }
  if (f.yearFrom != null) { conds.push("year >= ?"); params.push(f.yearFrom); }
  if (f.yearTo != null) { conds.push("year <= ?"); params.push(f.yearTo); }
  if (f.source) { conds.push("source = ?"); params.push(f.source); }
  if (f.saudiOnly) { conds.push("is_saudi_submitter = 1"); }
  return { clause: conds.length ? ` WHERE ${conds.join(" AND ")}` : "", params };
}
