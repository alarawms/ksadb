import Link from "next/link";

import { apiGet, PUBLIC_API, SearchResponse } from "@/lib/api";
import { FilterBar } from "@/components/FilterBar";
import { RunsTable } from "@/components/RunsTable";

const FILTER_KEYS = ["q", "organism", "platform", "institution", "year_from", "year_to", "source", "saudi_only"];

function buildQuery(searchParams: Record<string, string | undefined>, page: number): string {
  const qs = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = searchParams[key];
    if (value) qs.set(key, value);
  }
  qs.set("page", String(page));
  return qs.toString();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const qs = buildQuery(searchParams, page);
  const data = await apiGet<SearchResponse>(`/search?${qs}`);
  const totalPages = Math.max(1, Math.ceil(data.total / data.page_size));
  const exportUrl = `${PUBLIC_API}/api/export?format=csv&${buildQuery(searchParams, 1).replace(/&?page=1/, "")}`;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Search</h1>
      <FilterBar defaults={Object.fromEntries(
        Object.entries(searchParams).filter(([, v]) => v !== undefined)
      ) as Record<string, string>} />
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{data.total.toLocaleString()} runs</p>
        <a href={exportUrl} className="rounded border bg-white px-3 py-1 text-sm hover:bg-gray-100">
          Export CSV
        </a>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <RunsTable runs={data.items} />
      </div>
      <div className="flex gap-2 text-sm">
        {page > 1 && (
          <Link className="rounded border bg-white px-3 py-1"
            href={`/search?${buildQuery(searchParams, page - 1)}`}>Previous</Link>
        )}
        {page < totalPages && (
          <Link className="rounded border bg-white px-3 py-1"
            href={`/search?${buildQuery(searchParams, page + 1)}`}>Next</Link>
        )}
        <span className="px-2 py-1 text-gray-600">Page {page} / {totalPages}</span>
      </div>
    </div>
  );
}
