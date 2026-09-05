"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useQuery } from "@/lib/useQuery";
import type { ProjectOut } from "@/lib/api";
import { RunsTable } from "@/components/RunsTable";

export default function ProjectPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ProjectInner />
    </Suspense>
  );
}

function ProjectInner() {
  const id = useSearchParams().get("id");
  const { data: project, error } = useQuery<ProjectOut>(id ? `/projects/${id}` : null);

  if (!id) return <p>No BioProject accession given.</p>;
  if (error) return <p className="text-danger">Project {id} not found.</p>;
  if (!project) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{project.bioproject_accession}</h1>
      {project.title && <p className="text-dim">{project.title}</p>}
      <p className="text-sm text-dim">
        {project.runs_count.toLocaleString()} runs ·{" "}
        {(project.total_bases / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })} Gb
        {project.institution_name ? ` · ${project.institution_name}` : ""}
      </p>
      <div className="overflow-x-auto card">
        <RunsTable runs={project.runs} />
      </div>
    </div>
  );
}
