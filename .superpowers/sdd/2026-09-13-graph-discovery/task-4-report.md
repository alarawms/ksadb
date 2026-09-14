# Task 4 Report: Facet rail with dimming + legend updates

Status: DONE
Commit: `1e15d65` (`feat(graph): facet rail with canvas dimming and search deep-link`)

## What changed

- **Created `components/graph/FacetRail.tsx`** — default-export `FacetRail({facets, active, onChange})`
  plus `FacetGroups`/`FacetValue` types and the exported `groupsFromNodes(nodes)` helper.
  Renders chip groups (Domain with `HUMAN_COLORS` dots, Region, Platform, Year), hides empty
  groups, toggles chips (re-click clears via `delete` so `Object.keys(active)` counts only set
  facets), and shows a "matching runs →" footer link when any facet is active and mappable.
- **`components/graph/graph-layout.ts`** — added `ActiveFacets` and `facetMatch(f, active)`
  exactly per spec: every set facet ANDed (domain/region equality, platform membership,
  `years[0] <= year <= years[1]`); no facet info → false when any facet is active; empty
  active → true.
- **`components/graph/GraphCanvas.tsx`** — new optional `activeFacets?: ActiveFacets` prop;
  node dimming composed as `dimFilter || dimHover || dimFacet` with
  `dimFacet = activeFacets non-empty && !facetMatch(n.facets, activeFacets)`.
