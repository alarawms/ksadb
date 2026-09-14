### Task 3: Inspector panel + click-to-select interaction

**Files:**
- Create: `components/graph/Inspector.tsx`
- Modify: `components/graph/GraphHub.tsx`
- Modify: `components/graph/GraphCanvas.tsx` (click/dblclick split, recent ring)
- Modify: `components/graph/graph-layout.ts` (extend `GraphNode` type with `facets`/`recent` to mirror the API)
- Test: `components/graph/GraphCanvas.test.tsx` (extend)

**Interfaces:**
- Consumes: detail payload keys from Task 2 (verbatim); `GraphNode.facets`/`recent` from Task 1.
- Produces: `Inspector({ node, detail, onClose, onFocus, onOpen, onSearch }: { node: GraphNode; detail: DetailPayload | null; onClose: () => void; onFocus: (id: string) => void; onOpen: (link: string) => void; onSearch: (href: string) => void })` — default export. `DetailPayload` is a TS union in `components/graph/graph-layout.ts`: `export type DetailPayload = Record<string, unknown> & { type: NodeType }` (the endpoint returns the type-specific keys; the panel renders defensively with `?? "—"`).
- Produces: `GraphCanvas` props change: `onNodeClick` is replaced by `onNodeSelect: (n: GraphNode) => void` and `onNodeFocus: (n: GraphNode) => void` (double-click). Existing `filter`, `data`, search, zoom controls unchanged.

- [ ] **Step 1: Write the failing tests**

Extend `components/graph/GraphCanvas.test.tsx`:

```tsx
it("single click selects, double click focuses", async () => {
  const select = vi.fn();
  const focus = vi.fn();
  render(<GraphCanvas data={fixture} filter="all" onNodeSelect={select} onNodeFocus={focus} />);
  const nodeEl = (await screen.findAllByText("Study Alpha"))[0].closest("g.graph-node")!;
  fireEvent.click(nodeEl);
  expect(select).toHaveBeenCalledTimes(1);
  expect(focus).not.toHaveBeenCalled();
  fireEvent.doubleClick(nodeEl);
  expect(focus).toHaveBeenCalledTimes(1);
});
```

New `components/graph/Inspector.test.tsx`:

```tsx
it("renders study detail fields and actions", () => {
  const onFocus = vi.fn();
  render(<Inspector node={{ id: "study:A", type: "study", label: "A" }}
    detail={{ type: "study", accession: "A", title: "T", runs: 3, bytes: 100, top_organisms: [{ name: "Homo sapiens", runs: 3 }], platforms: ["ILLUMINA"] }}
    onClose={() => {}} onFocus={onFocus} onOpen={() => {}} onSearch={() => {}} />);
  expect(screen.getByText("Homo sapiens")).toBeTruthy();
  expect(screen.getByText("3 runs")).toBeTruthy();
  fireEvent.click(screen.getByText("Focus graph"));
  expect(onFocus).toHaveBeenCalledWith("study:A");
});
```

- [ ] **Step 2: Run to verify failure** — props don't exist yet.

- [ ] **Step 3: Implement**

1. `graph-layout.ts`: extend `GraphNode` with the Task 1 fields; add `export type DetailPayload = Record<string, unknown> & { type: NodeType }`.
2. `GraphCanvas.tsx`: rename the click prop usage — single `onClick` on node groups calls `onNodeSelect` (keep `draggedRef` suppression); add `onDoubleClick` calling `onNodeFocus` (same suppression). In the node render, when `n.recent` is true, draw the ring: `<circle r={r + 4} fill="none" stroke="var(--accent)" strokeWidth={2} strokeOpacity={0.8} />` beneath the node circle (reuse the radius expression `6 + Math.min(14, Math.log2(n.count ?? 1))`). Update the existing tests in this file to the new prop names.
3. `Inspector.tsx`: a right-side panel (`<aside>` with `card` styling, fixed width ~320px, absolutely positioned or flex sibling — follow the existing page layout conventions in `app/graph/page.tsx`). Header: node label + type badge + ✕ (onClose). Body: render the detail keys per type (study: title/abstract/submitter/dates/samples/runs/bytes/top_organisms/platforms; sample: organism/lineage/host/tissue/region/collection_date/runs/bytes/study; organism: lineage/human_class/studies/runs; submitter: studies/runs/top_organisms; platform/strategy/region: runs/top_studies; term: label/runs/samples/top_studies; taxon: rank/name/organisms/runs). Use `?? "—"` for missing values. Footer buttons: **Focus graph** (onFocus(node.id)), **Open page** (disabled when no `node.link`), **View runs in search** (onSearch with the mapping: sample → `/search?q=<biosample accession from node id>`, organism → `/search?organism=`, submitter → `/search?submitter=`, region → `/search?region=`, platform → `/search?platform=`, strategy → `/search?strategy=`, study → `/search?study=`, term/taxon → omit the button).
4. `GraphHub.tsx`: hold `selected: GraphNode | null` and `detail: DetailPayload | null`; on select, set selected and fetch `/api/v2/graph/detail?node=${encodeURIComponent(node.id)}` (cancel stale fetches like the existing graph fetch effect). Double-click handler: `router.push(`/graph?focus=${id}`)`. Render `<GraphCanvas ... onNodeSelect onNodeFocus />` and, when selected, `<Inspector ... />`. Close on background click: pass an `onBackgroundClick` to GraphCanvas that clears selection (add a transparent rect under nodes capturing clicks that aren't on nodes) — or simpler: the ✕ button and selecting another node; implement the background-rect approach only if it is a one-element change (it is: `<rect width={800} height={600} fill="none" onClick={onBackgroundClick} />` as the first child of the root `<g>`, behind edges).

- [ ] **Step 4: Run tests + typecheck** — all green.

- [ ] **Step 5: Build + live smoke**

```bash
npm run build && rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8788/graph
```
Expected: 200.

- [ ] **Step 6: Commit**

```bash
git add components/graph/GraphHub.tsx components/graph/GraphCanvas.tsx components/graph/Inspector.tsx components/graph/graph-layout.ts components/graph/GraphCanvas.test.tsx components/graph/Inspector.test.tsx
git commit -m "feat(graph): inspector panel with click-to-select, focus on double-click, recency rings"
```

---

