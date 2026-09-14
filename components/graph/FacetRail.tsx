"use client";

import { HUMAN_COLORS, type ActiveFacets, type GraphNode, type HumanClass } from "./graph-layout";

export interface FacetValue { value: string; count: number }
export interface FacetGroups {
  domain: FacetValue[];
  region: FacetValue[];
  platform: FacetValue[];
  years: number[];
}

const headingCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]";
// The rail is a compact sidebar; cap the long tail so it stays scannable.
const MAX_CHIPS = 12;

// Client-side groups from the loaded graph nodes: domain counts come from
// node facets, regions from the region-type nodes in view, years expanded
// from each node's years range. (The /v2/search/facets endpoint has no
// region or year key — platform comes from there, see GraphHub.)
export function groupsFromNodes(nodes: GraphNode[]): Pick<FacetGroups, "domain" | "region" | "years"> {
  const domainCounts = new Map<string, number>();
  const years = new Set<number>();
  for (const n of nodes) {
    if (n.facets?.domain) {
      domainCounts.set(n.facets.domain, (domainCounts.get(n.facets.domain) ?? 0) + 1);
    }
    const [y0, y1] = n.facets?.years ?? [];
    if (y0 !== undefined && y1 !== undefined) {
      for (let y = y0; y <= y1; y++) years.add(y);
    }
  }
  const domain = (["human", "human_associated", "other"] as HumanClass[])
    .filter((d) => domainCounts.has(d))
    .map((d) => ({ value: d, count: domainCounts.get(d)! }));
  const region = nodes
    .filter((n) => n.type === "region")
    .map((n) => ({ value: n.label, count: n.count ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_CHIPS);
  return { domain, region, years: [...years].sort((a, b) => b - a).slice(0, MAX_CHIPS) };
}

// Deep-link params mirror functions/api/v2/_lib/filters.ts (parseV2Filters):
// region/platform map 1:1, a single year becomes a from/to submitted-date
// range. Domain is a graph-only classification with no search-v2 param.
function searchHref(active: ActiveFacets): string | null {
  const qs = new URLSearchParams();
  if (active.region) qs.set("region", active.region);
  if (active.platform) qs.set("platform", active.platform);
  if (active.year) {
    qs.set("from", `${active.year}-01-01`);
    qs.set("to", `${active.year}-12-31`);
  }
  const s = qs.toString();
  return s ? `/search?${s}` : null;
}

export default function FacetRail({ facets, active, onChange }: {
  facets: FacetGroups;
  active: ActiveFacets;
  onChange: (f: ActiveFacets) => void;
}) {
  // Toggle semantics: clicking a set chip clears it. `delete` (not undefined)
  // keeps the object free of unset keys, so Object.keys(active) counts only
  // real facets (GraphCanvas dims on that length).
  const toggle = (key: keyof ActiveFacets, value: string | number) => {
    const next: ActiveFacets = { ...active };
    if (next[key] === value) delete next[key];
    else (next as Record<string, string | number>)[key] = value;
    onChange(next);
  };

  const groups: { key: keyof ActiveFacets; label: string; values: (FacetValue | number)[] }[] = [
    { key: "domain", label: "Domain", values: facets.domain },
    { key: "region", label: "Region", values: facets.region },
    { key: "platform", label: "Platform", values: facets.platform },
    { key: "year", label: "Year", values: facets.years },
  ];
  const href = searchHref(active);

  return (
    <aside className="card w-full shrink-0 p-3 xl:w-56" aria-label="Facet rail">
      <div className="space-y-3">
        {groups.filter((g) => g.values.length > 0).map((g) => (
          <div key={g.key}>
            <span className={headingCls}>{g.label}</span>
            <div className="flex flex-wrap gap-1">
              {g.values.map((v) => {
                const value = typeof v === "number" ? v : v.value;
                const label = typeof v === "number" ? String(v) : `${v.value} (${v.count.toLocaleString()})`;
                const color = g.key === "domain" ? HUMAN_COLORS[value as HumanClass] : undefined;
                return (
                  <button key={label}
                    className={`badge ${active[g.key] === value ? "badge-accent" : ""}`}
                    onClick={() => toggle(g.key, value)}>
                    {color && (
                      <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle"
                        style={{ background: color }} />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {href && (
        <a className="btn mt-3" href={href}>matching runs →</a>
      )}
    </aside>
  );
}
