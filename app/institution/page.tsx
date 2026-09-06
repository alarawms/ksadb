"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useQuery } from "@/lib/useQuery";
import type { InstitutionListResponse, InstitutionOut } from "@/lib/api";
import { StatCard } from "@/components/StatCard";

export default function InstitutionPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <InstitutionInner />
    </Suspense>
  );
}

function TopInstitutions() {
  const { data, error } = useQuery<InstitutionListResponse>("/institutions");
  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <p>Loading…</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Institutions</h1>
      <p className="text-sm text-dim">
        Top {data.items.length} submitting institutions by run count — click one for details.
      </p>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead style={{ background: "var(--surface-2)", borderColor: "var(--border)" }} className="border-b">
            <tr>
              <th className="th">Institution</th>
              <th className="th">Country</th>
              <th className="th text-right">Runs</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((i) => (
              <tr key={i.name} className="border-b hover:bg-[var(--surface-2)]"
                style={{ borderColor: "var(--border)" }}>
                <td className="p-2">
                  <Link className="link" href={`/institution?name=${encodeURIComponent(i.name)}`}>
                    {i.name}
                  </Link>
                </td>
                <td className="p-2">{i.is_saudi ? "Saudi Arabia" : "—"}</td>
                <td className="p-2 text-right tabular-nums">{i.runs.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InstitutionInner() {
  const name = useSearchParams().get("name");
  const { data: inst, error } = useQuery<InstitutionOut>(
    name ? `/institutions/${encodeURIComponent(name)}` : null
  );

  if (!name) return <TopInstitutions />;
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
