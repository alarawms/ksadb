from pathlib import Path

from sync.loader import rows_from_csv

FIXTURE = Path(__file__).parent / "fixtures" / "runs_fixture.csv"


def test_rows_from_csv_count_and_types():
    rows = rows_from_csv(FIXTURE)
    assert len(rows) == 6
    row = next(r for r in rows if r["run_accession"] == "SRR1")
    assert row["bioproject_accession"] == "PRJNA1"
    assert isinstance(row["total_bases"], float)


def test_institutions_and_flags_derived():
    rows = rows_from_csv(FIXTURE)
    by_acc = {r["run_accession"]: r for r in rows}
    assert by_acc["SRR1"]["institution_name"] == "KAUST"
    assert by_acc["SRR1"]["is_saudi_submitter"] is True
    assert by_acc["SRR1"]["is_wgs"] is True
    assert by_acc["SRR2"]["is_wgs"] is False  # metagenome excluded from WGS
    assert by_acc["SRR3"]["is_pathogen"] is True
    assert by_acc["SRR4"]["institution_name"] == "University of Konstanz"
    assert by_acc["SRR4"]["is_saudi_submitter"] is False


def test_accessions_unique_and_year_parsed():
    rows = rows_from_csv(FIXTURE)
    accs = [r["run_accession"] for r in rows]
    assert len(accs) == len(set(accs))
    assert all(r["year"] is None or isinstance(r["year"], int) for r in rows)
