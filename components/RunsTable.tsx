import Link from "next/link";

import type { RunItem } from "@/lib/api";

export function RunsTable({ runs }: { runs: RunItem[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b bg-gray-100">
        <tr>
          <th className="p-2">Run</th><th className="p-2">Organism</th>
          <th className="p-2">Platform</th><th className="p-2">Institution</th>
          <th className="p-2">Source</th><th className="p-2">Year</th>
          <th className="p-2 text-right">Bases</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr key={r.run_accession} className="border-b hover:bg-gray-50">
            <td className="p-2">
              <Link className="text-blue-600 hover:underline" href={`/record?id=${r.run_accession}`}>
                {r.run_accession}
              </Link>
            </td>
            <td className="p-2">{r.organism}</td>
            <td className="p-2">{r.platform}</td>
            <td className="p-2">
              {r.institution_name ? (
                <Link className="text-blue-600 hover:underline"
                  href={`/institution?name=${encodeURIComponent(r.institution_name)}`}>
                  {r.institution_name}
                </Link>
              ) : "—"}
            </td>
            <td className="p-2">{r.source}</td>
            <td className="p-2">{r.year}</td>
            <td className="p-2 text-right">{r.total_bases?.toLocaleString() ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
