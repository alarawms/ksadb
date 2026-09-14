### Task 4: Facet rail with dimming + legend updates

**Files:**
- Create: `components/graph/FacetRail.tsx`
- Modify: `components/graph/graph-layout.ts` (add `facetMatch` + tests)
- Modify: `components/graph/GraphHub.tsx` (mount rail, compose dimming)
- Modify: `components/graph/GraphCanvas.tsx` (accept `activeFacets`, apply dimming)
- Test: `components/graph/graph-layout.test.ts` (extend), `components/graph/FacetRail.test.tsx` (create)

**Interfaces:**
- Consumes: `/v2/search/facets` response shape — READ `functions/api/v2/search/facets.ts` first and map whatever keys it returns for region/platform (pass them through as `{value, count}` lists); node `facets` from Task 1.
- Produces:
  - `export interface ActiveFacets { domain?: string; region?: string; platform?: string; year?: number }`
  - `export function facetMatch(f: GraphNode["facets"] | undefined, active: ActiveFacets): boolean` in `graph-layout.ts` — true when the node passes every set facet (no facets info → false when any facet active; platforms intersect; years range includes the year).
  - `FacetRail({ facets, active, onChange }: { facets: FacetGroups; active: ActiveFacets; onChange: (f: ActiveFacets) => void })` — default export. `FacetGroups = { domain: { value: string; count: number }[]; region: { value: string; count: number }[]; platform: { value: string; count: number }[]; years: number[] }` (domain counts computed client-side from loaded graph nodes' `facets.domain`).

- [ ] **Step 1: Write the failing tests**

In `graph-layout.test.ts`:

```ts
describe("facetMatch", () => {
  const f = { domain: "human", region: "Riyadh", platforms: ["ILLUMINA"], years: [2020, 2024] as [number, number] };
  it("passes when every active facet matches", () => {
    expect(facetMatch(f, { domain: "human", region: "Riyadh", platform: "ILLUMINA", year: 2022 })).toBe(true);
  });
  it("fails on any mismatch and on missing facet info", () => {
    expect(facetMatch(f, { domain: "other" })).toBe(false);
    expect(facetMatch(f, { year: 1999 })).toBe(false);
    expect(facetMatch(undefined, { platform: "ILLUMINA" })).toBe(false);
  });
  it("empty active facets passes everything", () => {
    expect(facetMatch(undefined, {})).toBe(true);
  });
});
```

`FacetRail.test.tsx`: renders chips from props, clicking a chip calls onChange with the facet set; active chip has the `badge-accent` class.

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement**

1. `graph-layout.ts`: `ActiveFacets`, `facetMatch` (implementation: each set facet ANDed; domain equality; region equality; platform membership; `years[0] <= year <= years[1]`).
2. `FacetRail.tsx`: fetch `/v2/search/facets` in `GraphHub` (existing `useQuery` hook pattern from `@/lib/useQuery` — see how `app/search/page.tsx` calls it) and pass the mapped groups down; the rail renders four chip groups (domain with the human-class colored dots reusing `HUMAN_COLORS`, region, platform, year as a small list of distinct years seen in the graph's nodes). Chip click toggles the value in `active` (click again clears). Footer: when any facet active, a "matching runs →" link to `/search` with the equivalent params (same mapping as Task 3's onSearch).
3. `GraphCanvas.tsx`: new optional prop `activeFacets?: ActiveFacets`. In the node render, compose: `const dimFacet = activeFacets && Object.keys(activeFacets).length > 0 && !facetMatch(n.facets, activeFacets); const dimmed = dimFilter || dimHover || dimFacet;`.
4. `GraphHub.tsx`: hold `active` state; compute `FacetGroups.domain` counts from `data.nodes`; render `<FacetRail />` beside the canvas (flex row: rail, canvas, inspector).
5. Legend: add a recency marker — an accent-ringed dot with the text `recent ≤180d` — next to the existing type legend (GraphHub legend row).

- [ ] **Step 4: Run tests + typecheck** — all green.

- [ ] **Step 5: Build + live smoke** (same commands as Task 3; `/graph` → 200).

- [ ] **Step 6: Commit**

```bash
git add components/graph/FacetRail.tsx components/graph/graph-layout.ts components/graph/graph-layout.test.ts components/graph/FacetRail.test.tsx components/graph/GraphHub.tsx components/graph/GraphCanvas.tsx
git commit -m "feat(graph): facet rail with canvas dimming and search deep-link"
```

---

## Self-Review Notes

- Spec coverage: §1 facets (T1), §2 inspector + detail endpoint (T2, T3), §3 facet rail (T4), §4 taxonomy rollup (T1 backend + T3 legend already has taxon entry — confirm the existing `NODE_TYPES` legend array still includes "taxon"), §5 recency ring (T1 `recent` flag + T3 ring + T4 legend marker), §6 interaction changes (T3), §7 non-goals respected (no canvas export, no refetch on facet change, no layout change), §8 testing (per-task).
- Type consistency: `facets`/`recent` on `GraphNode` defined in T1 and mirrored in `graph-layout.ts` in T3 (same field names). `DetailPayload`, `ActiveFacets`, `facetMatch`, `FacetRail` props used consistently across T3/T4. Detail payload keys in T2's Interfaces are the keys T3 renders.
- Known simplifications (documented for implementers): tissue terms omitted in group-level domain classification (name/tax_id/host only — same coverage as the existing study-focus classification); term/taxon nodes omit the "view runs in search" action; facet dimming is client-side only (no refetch) per spec.
