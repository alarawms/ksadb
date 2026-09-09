"""Push star-schema entities (submitters/studies/samples/runs) to Cloudflare D1.

Consumes entity dicts from `sync/star.py` and produces batched D1 REST
upserts, or standalone .sql files for `wrangler d1 execute --file`.
"""
import time
from pathlib import Path

import requests

from sync.d1_push import D1Error, DEFAULT_BASE_URL, sql_literal

STUDY_COLUMNS = ["accession", "title", "abstract", "submitter_id", "submitted_date"]
SAMPLE_COLUMNS = ["biosample_accession", "organism", "tax_id", "host", "tissue",
                  "country", "region", "collection_date", "lat_lon"]
RUN_COLUMNS = ["run_accession", "study_accession", "biosample_accession", "bytes",
               "spots", "platform", "instrument_model", "library_strategy",
               "library_source", "submitted_date", "fastq_ftp", "fastq_md5",
               "fastq_bytes", "source"]

DEFAULT_BATCH = 25
DEFAULT_FILE_CHUNK = 2000
BATCH_SLEEP = 0.25  # seconds between REST requests, to stay under D1 rate limits


class RawSQL:
    """Wrapper marking a value as raw SQL so sql_literal doesn't quote it."""

    def __init__(self, sql: str):
        self.sql = sql

    def __str__(self):
        return self.sql


def _upsert(table, columns, row, conflict):
    cols = ", ".join(columns)
    vals = ", ".join(
        str(v) if isinstance(v, RawSQL) else sql_literal(v)
        for v in (row.get(c) for c in columns)
    )
    updates = ", ".join(f"{c} = excluded.{c}" for c in columns)
    return (f"INSERT INTO {table} ({cols}) VALUES ({vals}) "
            f"ON CONFLICT({conflict}) DO UPDATE SET {updates}")


def build_statements(entities: list[dict]) -> list[str]:
    stmts, seen_submitters = [], set()
    for e in entities:
        sub = e.get("submitter")
        if sub and sub["center_name"] not in seen_submitters:
            seen_submitters.add(sub["center_name"])
            stmts.append("INSERT OR IGNORE INTO submitters (center_name) VALUES "
                         f"({sql_literal(sub['center_name'])})")
        study = dict(e["study"]) if e.get("study") else None
        if study:
            if sub:
                study["submitter_id"] = RawSQL(
                    "(SELECT id FROM submitters WHERE center_name = "
                    f"{sql_literal(sub['center_name'])})")
            stmts.append(_upsert("studies", STUDY_COLUMNS, study, "accession"))
        if e.get("sample"):
            stmts.append(_upsert("samples", SAMPLE_COLUMNS, e["sample"],
                                 "biosample_accession"))
        if e.get("run"):
            stmts.append(_upsert("ena_runs", RUN_COLUMNS, e["run"],
                                 "run_accession"))
    return stmts


def filter_new_rows(rows: list[dict], existing_runs: set) -> list[dict]:
    """Drop fetch rows whose run accession is already in D1 (resume support).

    `existing_runs` is a set of run_accession strings already present in the
    ena_runs table.
    """
    return [r for r in rows if r.get("run_accession") not in existing_runs]


def push_star(items, account_id=None, database_id=None, api_token=None,
              base_url=DEFAULT_BASE_URL, http=requests,
              batch: int = DEFAULT_BATCH) -> dict:
    """POST statements to D1 in batches.

    `items` is either a list of entity dicts (statements are built via
    `build_statements`) or a list of pre-built SQL statement strings,
    detected by the type of the first element.
    """
    url = (f"{base_url}/accounts/{account_id}"
           f"/d1/database/{database_id}/query")
    headers = {"Authorization": f"Bearer {api_token}"}
    if items and isinstance(items[0], dict):
        statements = build_statements(items)
        n_entities = len(items)
    else:
        statements = list(items)
        n_entities = None
    for i in range(0, len(statements), batch):
        chunk = statements[i:i + batch]
        resp = http.post(url, headers=headers,
                         json={"batch": [{"sql": s} for s in chunk]}, timeout=120)
        if resp.status_code != 200:
            raise D1Error(
                f"D1 batch HTTP {resp.status_code} at statements {i}-{i + len(chunk) - 1}: "
                f"{resp.text[:500]} | first stmt: {chunk[0][:200]}"
            )
        body = resp.json()
        if not body.get("success"):
            raise D1Error(f"D1 query failed: {body.get('errors')}")
        for result in body.get("result", []):
            if not result.get("success"):
                raise D1Error(f"D1 statement failed: {result.get('error')}")
        if i + batch < len(statements):
            time.sleep(BATCH_SLEEP)
    return {"statements": len(statements),
            "batches": (len(statements) + batch - 1) // batch,
            "entities": n_entities}


def write_sql_files(statements: list[str], out_dir, chunk: int = DEFAULT_FILE_CHUNK) -> list[Path]:
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("*.sql"):
        old.unlink()
    files = []
    for idx, i in enumerate(range(0, len(statements), chunk)):
        part = statements[i:i + chunk]
        path = out / f"{idx:03d}_star.sql"
        path.write_text(";\n".join(part) + ";\n")
        files.append(path)
    return files
