"use client";

import { useQuery } from "@/lib/useQuery";
import type { TimeseriesPoint, TopRow } from "@/lib/api";
import { TopBarChart, TrendChart } from "@/components/Charts";
import { StatCard } from "@/components/StatCard";

export default function GenomesPage() {
  const wgs = useQuery<TimeseriesPoint[]>("/stats/wgs-trend");
  const strategies = useQuery<TopRow[]>("/stats/library-strategies");

  const failed = [wgs, strategies].find((q) => q.error);
  if (failed) return <p className="text-danger">{failed.error}</p>;
  if (!wgs.data || !strategies.data) return <p>Loading…</p>;

  const totalRuns = wgs.data.reduce((s, p) => s + p.runs, 0);
  const totalBases = wgs.data.reduce((s, p) => s + p.total_bases, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Whole-genome sequencing</h1>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="WGS runs" value={totalRuns.toLocaleString()} />
        <StatCard label="WGS bases (Gb)"
          value={(totalBases / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })} />
      </div>
      <div className="card">
        <h3 className="mb-2 font-semibold">WGS runs per year</h3>
        <TrendChart data={wgs.data} />
      </div>
      <div className="card">
        <TopBarChart data={strategies.data} title="Library strategies (all runs)" />
      </div>
    </div>
  );
}
