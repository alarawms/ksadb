# SDD ledger — plan: /home/alarawms/nfs/kaust-seqdb/docs/superpowers/plans/2026-09-13-graph-discovery.md
# Plan BASE = 7da3257 (podman-local tip; includes c080b60 study-link fix)
# Pre-flight: fixed plan bug — classifyHuman call is classifyHuman(row.organism, row.tax_id, row.host, [])
Task 1: minor (deferred): brief inconsistency — Interfaces bullet says focusTaxon returns studies too, implementation returns organisms only (followed brief's Step-3 code); revisit if Task 3/4 needs study nodes under taxon focus
Task 1: minor (deferred): focusStudy lineage pick nondeterministic when organism maps to multiple tax_ids (GROUP BY arbitrary first row); fine at CAP=50 + sparse taxonomy
Task 1: complete (commits 7da3257..791a3e1, review clean)
Task 2: flagged by implementer (deferred, triage at final review): graph term-node counts inflated — SAMPLES_RUNS interpolated into sample_terms-anchored queries binds join oddly (e.g. BTO:0000545 shows n=1820 = study's whole run count); detail.ts joins correctly. May predate Task 1.
Task 2: minor (deferred): SA/SAMPLES_RUNS constants duplicated locally in detail.ts (graph.ts doesn't export them); can drift — consider shared _lib constant
Task 2: minor (deferred): organism detail uses MAX(s.tax_id) for classify when organism maps to multiple tax_ids; term label subquery LIMIT 1 arbitrary on duplicates
Task 2: minor (deferred): 200-nulls (study) vs 404 (other types) asymmetry for fake ids — consequence of brief's smoke expectation
Task 2: complete (commits 791a3e1..c78d682, review clean)
Task 3: minor (deferred): searchHref slices id assuming "type:" prefix — brittle on malformed ids (safe under API contract)
Task 3: minor (deferred): range() renders "2020 → —" when one date bound null; inspector stays open across focus navigation; dblclick test can't assert select-not-refired (happy-dom)
Task 3: complete (commits c78d682..decc84a, review clean)
Task 4: fix round 1/5 (2 addressed, 0 open — region dimming misleading, platform chip cap; commits 1e15d65..6fe3b1c)
Task 4: minor (deferred): FacetGroups type in FacetRail.tsx not graph-layout.ts; toggle cast weakens keyof typing
Task 4: complete (commits decc84a..6fe3b1c, review clean after 1 fix round)
Final review: 3 Important findings (study-focus term-count inflation [pre-existing, join-discipline violation], taxon focus missing study nodes [spec governs over plan code sample], study filter invisible on search page) — all fixed in 2ce2d82..44ade43, scoped re-review: all addressed
Task F: complete — branch 7da3257..44ade43 clean
