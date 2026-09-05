import type { RunItem } from "./api";

export interface FilterState {
  q: string;
  organism: string;
  platforms: string[];
  institution: string;
  yearFrom: string;
  yearTo: string;
  source: string;
  saudiOnly: boolean;
  pathogen: boolean;
  wgs: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  q: "",
  organism: "",
  platforms: [],
  institution: "",
  yearFrom: "",
  yearTo: "",
  source: "",
  saudiOnly: false,
  pathogen: false,
  wgs: false,
};

export function stateFromParams(sp: URLSearchParams): FilterState {
  const platforms = (sp.get("platforms") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  return {
    q: sp.get("q") ?? "",
    organism: sp.get("organism") ?? "",
    platforms,
    institution: sp.get("institution") ?? "",
    yearFrom: sp.get("year_from") ?? "",
    yearTo: sp.get("year_to") ?? "",
    source: sp.get("source") ?? "",
    saudiOnly: sp.get("saudi_only") === "true",
    pathogen: sp.get("pathogen") === "true",
    wgs: sp.get("wgs") === "true",
  };
}

export function paramsFromState(f: FilterState): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.organism) sp.set("organism", f.organism);
  if (f.platforms.length) sp.set("platforms", f.platforms.join(","));
  if (f.institution) sp.set("institution", f.institution);
  if (f.yearFrom) sp.set("year_from", f.yearFrom);
  if (f.yearTo) sp.set("year_to", f.yearTo);
  if (f.source) sp.set("source", f.source);
  if (f.saudiOnly) sp.set("saudi_only", "true");
  if (f.pathogen) sp.set("pathogen", "true");
  if (f.wgs) sp.set("wgs", "true");
  return sp;
}

export interface FilterChip {
  /** Facet key; platform chips use `platform:<value>`. */
  key: string;
  label: string;
}

export function chipsFromState(f: FilterState): FilterChip[] {
  const chips: FilterChip[] = [];
  if (f.q) chips.push({ key: "q", label: `Text: ${f.q}` });
  if (f.organism) chips.push({ key: "organism", label: `Organism: ${f.organism}` });
  for (const p of f.platforms) chips.push({ key: `platform:${p}`, label: p });
  if (f.institution) chips.push({ key: "institution", label: `Institution: ${f.institution}` });
  if (f.yearFrom || f.yearTo) {
    chips.push({ key: "year", label: `Years: ${f.yearFrom || "…"}–${f.yearTo || "…"}` });
  }
  if (f.source) chips.push({ key: "source", label: `Source: ${f.source}` });
  if (f.saudiOnly) chips.push({ key: "saudi_only", label: "Saudi only" });
  if (f.pathogen) chips.push({ key: "pathogen", label: "Pathogen" });
  if (f.wgs) chips.push({ key: "wgs", label: "WGS" });
  return chips;
}

export function removeFilter(f: FilterState, key: string): FilterState {
  const next = { ...f };
  if (key.startsWith("platform:")) {
    next.platforms = f.platforms.filter((p) => p !== key.slice("platform:".length));
  } else if (key === "year") {
    next.yearFrom = "";
    next.yearTo = "";
  } else {
    const map: Record<string, keyof FilterState> = {
      q: "q", organism: "organism", institution: "institution",
      source: "source", saudi_only: "saudiOnly", pathogen: "pathogen", wgs: "wgs",
    };
    const field = map[key];
    if (field) {
      (next as Record<string, unknown>)[field] =
        typeof next[field] === "boolean" ? false : "";
    }
  }
  return next;
}

export function countActiveFilters(f: FilterState): number {
  return chipsFromState(f).length;
}

/** Client-side filtering for views that hold their full run list locally. */
export function filterRuns(runs: RunItem[], f: FilterState): RunItem[] {
  const q = f.q.trim().toLowerCase();
  const org = f.organism.trim().toLowerCase();
  const inst = f.institution.trim().toLowerCase();
  const from = Number(f.yearFrom) || null;
  const to = Number(f.yearTo) || null;
  return runs.filter((r) => {
    if (q && ![r.run_accession, r.bioproject_accession, r.organism, r.center_name]
      .some((v) => v?.toLowerCase().includes(q))) return false;
    if (org && !(r.organism ?? "").toLowerCase().includes(org)) return false;
    if (f.platforms.length && !f.platforms.includes(r.platform ?? "")) return false;
    if (inst && !(r.institution_name ?? "").toLowerCase().includes(inst)) return false;
    if (from != null && (r.year == null || r.year < from)) return false;
    if (to != null && (r.year == null || r.year > to)) return false;
    if (f.source && r.source !== f.source) return false;
    if (f.saudiOnly && !r.is_saudi_submitter) return false;
    if (f.pathogen && !r.is_pathogen) return false;
    if (f.wgs && !r.is_wgs) return false;
    return true;
  });
}
