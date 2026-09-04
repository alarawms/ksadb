import io
import time

import pandas as pd
import requests

from sync.normalize import finalize_row

NCBI_EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
ENA_PORTAL = "https://www.ebi.ac.uk/ena/portal/api/search"

ENA_FIELDS = (
    "run_accession,study_accession,secondary_sample_accession,base_count,"
    "read_count,first_public,instrument_platform,instrument_model,"
    "library_strategy,library_source,scientific_name,center_name"
)


def fetch_ncbi(http=requests, term='"Saudi Arabia"[Country]', chunk: int = 10000):
    """Fetch SRA runinfo for the given esearch term; return canonical row dicts."""
    resp = http.get(
        f"{NCBI_EUTILS}/esearch.fcgi",
        params={
            "db": "sra",
            "term": term,
            "retmode": "json",
            "retmax": 0,
            "usehistory": "y",
        },
        timeout=60,
    )
    resp.raise_for_status()
    result = resp.json()["esearchresult"]
    webenv, query_key, count = result["webenv"], result["querykey"], int(result["count"])

    rows: list[dict] = []
    # Always issue at least one efetch: a history-based esearch may report
    # count 0 while the WebEnv still holds records.
    for start in range(0, count if count else 1, chunk):
        r = http.get(
            f"{NCBI_EUTILS}/efetch.fcgi",
            params={
                "db": "sra",
                "query_key": query_key,
                "WebEnv": webenv,
                "rettype": "runinfo",
                "retmode": "text",
                "retstart": start,
                "retmax": chunk,
            },
            timeout=180,
        )
        r.raise_for_status()
        df = pd.read_csv(io.StringIO(r.text))
        for rec in df.to_dict("records"):
            rows.append(_ncbi_row(rec))
        time.sleep(0.35)  # be polite to NCBI
    return rows


def _ncbi_row(rec: dict) -> dict:
    def g(key):
        v = rec.get(key)
        return None if pd.isna(v) else v

    published = g("ReleaseDate")
    return finalize_row(
        {
            "run_accession": g("Run"),
            "bioproject_accession": g("BioProject"),
            "biosample_accession": g("BioSample"),
            "total_bases": float(g("bases") or 0),
            "total_spots": float(g("spots") or 0),
            "published_dt": pd.to_datetime(published).to_pydatetime() if published else None,
            "platform": g("Platform"),
            "instrument_model": g("Model"),
            "library_strategy": g("LibraryStrategy"),
            "library_source": g("LibrarySource"),
            "organism": g("ScientificName"),
            "center_name": g("CenterName"),
            "organization_name": None,  # not present in runinfo
            "geo_loc_name": None,       # esearch term already filters country
            "file_size_mb": float(g("size_MB") or 0),
            "source": "NCBI",
        }
    )


def fetch_ena(http=requests, query='country="Saudi Arabia"'):
    """Fetch ENA read_run records for the given query; return canonical row dicts."""
    resp = http.get(
        ENA_PORTAL,
        params={
            "result": "read_run",
            "query": query,
            "fields": ENA_FIELDS,
            "format": "tsv",
            "limit": 0,
        },
        timeout=300,
    )
    resp.raise_for_status()
    df = pd.read_csv(io.StringIO(resp.text), sep="\t")
    return [_ena_row(rec) for rec in df.to_dict("records")]


def _ena_row(rec: dict) -> dict:
    def g(key):
        v = rec.get(key)
        return None if pd.isna(v) else v

    published = g("first_public")
    return finalize_row(
        {
            "run_accession": g("run_accession"),
            "bioproject_accession": g("study_accession"),
            "biosample_accession": g("secondary_sample_accession"),
            "total_bases": float(g("base_count") or 0),
            "total_spots": float(g("read_count") or 0),
            "published_dt": pd.to_datetime(published).to_pydatetime() if published else None,
            "platform": g("instrument_platform"),
            "instrument_model": g("instrument_model"),
            "library_strategy": g("library_strategy"),
            "library_source": g("library_source"),
            "organism": g("scientific_name"),
            "center_name": g("center_name"),
            "organization_name": None,
            "geo_loc_name": None,
            "file_size_mb": None,  # ENA portal does not expose file size here
            "source": "ENA",
        }
    )


def pull_all(db, http=requests) -> dict:
    """Pull both archives, dedupe by run_accession (NCBI preferred), upsert."""
    from api.sync.loader import rebuild_derived, record_sync, upsert_runs

    ncbi_rows = fetch_ncbi(http=http)
    ena_rows = fetch_ena(http=http)

    merged: dict[str, dict] = {}
    for row in ncbi_rows:
        merged[row["run_accession"]] = row
    for row in ena_rows:
        merged.setdefault(row["run_accession"], row)  # NCBI wins on overlap

    stats = upsert_runs(db, list(merged.values()))
    rebuild_derived(db)
    record_sync(db, "pull", stats)
    return stats
