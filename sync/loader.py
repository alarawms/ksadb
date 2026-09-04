from datetime import datetime
from pathlib import Path

import pandas as pd
from sqlalchemy import delete, func, select

from api.models import Bioproject, Institution, Run, SyncRun
from api.sync.institutions import is_saudi_institution
from api.sync.normalize import clean, finalize_row

RUN_COLUMNS = [
    "run_accession", "bioproject_accession", "biosample_accession",
    "total_bases", "total_spots", "published_dt", "platform", "instrument_model",
    "library_strategy", "library_source", "organism", "center_name",
    "organization_name", "geo_loc_name", "file_size_mb", "source",
]


def _row_from_csv_record(rec: dict) -> dict:
    row = {c: clean(rec.get(c)) for c in RUN_COLUMNS}
    published = row["published_dt"]
    row["published_dt"] = (
        pd.to_datetime(published).to_pydatetime() if published else None
    )
    return finalize_row(row)


def upsert_runs(db, rows: list[dict]) -> dict:
    stats = {"inserted": 0, "updated": 0, "unchanged": 0}
    for row in rows:
        existing = db.get(Run, row["run_accession"])
        if existing is None:
            db.add(Run(**row))
            stats["inserted"] += 1
        else:
            changed = False
            for key, value in row.items():
                if key == "run_accession":
                    continue
                if getattr(existing, key) != value:
                    setattr(existing, key, value)
                    changed = True
            stats["updated" if changed else "unchanged"] += 1
    db.commit()
    return stats


def rebuild_derived(db) -> None:
    names = db.scalars(
        select(Run.institution_name).where(Run.institution_name.is_not(None)).distinct()
    ).all()
    for name in names:
        inst = db.get(Institution, name) or Institution(name=name)
        inst.is_saudi = is_saudi_institution(name)
        db.add(inst)

    db.execute(delete(Bioproject))
    agg = db.execute(
        select(
            Run.bioproject_accession,
            func.count(Run.run_accession),
            func.sum(Run.total_bases),
            func.max(Run.institution_name),
        )
        .where(Run.bioproject_accession.is_not(None))
        .group_by(Run.bioproject_accession)
    ).all()
    for accession, runs_count, total_bases, institution_name in agg:
        db.add(
            Bioproject(
                bioproject_accession=accession,
                runs_count=runs_count,
                total_bases=total_bases or 0.0,
                institution_name=institution_name,
            )
        )
    db.commit()


def record_sync(db, mode: str, stats: dict) -> None:
    db.add(
        SyncRun(
            started_at=datetime.utcnow(),
            finished_at=datetime.utcnow(),
            mode=mode,
            rows_inserted=stats.get("inserted", 0),
            rows_updated=stats.get("updated", 0),
            rows_unchanged=stats.get("unchanged", 0),
        )
    )
    db.commit()


def seed_from_csv(db, csv_path: str | Path) -> dict:
    df = pd.read_csv(csv_path, low_memory=False)
    rows = [_row_from_csv_record(rec) for rec in df.to_dict("records")]
    stats = upsert_runs(db, rows)
    rebuild_derived(db)
    record_sync(db, "seed", stats)
    return stats
