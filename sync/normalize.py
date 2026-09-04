import math

import pandas as pd

from sync.institutions import is_saudi_institution, normalize_institution

PATHOGEN_KEYWORDS = (
    "klebsiella pneumoniae",
    "staphylococcus aureus",
    "acinetobacter baumannii",
    "pseudomonas aeruginosa",
    "coronavirus",
    "salmonella",
    "escherichia coli",
)


def clean(v):
    """NaN/empty -> None, else the value itself."""
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    if pd.isna(v):
        return None
    return v


def compute_is_wgs(library_strategy, library_source, organism) -> bool:
    return (
        (library_strategy or "") == "WGS"
        and (library_source or "") == "GENOMIC"
        and "metagenome" not in (organism or "").lower()
    )


def compute_is_pathogen(organism) -> bool:
    org = (organism or "").lower()
    return any(k in org for k in PATHOGEN_KEYWORDS)


def finalize_row(raw: dict) -> dict:
    """Return a copy of raw with institution and flag columns computed."""
    row = dict(raw)
    institution = normalize_institution(row.get("center_name"), row.get("organization_name"))
    row["institution_name"] = institution
    row["is_saudi_submitter"] = is_saudi_institution(institution)
    row["is_pathogen"] = compute_is_pathogen(row.get("organism"))
    row["is_wgs"] = compute_is_wgs(
        row.get("library_strategy"), row.get("library_source"), row.get("organism")
    )
    published = clean(row.get("published_dt"))
    row["year"] = int(str(published)[:4]) if published else None
    return row
