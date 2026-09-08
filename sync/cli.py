import argparse
import os

from sync.d1_push import push_rows, write_sql_files
from sync.fetch import pull_rows
from sync.loader import rows_from_csv
from sync.portal import COUNTRIES, fetch_country
from sync.star import row_to_entities
from sync.star_push import build_statements, push_star, write_sql_files as write_star_sql_files


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


def pull_portal_slice(countries=None) -> list[dict]:
    wanted = countries or list(COUNTRIES.values())
    rows = []
    for value in wanted:
        rows.extend(fetch_country(value))
    return rows


def cmd_pull_v2(args):
    rows = pull_portal_slice(args.country or None)
    entities = [row_to_entities(r) for r in rows]
    if args.dry_run:
        print(f"{len(entities)} entities from {len(rows)} runs")
        return
    stmts = build_statements(entities)
    out_dir = os.getenv("KSADB_D1_SQL_OUT")
    if out_dir:
        files = write_star_sql_files(stmts, out_dir)
        print(f"sql written: {len(files)} files -> {out_dir}")
        return
    stats = push_star(stmts, account_id=os.environ["D1_ACCOUNT_ID"],
                      database_id=os.environ["D1_DATABASE_ID"],
                      api_token=os.environ["D1_API_TOKEN"])
    print(f"push done: {stats}")


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
    args = parser.parse_args(argv)

    if args.command == "seed":
        _deliver(rows_from_csv(args.csv), mode="seed")
    elif args.command == "push-d1":
        _deliver(rows_from_csv(args.from_csv), mode="seed")
    elif args.command == "pull-v2":
        cmd_pull_v2(args)
    else:
        _deliver(pull_rows(), mode="pull")


if __name__ == "__main__":
    main()
