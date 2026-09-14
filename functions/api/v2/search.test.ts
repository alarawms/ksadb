import { describe, expect, it } from "vitest";

import { onRequestGet as searchGet } from "./search";

function stubCache() {
  const store = new Map<string, Response>();
  return {
    async match(key: Request | string) {
      const k = typeof key === "string" ? key : key.url;
      const hit = store.get(k);
      return hit ? new Response(hit.body, { status: hit.status, headers: hit.headers }) : undefined;
    },
    async put(key: Request | string, value: Response) {
      const k = typeof key === "string" ? key : key.url;
      store.set(k, value);
    },
  };
}

// Endpoints read request + caches.default from the worker runtime context.
globalThis.caches = { default: stubCache() } as never;

const ROW = {
  run_accession: "ERR123",
  study_accession: "ERP001",
  biosample_accession: "SAMEA1",
  bytes: 100,
  spots: 10,
  platform: "ILLUMINA",
  instrument_model: "Illumina NovaSeq 6000",
  library_strategy: "WGS",
  submitted_date: "2024-06-01",
  fastq_ftp: "ftp://x/ERR123.fastq.gz",
  fastq_bytes: "100",
  organism: "Camelus dromedarius",
  country: "Saudi Arabia",
  region: null,
  host: null,
  submitter: "KAUST",
  study_title: "Camel study",
};

function stubEnv(path: string, rows: unknown[] = [ROW]) {
  return {
    request: new Request(path),
    env: {
      DB: {
        prepare: () => ({
          bind: () => ({
            first: async () => ({ c: rows.length }),
            all: async () => ({ results: rows }),
          }),
        }),
      },
    },
  } as never;
}

function throwingEnv(path: string) {
  return {
    request: new Request(path),
    env: {
      DB: {
        prepare: () => ({
          bind: () => ({
            first: async () => {
              throw new Error("D1 error: quota exceeded");
            },
            all: async () => {
              throw new Error("D1 error: quota exceeded");
            },
          }),
        }),
      },
    },
  } as never;
}

describe("GET /api/v2/search", () => {
  it("returns total + items with run rows", async () => {
    const res = await searchGet(stubEnv("http://x/api/v2/search?page=1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      total: 1,
      page: 1,
      page_size: 50,
      items: [ROW],
    });
  });

  it("returns a graceful 503 when D1 is unavailable", async () => {
    const res = await searchGet(
      throwingEnv("http://x/api/v2/search?organism=Camelus&page=1")
    );
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error?: string; message?: string };
    expect(body.error).toBe("temporarily_unavailable");
    expect(typeof body.message).toBe("string");
  });
});
