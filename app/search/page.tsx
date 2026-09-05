"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useQuery } from "@/lib/useQuery";
import { useDebounced } from "@/lib/useDebounced";
import {
  chipsFromState, countActiveFilters, paramsFromState, removeFilter,
  stateFromParams, EMPTY_FILTERS, type FilterState,
} from "@/lib/filterState";
import type { FacetsResponse, InstitutionListResponse, SearchResponse } from "@/lib/api";
import { FilterButton, FilterDrawer } from "@/components/FilterDrawer";
import { RunsTable } from "@/components/RunsTable";

export default function SearchPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const sp = useSearchParams();
  const [state, setState] = useState<FilterState>(() =>
    stateFromParams(new URLSearchParams(sp.toString())));
  const [page, setPage] = useState(() => Math.max(1, Number(sp.get("page")) || 1));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const facets = useQuery<FacetsResponse>("/search/facets");
  const institutions = useQuery<InstitutionListResponse>("/institutions");

  // Real navigations (top-bar search, links, back/forward) push URL → state.
  const spStr = sp.toString();
  useEffect(() => {
    const p = new URLSearchParams(spStr);
    setState(stateFromParams(p));
    setPage(Math.max(1, Number(p.get("page")) || 1));
  }, [spStr]);

  // State → URL so filtered views are shareable. replaceState does not
  // re-trigger this effect (useSearchParams only tracks real navigations).
  const filterQs = paramsFromState(state).toString();
  useEffect(() => {
    const qs = new URLSearchParams(filterQs);
    if (page > 1) qs.set("page", String(page));
    const url = qs.toString() ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [filterQs, page]);

  const debouncedQs = useDebounced(filterQs, 300);
  const qs = new URLSearchParams(debouncedQs);
  qs.set("page", String(page));
  const { data, error } = useQuery<SearchResponse>(`/search?${qs.toString()}`);

  const change = (next: FilterState) => { setState(next); setPage(1); };
  const chips = chipsFromState(state);
  const exportUrl = `/api/export?format=csv&${filterQs}`;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Search</h1>
        <div className="flex items-center gap-2">
          <a className="btn" href={exportUrl}>Export CSV</a>
          <FilterButton count={countActiveFilters(state)} onClick={() => setDrawerOpen(true)} />
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <span key={c.key} className="chip">
              {c.label}
              <button aria-label={`Remove filter ${c.label}`}
                onClick={() => change(removeFilter(state, c.key))}>✕</button>
            </span>
          ))}
          <button className="text-xs text-[var(--text-dim)] hover:text-[var(--accent)]"
            onClick={() => change(EMPTY_FILTERS)}>
            Clear all
          </button>
        </div>
      )}

      <p className="text-sm text-[var(--text-dim)]">
        {data ? `${data.total.toLocaleString()} runs` : "…"}
      </p>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <div className="card overflow-x-auto p-0">
        {data ? <RunsTable runs={data.items} /> : <p className="p-4">Loading…</p>}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
        <span className="px-2 text-[var(--text-dim)]">Page {page} of {totalPages}</span>
      </div>

      <FilterDrawer
        state={state}
        onChange={change}
        platforms={(facets.data?.platforms ?? []).map((p) => p.name)}
        institutions={(institutions.data?.items ?? []).map((i) => i.name)}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
