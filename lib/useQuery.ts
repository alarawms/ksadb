"use client";

import { useEffect, useState } from "react";

export interface QueryState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The D1 free-tier limiter is bursty admission control: requests fail for a
// stretch, then pass again. Retry 503s with backoff instead of surfacing the
// error on the first closed-window hit (max wait ~45s).
async function fetchWithRetry(
  input: string,
  delays = [3000, 6000, 12000, 24000],
): Promise<Response> {
  const res = await fetch(input, { cache: "no-store" });
  if (res.status !== 503) return res;
  for (const delay of delays) {
    await sleep(delay);
    const retry = await fetch(input, { cache: "no-store" });
    if (retry.status !== 503) return retry;
  }
  return res;
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
    fetchWithRetry(`/api${path}`)
      .then(async (res) => {
        if (!res.ok) {
          let message = `API ${path} -> ${res.status}`;
          try {
            const body: unknown = await res.json();
            if (
              body && typeof body === "object" &&
              typeof (body as { message?: unknown }).message === "string"
            ) {
              message = (body as { message: string }).message;
            }
          } catch {
            // non-JSON error body — keep the status-based message
          }
          throw new Error(message);
        }
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
