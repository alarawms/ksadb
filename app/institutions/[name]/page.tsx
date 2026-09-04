import { notFound } from "next/navigation";

import { apiGet, InstitutionOut } from "@/lib/api";
import { StatCard } from "@/components/StatCard";

export default async function InstitutionPage({ params }: { params: { name: string } }) {
  let inst: InstitutionOut;
  try {
    // params.name arrives URL-encoded (Next App Router does not decode dynamic
    // segments), so pass it through as-is to avoid double-encoding.
    inst = await apiGet<InstitutionOut>(`/institutions/${params.name}`);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {inst.name}{" "}
        {inst.is_saudi && (
          <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-800">Saudi</span>
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
