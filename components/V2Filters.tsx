"use client";

import type { V2FacetsResponse } from "@/lib/api";

interface Props {
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  facets: V2FacetsResponse;
}

const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]";

export function V2Filters({ value, onChange, facets }: Props) {
  const set = (key: string, v: string) => onChange({ ...value, [key]: v });

  const select = (
    key: string,
    label: string,
    options: { name: string; runs: number }[],
  ) => (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <select className="input w-full" value={value[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}>
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.name} value={o.name}>{o.name} ({o.runs.toLocaleString()})</option>
        ))}
      </select>
    </label>
  );

  const text = (key: string, label: string, placeholder: string, type = "text") => (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input className="input w-full" type={type} placeholder={placeholder}
        value={value[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
    </label>
  );

  return (
    <div className="card space-y-3 p-4">
      {text("q", "Text", "Accession, organism, submitter, study title")}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {select("country", "Country", facets.countries ?? [])}
        {text("region", "Region", "e.g. Riyadh")}
        {select("platform", "Platform", facets.platforms ?? [])}
        {select("strategy", "Strategy", facets.strategies ?? [])}
        {select("submitter", "Submitter", facets.submitters ?? [])}
        <label className="block">
          <span className={labelCls}>Organism</span>
          <input className="input w-full" list="ksadb-v2-organisms" placeholder="e.g. Homo sapiens"
            value={value.organism ?? ""} onChange={(e) => set("organism", e.target.value)} />
          <datalist id="ksadb-v2-organisms">
            {(facets.organisms ?? []).map((o) => <option key={o.name} value={o.name} />)}
          </datalist>
        </label>
        {text("host", "Host", "e.g. Homo sapiens")}
        {text("from", "Submitted from", "YYYY-MM-DD", "date")}
        {text("to", "Submitted to", "YYYY-MM-DD", "date")}
      </div>
    </div>
  );
}
