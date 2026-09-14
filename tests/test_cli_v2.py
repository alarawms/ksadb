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
    # Empty slice: nothing new, no push, no watermark write.
    assert "nothing new to push" in capsys.readouterr().out


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


def _row(acc):
    return {"run_accession": acc, "study_accession": "PRJEB1",
            "sample_accession": "SAMEA1", "secondary_sample_accession": "",
            "study_title": "T", "sample_description": "d", "scientific_name": "X",
            "tax_id": "1", "instrument_platform": "ILLUMINA",
            "instrument_model": None, "library_strategy": "WGS",
            "library_source": "GENOMIC", "center_name": "C",
            "first_public": "2025-01-01", "country": "Saudi Arabia",
            "collection_date": None, "location": None, "host": None,
            "tissue": None, "fastq_ftp": None, "fastq_md5": None,
            "fastq_bytes": None, "read_count": "1", "base_count": "10",
            "last_updated": "2026-09-01 00:00:00"}


def test_pull_v2_max_runs_caps_and_skips_watermark(monkeypatch, capsys):
    pushed = {}
    def fake_slice(countries=None, since=None):
        return [_row(f"ERR{i}") for i in range(5)]
    def fake_push(stmts, **kw):
        pushed["n"] = len(stmts)
        return {"statements": len(stmts), "entities": None}
    watermark = {}
    def fake_watermark(value, **kw):
        watermark["value"] = value

    monkeypatch.delenv("KSADB_D1_SQL_OUT", raising=False)
    monkeypatch.delenv("V2_MAX_RUNS", raising=False)
    monkeypatch.setenv("D1_ACCOUNT_ID", "acct")
    monkeypatch.setenv("D1_DATABASE_ID", "db")
    monkeypatch.setenv("D1_API_TOKEN", "token")
    monkeypatch.setattr("sync.cli.pull_portal_slice", fake_slice)
    monkeypatch.setattr("sync.cli._read_v2_watermark", lambda **kw: None)
    monkeypatch.setattr("sync.cli._existing_runs", lambda **kw: set())
    monkeypatch.setattr("sync.cli.push_star", fake_push)
    monkeypatch.setattr("sync.cli._write_v2_watermark", fake_watermark)

    main(["pull-v2", "--max-runs", "2"])
    assert pushed["n"] == 7  # 4 stmts (incl. submitter insert) + 3 for the 2nd run
    assert "capping" in capsys.readouterr().out
    assert "value" not in watermark  # capped run must not advance the watermark

    # Uncapped run advances the watermark.
    main(["pull-v2"])
    assert watermark["value"] == "2026-09-01 00:00:00"


def test_pull_v2_env_max_runs(monkeypatch, capsys):
    pushed = {}
    monkeypatch.delenv("KSADB_D1_SQL_OUT", raising=False)
    monkeypatch.setenv("V2_MAX_RUNS", "1")
    monkeypatch.setenv("D1_ACCOUNT_ID", "acct")
    monkeypatch.setenv("D1_DATABASE_ID", "db")
    monkeypatch.setenv("D1_API_TOKEN", "token")
    monkeypatch.setattr("sync.cli.pull_portal_slice",
                        lambda countries=None, since=None: [_row(f"ERR{i}") for i in range(3)])
    monkeypatch.setattr("sync.cli._read_v2_watermark", lambda **kw: None)
    monkeypatch.setattr("sync.cli._existing_runs", lambda **kw: set())
    monkeypatch.setattr("sync.cli.push_star",
                        lambda stmts, **kw: pushed.setdefault("n", len(stmts)) or {"statements": 0, "entities": None})
    monkeypatch.setattr("sync.cli._write_v2_watermark", lambda *a, **k: None)
    main(["pull-v2"])
    assert pushed["n"] == 4  # 1 run: submitter + study + sample + run
