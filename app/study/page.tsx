"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";

import { RunTableV2, toCollectionItem } from "@/components/RunTableV2";
import type { V2StudyDetail } from "@/lib/api";
import {
  addItems, loadCollection, saveCollection, toggleItem, type CollectionItem,
} from "@/lib/collection";
import { useQuery } from "@/lib/useQuery";

export default function StudyPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <StudyInner />
    </Suspense>
  );
}

function StudyInner() {
  const id = useSearchParams().get("id");
  const { data: study, error } = useQuery<V2StudyDetail>(
    id ? `/v2/studies/${id}` : null,
  );
  const [collection, setCollection] = useState<CollectionItem[]>(loadCollection);

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

  if (!id) return <p>No study accession given.</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!study) return <p>Loading…</p>;

  const addAll = () => {
    setCollection((prev) => {
      const next = addItems(prev, study.runs.map(toCollectionItem));
      saveCollection(next);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{study.accession}</h1>
          {study.title && <p className="text-dim">{study.title}</p>}
          <p className="text-sm text-dim">
            {study.runs.length.toLocaleString()} runs
            {study.submitted_date ? ` · submitted ${study.submitted_date.slice(0, 10)}` : ""}
            {study.submitter ? " · " : ""}
            {study.submitter && (
              <Link className="link" href={`/institution?name=${encodeURIComponent(study.submitter)}`}>
                {study.submitter}
              </Link>
            )}
          </p>
        </div>
        <button className="btn shrink-0" onClick={addAll} disabled={study.runs.length === 0}>
          Add all runs to collection
        </button>
      </div>
      {study.abstract && (
        <div className="card p-4">
          <h2 className="mb-1 font-semibold">Abstract</h2>
          <p className="text-sm whitespace-pre-wrap text-[var(--text-dim)]">{study.abstract}</p>
        </div>
      )}
      <div className="card overflow-x-auto p-0">
        <RunTableV2 runs={study.runs} inCollection={inCollection} onToggle={onToggle} />
      </div>
    </div>
  );
}
