"use client";

import { useEffect, useState } from "react";

import { useQuery } from "@/lib/useQuery";
import type { InstitutionOut, TopRow } from "@/lib/api";

export default function ComparePage() {
  const { data: insts } = useQuery<TopRow[]>("/stats/top?dimension=institution&n=50");
  const [selected, setSelected] = useState<string[]>([]);
  const [details, setDetails] = useState<InstitutionOut[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!selected.length) {
      setDetails([]);
      return;
    }
    Promise.all(
      selected.map((name) =>
        fetch(`/api/institutions/${encodeURIComponent(name)}`).then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<InstitutionOut>;
        })
      )
    )
      .then((rows) => { if (!cancelled) setDetails(rows); })
      .catch(() => { if (!cancelled) setDetails([]); });
    return () => { cancelled = true; };
  }, [selected.join("|")]);

  const add = (name: string) => {
    if (name && !selected.includes(name)) setSelected([...selected, name]);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Compare institutions</h1>
      <div className="flex flex-wrap items-center gap-2 card">
        <select
          className="input"
          value=""
          onChange={(e) => add(e.target.value)}
        >
          <option value="">Add institution…</option>
          {(insts ?? []).map((i) => (
            <option key={i.name} value={i.name}>{i.name}</option>
          ))}
        </select>
        {selected.map((name) => (
          <span key={name} className="flex items-center gap-1 chip">
            {name}
            <button onClick={() => setSelected(selected.filter((n) => n !== name))}>×</button>
          </span>
        ))}
      </div>
      {details.length > 0 && (
        <div className="overflow-x-auto card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-2)]">
              <tr>
                <th className="p-2">Metric</th>
                {details.map((d) => <th key={d.name} className="p-2">{d.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]">
                <td className="p-2 text-dim">Saudi</td>
                {details.map((d) => <td key={d.name} className="p-2">{d.is_saudi ? "Yes" : "No"}</td>)}
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="p-2 text-dim">Runs</td>
                {details.map((d) => <td key={d.name} className="p-2">{d.runs.toLocaleString()}</td>)}
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="p-2 text-dim">Bases (Gb)</td>
                {details.map((d) => (
                  <td key={d.name} className="p-2">
                    {(d.total_bases / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 text-dim">BioProjects</td>
                {details.map((d) => <td key={d.name} className="p-2">{d.unique_bioprojects.toLocaleString()}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
