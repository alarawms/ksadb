"use client";

import { useQuery } from "@/lib/useQuery";
import type { PathogensResponse } from "@/lib/api";
import { TopBarChart, TrendChart } from "@/components/Charts";

export default function PathogensPage() {
  const { data, error } = useQuery<PathogensResponse>("/pathogens");

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pathogen sequencing</h1>
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-2 font-semibold">Pathogen runs per year</h3>
        <TrendChart data={data.by_year} />
      </div>
      <div className="rounded-lg border bg-white p-4">
        <TopBarChart data={data.top} title="Top pathogenic organisms" />
      </div>
    </div>
  );
}
