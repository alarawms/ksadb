export interface V2Where {
  clause: string;
  params: (string | number)[];
}

/**
 * Build the WHERE clause for the v2 star-schema search. Equality filters hit
 * the joined dim columns (`s.*` samples, `r.*` ena_runs, `sub.*` submitters,
 * `st.*` studies); `from`/`to` bound `r.submitted_date` as strings (ENA dates
 * are `YYYY-MM-DD[ HH:MM:SS]`, lexicographic order matches chronological).
 * `to` appends `~` so `<= to~` includes everything on the `to` day.
 */
export function parseV2Filters(url: URL): V2Where {
  const p = url.searchParams;
  const conds: string[] = [];
  const params: (string | number)[] = [];
  const eq = (col: string, v: string | null) => {
    if (v) {
      conds.push(`${col} = ?`);
      params.push(v);
    }
  };
  eq("s.organism", p.get("organism"));
  eq("s.country", p.get("country"));
  eq("s.region", p.get("region"));
  eq("s.host", p.get("host"));
  eq("r.platform", p.get("platform"));
  eq("r.library_strategy", p.get("strategy"));
  eq("sub.center_name", p.get("submitter"));
  const from = p.get("from");
  if (from) {
    conds.push("r.submitted_date >= ?");
    params.push(from);
  }
  const to = p.get("to");
  if (to) {
    conds.push("r.submitted_date <= ?");
    params.push(`${to}~`);
  }
  const q = p.get("q");
  if (q) {
    conds.push(
      "(r.run_accession LIKE ? OR s.organism LIKE ? OR sub.center_name LIKE ? OR st.title LIKE ?)"
    );
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  return {
    clause: conds.length ? ` WHERE ${conds.join(" AND ")}` : "",
    params,
  };
}
