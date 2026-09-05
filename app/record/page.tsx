"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function RecordPage() {
  return (
    <Suspense fallback={<p>Redirecting…</p>}>
      <RecordRedirect />
    </Suspense>
  );
}

function RecordRedirect() {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/run?${sp.toString()}`);
  }, [sp, router]);

  return <p>Redirecting…</p>;
}
