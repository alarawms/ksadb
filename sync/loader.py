from pathlib import Path

import pandas as pd

from sync.normalize import clean, finalize_row

RUN_COLUMNS = [
    "run_accession", "bioproject_accession", "biosample_accession",
    "total_bases", "total_spots", "published_dt", "platform", "instrument_model",
    "library_strategy", "library_source", "organism", "center_name",
    "organization_name", "geo_loc_name", "file_size_mb", "source",
]

NUMERIC_COLUMNS = ("total_bases", "total_spots", "file_size_mb")


def _row_from_csv_record(rec: dict) -> dict:
    row = {c: clean(rec.get(c)) for c in RUN_COLUMNS}
    for col in NUMERIC_COLUMNS:
        row[col] = float(row[col]) if row[col] is not None else None
    published = row["published_dt"]
    row["published_dt"] = (
        pd.to_datetime(published).to_pydatetime() if published else None
    )
    return finalize_row(row)


def rows_from_csv(csv_path: str | Path) -> list[dict]:
    df = pd.read_csv(csv_path, low_memory=False)
    return [_row_from_csv_record(rec) for rec in df.to_dict("records")]
