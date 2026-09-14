"""Push normalized run rows to Cloudflare D1.

Two output modes:
- REST API (production / GitHub Actions): batched statement posts.
- SQL files (local dev): for `wrangler d1 execute --file`.
"""
import os
from datetime import datetime, timezone
from pathlib import Path

import requests

from sync.institutions import is_saudi_institution

RUN_TABLE_COLUMNS = [
    "run_accession", "bioproject_accession", "biosample_accession",
    "total_bases", "total_spots", "published_dt", "year", "platform",
    "instrument_model", "library_strategy", "library_source", "organism",
    "center_name", "organization_name", "institution_name", "geo_loc_name",
    "file_size_mb", "source", "is_saudi_submitter", "is_pathogen", "is_wgs",
]

DEFAULT_BASE_URL = "https://api.cloudflare.com/client/v4"
DEFAULT_BATCH = 25        # statements per REST request
DEFAULT_FILE_CHUNK = 2000  # statements per .sql file


def cf_base_url() -> str:
    """Cloudflare REST base. CF_API_BASE_URL overrides it for local stacks
    (e.g. the podman d1-shim); unset means production behavior."""
    return os.environ.get("CF_API_BASE_URL", DEFAULT_BASE_URL)


class D1Error(RuntimeError):
    pass


def sql_literal(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "1" if v else "0"
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, datetime):
        return "'" + v.strftime("%Y-%m-%d %H:%M:%S") + "'"
    return "'" + str(v).replace("'", "''") + "'"


def institutions_statements(rows: list[dict]) -> list[str]:
    flags: dict[str, int] = {}
    for row in rows:
        name = row.get("institution_name")
        if name:
            flags[name] = 1 if is_saudi_institution(name) else 0
    return [
        "INSERT INTO institutions (name, is_saudi) VALUES "
        f"({sql_literal(name)}, {flag}) "
        "ON CONFLICT(name) DO UPDATE SET is_saudi = excluded.is_saudi"
        for name, flag in sorted(flags.items())
    ]


def run_upsert_statements(rows: list[dict]) -> list[str]:
    columns = ", ".join(RUN_TABLE_COLUMNS)
    updates = ", ".join(
        f"{c} = excluded.{c}" for c in RUN_TABLE_COLUMNS if c != "run_accession"
    )
    stmts = []
    for row in rows:
        values = ", ".join(sql_literal(row.get(c)) for c in RUN_TABLE_COLUMNS)
        stmts.append(
            f"INSERT INTO runs ({columns}) VALUES ({values}) "
            f"ON CONFLICT(run_accession) DO UPDATE SET {updates}"
        )
    return stmts


def rebuild_statements() -> list[str]:
    return [
        "DELETE FROM bioprojects",
        "INSERT INTO bioprojects "
        "(bioproject_accession, title, institution_name, runs_count, total_bases) "
        "SELECT bioproject_accession, NULL, MAX(institution_name), COUNT(*), "
        "COALESCE(SUM(total_bases), 0) FROM runs "
        "WHERE bioproject_accession IS NOT NULL GROUP BY bioproject_accession",
        # Drop institution names no longer referenced by any run, e.g. when a
        # center-name mapping change (KAUST <- CBRC) renames them on re-push.
        "DELETE FROM institutions WHERE name NOT IN "
        "(SELECT DISTINCT institution_name FROM runs WHERE institution_name IS NOT NULL)",
    ]


def sync_run_statement(mode: str, row_count: int,
                       started: datetime, finished: datetime) -> str:
    return (
        "INSERT INTO sync_runs "
        "(started_at, finished_at, mode, rows_inserted, rows_updated, rows_unchanged) "
        "VALUES ("
        f"{sql_literal(started)}, {sql_literal(finished)}, {sql_literal(mode)}, "
        f"{row_count}, 0, 0)"
    )


def build_statements(rows: list[dict], *, mode: str,
                     started: datetime, finished: datetime) -> list[str]:
    return (
        institutions_statements(rows)
        + run_upsert_statements(rows)
        + rebuild_statements()
        + [sync_run_statement(mode, len(rows), started, finished)]
    )


class D1Client:
    def __init__(self, account_id, database_id, api_token,
                 base_url=DEFAULT_BASE_URL, http=requests):
        self.url = (f"{base_url}/accounts/{account_id}"
                    f"/d1/database/{database_id}/query")
        self.headers = {"Authorization": f"Bearer {api_token}"}
        self.http = http

    def execute(self, statements: list[str]) -> None:
        resp = self.http.post(
            self.url, headers=self.headers,
            json={"batch": [{"sql": s} for s in statements]}, timeout=120,
        )
        resp.raise_for_status()
        body = resp.json()
        if not body.get("success"):
            raise D1Error(f"D1 query failed: {body.get('errors')}")
        for result in body.get("result", []):
            if not result.get("success"):
                raise D1Error(f"D1 statement failed: {result.get('error')}")


def push_rows(rows: list[dict], *, mode: str = "push", account_id=None,
              database_id=None, api_token=None,
              base_url=DEFAULT_BASE_URL, http=requests,
              batch_size: int = DEFAULT_BATCH) -> dict:
    started = datetime.now(timezone.utc)
    client = D1Client(account_id, database_id, api_token,
                      base_url=base_url, http=http)
    statements = build_statements(
        rows, mode=mode, started=started, finished=datetime.now(timezone.utc)
    )
    for i in range(0, len(statements), batch_size):
        client.execute(statements[i:i + batch_size])
    return {"statements": len(statements), "rows": len(rows)}


def write_sql_files(rows: list[dict], out_dir, *, mode: str = "push",
                    file_chunk: int = DEFAULT_FILE_CHUNK) -> list[str]:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("*.sql"):
        old.unlink()
    started = datetime.now(timezone.utc)
    finished = datetime.now(timezone.utc)
    # Chunk the per-row statements; the rebuild + sync_runs tail always lands
    # in the last file so it is never split into its own chunk.
    head = institutions_statements(rows) + run_upsert_statements(rows)
    tail = rebuild_statements() + [
        sync_run_statement(mode, len(rows), started, finished)
    ]
    chunks = [head[i:i + file_chunk] for i in range(0, len(head), file_chunk)]
    if not chunks:
        chunks = [[]]
    files = []
    for idx, chunk in enumerate(chunks):
        if idx == len(chunks) - 1:
            chunk = chunk + tail
        path = out / f"{idx:03d}_seed.sql"
        path.write_text(";\n".join(chunk) + ";\n")
        files.append(str(path))
    return files
