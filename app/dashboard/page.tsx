import { apiGet, StatsSummary, TimeseriesPoint, TopRow } from "@/lib/api";
import { StatCard } from "@/components/StatCard";
import { TopBarChart, TrendChart } from "@/components/Charts";

// Task 9 neutralization: the API is now same-origin, so it cannot be reached
// during static prerender (relative URL, no server at build time). force-static
// keeps the no-store fetch from marking the route dynamic; the catch renders a
// placeholder. Task 10 rewrites this page as a client component.
export const dynamic = "force-static";

export default async function DashboardPage() {
  let summary: StatsSummary;
  let ts: TimeseriesPoint[];
  let orgs: TopRow[];
  let plats: TopRow[];
  let insts: TopRow[];
  try {
    [summary, ts, orgs, plats, insts] = await Promise.all([
      apiGet<StatsSummary>("/stats/summary"),
      apiGet<TimeseriesPoint[]>("/stats/timeseries"),
      apiGet<TopRow[]>("/stats/top?dimension=organism"),
      apiGet<TopRow[]>("/stats/top?dimension=platform"),
      apiGet<TopRow[]>("/stats/top?dimension=institution"),
    ]);
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Runs" value={summary.total_runs.toLocaleString()} />
        <StatCard label="BioProjects" value={summary.unique_bioprojects.toLocaleString()} />
        <StatCard label="BioSamples" value={summary.unique_biosamples.toLocaleString()} />
        <StatCard
          label="Total bases (Gb)"
          value={(summary.total_bases / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })}
        />
      </div>
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 font-semibold">Runs per year</h3>
        <TrendChart data={ts} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <TopBarChart data={orgs} title="Top organisms" />
        </div>
        <div className="rounded-lg border bg-white p-4">
          <TopBarChart data={plats} title="Top platforms" />
        </div>
        <div className="col-span-full rounded-lg border bg-white p-4">
          <TopBarChart data={insts} title="Top institutions" />
        </div>
      </div>
    </div>
  );
}
