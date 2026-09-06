"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useQuery } from "@/lib/useQuery";
import type { SampleListResponse, SampleOut } from "@/lib/api";
import {
  chipsFromState, countActiveFilters, filterRuns, removeFilter,
  EMPTY_FILTERS, type FilterState,
} from "@/lib/filterState";
import { FilterButton, FilterDrawer } from "@/components/FilterDrawer";
import { RunsTable } from "@/components/RunsTable";

export default function SamplesPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <SamplesInner />
    </Suspense>
  );
}

function TopSamples() {
  const { data, error } = useQuery<SampleListResponse>("/samples");
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return <p>Loading…</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">BioSamples</h1>
      <p className="text-sm text-[var(--text-dim)]">
        Top {data.items.length} BioSamples by run count — click one to browse its runs.
      </p>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead style={{ background: "var(--surface-2)", borderColor: "var(--border)" }} className="border-b">
            <tr>
              <th className="th">BioSample</th>
              <th className="th">Projects</th>
              <th className="th text-right">Runs</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((s) => (
              <tr key={s.accession} className="border-b hover:bg-[var(--surface-2)]"
                style={{ borderColor: "var(--border)" }}>
                <td className="p-2 font-mono">
                  <Link className="link" href={`/samples?acc=${s.accession}`}>{s.accession}</Link>
                </td>
                <td className="p-2">{s.projects}</td>
                <td className="p-2 text-right tabular-nums">{s.runs.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SamplesInner() {
  const acc = useSearchParams().get("acc");
  const { data, error } = useQuery<SampleOut>(acc ? `/samples/${acc}` : null);
  const [state, setState] = useState<FilterState>(EMPTY_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!acc) return <TopSamples />;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  const runs = filterRuns(data.runs, state);
  const chips = chipsFromState(state);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold">{data.biosample_accession}</h1>
          <p className="text-sm text-[var(--text-dim)]">
            {data.runs.length} runs · projects:{" "}
            {data.projects.map((p, i) => (
              <span key={p}>
                {i > 0 && ", "}
                <Link className="link" href={`/project?id=${p}`}>{p}</Link>
              </span>
            ))}
          </p>
        </div>
        <FilterButton count={countActiveFilters(state)} onClick={() => setDrawerOpen(true)} />
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <span key={c.key} className="chip">
              {c.label}
              <button aria-label={`Remove filter ${c.label}`}
                onClick={() => setState(removeFilter(state, c.key))}>✕</button>
            </span>
          ))}
          <button className="text-xs text-[var(--text-dim)] hover:text-[var(--accent)]"
            onClick={() => setState(EMPTY_FILTERS)}>
            Clear all
          </button>
        </div>
      )}

      <p className="text-sm text-[var(--text-dim)]">
        {runs.length.toLocaleString()} of {data.runs.length.toLocaleString()} runs shown
      </p>
      <div className="card overflow-x-auto p-0">
        <RunsTable runs={runs} />
      </div>

      <FilterDrawer
        state={state}
        onChange={setState}
        platforms={[...new Set(data.runs.map((r) => r.platform ?? "Unknown"))]}
        institutions={[...new Set(data.runs.map((r) => r.institution_name).filter((n): n is string => !!n))]}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
