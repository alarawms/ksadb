"""Tests for the stdlib D1 shim (deploy/podman/d1-shim/app.py)."""
import json
import os
import sqlite3
import sys
import threading
import urllib.error
import urllib.request
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO / "deploy/podman/d1-shim"))
import app  # noqa: E402


@pytest.fixture()
def shim(tmp_path, monkeypatch):
    monkeypatch.setenv("PORT", "0")  # ephemeral port; 8000 may be occupied
    (tmp_path / "migrations").mkdir()
    src = REPO / "migrations"
    for name in ("0003_star_schema.sql", "0004_star_indexes.sql",
                 "0006_sync_meta.sql", "0007_embedded_entities.sql"):
        (tmp_path / "migrations" / name).write_text((src / name).read_text())
    (tmp_path / "aggregates").mkdir()
    server = app.init(str(tmp_path / "ksadb.db"),
                      str(tmp_path / "migrations"),
                      str(tmp_path / "aggregates"))
    server.start()
    yield f"http://127.0.0.1:{server.server_port}"
    server.stop()


def post(base, payload):
    req = urllib.request.Request(base + "/accounts/local/d1/database/local/query",
                                 data=json.dumps(payload).encode(),
                                 headers={"content-type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def test_batch_insert_select_roundtrip(shim):
    body = post(shim, {"batch": [
        {"sql": "INSERT INTO submitters (center_name) VALUES ('KAUST' )"},
    ]})
    # submitters schema may differ; use a table we know:
    body = post(shim, {"batch": [
        {"sql": ("INSERT INTO studies (accession, title) VALUES "
                 "('PRJTEST1', 'Test Study')")},
        {"sql": "SELECT accession, title FROM studies"},
    ]})
    assert body["success"] is True
    assert body["result"][0]["success"] is True
    assert body["result"][1]["results"] == [
        {"accession": "PRJTEST1", "title": "Test Study"}]


def test_error_returns_success_false_with_sqlite_message(shim):
    body = post(shim, {"batch": [{"sql": "SELECT * FROM no_such_table"}]})
    assert body["success"] is False
    assert "no such table" in body["errors"][0]["message"]
    # failed batch must roll back: good insert in the same batch is undone
    post(shim, {"batch": [
        {"sql": "INSERT INTO studies (accession, title) VALUES ('PRJRB1', 'x')"},
        {"sql": "SELECT bogus FROM studies"},
    ]})
    body = post(shim, {"batch": [
        {"sql": "SELECT accession FROM studies WHERE accession = 'PRJRB1'"}]})
    assert body["result"][0]["results"] == []


def test_aggregates_get(shim, tmp_path):
    (tmp_path / "aggregates" / "summary.json").write_text('{"runs": 3}')
    with urllib.request.urlopen(shim + "/aggregates/summary.json") as r:
        assert json.loads(r.read()) == {"runs": 3}
    with pytest.raises(urllib.error.HTTPError) as ei:
        urllib.request.urlopen(shim + "/aggregates/evil.json")
    assert ei.value.code == 404


def test_apply_sql_dir(shim, tmp_path):
    sql_dir = tmp_path / "seed"
    sql_dir.mkdir()
    (sql_dir / "001.sql").write_text(
        "INSERT INTO studies (accession, title) VALUES ('PRJAP1', 'applied');")
    with urllib.request.urlopen(shim + f"/admin/apply-sql?dir={sql_dir}") as r:
        assert json.loads(r.read()) == {"applied": 1}
    body = post(shim, {"batch": [
        {"sql": "SELECT title FROM studies WHERE accession = 'PRJAP1'"}]})
    assert body["result"][0]["results"] == [{"title": "applied"}]


def test_star_migrations_applied_on_init(shim):
    body = post(shim, {"batch": [{"sql": (
        "SELECT name FROM sqlite_master WHERE type='table' "
        "AND name IN ('ena_runs','studies','samples','sync_meta',"
        "'embedded_entities') ORDER BY name")}]})
    tables = [r["name"] for r in body["result"][0]["results"]]
    assert tables == ["embedded_entities", "ena_runs", "samples", "studies",
                      "sync_meta"]
