CREATE TABLE IF NOT EXISTS taxonomy (
  tax_id INTEGER PRIMARY KEY,
  scientific_name TEXT NOT NULL,
  genus TEXT,
  family TEXT,
  tax_order TEXT,
  tax_class TEXT,
  phylum TEXT
);
CREATE INDEX IF NOT EXISTS idx_taxonomy_genus ON taxonomy(genus);

CREATE TABLE IF NOT EXISTS ontology_terms (
  source_ontology TEXT NOT NULL,
  term_id TEXT NOT NULL,
  label TEXT NOT NULL,
  iri TEXT,
  field TEXT NOT NULL,
  value_norm TEXT NOT NULL,
  PRIMARY KEY (field, value_norm)
);

CREATE TABLE IF NOT EXISTS sample_terms (
  biosample_accession TEXT NOT NULL REFERENCES samples(biosample_accession),
  field TEXT NOT NULL,
  term_id TEXT NOT NULL,
  PRIMARY KEY (biosample_accession, field, term_id)
);
CREATE INDEX IF NOT EXISTS idx_sample_terms_term ON sample_terms(term_id);
