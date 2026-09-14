"use client";

import Link from "next/link";

import { V2TopBarChart, V2TrendChart } from "@/components/Charts";
import { StatCard } from "@/components/StatCard";
import type { V2MonthPoint, V2StatsSummary, V2TopRow } from "@/lib/api";
import { useQuery } from "@/lib/useQuery";

const TASKS = [
  { href: "/search", title: "Search & filter",
    blurb: "Facet-filter Saudi runs by organism, platform, submitter, date." },
  { href: "/explore", title: "Semantic explore",
    blurb: "Natural-language search over studies, samples and runs." },
  { href: "/collection", title: "Collection & export",
    blurb: "Build an accession basket; export curl, sra-tools or samplesheet scripts." },
  { href: "/institution", title: "Institutions",
    blurb: "Submitter leaderboard and per-institution breakdowns." },
];

function fmtBytes(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)} TB`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  return `${n} B`;
}

export default function DashboardPage() {
  const summary = useQuery<V2StatsSummary>("/v2/stats/summary");
  const months = useQuery<V2MonthPoint[]>("/v2/stats/by-month");
  const organisms = useQuery<V2TopRow[]>("/v2/stats/by-organism");
  const platforms = useQuery<V2TopRow[]>("/v2/stats/by-platform");
  const submitters = useQuery<V2TopRow[]>("/v2/stats/by-submitter");

  const failed = [summary, months, organisms, platforms, submitters].find((q) => q.error);
  if (failed) return <p className="text-danger">{failed.error}</p>;

  const s = summary.data;

  return (
    <div className="space-y-6">
      <div className="card space-y-3" style={{ borderTop: "3px solid var(--accent)" }}>
        <div>
          <h1 className="text-2xl font-bold">Saudi Sequence Database</h1>
          <p className="text-sm text-[var(--text-dim)]">
            Sequence-archive metadata from ENA, scoped to Saudi Arabia
            (country=SA). No raw reads stored — export accessions and fetch
            with sra-tools or ENA FTP.
          </p>
        </div>
        <form method="GET" action="/search" className="flex gap-2">
          <input
            name="q"
            className="input flex-1"
            placeholder="Search accessions, organisms, submitters, study titles…"
          />
          <button type="submit" className="btn-accent">Search</button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Runs" value={s ? s.runs.toLocaleString() : "…"} />
        <StatCard label="Studies" value={s ? s.studies.toLocaleString() : "…"} />
        <StatCard label="Samples" value={s ? s.samples.toLocaleString() : "…"} />
        <StatCard label="Data volume" value={s ? fmtBytes(s.bytes) : "…"} />
        <StatCard
          label="Coverage"
          value={s?.date_min && s?.date_max ? `${s.date_min.slice(0, 4)}–${s.date_max.slice(0, 4)}` : "…"}
          hint="submission dates"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TASKS.map((t) => (
          <Link key={t.href} href={t.href} className="card block hover:border-[var(--accent)]">
            <h3 className="font-semibold" style={{ color: "var(--accent)" }}>{t.title}</h3>
            <p className="mt-1 text-sm text-[var(--text-dim)]">{t.blurb}</p>
          </Link>
        ))}
      </div>

      <div className="card">
        <V2TrendChart data={months.data ?? []} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <V2TopBarChart data={organisms.data ?? []} title="Top organisms" limit={10} />
        </div>
        <div className="card">
          <V2TopBarChart data={platforms.data ?? []} title="Top platforms" limit={10} />
        </div>
        <div className="col-span-full card">
          <V2TopBarChart data={submitters.data ?? []} title="Top submitters" limit={10} />
        </div>
      </div>
    </div>
  );
}
