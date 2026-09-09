import argparse
import os

import requests

from sync.aggregate import run_aggregates
from sync.d1_push import (DEFAULT_BASE_URL, D1Error, push_rows, sql_literal,
                          write_sql_files)
from sync.embed import cmd_embed
from sync.fetch import pull_rows
from sync.loader import rows_from_csv
from sync.portal import COUNTRIES, fetch_country
from sync.star import row_to_entities
from sync.star_push import build_statements, filter_new_rows, push_star, write_sql_files as write_star_sql_files

V2_WATERMARK_KEY = "v2_last_sync"


def _deliver(rows: list[dict], mode: str) -> None:
    out_dir = os.getenv("KSADB_D1_SQL_OUT")
    if out_dir:
        files = write_sql_files(rows, out_dir, mode=mode)
        print(f"sql written: {len(files)} files -> {out_dir}")
        return
    stats = push_rows(
        rows, mode=mode,
        account_id=os.environ["D1_ACCOUNT_ID"],
        database_id=os.environ["D1_DATABASE_ID"],
        api_token=os.environ["D1_API_TOKEN"],
    )
    print(f"push done: {stats}")


def pull_portal_slice(countries=None, since=None) -> list[dict]:
    wanted = countries or list(COUNTRIES.values())
    rows = []
    for value in wanted:
        rows.extend(fetch_country(value, since=since))
    return rows


def _d1_query(sql, *, account_id, database_id, api_token) -> dict:
    url = (f"{DEFAULT_BASE_URL}/accounts/{account_id}"
           f"/d1/database/{database_id}/query")
    resp = requests.post(url, headers={"Authorization": f"Bearer {api_token}"},
                         json={"batch": [{"sql": sql}]}, timeout=120)
    resp.raise_for_status()
    body = resp.json()
    if not body.get("success"):
        raise D1Error(f"D1 query failed: {body.get('errors')}")
    return body


def _env_int(name):
    raw = os.getenv(name)
    if not raw:
        return None
    try:
        return int(raw)
    except ValueError:
        return None


def _existing_runs(*, account_id, database_id, api_token) -> set:
    """All run accessions currently in ena_runs (for resume de-dup)."""
    body = _d1_query("SELECT run_accession FROM ena_runs",
                     account_id=account_id, database_id=database_id,
                     api_token=api_token)
    return {r["run_accession"]
            for res in body.get("result", []) for r in res.get("results", [])}


def _read_v2_watermark(*, account_id, database_id, api_token):
    """Return the stored v2 watermark, or None if unset/unavailable.

    A missing sync_meta table (migration not applied) is treated as "no
    watermark" so the first run bootstraps with a full pull.
    """
    try:
        body = _d1_query(
            "SELECT value FROM sync_meta WHERE key = "
            f"{sql_literal(V2_WATERMARK_KEY)}",
            account_id=account_id, database_id=database_id, api_token=api_token)
    except D1Error as e:
        if "no such table" in str(e):
            return None
        raise
    results = body.get("result", [{}])[0].get("results", [])
    return results[0]["value"] if results else None


def _write_v2_watermark(value, *, account_id, database_id, api_token):
    stmt = ("INSERT INTO sync_meta (key, value) VALUES "
            f"({sql_literal(V2_WATERMARK_KEY)}, {sql_literal(value)}) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    push_star([stmt], account_id=account_id, database_id=database_id,
              api_token=api_token)


