export interface RunFilters {
  q?: string;
  organism?: string;
  platform?: string;
  platforms?: string[];
  institution?: string;
  bioproject?: string;
  biosample?: string;
  source?: string;
  yearFrom?: number;
  yearTo?: number;
  saudiOnly?: boolean;
  pathogen?: boolean;
  wgs?: boolean;
}

function num(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFilters(url: URL): RunFilters {
  const p = (key: string) => url.searchParams.get(key) ?? undefined;
  const flag = (key: string) => url.searchParams.get(key) === "true";
  const list = (key: string) => {
    const raw = url.searchParams.get(key);
    if (!raw) return undefined;
    const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return items.length ? items : undefined;
  };
  return {
    q: p("q"),
    organism: p("organism"),
    platform: p("platform"),
    platforms: list("platforms"),
    institution: p("institution"),
    bioproject: p("bioproject"),
    biosample: p("biosample"),
    source: p("source"),
    yearFrom: num(url.searchParams.get("year_from")),
    yearTo: num(url.searchParams.get("year_to")),
    saudiOnly: flag("saudi_only"),
    pathogen: flag("pathogen"),
    wgs: flag("wgs"),
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
  if (f.platforms?.length) {
    conds.push(`platform IN (${f.platforms.map(() => "?").join(", ")})`);
    params.push(...f.platforms);
  }
  if (f.institution) { conds.push("institution_name = ?"); params.push(f.institution); }
  if (f.bioproject) { conds.push("bioproject_accession = ?"); params.push(f.bioproject); }
  if (f.biosample) { conds.push("biosample_accession = ?"); params.push(f.biosample); }
  if (f.yearFrom != null) { conds.push("year >= ?"); params.push(f.yearFrom); }
  if (f.yearTo != null) { conds.push("year <= ?"); params.push(f.yearTo); }
  if (f.source) { conds.push("source = ?"); params.push(f.source); }
  if (f.saudiOnly) { conds.push("is_saudi_submitter = 1"); }
  if (f.pathogen) { conds.push("is_pathogen = 1"); }
  if (f.wgs) { conds.push("is_wgs = 1"); }
  return { clause: conds.length ? ` WHERE ${conds.join(" AND ")}` : "", params };
}
