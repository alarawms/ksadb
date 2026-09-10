"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type FormEvent } from "react";

import { CollectionBar } from "@/components/CollectionBar";
import { RunTableV2 } from "@/components/RunTableV2";
import { V2Filters } from "@/components/V2Filters";
import type { V2FacetsResponse, V2SearchResponse } from "@/lib/api";
import {
  loadCollection, saveCollection, toggleItem, type CollectionItem,
} from "@/lib/collection";
import {
  semanticBadge, semanticTitle, type SemanticMatch,
} from "@/lib/semanticMatch";
import { useDebounced } from "@/lib/useDebounced";
import { useQuery } from "@/lib/useQuery";

const EMPTY_FACETS: V2FacetsResponse = {
  countries: [], platforms: [], strategies: [], submitters: [], organisms: [],
};

async function postJson(path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function ExplorePage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [collection, setCollection] = useState<CollectionItem[]>(loadCollection);
  const [semantic, setSemantic] = useState("");
  const [matches, setMatches] = useState<SemanticMatch[]>([]);
  const [semanticError, setSemanticError] = useState<string | null>(null);
  const [semanticLoading, setSemanticLoading] = useState(false);

  const facets = useQuery<V2FacetsResponse>("/v2/search/facets");

  const change = (next: Record<string, string>) => {
    setFilters(next);
    setPage(1);
  };

  const debounced = useDebounced(filters, 300);
  const qs = useMemo(() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(debounced)) if (v) p.set(k, v);
    p.set("page", String(page));
    return p.toString();
  }, [debounced, page]);
  const { data, error } = useQuery<V2SearchResponse>(`/v2/search?${qs}`);

  const onToggle = useCallback((item: CollectionItem) => {
    setCollection((prev) => {
      const next = toggleItem(prev, item);
      saveCollection(next);
      return next;
    });
  }, []);
  const inCollection = useMemo(
    () => new Set(collection.map((c) => c.accession)),
    [collection],
  );

  const runSemantic = async (e: FormEvent) => {
    e.preventDefault();
    const query = semantic.trim();
    if (!query) return;
    setSemanticLoading(true);
    setSemanticError(null);
    try {
      const [parsed, similar] = await Promise.all([
        postJson("/api/v2/parse-query", { query }),
        postJson("/api/v2/semantic", { query }),
      ]);
      const parsedFilters = parsed?.filters;
      if (parsedFilters && typeof parsedFilters === "object") {
        change({ ...filters, ...(parsedFilters as Record<string, string>) });
      }
      if (similar?.error) {
        setSemanticError(
          typeof similar.message === "string" ? similar.message : "Semantic search failed",
        );
        setMatches([]);
      } else {
        setMatches((similar?.matches as SemanticMatch[] | undefined) ?? []);
      }
    } catch (err) {
      setSemanticError(String(err));
      setMatches([]);
    } finally {
      setSemanticLoading(false);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <div className="space-y-4 pb-14">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Explore</h1>
        <Link className="btn" href="/collection">Export collection</Link>
      </div>

      <form className="card flex items-center gap-2 p-4" onSubmit={runSemantic}>
        <input className="input w-full" placeholder="Ask in plain language, e.g. Saudi camel WGS from 2022"
          value={semantic} onChange={(e) => setSemantic(e.target.value)} />
        <button className="btn" type="submit" disabled={semanticLoading}>
          {semanticLoading ? "Parsing…" : "Search"}
        </button>
      </form>
      {semanticError && <p style={{ color: "var(--danger)" }}>{semanticError}</p>}

      <V2Filters value={filters} onChange={change}
        facets={facets.data ?? EMPTY_FACETS} />

      <p className="text-sm text-[var(--text-dim)]">
        {data ? `${data.total.toLocaleString()} runs` : "…"}
      </p>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
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

      {matches.length > 0 && (
        <div className="card space-y-2 p-4">
          <h2 className="font-semibold">Semantically similar studies</h2>
          {matches.map((m) => (
            <div key={m.accession} className="flex items-baseline gap-2 text-sm">
              <span className="shrink-0 badge">{semanticBadge(m.type)}</span>
              <Link className="link shrink-0 font-mono" href={`/study?id=${m.accession}`}>
                {m.accession}
              </Link>
              <span className="truncate">{semanticTitle(m)}</span>
              <span className="shrink-0 text-[var(--text-dim)]">{m.submitter ?? "—"}</span>
              <span className="ml-auto shrink-0 badge">{m.score.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      <CollectionBar items={collection} />
    </div>
  );
}
