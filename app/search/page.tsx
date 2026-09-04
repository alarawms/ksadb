"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useQuery } from "@/lib/useQuery";
import type { SearchResponse } from "@/lib/api";
import { FilterBar } from "@/components/FilterBar";
import { RunsTable } from "@/components/RunsTable";

const FILTER_KEYS = ["q", "organism", "platform", "institution", "year_from", "year_to", "source", "saudi_only"];

function buildQuery(sp: URLSearchParams, page: number): string {
  const qs = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = sp.get(key);
    if (value) qs.set(key, value);
  }
  qs.set("page", String(page));
  return qs.toString();
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const sp = useSearchParams();
  const page = Math.max(1, Number(sp.get("page") ?? "1") || 1);
  const qs = buildQuery(sp, page);
  const { data, error } = useQuery<SearchResponse>(`/search?${qs}`);

  const defaults = Object.fromEntries(FILTER_KEYS.map((k) => [k, sp.get(k) ?? ""]));
  const exportUrl = `/api/export?format=csv&${buildQuery(sp, 1).replace(/&?page=1/, "")}`;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Search</h1>
      <FilterBar defaults={defaults} />
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {data ? `${data.total.toLocaleString()} runs` : "…"}
        </p>
        <a href={exportUrl} className="rounded border bg-white px-3 py-1 text-sm hover:bg-gray-100">
          Export CSV
        </a>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {!data && !error && <p>Loading…</p>}
      {data && (
        <>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <RunsTable runs={data.items} />
          </div>
          <div className="flex gap-2 text-sm">
            {page > 1 && (
              <Link className="rounded border bg-white px-3 py-1"
                href={`/search?${buildQuery(sp, page - 1)}`}>Previous</Link>
            )}
            {page < Math.max(1, Math.ceil(data.total / data.page_size)) && (
              <Link className="rounded border bg-white px-3 py-1"
                href={`/search?${buildQuery(sp, page + 1)}`}>Next</Link>
            )}
            <span className="px-2 py-1 text-gray-600">Page {page}</span>
          </div>
        </>
      )}
    </div>
  );
}
