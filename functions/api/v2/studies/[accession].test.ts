import { describe, expect, it } from "vitest";

import { onRequestGet as studyGet } from "./[accession]";

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

const STUDY = {
  accession: "ERP001",
  title: "Camel study",
  abstract: "Dromedary WGS.",
  submitted_date: "2024-01-01",
  submitter: "KAUST",
};

const RUN = {
  run_accession: "ERR123",
  study_accession: "ERP001",
  biosample_accession: "SAMEA1",
  bytes: "100",
  spots: "10",
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

let studyRow: unknown = STUDY;
let runRows: unknown[] = [RUN];

function stubEnv(path: string) {
  return {
    request: new Request(path),
    params: { accession: "ERP001" },
    env: {
      DB: {
        prepare: () => ({
          bind: () => ({
            first: async () => studyRow,
            all: async () => ({ results: runRows }),
          }),
        }),
      },
    },
  } as never;
}

function throwingEnv(path: string) {
  return {
    request: new Request(path),
    params: { accession: "ERP001" },
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

describe("GET /api/v2/studies/[accession]", () => {
  it("returns study metadata with coerced run rows", async () => {
    const res = await studyGet(stubEnv("http://x/api/v2/studies/ERP001"));
    expect(res.status).toBe(200);
    const body = await res.json() as {
      accession: string;
      title: string;
      submitter: string;
      runs: { run_accession: string; bytes: number | null; spots: number | null }[];
    };
    expect(body.accession).toBe("ERP001");
    expect(body.submitter).toBe("KAUST");
    expect(body.runs).toHaveLength(1);
    expect(body.runs[0].bytes).toBe(100);
    expect(body.runs[0].spots).toBe(10);
  });

  it("returns 404 when the study does not exist", async () => {
    studyRow = null;
    const res = await studyGet(stubEnv("http://x/api/v2/studies/ERP404"));
    expect(res.status).toBe(404);
    studyRow = STUDY;
  });

  it("returns a graceful 503 when D1 is unavailable", async () => {
    // Distinct URL so the stub cache from the first test doesn't shadow it.
    const res = await studyGet(throwingEnv("http://x/api/v2/studies/ERP001?degraded=1"));
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error?: string; message?: string };
    expect(body.error).toBe("temporarily_unavailable");
    expect(typeof body.message).toBe("string");
  });

  it("scopes the runs list to Saudi samples and captures it in SQL", async () => {
    const prepared: string[] = [];
    const ctx = {
      request: new Request("http://x/api/v2/studies/ERP001?sa=1"),
      params: { accession: "ERP001" },
      env: {
        DB: {
          prepare: (sql: string) => {
            prepared.push(sql);
            return {
              bind: () => ({
                first: async () => STUDY,
                all: async () => ({ results: [RUN] }),
              }),
            };
          },
        },
      },
    } as never;
    const res = await studyGet(ctx);
    expect(res.status).toBe(200);
    const runsSql = prepared.find((s) => s.includes("FROM ena_runs"));
    expect(runsSql).toContain("s.country = 'SA'");
  });

  it("returns 404 when the study has no Saudi runs", async () => {
    // A GCC-wide study that has runs but none from Saudi Arabia must not
    // be served — the same rule as the search/records endpoints.
    studyRow = STUDY;
    runRows = [];
    const res = await studyGet(stubEnv("http://x/api/v2/studies/ERP001?nosa=1"));
    expect(res.status).toBe(404);
    runRows = [RUN];
  });
});
