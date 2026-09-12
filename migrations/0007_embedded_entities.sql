CREATE TABLE IF NOT EXISTS embedded_entities (
  type TEXT NOT NULL,
  accession TEXT NOT NULL,
  PRIMARY KEY (type, accession)
);
