"""ENA portal row -> star-schema entities (pure, no I/O)."""
import re

GCC = {"SA", "AE", "QA", "BH", "KW", "OM"}

_COUNTRY_ALIASES = {
    "saudi arabia": "SA", "kingdom of saudi arabia": "SA",
    "united arab emirates": "AE", "uae": "AE", "qatar": "QA",
    "bahrain": "BH", "kuwait": "KW", "oman": "OM", "yemen": "YE",
}

def normalize_country(ena_country):
    if not ena_country:
        return (None, None)
    base = re.split(r"[:;,]", ena_country.strip().lower())[0].strip()
    iso = _COUNTRY_ALIASES.get(base)
    if not iso:
        return (None, None)
    return (iso, "GCC" if iso in GCC else "MENA")

def _int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None

def row_to_entities(row):
    iso, region = normalize_country(row.get("country"))
    biosample = row.get("secondary_sample_accession") or row.get("sample_accession")
    study_title = row.get("study_title")
    abstract = "\n".join(x for x in [study_title, row.get("sample_description")] if x)
    return {
        "submitter": {"center_name": row["center_name"]} if row.get("center_name") else None,
        "study": {
            "accession": row.get("study_accession"),
            "title": study_title,
            "abstract": abstract or None,
            "submitted_date": row.get("first_public"),
        } if row.get("study_accession") else None,
        "sample": {
            "biosample_accession": biosample,
            "organism": row.get("scientific_name"),
            "tax_id": _int(row.get("tax_id")),
            "host": row.get("host"),
            "tissue": row.get("tissue"),
            "country": iso,
            "region": region,
            "collection_date": row.get("collection_date"),
            "lat_lon": row.get("location"),
        } if biosample else None,
        "run": {
            "run_accession": row["run_accession"],
            "study_accession": row.get("study_accession"),
            "biosample_accession": biosample,
            "bytes": _int(row.get("base_count")),
            "spots": _int(row.get("read_count")),
            "platform": row.get("instrument_platform"),
            "instrument_model": row.get("instrument_model"),
            "library_strategy": row.get("library_strategy"),
            "library_source": row.get("library_source"),
            "submitted_date": row.get("first_public"),
            "fastq_ftp": row.get("fastq_ftp"),
            "fastq_md5": row.get("fastq_md5"),
            "fastq_bytes": row.get("fastq_bytes"),
            "source": "ena",
        },
    }
