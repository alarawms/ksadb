import Link from "next/link";

import type { RunItem } from "@/lib/api";
import { formatBases } from "@/lib/format";

function Flags({ r }: { r: RunItem }) {
  return (
    <span className="inline-flex gap-1">
      {r.is_saudi_submitter && <span className="badge badge-accent">Saudi</span>}
      {r.is_pathogen && <span className="badge badge-accent">Pathogen</span>}
      {r.is_wgs && <span className="badge">WGS</span>}
    </span>
  );
}

export function RunsTable({ runs }: { runs: RunItem[] }) {
  return (
    <table className="table-zebra w-full text-left text-sm">
      <thead style={{ background: "var(--surface-2)", borderColor: "var(--border)" }} className="border-b">
        <tr>
          <th className="th">Run</th>
          <th className="th">Organism</th>
          <th className="th">Platform</th>
          <th className="th">Institution</th>
          <th className="th">Src</th>
          <th className="th">Year</th>
          <th className="th">Flags</th>
          <th className="th text-right">Bases</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr key={r.run_accession} className="border-b hover:bg-[var(--surface-2)]"
            style={{ borderColor: "var(--border)" }}>
            <td className="p-2 font-mono">
              <Link className="link" href={`/run?id=${r.run_accession}`}>
                {r.run_accession}
              </Link>
            </td>
            <td className="p-2">{r.organism ?? "—"}</td>
            <td className="p-2">
              {r.platform ?? "—"}
              {r.instrument_model ? <span className="text-[var(--text-dim)]"> · {r.instrument_model}</span> : null}
            </td>
            <td className="p-2">
              {r.institution_name ? (
                <Link className="link"
                  href={`/institution?name=${encodeURIComponent(r.institution_name)}`}>
                  {r.institution_name}
                </Link>
              ) : "—"}
            </td>
            <td className="p-2">
              <span className="badge">{r.source}</span>
            </td>
            <td className="p-2">{r.year ?? "—"}</td>
            <td className="p-2"><Flags r={r} /></td>
            <td className="p-2 text-right tabular-nums">{formatBases(r.total_bases)}</td>
          </tr>
        ))}
        {runs.length === 0 && (
          <tr>
            <td colSpan={8} className="p-6 text-center text-[var(--text-dim)]">
              No runs to display.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
