import { notFound } from "next/navigation";

import { apiGet, ProjectOut } from "@/lib/api";
import { RunsTable } from "@/components/RunsTable";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  let project: ProjectOut;
  try {
    project = await apiGet<ProjectOut>(`/projects/${params.id}`);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{project.bioproject_accession}</h1>
      {project.title && <p className="text-gray-700">{project.title}</p>}
      <p className="text-sm text-gray-600">
        {project.runs_count.toLocaleString()} runs ·{" "}
        {(project.total_bases / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })} Gb
        {project.institution_name ? ` · ${project.institution_name}` : ""}
      </p>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <RunsTable runs={project.runs} />
      </div>
    </div>
  );
}
