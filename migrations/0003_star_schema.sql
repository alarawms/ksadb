CREATE TABLE IF NOT EXISTS submitters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  center_name TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS studies (
  accession TEXT PRIMARY KEY,
  title TEXT,
  abstract TEXT,
  submitter_id INTEGER REFERENCES submitters(id),
  submitted_date TEXT
);
CREATE TABLE IF NOT EXISTS samples (
  biosample_accession TEXT PRIMARY KEY,
  organism TEXT,
  tax_id INTEGER,
  host TEXT,
  tissue TEXT,
  country TEXT,
  region TEXT,
  collection_date TEXT,
  lat_lon TEXT
);
CREATE TABLE IF NOT EXISTS ena_runs (
  run_accession TEXT PRIMARY KEY,
  study_accession TEXT NOT NULL REFERENCES studies(accession),
  biosample_accession TEXT REFERENCES samples(biosample_accession),
  bytes INTEGER,
  spots INTEGER,
  platform TEXT,
  instrument_model TEXT,
  library_strategy TEXT,
  library_source TEXT,
  submitted_date TEXT,
  fastq_ftp TEXT,
  fastq_md5 TEXT,
  fastq_bytes TEXT,
  source TEXT NOT NULL DEFAULT 'ena'
);
