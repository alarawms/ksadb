"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GraphHub from "../../components/graph/GraphHub";

export default function GraphPage() {
  return (
    <Suspense fallback={<GraphToolbarShell />}>
      <GraphWrapper />
    </Suspense>
  );
}

// Prerendered shell so the toolbar is present in the static HTML. The
// interactive canvas replaces it as soon as the client resolves the
// search params and fetches the graph data.
function GraphToolbarShell() {
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex flex-wrap items-center gap-2 border-b p-2"
        style={{ borderColor: "var(--border)" }}>
        <input
          className="input w-56"
          placeholder="Find node…"
          readOnly
          aria-label="Find node"
        />
        <div className="ml-auto flex items-center gap-1">
          <button className="btn" aria-label="Zoom in">+</button>
          <button className="btn" aria-label="Zoom out">−</button>
          <button className="btn">Fit</button>
        </div>
      </div>
    </div>
  );
}

function GraphWrapper() {
  const params = useSearchParams();
  return <GraphHub focus={params.get("focus")} />;
}
