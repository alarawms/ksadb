"use client";

import { useQuery } from "@/lib/useQuery";
import type { HumanStats } from "@/lib/api";
import { TopBarChart, TrendChart } from "@/components/Charts";
import { StatCard } from "@/components/StatCard";

export default function HumanPage() {
  const { data, error } = useQuery<HumanStats>("/stats/human");

  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Human sequencing</h1>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Human runs" value={data.total_runs.toLocaleString()} />
        <StatCard label="Human bases (Gb)"
          value={(data.total_bases / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })} />
      </div>
      <div className="card">
        <h3 className="mb-2 font-semibold">Human runs per year</h3>
        <TrendChart data={data.by_year} />
      </div>
      <div className="card">
        <TopBarChart data={data.top_institutions} title="Top human-data submitters" />
      </div>
    </div>
  );
}
