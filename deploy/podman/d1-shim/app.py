#!/usr/bin/env python3
"""D1-compatible query shim over SQLite — local dev only.

Implements the exact REST surface the ksadb sync pipeline and Pages
functions' local flow use: batched SQL in one transaction, D1-shaped
responses, aggregates file serving, and bulk .sql application.
Stdlib only — no pip dependencies.
"""
import json
import os
import sqlite3
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# Full prod parity: production D1 has all 7 migrations applied, and the v1
# detail endpoints (records/projects/samples) query the legacy 0001 tables
# (runs/bioprojects/institutions) before falling back to the star schema.
APPLY_SCHEMA = [
    "0001_init.sql",
    "0002_indexes.sql",
    "0003_star_schema.sql",
    "0004_star_indexes.sql",
    "0005_embedded_studies.sql",
    "0006_sync_meta.sql",
    "0007_embedded_entities.sql",
]
ALLOWED_AGGREGATES = {
    "summary", "by-month", "by-country", "by-region",
    "by-organism", "by-submitter", "by-platform", "by-strategy",
}

_state = {"db": None, "migrations": None, "aggregates": None}


def init(db_path, migrations_dir, aggregates_dir):
    """Configure and boot the shim; returns a server (not yet serving)."""
    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
    os.makedirs(aggregates_dir, exist_ok=True)
    _state.update(db=db_path, migrations=migrations_dir,
                  aggregates=aggregates_dir)
    _apply_migrations()
    return _ShimServer(("0.0.0.0", int(os.environ.get("PORT", "8000"))),
                       _Handler)


def _connect():
    conn = sqlite3.connect(_state["db"])
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _apply_migrations():
    conn = _connect()
    conn.execute("CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY)")
    done = {r[0] for r in conn.execute("SELECT name FROM _migrations")}
    for name in APPLY_SCHEMA:
        if name in done:
            continue
        path = Path(_state["migrations"]) / name
        conn.executescript(path.read_text())
        conn.execute("INSERT INTO _migrations VALUES (?)", (name,))
    conn.commit()
    conn.close()


def _run_batch(statements):
    conn = _connect()
    results = []
    try:
        for stmt in statements:
            cur = conn.execute(stmt)
            if cur.description:
                cols = [d[0] for d in cur.description]
                rows = [dict(zip(cols, row)) for row in cur.fetchall()]
            else:
                rows = []
            results.append({"results": rows, "success": True,
                            "meta": {"changes": max(cur.rowcount, 0),
                                     "duration": 0}})
        conn.commit()
        return {"result": results, "success": True, "errors": []}
    except sqlite3.Error as exc:
        conn.rollback()
        return {"result": [], "success": False,
                "errors": [{"code": 7500, "message": str(exc)}]}
    finally:
        conn.close()


class _Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):  # keep test/compose logs clean
        pass

    def _send(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        parsed = urlparse(self.path)
        if not parsed.path.endswith("/d1/database/local/query") and \
           not parsed.path.endswith("/d1/database/ksadb-db/query"):
            self._send(404, {"error": "not found"})
            return
        length = int(self.headers.get("content-length", "0"))
        body = json.loads(self.rfile.read(length) or b"{}")
        batch = body.get("batch") or [{"sql": body.get("sql", "")}]
        self._send(200, _run_batch([item["sql"] for item in batch]))

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/aggregates/") and path.endswith(".json"):
            name = path[len("/aggregates/"):-len(".json")]
            if name not in ALLOWED_AGGREGATES:
                self._send(404, {"error": "not found"})
                return
            target = Path(_state["aggregates"]) / f"{name}.json"
            if not target.exists():
                self._send(404, {"error": "not found"})
                return
            self._send(200, json.loads(target.read_text()))
            return
        if path == "/admin/apply-sql":
            directory = parse_qs(parsed.query).get("dir", [""])[0]
            files = sorted(Path(directory).glob("*.sql")) if directory else []
            if not files:
                self._send(404, {"error": "no sql files in dir"})
                return
            conn = _connect()
            try:
                for f in files:
                    conn.executescript(f.read_text())
                conn.commit()
            except sqlite3.Error as exc:
                conn.rollback()
                self._send(400, {"error": str(exc)})
                return
            finally:
                conn.close()
            self._send(200, {"applied": len(files)})
            return
        self._send(404, {"error": "not found"})


class _ShimServer(ThreadingHTTPServer):
    daemon_threads = True

    def start(self):
        self._thread = threading.Thread(target=self.serve_forever,
                                        kwargs={"poll_interval": 0.1},
                                        daemon=True)
        self._thread.start()

    def stop(self):
        self.shutdown()
        self.server_close()


if __name__ == "__main__":
    srv = init(os.environ.get("SHIM_DB", "/data/ksadb.db"),
               os.environ.get("MIGRATIONS_DIR", "/migrations"),
               os.environ.get("AGGREGATES_DIR", "/aggregates"))
    print(f"d1-shim on :{srv.server_port}", flush=True)
    srv.serve_forever()
