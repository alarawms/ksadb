### Task 2: Graph detail endpoint for the inspector

**Files:**
- Create: `functions/api/v2/graph/detail.ts`
- Test: `functions/api/v2/graph/detail.test.ts`

**Interfaces:**
- Consumes: same db helpers as graph.ts (`cachedJson`, `json`, `SA`, `SAMPLES_RUNS`, `classifyHuman`).
- Produces: `GET /api/v2/graph/detail?node=<type>:<id>` → 200 JSON per type (Task 3 renders these keys verbatim):
  - `study`: `{ accession, title, abstract, submitter, date_min, date_max, samples, runs, bytes, top_organisms: [{name, runs}], platforms: string[] }`
  - `sample`: `{ accession, organism, lineage: { genus, family, phylum }, host, tissue, region, collection_date, runs, bytes, study }`
  - `organism`: `{ name, lineage, human_class, studies, runs }`
  - `submitter`: `{ name, studies, runs, top_organisms: [{name, runs}] }`
  - `platform` | `strategy` | `region`: `{ name, runs, top_studies: [{accession, runs}] }`
  - `term`: `{ id, label, runs, samples, top_studies: [{accession, runs}] }`
  - `taxon`: `{ rank, name, organisms, runs }`
  - Unknown/malformed node → `{ error: "invalid node" }` with 400.
  All counts Saudi-scoped.

- [ ] **Step 1: Write the failing test**

Create `functions/api/v2/graph/detail.test.ts` using the same `caches` stub and `stubEnv`-style D1 mock as `functions/api/v2/graph.test.ts` (copy that scaffolding):

```ts
import { describe, expect, it } from "vitest";
import { onRequestGet } from "./detail";

// ... same globalThis.caches stub as graph.test.ts ...

function stubEnv(path: string) {
  const prepared: string[] = [];
  const ctx = {
    request: new Request(path),
    env: {
      DB: {
        prepare: (sql: string) => {
          prepared.push(sql);
          const all = async () => {
            if (sql.includes("top_organisms") || sql.includes("GROUP BY s.organism"))
              return { results: [{ name: "Homo sapiens", runs: 3 }] };
            if (sql.includes("FROM studies"))
              return { results: [{ accession: "PRJNA1249945", title: "T", abstract: "A", center_name: "KAUST", date_min: "2020", date_max: "2024", samples: 2, runs: 3, bytes: 100 }] };
            return { results: [] };
          };
          return { bind: () => ({ all, first: async () => (await all()).results[0] ?? null }) });
        },
      },
    },
  } as never;
  return { ctx, prepared };
}

describe("GET /api/v2/graph/detail", () => {
  it("study detail returns the inspector payload, Saudi-scoped", async () => {
    const { ctx, prepared } = stubEnv("http://x/api/v2/graph/detail?node=study:PRJNA1249945");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { accession: string; top_organisms: { name: string }[] };
    expect(body.accession).toBe("PRJNA1249945");
    for (const sql of prepared) expect(sql).toContain("s.country = 'SA'");
  });

  it("rejects malformed node ids", async () => {
    const { ctx } = stubEnv("http://x/api/v2/graph/detail?node=bogus");
    const res = await onRequestGet(ctx);
    expect(res.status).toBe(400);
  });
});
```

Adjust stub row shapes to whatever the implementation's SQL aliases are — the test contract is the response keys, not the SQL.

- [ ] **Step 2: Run to verify failure** — `npx vitest run functions/api/v2/graph/detail.test.ts` fails (module not found).

- [ ] **Step 3: Implement `functions/api/v2/graph/detail.ts`**

One `onRequestGet` that parses `?node=type:id`, switches on type, and runs the minimal Saudi-scoped queries per type to fill the payload keys listed in Interfaces. Wrap in `cachedJson(request, STATS_TTL, ...)`. Example for study (others follow the same pattern; column names from the star schema: `studies.accession/title/abstract/submitted_date`, `submitters.center_name`, `ena_runs.bytes`, `samples.region/collection_date/host/tissue`, `taxonomy.genus/family/phylum`, `sample_terms.term_id`):

```ts
const row = await db.prepare(
  `SELECT st.accession, st.title, st.abstract, sub.center_name AS submitter,
          MIN(r.submitted_date) AS date_min, MAX(r.submitted_date) AS date_max,
          COUNT(DISTINCT r.biosample_accession) AS samples, COUNT(*) AS runs,
          COALESCE(SUM(r.bytes), 0) AS bytes
   FROM studies st
   JOIN submitters sub ON sub.id = st.submitter_id
   JOIN ena_runs r ON r.study_accession = st.accession
   ${SAMPLES_RUNS}
   WHERE st.accession = ? AND ${SA}`
).bind(id).first();
const { results: orgs } = await db.prepare(
  `SELECT s.organism AS name, COUNT(*) AS runs
   FROM ena_runs r ${SAMPLES_RUNS}
   WHERE r.study_accession = ? AND ${SA} AND s.organism IS NOT NULL
   GROUP BY s.organism ORDER BY runs DESC LIMIT 5`
).bind(id).all();
const { results: plats } = await db.prepare(
  `SELECT DISTINCT r.platform AS name FROM ena_runs r ${SAMPLES_RUNS}
   WHERE r.study_accession = ? AND ${SA} AND r.platform IS NOT NULL LIMIT 5`
).bind(id).all();
```

- [ ] **Step 4: Run tests + typecheck** — all green.

- [ ] **Step 5: Live smoke (uncached)**

```bash
curl -s "http://localhost:8788/api/v2/graph/detail?node=study:PRJNA9999997" | head -c 300
```
Expected: JSON with the study keys (empty top_organisms OK for a fake accession, but keys present).

- [ ] **Step 6: Commit**

```bash
git add functions/api/v2/graph/detail.ts functions/api/v2/graph/detail.test.ts
git commit -m "feat(graph): /api/v2/graph/detail inspector payload endpoint"
```

---