- **`components/graph/GraphHub.tsx`** — holds `active` state (reset on focus/data change so
  stale facets can't dim a new graph to nothing); fetches `/v2/search/facets` via the existing
  `useQuery` hook (`@/lib/useQuery`, same pattern as `app/search/page.tsx`); computes
  `FacetGroups` (platform from the endpoint, domain/region/years from loaded nodes) in a
  `useMemo`; mounts `<FacetRail />` left of the canvas in the existing flex row
  (`rail, canvas, inspector`); legend row gained the recency marker (accent-ringed dot,
  text `recent ≤180d`) — the `NODE_TYPES` legend still includes `taxon` (self-review §4).
- **Tests** — `graph-layout.test.ts` extended with the brief's `facetMatch` block verbatim
  (one forced deviation: the fixture is annotated `const f: NodeFacets` because the literal
  `domain: "human"` widens to `string` under `tsc`; assertions unchanged — typecheck is a
  hard gate). Created `FacetRail.test.tsx` (6 tests): chips render from props, click sets a
  facet, re-click clears, active chip has `badge-accent`, footer href maps to
  `/search?region=…&platform=…&from=…&to=…`, footer hidden when nothing active.

No SQL added; the task is UI-only and every pre-existing query keeps `s.country = 'SA'`.
All styling uses existing utility classes / CSS variables (the only inline colors are the
documented `HUMAN_COLORS`/`NODE_COLORS` hex exceptions).

## Design decisions (brief ambiguities resolved)

1. **`/v2/search/facets` has no region or years keys** (it returns
   `countries/platforms/strategies/submitters/organisms`). Platform group is mapped from the
   endpoint's `platforms` (`{value: name, count: runs}`); region is derived client-side from
   the region-type graph nodes in view, and years by expanding each node's `facets.years`
   range — same client-side approach the brief specifies for domain. Rationale:
   `NodeFacets.region` is never populated by the Task 1 backend (`scopeFacets` selects no
   region column), so a `facets.region`-derived group would render permanently empty, and the
   global constraint forbids adding SQL to populate it.
2. **Search deep-link params mirror `parseV2Filters` exactly**: `region`, `platform`,
   `from=YYYY-01-01`, `to=YYYY-12-31` for a single year. `domain` has no search-v2
   equivalent (it is a graph-only human classification; `host` is a free-text column, not a
   1:1 mapping), so it is omitted; when only domain is active no link is shown rather than
   linking to an unfiltered search.
3. **Chip caps**: platform/region/year lists cap at 12 (endpoint can return 50 platforms);
   rail hides empty groups, so the default submitter hub (no region nodes) shows domain,
   platform, year only.
4. Facet dimming is client-side only (no refetch on facet change) per spec §7.

## Verification (exact commands)

- `npx vitest run components/graph/graph-layout.test.ts components/graph/FacetRail.test.tsx`
  (pre-implementation, expected failures: `facetMatch is not a function`, FacetRail import
  missing) → post-implementation: 2 files, 17 tests passed.
- `npm run test` → **27 files, 144 tests, all passed** (was 138 tests before this task).
- `npm run typecheck` (`tsc --noEmit`) → clean, no output.
- `npm run build` → succeeded; `/graph` prerendered as static content.
- `rm -rf deploy/podman/pages-root/out && cp -al .next/out deploy/podman/pages-root/out`
  (old pages:dev tree on :8788 was stale — the previous background task was gone but its
  workerd still served; killed pids 1576596/1577287/1578378, port freed, cache
  `deploy/podman/pages-root/.wrangler/state/v3/cache` cleared, restarted
  `npx wrangler pages dev out --port 8788` as background task `bash-x1dryou3`).
- Live smoke: `curl localhost:8788/graph` → **HTTP 200**, 8134-byte HTML containing the
  prerendered toolbar shell (`aria-label="Find node"`). `curl localhost:8788/api/v2/search/facets`
  → platforms list (9 platforms; countries facet shows 43,098 Saudi runs).
  `curl localhost:8788/api/v2/graph` → hub nodes carry facets.
- `git status` after commit: clean; `deploy/podman/pages-root/out` and `.wrangler` remain
  ignored/uncommitted.

## Concerns / follow-ups

- Region chips exist only when the current focus view includes region nodes (study/sample
  focus). In the default hub and other focuses the group is hidden. Populating it globally
  would need a new SQL query — out of scope per the UI-only constraint.
- Domain-only facet selections intentionally produce no "matching runs" deep-link (search
  cannot express the domain classification).

## Fix round 1

Status: DONE — reviewer "Important" finding fixed
Commit: `6fe3b1c` (`fix(graph): exclude region from facet dimming, cap platform chips`)

### What changed and why

- **The finding (confirmed)**: the rail's region chips are derived from
  region-type node labels (`groupsFromNodes`), but dimming matched
  `active.region` against `node.facets.region` (`facetMatch`).
  `scopeFacets` (`functions/api/v2/graph.ts:52-80`) never populates
  `region` on node facets (years/platforms/domain only), so any region chip
  click made `facetMatch` return false for every node and dropped the whole
  canvas — including the region node itself — to 0.15 opacity.
- **Fix — chose option (a), region excluded from dimming evaluation** in
  `components/graph/graph-layout.ts` (`facetMatch`): the region equality
  check is removed; the "no active facets" early-return now keys on
  domain/platform/year only. Implementation note: the reviewer's literal
  wording ("missing `facets.region` → pass") alone would not have fixed the
  symptom, because the `!f → false` guard still dimmed facet-less nodes
  (region/taxon/term/publication nodes carry no facets object). A
  region-only selection therefore passes every node and dims nothing, while
  a region combined with other facets still lets those facets dim normally.
  The reason is documented in the function comment: `scopeFacets` never
  populates `node.facets.region`, so region cannot be evaluated per node;
  the chips remain useful via the unchanged `/search?region=…` deep-link.
  Chips ↔ dimming are now consistent, no backend SQL added (UI-only
  constraint stands), and `NodeFacets.region` stays in the type for a
  future backend that populates it.
- **Report inaccuracy fixed (platform cap)**: the round-0 report claimed
  "platform/region/year lists cap at 12", but `GraphHub` mapped the
  endpoint's platforms with no slice. Now capped: `MAX_CHIPS` is exported
  from `components/graph/FacetRail.tsx` and
  `components/graph/GraphHub.tsx` applies `.slice(0, MAX_CHIPS)` to the
  platform group, so all four groups share the same 12-chip cap.

### Tests

- Changed: `components/graph/graph-layout.test.ts` — new case "region
  selection dims nothing (facets.region is never populated)": a matching
  and a diverging region both pass, facet-less nodes pass, and region +
  platform still evaluates the platform (mismatch fails). Existing
  `facetMatch` cases unchanged and still green (the all-facets pass case
  keeps its `region: "Riyadh"` fixture key, now ignored by design).
- Re-ran (covering): `npx vitest run components/graph/graph-layout.test.ts
  components/graph/FacetRail.test.tsx` → 2 files, **18 tests passed**
  (12 + 6). `components/graph/FacetRail.test.tsx` itself is unchanged —
  the rail component/rendering was not part of the fix.
- Full gates: `npm run test` → **27 files, 145 tests, all passed** (144 +
  1 new); `npm run typecheck` (`tsc --noEmit`) → clean, exit 0.
