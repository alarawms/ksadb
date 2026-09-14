### Task 1: Graph API — node facets, taxon focus, study filter

**Files:**
- Modify: `functions/api/v2/graph.ts`
- Modify: `functions/api/v2/_lib/filters.ts`
- Test: `functions/api/v2/graph.test.ts` (extend), `functions/api/v2/_lib/filters.test.ts` (extend or create — check which exists)

**Interfaces:**
- Consumes: `classifyHuman(name, tax_id, host, tissueTerms)` from `./_lib/human`; existing helpers `node`, `addEdge`, `linkFor`; `TERMS_SAMPLES`/`SAMPLES_RUNS` join constants.
- Produces (Task 3/4 rely on these exact shapes):
  - `GraphNode` gains optional `facets?: { domain?: "human" | "human_associated" | "other"; region?: string; platforms?: string[]; years?: [number, number] }` and `recent?: boolean`.
  - `FOCUS_TYPES` gains `"taxon"`; `focusTaxon(db, "genus:X" | "family:X" | "phylum:X")` returns child organism nodes + studies.
  - Organism focus responses include `taxon` nodes: edges organism→`genus:<g>`→`family:<f>`→`phylum:<p>` kind `classified_in` (omit missing ranks).
  - `parseV2Filters` accepts `?study=<accession>` → `r.study_accession = ?` (after the existing `eq("sub.center_name", ...)` line, same helper).

- [ ] **Step 1: Write the failing tests**

In `functions/api/v2/graph.test.ts` add (extend the existing `stubEnv` pattern — the stub returns rows for SQL containing `FROM studies`, `sample_terms`, etc.; add stubs as needed for the new queries, e.g. SQL containing `GROUP_CONCAT` or `MIN(substr` returns per-scope facet rows):

```ts
it("study focus nodes carry facets and taxon lineage", async () => {
  const { ctx, prepared } = stubEnv("http://x/api/v2/graph?focus=study:PRJNA1249945&t=9");
  const res = await onRequestGet(ctx);
  const body = (await res.json()) as {
    nodes: { type: string; facets?: { domain?: string; years?: number[]; platforms?: string[] }; recent?: boolean }[];
  };
  const study = body.nodes.find((n) => n.type === "study");
  expect(study?.facets?.domain).toBeDefined();
  expect(study?.facets?.years?.length).toBe(2);
  expect(body.nodes.some((n) => n.type === "taxon")).toBe(true);
  for (const sql of prepared) expect(sql).toContain("s.country = 'SA'");
});

it("taxon focus returns child organisms", async () => {
  const { ctx, prepared } = stubEnv("http://x/api/v2/graph?focus=genus:Camelus&t=10");
  const res = await onRequestGet(ctx);
  expect(res.status).toBe(200);
  const body = (await res.json()) as { nodes: { type: string }[] };
  expect(body.nodes.some((n) => n.type === "organism")).toBe(true);
  for (const sql of prepared) expect(sql).toContain("s.country = 'SA'");
});
```

In `functions/api/v2/_lib/filters.test.ts` (create if absent, mirroring the style of the existing v2 search tests):

```ts
it("study param adds an equality filter on r.study_accession", () => {
  const { clause, params } = parseV2Filters(new URL("https://x/v2/search?study=PRJNA1249945"));
  expect(clause).toContain("r.study_accession = ?");
  expect(clause).toContain("s.country = 'SA'");
  expect(params).toContain("PRJNA1249945");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run functions/api/v2`
Expected: new tests FAIL (facets undefined / no taxon nodes / study filter missing).

- [ ] **Step 3: Implement**

`functions/api/v2/_lib/filters.ts` — one line after `eq("sub.center_name", p.get("submitter"));`:

```ts
eq("r.study_accession", p.get("study"));
```

`functions/api/v2/graph.ts`:

1. Extend the `GraphNode` interface with `facets` and `recent` as in Interfaces.

2. Add a batched facet helper (avoids per-node N+1; the IN-list is built from the scope ids already at hand, capped by CAP):

```ts
interface FacetRow { id: string; y0: number | null; y1: number | null; recent: number; platforms: string | null; organism: string | null; tax_id: number | null; host: string | null; }

async function scopeFacets(db: Db, scopeCol: string, ids: string[]): Promise<Map<string, NonNullable<GraphNode["facets"]> & { recent: boolean }>> {
  if (!ids.length) return new Map();
  const ph = ids.map(() => "?").join(",");
  const { results } = await db.prepare(
    `SELECT ${scopeCol} AS id,
            MIN(CAST(substr(r.submitted_date, 1, 4) AS INTEGER)) AS y0,
            MAX(CAST(substr(r.submitted_date, 1, 4) AS INTEGER)) AS y1,
            MAX(CASE WHEN r.submitted_date >= date('now', '-180 days') THEN 1 ELSE 0 END) AS recent,
            GROUP_CONCAT(DISTINCT r.platform) AS platforms,
            s.organism AS organism, s.tax_id AS tax_id, s.host AS host
     FROM ena_runs r ${SAMPLES_RUNS}
     WHERE ${scopeCol} IN (${ph}) AND ${SA}
     GROUP BY ${scopeCol}, s.organism, s.tax_id, s.host`
  ).bind(...ids).all<FacetRow>();
  const out = new Map<string, NonNullable<GraphNode["facets"]> & { recent: boolean }>();
  for (const row of results) {
    const cur = out.get(row.id) ?? { recent: false };
    if (row.y0 != null) cur.years = [Math.min(cur.years?.[0] ?? row.y0, row.y0), Math.max(cur.years?.[1] ?? row.y1 ?? row.y0, row.y1 ?? row.y0)] as [number, number];
    if (row.recent) cur.recent = true;
    if (row.platforms) cur.platforms = [...new Set([...(cur.platforms ?? []), ...row.platforms.split(",")])].slice(0, 5);
    // domain aggregation: human > human_associated > other
    // (tissue terms intentionally omitted at group scope — name/tax_id/host
    // carry the common cases; keep classifyHuman as the only rule source)
    const cls = classifyHuman(row.organism, row.tax_id, row.host, []);
    const rank = { other: 0, human_associated: 1, human: 2 } as const;
    if (!cur.domain || rank[cls] > rank[cur.domain as keyof typeof rank]) cur.domain = cls;
    out.set(row.id, cur);
  }
  return out;
}
```

