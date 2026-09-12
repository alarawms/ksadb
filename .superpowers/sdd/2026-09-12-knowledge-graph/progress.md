# SDD ledger — plan: /home/alarawms/nfs/kaust-seqdb/docs/superpowers/plans/2026-09-12-knowledge-graph.md
# worktree: /home/alarawms/nfs/kaust-seqdb/ksadb-podman-local (branch knowledge-graph)
# Plan BASE (Task 1): 0a6a77e3f000aa3a6b0e08db9e8c14d56f5ae4ef
Task 1: complete (commits 0a6a77e..d807a21, review clean — 2 concerns assessed non-defects: pytest.raises sanctioned wrap; shim replay quirk is pre-existing 0001, out of scope)
Task 2 BASE: d807a21
Task 2: complete (commits d807a21..6307f2a, review clean — 3 plan-code bugs found by verbatim tests and fixed minimally: names.dmp trailing-tab, wanted_taxa topmost ancestor, root self-parent loop)
Task 2: minor (deferred): unused io/tarfile imports in test (brief-verbatim); parse_taxdump builds lineage for all taxa before filtering (batch-job OK)
Task 3 BASE: 6307f2a
Task 3: complete (commits 6307f2a..1ff5d63, review clean — verbatim code passed unchanged)
Task 4 BASE: 1ff5d63
Task 4: complete (commits 1ff5d63..f6c0f73, review Approved — verbatim code passed unchanged)
Task 4: minor (deferred): synonym-based exact match with score<0.85 rejected by post-loop label-only gate (narrow edge)
Task 4: minor (deferred): relink uses lower(field)=norm while normalize_value also collapses whitespace -> 'Human  Gut' relinks 0 rows (rare)
Task 5 BASE: f6c0f73
Task 5: complete (commits f6c0f73..336f560, review Approved — 17/17 SQL strings Saudi-scoped, contract exact)
Task 5: minor (deferred): tissue-term lookup queries unbounded (classification-only, not output)
Task 5: minor (deferred): focusStudy passes host=null to classifyHuman (organism query doesn't select s.host; name-based rules still catch the common human-metagenome cases)
Task 5: minor (deferred): SAMPLES_RUNS references r before declaration (valid SQLite, cosmetic)
Task 6 BASE: 336f560
Task 6: complete (commits 336f560..b45b73d, review Approved — d3 lifecycle clean, package diff minimal)
Task 6: minor (deferred): svgRef attached but never read (dead code); stale previous-focus graph renders during reload (cosmetic); per-tick setState (standard pattern)
Task 7 BASE: b45b73d
Task 7: complete (commits b45b73d..61f16dc, controller-run e2e green) — pages:dev on :8788; taxonomy 2146 rows, ontology_terms 165, sample_terms 15828 mirrored to wrangler local D1. Two defects found by the live smoke and fixed in 61f16dc: (1) wrangler FK failure on 007_star.sql root-caused to SAMLOC1-3 fixture rows missing from wrangler's DB (inserted; earlier check had validated against the shim snapshot, not live wrangler); (2) term/sample focus 503s caused by sample_terms-anchored queries reusing SAMPLES_RUNS with dangling ena_runs alias r — fixed with TERMS_SAMPLES join + regression test. Smoke: hub 200 (49 nodes, SRR34334023 absent), study focus 200 (publication + 50 term nodes), term focus 200 (term+50 samples+8 studies), sample focus 200, /graph page 200, stats/summary 200. Suites: vitest 102 passed, pytest 74 passed, typecheck clean.
Task 7: minor (deferred): study-focus tissue/terms queries still rely on SQLite forward-reference tolerance for r in SAMPLES_RUNS (works in D1's SQLite, flagged in Task 5)
