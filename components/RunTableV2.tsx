"use client";

import Link from "next/link";

import type { CollectionItem } from "@/lib/collection";
import type { V2Run } from "@/lib/api";
import { formatGb, parseFastqBytes } from "@/lib/format";

interface Props {
  runs: V2Run[];
  inCollection: Set<string>;
  onToggle: (item: CollectionItem) => void;
}

function toCollectionItem(r: V2Run): CollectionItem {
  return {
    accession: r.run_accession,
    type: "run",
    fastq_ftp: r.fastq_ftp,
    fastq_md5: null,
    // ENA returns fastq_bytes as a string (semicolon-delimited per-file
    // sizes), so coerce to a numeric total.
    fastq_bytes: parseFastqBytes(r.fastq_bytes),
    organism: r.organism,
    country: r.country,
  };
}

export function RunTableV2({ runs, inCollection, onToggle }: Props) {
  return (
    <table className="w-full text-left text-sm">
      <thead style={{ background: "var(--surface-2)", borderColor: "var(--border)" }} className="border-b">
        <tr>
          <th className="th w-6" aria-label="In collection" />
          <th className="th">Run</th>
          <th className="th">Study</th>
          <th className="th">Organism</th>
          <th className="th">Submitter</th>
          <th className="th">Platform</th>
          <th className="th">Strategy</th>
          <th className="th">Date</th>
          <th className="th text-right">Reads</th>
          <th className="th text-right">Size</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((r) => {
          const item = toCollectionItem(r);
          return (
            <tr key={r.run_accession} className="border-b hover:bg-[var(--surface-2)]"
              style={{ borderColor: "var(--border)" }}>
              <td className="p-2">
                <input type="checkbox" aria-label={`Add ${r.run_accession} to collection`}
                  checked={inCollection.has(r.run_accession)}
                  onChange={() => onToggle(item)} />
              </td>
              <td className="p-2 font-mono">
                <Link className="link" href={`/run?id=${r.run_accession}`}>
                  {r.run_accession}
                </Link>
              </td>
              <td className="p-2 font-mono">
                <Link className="link" href={`/study?id=${r.study_accession}`}>
                  {r.study_accession}
                </Link>
              </td>
              <td className="p-2">{r.organism ?? "—"}</td>
              <td className="p-2">
                {r.submitter ? (
                  <Link className="link" href={`/institution?name=${encodeURIComponent(r.submitter)}`}>
                    {r.submitter}
                  </Link>
                ) : "—"}
              </td>
              <td className="p-2">{r.platform ?? "—"}</td>
              <td className="p-2">{r.library_strategy ?? "—"}</td>
              <td className="p-2 whitespace-nowrap">{r.submitted_date?.slice(0, 10) ?? "—"}</td>
              <td className="p-2 text-right tabular-nums">
                {r.spots != null ? r.spots.toLocaleString() : "—"}
              </td>
              <td className="p-2 text-right tabular-nums">{formatGb(parseFastqBytes(r.fastq_bytes))}</td>
            </tr>
          );
        })}
        {runs.length === 0 && (
          <tr>
            <td colSpan={10} className="p-6 text-center text-[var(--text-dim)]">
              No runs to display.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
