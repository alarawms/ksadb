import Link from "next/link";
import { notFound } from "next/navigation";

import { apiGet, RecordOut } from "@/lib/api";

export default async function RecordPage({ params }: { params: { id: string } }) {
  let record: RecordOut;
  try {
    record = await apiGet<RecordOut>(`/records/${params.id}`);
  } catch {
    notFound();
  }

  const fields: [string, string][] = [
    ["Run", record.run_accession],
    ["Organism", record.organism ?? "—"],
    ["Platform", `${record.platform ?? "—"} / ${record.instrument_model ?? "—"}`],
    ["Library", `${record.library_strategy ?? "—"} (${record.year ?? "—"})`],
    ["Bases", record.total_bases?.toLocaleString() ?? "—"],
    ["File size", record.file_size_mb != null ? `${record.file_size_mb.toFixed(1)} MB` : "—"],
    ["Center", record.center_name ?? "—"],
    ["Location", record.geo_loc_name ?? "—"],
    ["Source", record.source],
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{record.run_accession}</h1>
      <div className="flex gap-3 text-sm">
        <a className="text-blue-600 hover:underline" href={record.ncbi_url} target="_blank">NCBI SRA ↗</a>
        <a className="text-blue-600 hover:underline" href={record.ena_url} target="_blank">ENA ↗</a>
        {record.bioproject_accession && (
          <Link className="text-blue-600 hover:underline"
            href={`/projects/${record.bioproject_accession}`}>
            {record.bioproject_accession}
          </Link>
        )}
        {record.institution_name && (
          <Link className="text-blue-600 hover:underline"
            href={`/institutions/${encodeURIComponent(record.institution_name)}`}>
            {record.institution_name}
          </Link>
        )}
      </div>
      <dl className="grid grid-cols-1 gap-2 rounded-lg border bg-white p-4 md:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="w-28 shrink-0 text-sm text-gray-500">{label}</dt>
            <dd className="text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
