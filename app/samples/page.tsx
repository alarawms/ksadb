"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useQuery } from "@/lib/useQuery";
import type { SampleOut } from "@/lib/api";
import { RunsTable } from "@/components/RunsTable";

export default function SamplesPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <SamplesInner />
    </Suspense>
  );
}

function SamplesInner() {
  const acc = useSearchParams().get("acc");
  const { data, error } = useQuery<SampleOut>(acc ? `/samples/${acc}` : null);

  if (!acc) return <p>No BioSample accession given.</p>;
  if (error) return <p className="text-red-600">Sample {acc} not found.</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{data.biosample_accession}</h1>
      <p className="text-sm text-gray-600">
        {data.runs.length} runs · projects:{" "}
        {data.projects.map((p, i) => (
          <span key={p}>
            {i > 0 && ", "}
            <Link className="text-blue-600 hover:underline" href={`/project?id=${p}`}>{p}</Link>
          </span>
        ))}
      </p>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <RunsTable runs={data.runs} />
      </div>
    </div>
  );
}
