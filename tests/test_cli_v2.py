from sync.cli import main


def test_pull_v2_dry_run(monkeypatch, capsys, tmp_path):
    monkeypatch.setenv("KSADB_D1_SQL_OUT", str(tmp_path))
    monkeypatch.setattr("sync.cli.pull_portal_slice", lambda countries=None: [
        {"run_accession": "ERR1", "study_accession": "PRJEB1", "sample_accession": "SAMEA1",
         "secondary_sample_accession": "", "study_title": "T", "sample_description": "d",
         "scientific_name": "X", "tax_id": "1", "instrument_platform": "ILLUMINA",
         "instrument_model": None, "library_strategy": "WGS", "library_source": "GENOMIC",
         "center_name": "C", "first_public": "2025-01-01", "country": "Saudi Arabia",
         "collection_date": None, "location": None, "host": None, "tissue": None,
         "fastq_ftp": None, "fastq_md5": None, "fastq_bytes": None,
         "read_count": "1", "base_count": "10"}])
    main(["pull-v2", "--dry-run"])
    assert "entities" in capsys.readouterr().out
