"use client";

import type { ReactNode } from "react";

import { V2PieChart, V2TopBarChart, V2TrendChart } from "@/components/Charts";
import { StatCard } from "@/components/StatCard";
import type {
  V2MonthPoint, V2StatsSummary, V2TopRow,
} from "@/lib/api";
import { useQuery, type QueryState } from "@/lib/useQuery";

// R2 aggregates are only uploaded after the first successful nightly sync;
// until then the endpoints 404. Treat "not built yet" as an empty state,
// not an error.
const EMPTY_NOTE = "No data yet — aggregates are built by the nightly sync.";

function ChartCard<T>({ query, title, children }: {
  query: QueryState<T>;
  title: string;
  children: (data: T) => ReactNode;
}) {
  let body: ReactNode;
  if (query.loading) {
    body = <p className="p-4">Loading…</p>;
  } else if (query.error) {
    body = query.error.includes("404")
      ? <p className="p-4 text-[var(--text-dim)]">{EMPTY_NOTE}</p>
      : <p className="text-danger p-4">{query.error}</p>;
  } else if (Array.isArray(query.data) && query.data.length === 0) {
    body = <p className="p-4 text-[var(--text-dim)]">{EMPTY_NOTE}</p>;
  } else if (query.data) {
    body = children(query.data);
  }
  return (
    <div className="card">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {body}
    </div>
  );
}

export default function InsightsPage() {
  const summary = useQuery<V2StatsSummary>("/v2/stats/summary");
  const byMonth = useQuery<V2MonthPoint[]>("/v2/stats/by-month");
  const byCountry = useQuery<V2TopRow[]>("/v2/stats/by-country");
  const byOrganism = useQuery<V2TopRow[]>("/v2/stats/by-organism");
  const bySubmitter = useQuery<V2TopRow[]>("/v2/stats/by-submitter");
  const byPlatform = useQuery<V2TopRow[]>("/v2/stats/by-platform");
  const byStrategy = useQuery<V2TopRow[]>("/v2/stats/by-strategy");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Insights</h1>

      <ChartCard query={summary} title="Overview">
        {(s) => (
          // summary.json can be `{}` before the first sync — fall back to 0s.
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Runs" value={(s.runs ?? 0).toLocaleString()} />
            <StatCard label="Studies" value={(s.studies ?? 0).toLocaleString()} />
            <StatCard label="Samples" value={(s.samples ?? 0).toLocaleString()} />
            <StatCard
              label="Total size (Gb)"
              value={((s.bytes ?? 0) / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            />
          </div>
        )}
      </ChartCard>

      <ChartCard query={byMonth} title={"Runs & bytes per month"}>
        {(rows) => <V2TrendChart data={rows} />}
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard query={byCountry} title="Top 20 countries">
          {(rows) => <V2TopBarChart data={rows} title="" />}
        </ChartCard>
        <ChartCard query={bySubmitter} title="Top 20 submitters">
          {(rows) => <V2TopBarChart data={rows} title="" />}
        </ChartCard>
        <ChartCard query={byOrganism} title="Top 20 organisms">
          {(rows) => <V2TopBarChart data={rows} title="" />}
        </ChartCard>
        <ChartCard query={byPlatform} title="Platforms">
          {(rows) => <V2PieChart data={rows} title="" />}
        </ChartCard>
        <ChartCard query={byStrategy} title="Library strategies">
          {(rows) => <V2PieChart data={rows} title="" />}
        </ChartCard>
      </div>
    </div>
  );
}
