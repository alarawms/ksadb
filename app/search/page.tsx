"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { CollectionBar } from "@/components/CollectionBar";
import { RunTableV2 } from "@/components/RunTableV2";
import { V2Filters } from "@/components/V2Filters";
import type { V2FacetsResponse, V2SearchResponse } from "@/lib/api";
import {
  loadCollection, saveCollection, toggleItem, type CollectionItem,
} from "@/lib/collection";
import { useDebounced } from "@/lib/useDebounced";
import { useQuery } from "@/lib/useQuery";

// Saudi scope: country=SA by default (the stack holds the ENA Saudi slice;
// NULL-country samples appear only when the user clears the Country filter).
const DEFAULT_FILTERS: Record<string, string> = { country: "SA" };

const EMPTY_FACETS: V2FacetsResponse = {
  countries: [], platforms: [], strategies: [], submitters: [], organisms: [],
};

export default function SearchPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const sp = useSearchParams();
  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const init = { ...DEFAULT_FILTERS };
    sp.forEach((v, k) => {
      if (k !== "page" && v) init[k] = v;
    });
    return init;
  });
  const [page, setPage] = useState(() => Math.max(1, Number(sp.get("page")) || 1));
  const [collection, setCollection] = useState<CollectionItem[]>(loadCollection);

  const facets = useQuery<V2FacetsResponse>("/v2/search/facets");

  const debounced = useDebounced(filters, 300);
  const qs = new URLSearchParams(debounced);
  qs.set("page", String(page));
  const { data, error } = useQuery<V2SearchResponse>(`/v2/search?${qs.toString()}`);

  const inCollection = new Set(collection.map((c) => c.accession));
  const onToggle = (item: CollectionItem) => {
    setCollection((prev) => {
      const next = toggleItem(prev, item);
      saveCollection(next);
      return next;
    });
  };
  const change = (next: Record<string, string>) => {
    setPage(1);
    setFilters(next);
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Search</h1>
        <a
          className="btn"
          href={`/api/export?format=csv&v2=1&${new URLSearchParams(debounced).toString()}`}
        >
          Export CSV
        </a>
      </div>

      <V2Filters
        value={filters}
        onChange={change}
        facets={facets.data ?? EMPTY_FACETS}
      />

      <p className="text-sm text-[var(--text-dim)]">
        {data ? `${data.total.toLocaleString()} runs` : "…"}
      </p>
      {error && <p className="text-danger">{error}</p>}
      <div className="card overflow-x-auto p-0">
        {data ? (
          <RunTableV2 runs={data.items} inCollection={inCollection} onToggle={onToggle} />
        ) : (
          <p className="p-4">Loading…</p>
        )}
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

      <CollectionBar items={collection} />
    </div>
  );
}
