"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GraphHub from "../../components/graph/GraphHub";

export default function GraphPage() {
  return (
    <Suspense fallback={<p className="text-dim p-4">Loading graph…</p>}>
      <GraphWrapper />
    </Suspense>
  );
}

function GraphWrapper() {
  const params = useSearchParams();
  return <GraphHub focus={params.get("focus")} />;
}
