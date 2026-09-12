-- Minimal star-schema fixture for the podman smoke test.
-- 2 studies (1 with abstract), 1 submitter, 3 samples (2 SA + 1 non-SA), 3 runs.
-- SAMLOC3/ERRLOC3 are deliberately non-Saudi: the embed step must EXCLUDE them
-- (samples.country = 'SA' filter), while `aggregate` still counts all 3 runs.
INSERT INTO submitters (id, center_name) VALUES (1, 'KAUST');
INSERT INTO studies (accession, title, abstract, submitter_id)
VALUES ('PRJLOC1', 'Camel metagenomics pilot', 'Gut metagenomes of dromedary camels in Saudi Arabia.', 1);
INSERT INTO studies (accession, title, abstract, submitter_id)
VALUES ('PRJLOC2', 'Date palm transcriptomics', NULL, 1);
INSERT INTO samples (biosample_accession, organism, tax_id, host, tissue, country, region, collection_date, lat_lon)
VALUES ('SAMLOC1', 'Camelus dromedarius', 9838, NULL, 'gut', 'SA', 'Makkah', '2024-03-01', NULL);
INSERT INTO samples (biosample_accession, organism, tax_id, host, tissue, country, region, collection_date, lat_lon)
VALUES ('SAMLOC2', 'Phoenix dactylifera', 42345, NULL, 'leaf', 'SA', 'Riyadh', '2024-04-15', NULL);
INSERT INTO samples (biosample_accession, organism, tax_id, host, tissue, country, region, collection_date, lat_lon)
VALUES ('SAMLOC3', 'Homo sapiens', 9606, NULL, NULL, NULL, NULL, '2024-01-01', NULL);
INSERT INTO ena_runs (run_accession, study_accession, biosample_accession, bytes, submitted_date, platform, instrument_model, library_strategy, library_source)
VALUES ('ERRLOC1', 'PRJLOC1', 'SAMLOC1', 1000, '2024-03-05', 'ILLUMINA', 'NovaSeq', 'WGS', 'METAGENOMIC');
INSERT INTO ena_runs (run_accession, study_accession, biosample_accession, bytes, submitted_date, platform, instrument_model, library_strategy, library_source)
VALUES ('ERRLOC2', 'PRJLOC1', 'SAMLOC1', 2000, '2024-03-06', 'ILLUMINA', 'NovaSeq', 'WGS', 'METAGENOMIC');
INSERT INTO ena_runs (run_accession, study_accession, biosample_accession, bytes, submitted_date, platform, instrument_model, library_strategy, library_source)
VALUES ('ERRLOC3', 'PRJLOC2', 'SAMLOC3', 3000, '2024-01-10', 'ILLUMINA', 'MiSeq', 'RNA-SEQ', 'TRANSCRIPTOMIC');
