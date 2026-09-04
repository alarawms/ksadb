"use client";

import { useEffect, useState } from "react";

export interface QueryState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useQuery<T>(path: string | null): QueryState<T> {
  const key = path ?? "";
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    loading: path !== null,
  });

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setState({ data: null, error: null, loading: true });
    fetch(`/api${path}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
        return res.json();
      })
      .then((data: unknown) => {
        if (!cancelled) setState({ data: data as T, error: null, loading: false });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, error: String(err), loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return state;
}

export function useQueryString(): string {
  const [qs, setQs] = useState("");
  useEffect(() => {
    setQs(window.location.search);
    const onPop = () => setQs(window.location.search);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return qs;
}
