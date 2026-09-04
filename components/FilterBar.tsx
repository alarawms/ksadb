"use client";

export function FilterBar({ defaults }: { defaults: Record<string, string> }) {
  return (
    <form method="GET" action="/search" className="flex flex-wrap gap-2 rounded-lg border bg-white p-4">
      <input name="q" defaultValue={defaults.q ?? ""} placeholder="Search accession / organism / center"
        className="min-w-48 flex-1 rounded border p-2" />
      <input name="organism" defaultValue={defaults.organism ?? ""} placeholder="Organism" className="rounded border p-2" />
      <input name="platform" defaultValue={defaults.platform ?? ""} placeholder="Platform" className="rounded border p-2" />
      <input name="institution" defaultValue={defaults.institution ?? ""} placeholder="Institution" className="rounded border p-2" />
      <input name="year_from" defaultValue={defaults.year_from ?? ""} placeholder="Year from" type="number" className="w-28 rounded border p-2" />
      <input name="year_to" defaultValue={defaults.year_to ?? ""} placeholder="Year to" type="number" className="w-28 rounded border p-2" />
      <select name="source" defaultValue={defaults.source ?? ""} className="rounded border p-2">
        <option value="">Any source</option>
        <option value="NCBI">NCBI</option>
        <option value="ENA">ENA</option>
      </select>
      <label className="flex items-center gap-1 text-sm">
        <input type="checkbox" name="saudi_only" value="true" defaultChecked={defaults.saudi_only === "true"} />
        Saudi only
      </label>
      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">Search</button>
    </form>
  );
}
