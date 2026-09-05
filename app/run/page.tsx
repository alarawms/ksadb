"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useQuery } from "@/lib/useQuery";
import type { RecordOut, SearchResponse } from "@/lib/api";
import { formatBases, formatMb } from "@/lib/format";
import { RunsTable } from "@/components/RunsTable";

export default function RunPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <RunInner />
    </Suspense>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 shrink-0 text-sm text-[var(--text-dim)]">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a className="btn" href={href} target="_blank" rel="noreferrer">
      {children} ↗
    </a>
  );
}

function RelatedRuns({ title, query, exclude }: { title: string; query: string | null; exclude: string }) {
  const { data } = useQuery<SearchResponse>(query);
  const runs = (data?.items ?? []).filter((r) => r.run_accession !== exclude);
  if (!query || !data || runs.length === 0) return null;
  return (
    <div className="card p-0">
      <div className="flex items-baseline justify-between border-b p-3"
        style={{ borderColor: "var(--border)" }}>
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-[var(--text-dim)]">{data.total.toLocaleString()} runs</span>
      </div>
      <div className="overflow-x-auto">
        <RunsTable runs={runs} />
      </div>
    </div>
  );
}

function RunInner() {
  const id = useSearchParams().get("id");
  const { data: record, error } = useQuery<RecordOut>(id ? `/records/${id}` : null);

  if (!id) return <p>No run accession given.</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>Run {id} not found.</p>;
  if (!record) return <p>Loading…</p>;

  const bp = record.bioproject_accession;
  const bs = record.biosample_accession;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold">{record.run_accession}</h1>
          <p className="text-[var(--text-dim)]">{record.organism ?? "Unknown organism"}</p>
          <div className="mt-2 inline-flex gap-1">
            {record.is_saudi_submitter && <span className="badge badge-accent">Saudi</span>}
            {record.is_pathogen && <span className="badge badge-accent">Pathogen</span>}
            {record.is_wgs && <span className="badge">WGS</span>}
            <span className="badge">{record.source}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExternalLink href={record.ncbi_url}>NCBI SRA</ExternalLink>
          <ExternalLink href={record.ena_url}>ENA</ExternalLink>
          {bp && <ExternalLink href={`https://www.ncbi.nlm.nih.gov/bioproject/${bp}`}>BioProject</ExternalLink>}
          {bs && <ExternalLink href={`https://www.ncbi.nlm.nih.gov/biosample/${bs}`}>BioSample</ExternalLink>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <dl className="card space-y-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">Sequencing</h3>
          <Field label="Platform" value={record.platform ?? "—"} />
          <Field label="Instrument" value={record.instrument_model ?? "—"} />
          <Field label="Strategy" value={record.library_strategy ?? "—"} />
          <Field label="Source" value={record.library_source ?? "—"} />
        </dl>
        <dl className="card space-y-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">Submission</h3>
          <Field label="Center" value={record.center_name ?? "—"} />
          <Field label="Institution" value={
            record.institution_name ? (
              <Link className="link"
                href={`/institution?name=${encodeURIComponent(record.institution_name)}`}>
                {record.institution_name}
              </Link>
            ) : "—"
          } />
          <Field label="Published" value={record.published_dt ?? "—"} />
          <Field label="Year" value={record.year ?? "—"} />
          <Field label="Spots" value={record.total_spots?.toLocaleString() ?? "—"} />
          <Field label="Bases" value={formatBases(record.total_bases)} />
          <Field label="File size" value={formatMb(record.file_size_mb)} />
        </dl>
        <dl className="card space-y-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">Identifiers</h3>
          <Field label="Run" value={<span className="font-mono">{record.run_accession}</span>} />
          <Field label="BioProject" value={bp ? (
            <Link className="link" href={`/project?id=${bp}`}>{bp}</Link>
          ) : "—"} />
          <Field label="BioSample" value={bs ? (
            <Link className="link" href={`/samples?acc=${bs}`}>{bs}</Link>
          ) : "—"} />
          <Field label="Location" value={record.geo_loc_name ?? "—"} />
          <Field label="Organization" value={record.organization_name ?? "—"} />
        </dl>
      </div>

      <RelatedRuns title={bp ? `Same BioProject (${bp})` : "Same BioProject"}
        query={bp ? `/search?bioproject=${bp}&page_size=10` : null} exclude={record.run_accession} />
      <RelatedRuns title={bs ? `Same BioSample (${bs})` : "Same BioSample"}
        query={bs ? `/search?biosample=${bs}&page_size=10` : null} exclude={record.run_accession} />
      <RelatedRuns title={record.institution_name ? `Same institution (${record.institution_name})` : "Same institution"}
        query={record.institution_name
          ? `/search?institution=${encodeURIComponent(record.institution_name)}&page_size=10`
          : null}
        exclude={record.run_accession} />
    </div>
  );
}
