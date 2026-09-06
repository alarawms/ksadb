-- Indexes for the hot lookup/filter columns. The stats endpoints aggregate
-- over everything and are response-cached instead (see _lib/cache.ts); these
-- serve filtered searches and the /run related-runs queries, which must not
-- full-scan the runs table on every page view (D1 free tier meters rows read).
CREATE INDEX IF NOT EXISTS idx_runs_bioproject ON runs(bioproject_accession);
CREATE INDEX IF NOT EXISTS idx_runs_biosample ON runs(biosample_accession);
CREATE INDEX IF NOT EXISTS idx_runs_institution ON runs(institution_name);
CREATE INDEX IF NOT EXISTS idx_runs_organism ON runs(organism);
CREATE INDEX IF NOT EXISTS idx_runs_platform ON runs(platform);
CREATE INDEX IF NOT EXISTS idx_runs_year ON runs(year);
