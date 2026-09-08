import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from sync.star_push import build_statements, push_star, write_sql_files


def _entity(**over):
    e = {"submitter": {"center_name": "KAUST"},
         "study": {"accession": "PRJEB1", "title": "T", "abstract": "A",
                   "submitted_date": "2025-01-01"},
         "sample": {"biosample_accession": "SAMEA1", "organism": "Homo sapiens",
                    "tax_id": 9606, "host": None, "tissue": None, "country": "SA",
                    "region": "GCC", "collection_date": None, "lat_lon": None},
         "run": {"run_accession": "ERR1", "study_accession": "PRJEB1",
                 "biosample_accession": "SAMEA1", "bytes": 10, "spots": 1,
                 "platform": "ILLUMINA", "instrument_model": None,
                 "library_strategy": "WGS", "library_source": "GENOMIC",
                 "submitted_date": "2025-01-01", "fastq_ftp": "f",
                 "fastq_md5": "m", "fastq_bytes": "10", "source": "ena"}}
    e.update(over)
    return e


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


def test_statements_upsert_all_four_tables():
    e = {"submitter": {"center_name": "KAUST"},
         "study": {"accession": "PRJEB1", "title": "T", "abstract": "A", "submitted_date": "2025-01-01"},
         "sample": {"biosample_accession": "SAMEA1", "organism": "Homo sapiens", "tax_id": 9606,
                    "host": None, "tissue": None, "country": "SA", "region": "GCC",
                    "collection_date": None, "lat_lon": None},
         "run": {"run_accession": "ERR1", "study_accession": "PRJEB1", "biosample_accession": "SAMEA1",
                 "bytes": 10, "spots": 1, "platform": "ILLUMINA", "instrument_model": None,
                 "library_strategy": "WGS", "library_source": "GENOMIC", "submitted_date": "2025-01-01",
                 "fastq_ftp": "f", "fastq_md5": "m", "fastq_bytes": "10", "source": "ena"}}
    stmts = build_statements([e])
    sql = "\n".join(stmts)
    assert "INSERT OR IGNORE INTO submitters" in sql
    assert "INSERT INTO studies" in sql and "ON CONFLICT(accession) DO UPDATE" in sql
    assert "INSERT INTO samples" in sql
    assert "INSERT INTO ena_runs" in sql
    assert "(SELECT id FROM submitters WHERE center_name = 'KAUST')" in sql
    assert "'KAUST''s" not in sql  # no identifier mangling


def test_submitter_inserted_once_per_center_name():
    stmts = build_statements([_entity(), _entity(), _entity(run={"run_accession": "ERR2"})])
    assert sum("INSERT OR IGNORE INTO submitters" in s for s in stmts) == 1


def test_value_quoting_and_null_rendering():
    sql = "\n".join(build_statements([_entity()]))
    assert ("VALUES ('PRJEB1', 'T', 'A', "
            "(SELECT id FROM submitters WHERE center_name = 'KAUST'), "
            "'2025-01-01')") in sql
    assert ("VALUES ('SAMEA1', 'Homo sapiens', 9606, NULL, NULL, 'SA', "
            "'GCC', NULL, NULL)") in sql
    assert "VALUES ('ERR1', 'PRJEB1', 'SAMEA1', 10, 1, 'ILLUMINA', NULL" in sql


def test_missing_optional_entities():
    stmts = build_statements([{"submitter": {"center_name": "KAUST"}}])
    assert len(stmts) == 1


def test_push_star_batches_and_stats(d1_server):
    base_url, received, _ = d1_server
    entities = [_entity(run={"run_accession": f"ERR{i}"}) for i in range(10)]
    stats = push_star(entities, account_id="acc", database_id="db",
                      api_token="tok", base_url=base_url, batch=4)
    assert stats["statements"] == len(build_statements(entities))
    assert stats["entities"] == 10
    assert stats["batches"] == len(received)
    assert sum(len(r["body"]["batch"]) for r in received) == stats["statements"]
    assert all(len(r["body"]["batch"]) <= 4 for r in received)
    assert all(r["auth"] == "Bearer tok" for r in received)
    assert all(r["body"]["batch"][0]["sql"] for r in received)


def test_push_star_accepts_prebuilt_statements(d1_server):
    base_url, received, _ = d1_server
    stmts = ["INSERT OR IGNORE INTO submitters (center_name) VALUES ('KAUST')",
             "DELETE FROM ena_runs"]
    stats = push_star(stmts, "acc", "db", "tok", base_url=base_url, batch=1)
    assert stats["statements"] == 2
    assert stats["entities"] is None
    assert stats["batches"] == 2 == len(received)
    posted = [s["sql"] for r in received for s in r["body"]["batch"]]
    assert posted == stmts


def test_push_star_raises_on_d1_error(d1_server):
    from sync.d1_push import D1Error
    base_url, _received, set_fail = d1_server
    set_fail()
    with pytest.raises(D1Error):
        push_star([_entity()], account_id="a", database_id="d",
                  api_token="t", base_url=base_url)


def test_write_sql_files(tmp_path):
    stmts = build_statements([_entity()])
    files = write_sql_files(stmts, tmp_path, chunk=2)
    assert len(files) == 2
    text = "".join(f.read_text() for f in files)
    assert "INSERT OR IGNORE INTO submitters" in text
    assert "INSERT INTO ena_runs" in text
