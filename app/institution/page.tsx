"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useQuery } from "@/lib/useQuery";
import type { InstitutionOut } from "@/lib/api";
import { StatCard } from "@/components/StatCard";

export default function InstitutionPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <InstitutionInner />
    </Suspense>
  );
}

function InstitutionInner() {
  const name = useSearchParams().get("name");
  const { data: inst, error } = useQuery<InstitutionOut>(
    name ? `/institutions/${encodeURIComponent(name)}` : null
  );

  if (!name) return <p>No institution given.</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!inst) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {inst.name}{" "}
        {inst.is_saudi && (
          <span className="badge badge-accent">Saudi</span>
        )}
      </h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Runs" value={inst.runs.toLocaleString()} />
        <StatCard label="Total bases (Gb)"
          value={(inst.total_bases / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })} />
        <StatCard label="BioProjects" value={inst.unique_bioprojects.toLocaleString()} />
      </div>
    </div>
  );
}
