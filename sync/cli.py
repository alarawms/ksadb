import argparse
import os

from sync.d1_push import push_rows, write_sql_files
from sync.fetch import pull_rows
from sync.loader import rows_from_csv


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


def main():
    parser = argparse.ArgumentParser(prog="ksadb-sync")
    sub = parser.add_subparsers(dest="command", required=True)
    p_seed = sub.add_parser("seed")
    p_seed.add_argument("--csv", required=True)
    sub.add_parser("pull")
    p_push = sub.add_parser("push-d1")
    p_push.add_argument("--from-csv", required=True)
    args = parser.parse_args()

    if args.command == "seed":
        _deliver(rows_from_csv(args.csv), mode="seed")
    elif args.command == "push-d1":
        _deliver(rows_from_csv(args.from_csv), mode="seed")
    else:
        _deliver(pull_rows(), mode="pull")


if __name__ == "__main__":
    main()
