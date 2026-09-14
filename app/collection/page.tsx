"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  collectionBytes, loadCollection, saveCollection, type CollectionItem,
} from "@/lib/collection";
import {
  toCurlScript, toManifest, toSamplesheet, toSraToolsScript,
} from "@/lib/exporters";
import { formatGb } from "@/lib/format";

const EXPORTERS = {
  curl: { label: "curl script", file: "collection-curl.sh", render: toCurlScript },
  "sra-tools": { label: "sra-tools script", file: "collection-sra-tools.sh", render: toSraToolsScript },
  samplesheet: { label: "samplesheet (CSV)", file: "collection-samplesheet.csv", render: toSamplesheet },
  manifest: { label: "JSON manifest", file: "collection-manifest.json", render: toManifest },
} as const;

type ExportKind = keyof typeof EXPORTERS;

export default function CollectionPage() {
  const [items, setItems] = useState<CollectionItem[]>(loadCollection);
  const [exportKind, setExportKind] = useState<ExportKind>("curl");

  const grouped = useMemo(() => {
    const byType = new Map<string, CollectionItem[]>();
    for (const item of items) {
      const list = byType.get(item.type) ?? [];
      list.push(item);
      byType.set(item.type, list);
    }
    return [...byType.entries()];
  }, [items]);

  const summary = useMemo(() => {
    const organisms = new Set(items.map((i) => i.organism).filter(Boolean));
    const countries = new Set(items.map((i) => i.country).filter(Boolean));
    return `${items.length} ${items.length === 1 ? "item" : "items"}, ~${formatGb(collectionBytes(items))}, ${organisms.size} organisms, ${countries.size} countries`;
  }, [items]);

  const removeItem = (accession: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.accession !== accession);
      saveCollection(next);
      return next;
    });
  };

  const clearAll = () => {
    if (!window.confirm(`Remove all ${items.length} items from the collection?`)) return;
    setItems(() => {
      saveCollection([]);
      return [];
    });
  };

  const download = () => {
    const exporter = EXPORTERS[exportKind];
    const text = exporter.render(items);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exporter.file;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Collection</h1>
        <p className="text-[var(--text-dim)]">
          Collection is empty. Tick runs in the{" "}
          <Link className="link" href="/explore">explore</Link> view to add them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Collection</h1>
        <button className="btn" onClick={clearAll}>Clear all</button>
      </div>
      <p className="text-sm text-[var(--text-dim)]">{summary}</p>

      <div className="flex items-center gap-2">
        <label className="text-sm" htmlFor="export-as">Export as</label>
        <select id="export-as" className="input" value={exportKind}
          onChange={(e) => setExportKind(e.target.value as ExportKind)}>
          {Object.entries(EXPORTERS).map(([kind, e]) => (
            <option key={kind} value={kind}>{e.label}</option>
          ))}
        </select>
        <button className="btn" onClick={download}>Download</button>
      </div>

      {grouped.map(([type, list]) => (
        <div key={type} className="card overflow-x-auto p-0">
          <h2 className="p-3 font-semibold capitalize">{type}s ({list.length})</h2>
          <table className="w-full text-left text-sm">
            <thead style={{ background: "var(--surface-2)", borderColor: "var(--border)" }} className="border-b">
              <tr>
                <th className="th">Accession</th>
                <th className="th">Organism</th>
                <th className="th">Country</th>
                <th className="th">FASTQ</th>
                <th className="th text-right">Size</th>
                <th className="th" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.accession} className="border-b hover:bg-[var(--surface-2)]"
                  style={{ borderColor: "var(--border)" }}>
                  <td className="p-2 font-mono">
                    <Link className="link" href={`/run?id=${item.accession}`}>{item.accession}</Link>
                  </td>
                  <td className="p-2">{item.organism ?? "—"}</td>
                  <td className="p-2">{item.country ?? "—"}</td>
                  <td className="p-2 break-all">{item.fastq_ftp ?? "—"}</td>
                  <td className="p-2 text-right tabular-nums">{formatGb(item.fastq_bytes)}</td>
                  <td className="p-2 text-right">
                    <button className="btn px-2 py-1" aria-label={`Remove ${item.accession}`}
                      onClick={() => removeItem(item.accession)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
