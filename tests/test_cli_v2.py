from sync.cli import main


def test_pull_v2_dry_run(monkeypatch, capsys, tmp_path):
    monkeypatch.setenv("KSADB_D1_SQL_OUT", str(tmp_path))
    monkeypatch.setattr("sync.cli.pull_portal_slice",
                        lambda countries=None, since=None: [
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


def test_pull_v2_passes_since_to_fetch(monkeypatch, capsys):
    captured = {}
    def fake_slice(countries=None, since=None):
        captured["countries"] = countries
        captured["since"] = since
        return []

    monkeypatch.delenv("KSADB_D1_SQL_OUT", raising=False)
    monkeypatch.setenv("D1_ACCOUNT_ID", "acct")
    monkeypatch.setenv("D1_DATABASE_ID", "db")
    monkeypatch.setenv("D1_API_TOKEN", "token")
    monkeypatch.setattr("sync.cli.pull_portal_slice", fake_slice)
    monkeypatch.setattr("sync.cli._read_v2_watermark",
                        lambda **kw: "2026-09-01 00:00:00")
    monkeypatch.setattr("sync.cli._existing_runs", lambda **kw: set())
    monkeypatch.setattr("sync.cli.push_star",
                        lambda stmts, **kw: {"statements": 0, "entities": None})
    main(["pull-v2"])
    assert captured["since"] == "2026-09-01 00:00:00"
    assert "push done" in capsys.readouterr().out


def test_pull_v2_bootstrap_when_no_watermark(monkeypatch):
    captured = {}
    def fake_slice(countries=None, since=None):
        captured["since"] = since
        return []

    monkeypatch.delenv("KSADB_D1_SQL_OUT", raising=False)
    monkeypatch.setenv("D1_ACCOUNT_ID", "acct")
    monkeypatch.setenv("D1_DATABASE_ID", "db")
    monkeypatch.setenv("D1_API_TOKEN", "token")
    monkeypatch.setattr("sync.cli.pull_portal_slice", fake_slice)
    monkeypatch.setattr("sync.cli._read_v2_watermark", lambda **kw: None)
    monkeypatch.setattr("sync.cli._existing_runs", lambda **kw: set())
    monkeypatch.setattr("sync.cli.push_star",
                        lambda stmts, **kw: {"statements": 0, "entities": None})
    main(["pull-v2"])
    assert captured["since"] is None  # full bootstrap pull