NOTE for implementer: read `functions/api/v2/_lib/human.ts` first and call `classifyHuman` with its actual signature (the call above is illustrative — adapt to the real parameter list; tissue terms are intentionally omitted at group scope, document this in a comment). Keep `classifyHuman` as the only classification logic.

3. In `hubSubmitter`, `focusStudy`, `focusSubmitter`, `focusOrganism`, `focusSample`: after building study/sample/organism/submitter nodes, call `scopeFacets` with the appropriate scope column (`st.accession` for studies via the join, `s.biosample_accession` for samples, `sub.center_name` for submitters, `s.organism` for organisms — pass the same ids used to build the nodes) and attach `facets` + `recent` to each node. Use `node(...)`'s `extra` parameter. Where a scope column needs a join not present in the facet query, add the minimal JOIN to the facet SQL (e.g. submitters: `JOIN studies st ON st.accession = r.study_accession JOIN submitters sub ON sub.id = st.submitter_id`).

4. Taxon rollup in `focusOrganism` (after the organism self node):

```ts
const { results: lineage } = await db.prepare(
  `SELECT t.genus, t.family, t.phylum FROM samples s
   JOIN taxonomy t ON t.tax_id = s.tax_id
   WHERE s.organism = ? AND ${SA} LIMIT 1`
).bind(name).all<{ genus: string | null; family: string | null; phylum: string | null }>();
const ranks: { rank: string; value: string | null }[] = [
  { rank: "genus", value: lineage[0]?.genus ?? null },
  { rank: "family", value: lineage[0]?.family ?? null },
  { rank: "phylum", value: lineage[0]?.phylum ?? null },
];
let childId = self.id;
for (const { rank, value } of ranks) {
  if (!value) continue;
  const id = `taxon:${rank}:${value}`;
  nodes.push(node("taxon", `${rank}:${value}`, value, { link: linkFor("taxon" as NodeType, `${rank}:${value}`, value) }));
  addEdge(edges, childId, id, "classified_in");
  childId = id;
}
```

(Adjust `linkFor`'s default branch so `taxon` returns `undefined` — focus navigation handles it; the id format `genus:X` is what `focusTaxon` parses.)

5. Add `"taxon"` to `FOCUS_TYPES` and implement:

```ts
async function focusTaxon(db: Db, id: string): Promise<Graph> {
  const m = /^(genus|family|phylum):(.+)$/.exec(id);
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  if (!m) return { nodes, edges };
  const [, rank, value] = m;
  const self = node("taxon", id, value as string, {});
  nodes.push(self);
  const { results: organisms } = await db.prepare(
    `SELECT s.organism AS name, s.tax_id AS tax_id, COUNT(*) AS n
     FROM samples s JOIN ena_runs r ON r.biosample_accession = s.biosample_accession
     JOIN taxonomy t ON t.tax_id = s.tax_id
     WHERE t.${rank} = ? AND ${SA} AND s.organism IS NOT NULL
     GROUP BY s.organism, s.tax_id ORDER BY n DESC LIMIT ${CAP}`
  ).bind(value).all<{ name: string; tax_id: number | null; n: number }>();
  for (const row of organisms) {
    const cls = classifyHuman(row.name, row.tax_id, null, []);
    nodes.push(node("organism", row.name, row.name, { count: row.n, human_class: cls, link: linkFor("organism", row.name, row.name) }));
    addEdge(edges, self.id, `organism:${row.name}`, "classifies", row.n);
  }
  return { nodes, edges };
}
```

(`t.${rank}` is safe: rank is validated against the regex capture `(genus|family|phylum)`.)

- [ ] **Step 4: Run tests and typecheck**

Run: `npx vitest run functions/api/v2 && npm run typecheck`
Expected: all green. Fix stub return shapes in the test if the implementation legitimately needs different row shapes (document any such change in the report).

- [ ] **Step 5: Live smoke (uncached URL)**

```bash
curl -s "http://localhost:8788/api/v2/graph?focus=study:PRJNA9999998" | python3 -c "import sys,json; d=json.load(sys.stdin); n=[x for x in d['nodes'] if x['type']=='study'][0]; print(n.get('facets'), n.get('recent'))"
```
Expected: a facets object with domain/years/platforms prints. Also: `curl -s "http://localhost:8788/api/v2/search?study=PRJNA1249945&page_size=1"` returns only rows of that study.

- [ ] **Step 6: Commit**

```bash
git add functions/api/v2/graph.ts functions/api/v2/_lib/filters.ts functions/api/v2/graph.test.ts functions/api/v2/_lib/filters.test.ts
git commit -m "feat(graph): node facets (domain/platforms/years/recent), taxon focus + lineage, study search filter"
```

---

