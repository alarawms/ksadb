"use client";

import { useQuery } from "@/lib/useQuery";
import type { StatsSummary, TimeseriesPoint, TopRow, SaudiSplit, PathogensResponse } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { TopBarChart, TrendChart } from "@/components/Charts";

export default function DashboardPage() {
  const summary = useQuery<StatsSummary>("/stats/summary");
  const ts = useQuery<TimeseriesPoint[]>("/stats/timeseries");
  const orgs = useQuery<TopRow[]>("/stats/top?dimension=organism");
  const plats = useQuery<TopRow[]>("/stats/top?dimension=platform");
  const insts = useQuery<TopRow[]>("/stats/top?dimension=institution");
  const split = useQuery<SaudiSplit>("/stats/saudi-split");
  const strategies = useQuery<TopRow[]>("/stats/library-strategies");
  const pathogens = useQuery<PathogensResponse>("/pathogens");

  const failed = [summary, ts, orgs, plats, insts, split, strategies, pathogens].find((q) => q.error);
  if (failed) return <p className="text-danger">{failed.error}</p>;
  if (!summary.data || !ts.data || !orgs.data || !plats.data || !insts.data || !split.data || !strategies.data || !pathogens.data) {
    return <p>Loading…</p>;
  }
  const s = summary.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Runs" value={s.total_runs.toLocaleString()} />
        <StatCard label="BioProjects" value={s.unique_bioprojects.toLocaleString()} />
        <StatCard label="BioSamples" value={s.unique_biosamples.toLocaleString()} />
        <StatCard
          label="Total bases (Gb)"
          value={(s.total_bases / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })}
        />
      </div>
      <div className="card">
        <h3 className="mb-2 font-semibold">Runs per year</h3>
        <TrendChart data={ts.data} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <TopBarChart
            data={[
              { name: "Saudi", runs: split.data?.saudi?.runs ?? 0, total_bases: split.data?.saudi?.total_bases ?? 0 },
              { name: "Non-Saudi", runs: split.data?.non_saudi?.runs ?? 0, total_bases: split.data?.non_saudi?.total_bases ?? 0 },
            ]}
            title="Runs by submitter origin"
          />
        </div>
        <div className="card">
          <TopBarChart data={strategies.data ?? []} title="Library strategies" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <TopBarChart data={orgs.data} title="Top organisms" />
        </div>
        <div className="card">
          <TopBarChart data={plats.data} title="Top platforms" />
        </div>
        <div className="col-span-full card">
          <TopBarChart data={insts.data} title="Top institutions" />
        </div>
        <div className="col-span-full card">
          <TopBarChart data={pathogens.data?.top ?? []} title="Top pathogens" />
        </div>
      </div>
    </div>
  );
}