def cmd_pull_v2(args):
    # Incremental (watermarked) sync only applies to the real push path —
    # dry-run and SQL-file output always represent the full slice.
    out_dir = os.getenv("KSADB_D1_SQL_OUT")
    since = None
    if not args.dry_run and not out_dir:
        since = _read_v2_watermark(account_id=os.environ["D1_ACCOUNT_ID"],
                                   database_id=os.environ["D1_DATABASE_ID"],
                                   api_token=os.environ["D1_API_TOKEN"])
        if since:
            print(f"incremental sync since {since}")
    rows = pull_portal_slice(args.country or None, since=since)
    entities = [row_to_entities(r) for r in rows]
    if args.dry_run:
        print(f"{len(entities)} entities from {len(rows)} runs")
        return
    stmts = build_statements(entities)
    if out_dir:
        files = write_star_sql_files(stmts, out_dir)
        print(f"sql written: {len(files)} files -> {out_dir}")
        return
    # Resume (real push path only): drop entities whose run is already in D1
    # (e.g. a previous run died mid-push). Keeps re-runs inside the daily
    # write budget. Safe for FKs: batches apply as a strict prefix, so any
    # run already in D1 has its study/sample rows already in D1 too.
    existing = _existing_runs(account_id=os.environ["D1_ACCOUNT_ID"],
                              database_id=os.environ["D1_DATABASE_ID"],
                              api_token=os.environ["D1_API_TOKEN"])
    all_rows = rows
    before = len(rows)
    rows = filter_new_rows(rows, existing)
    if before - len(rows):
        print(f"resume: skipping {before - len(rows)} runs already in D1")
    # Nightly write-budget cap: push at most this many NEW runs per night.
    # The resume logic picks up where the previous night stopped, so the
    # bootstrap fills gradually; raise or unset V2_MAX_RUNS to scale up.
    max_runs = args.max_runs or _env_int("V2_MAX_RUNS")
    if max_runs is not None and len(rows) > max_runs:
        print(f"capping tonight's push at {max_runs} of {len(rows)} new runs")
        rows = rows[:max_runs]
        capped = True
    else:
        capped = False
    if not rows:
        print("nothing new to push")
        return
    entities = [row_to_entities(r) for r in rows]
    stmts = build_statements(entities)
    stats = push_star(stmts, account_id=os.environ["D1_ACCOUNT_ID"],
                      database_id=os.environ["D1_DATABASE_ID"],
                      api_token=os.environ["D1_API_TOKEN"])
    print(f"push done: {stats}")
    # Advance the watermark only after a successful push, and only to the
    # newest row actually fetched — a run with zero changed rows leaves it
    # untouched so the next run re-scans the same window. Uses all_rows (not
    # the resume-filtered subset) so a resumed run never regresses it. On a
    # CAPPED run the tail is deliberately unpushed, so advancing would skip
    # it forever — leave the watermark for the next night.
    updated = [] if capped else [r.get("last_updated") for r in all_rows if r.get("last_updated")]
    if updated:
        _write_v2_watermark(max(updated), account_id=os.environ["D1_ACCOUNT_ID"],
                            database_id=os.environ["D1_DATABASE_ID"],
                            api_token=os.environ["D1_API_TOKEN"])


def cmd_aggregate(args):
    paths = run_aggregates(
        account_id=os.environ["D1_ACCOUNT_ID"],
        database_id=os.environ["D1_DATABASE_ID"],
        api_token=os.environ["D1_API_TOKEN"],
        out_dir=args.out_dir,
    )
    print(f"aggregates written: {len(paths)} files -> {args.out_dir}")


def main(argv=None):
    parser = argparse.ArgumentParser(prog="ksadb-sync")
    sub = parser.add_subparsers(dest="command", required=True)
    p_seed = sub.add_parser("seed")
    p_seed.add_argument("--csv", required=True)
    sub.add_parser("pull")
    p_push = sub.add_parser("push-d1")
    p_push.add_argument("--from-csv", required=True)
    p_v2 = sub.add_parser("pull-v2")
    p_v2.add_argument("--country", action="append")
    p_v2.add_argument("--dry-run", action="store_true")
    p_v2.add_argument("--max-runs", type=int, default=None,
                      help="cap new runs pushed tonight (bootstrap pacing; "
                           "the resume logic continues next run)")
    p_agg = sub.add_parser("aggregate")
    p_agg.add_argument("--out-dir", required=True)
    sub.add_parser("embed")
    args = parser.parse_args(argv)

    if args.command == "seed":
        _deliver(rows_from_csv(args.csv), mode="seed")
    elif args.command == "push-d1":
        _deliver(rows_from_csv(args.from_csv), mode="seed")
    elif args.command == "pull-v2":
        cmd_pull_v2(args)
    elif args.command == "aggregate":
        cmd_aggregate(args)
    elif args.command == "embed":
        cmd_embed()
    else:
        _deliver(pull_rows(), mode="pull")


if __name__ == "__main__":
    main()
