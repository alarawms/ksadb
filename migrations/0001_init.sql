CREATE TABLE institutions (
  name TEXT PRIMARY KEY,
  is_saudi INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE bioprojects (
  bioproject_accession TEXT PRIMARY KEY,
  title TEXT,
  institution_name TEXT REFERENCES institutions(name),
  runs_count INTEGER NOT NULL DEFAULT 0,
  total_bases REAL NOT NULL DEFAULT 0
);

CREATE TABLE runs (
  run_accession TEXT PRIMARY KEY,
  bioproject_accession TEXT,
  biosample_accession TEXT,
  total_bases REAL,
  total_spots REAL,
  published_dt TEXT,
  year INTEGER,
  platform TEXT,
  instrument_model TEXT,
  library_strategy TEXT,
  library_source TEXT,
  organism TEXT,
  center_name TEXT,
  organization_name TEXT,
  institution_name TEXT REFERENCES institutions(name),
  geo_loc_name TEXT,
  file_size_mb REAL,
  source TEXT NOT NULL,
  is_saudi_submitter INTEGER NOT NULL DEFAULT 0,
  is_pathogen INTEGER NOT NULL DEFAULT 0,
  is_wgs INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX ix_runs_organism ON runs (organism);
CREATE INDEX ix_runs_platform ON runs (platform);
CREATE INDEX ix_runs_year ON runs (year);
CREATE INDEX ix_runs_bioproject ON runs (bioproject_accession);
CREATE INDEX ix_runs_institution ON runs (institution_name);

CREATE TABLE sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT,
  finished_at TEXT,
  mode TEXT NOT NULL,
  rows_inserted INTEGER NOT NULL DEFAULT 0,
  rows_updated INTEGER NOT NULL DEFAULT 0,
  rows_unchanged INTEGER NOT NULL DEFAULT 0
);
