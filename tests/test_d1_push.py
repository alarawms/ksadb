import json
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from sync.d1_push import (
    D1Error,
    RUN_TABLE_COLUMNS,
    build_statements,
    institutions_statements,
    push_rows,
    rebuild_statements,
    run_upsert_statements,
    sql_literal,
    write_sql_files,
)


def _blank_row(**over):
    row = {c: None for c in RUN_TABLE_COLUMNS}
    row.update(over)
    return row


@pytest.fixture()
def d1_server():
    received = []
    state = {"fail": False}

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            length = int(self.headers["Content-Length"])
            body = json.loads(self.rfile.read(length))
            received.append({"body": body, "auth": self.headers.get("Authorization")})
            if state["fail"]:
                payload = json.dumps(
                    {"success": False, "errors": [{"message": "boom"}]}
                ).encode()
            else:
                n = len(body.get("batch", []))
                payload = json.dumps(
                    {"success": True,
                     "result": [{"success": True, "results": []}] * max(n, 1)}
                ).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(payload)

        def log_message(self, *args):
            pass

    server = HTTPServer(("127.0.0.1", 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{server.server_port}", received, lambda: state.update(fail=True)
    server.shutdown()
    thread.join()


def test_sql_literal_types():
    assert sql_literal(None) == "NULL"
    assert sql_literal(True) == "1"
    assert sql_literal(False) == "0"
    assert sql_literal(42) == "42"
    assert sql_literal(1.5) == "1.5"
    assert sql_literal("O'Neil") == "'O''Neil'"
    assert sql_literal(datetime(2024, 1, 2, 3, 4, 5)) == "'2024-01-02 03:04:05'"


def test_institutions_statements_flags_and_conflict():
    rows = [
        {"institution_name": "KAUST"},
        {"institution_name": "University of Konstanz"},
        {"institution_name": None},
    ]
    stmts = institutions_statements(rows)
    assert len(stmts) == 2
    assert "('KAUST', 1)" in stmts[0]
    assert "('University of Konstanz', 0)" in stmts[1]
    assert "ON CONFLICT(name) DO UPDATE" in stmts[0]


def test_run_upsert_statements_shape_and_escaping():
    stmt = run_upsert_statements([
        _blank_row(run_accession="SRR1", organism="Staph, 'weird'", is_wgs=True)
    ])[0]
    assert stmt.startswith("INSERT INTO runs (")
    assert "ON CONFLICT(run_accession) DO UPDATE SET" in stmt
    assert "'Staph, ''weird'''" in stmt


def test_rebuild_statements():
    stmts = rebuild_statements()
    assert stmts[0] == "DELETE FROM bioprojects"
    assert stmts[1].startswith("INSERT INTO bioprojects")
    assert "GROUP BY bioproject_accession" in stmts[1]
    assert stmts[2].startswith("DELETE FROM institutions WHERE name NOT IN")


def test_build_statements_order():
    rows = [_blank_row(run_accession="SRR1", institution_name="KAUST")]
    stmts = build_statements(rows, mode="seed",
                             started=datetime(2024, 1, 1), finished=datetime(2024, 1, 2))
    assert stmts[0].startswith("INSERT INTO institutions")
    assert stmts[1].startswith("INSERT INTO runs")
    assert "DELETE FROM bioprojects" in stmts
    assert stmts[-1].startswith("INSERT INTO sync_runs")


def test_push_rows_batches_and_auth(d1_server):
    base_url, received, _ = d1_server
    rows = [_blank_row(run_accession=f"SRR{i}") for i in range(10)]
    stats = push_rows(rows, mode="seed", account_id="acc", database_id="db",
                      api_token="tok", base_url=base_url, batch_size=4)
    assert stats["rows"] == 10
    assert sum(len(r["body"]["batch"]) for r in received) == stats["statements"]
    assert all(len(r["body"]["batch"]) <= 4 for r in received)
    assert all(r["auth"] == "Bearer tok" for r in received)


def test_push_rows_raises_on_d1_error(d1_server):
    base_url, _received, set_fail = d1_server
    set_fail()
    with pytest.raises(D1Error):
        push_rows([_blank_row(run_accession="SRR1")], account_id="a",
                  database_id="d", api_token="t", base_url=base_url)


def test_write_sql_files(tmp_path):
    rows = [_blank_row(run_accession=f"SRR{i}") for i in range(5)]
    files = write_sql_files(rows, tmp_path, file_chunk=3)
    assert len(files) == 2
    text = "".join(open(f).read() for f in files)
    assert "INSERT INTO runs" in text
    assert "DELETE FROM bioprojects" in text
    assert "INSERT INTO sync_runs" in text
