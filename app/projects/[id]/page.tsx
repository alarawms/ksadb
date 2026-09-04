import { notFound } from "next/navigation";

import { apiGet, ProjectOut } from "@/lib/api";
import { RunsTable } from "@/components/RunsTable";

// Task 9 neutralization: `output: "export"` requires every dynamic segment to
// yield at least one static path, and server-side prerender cannot reach the
// same-origin API (relative URL, no server at build time). A dummy param is
// prerendered into a 404 via the page's existing try/catch. Task 10 rewrites
// this page as a client component.
export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ id: "_" }];
}

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
