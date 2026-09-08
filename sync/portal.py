"""ENA Portal API fetcher for the star-schema slice (sync v2)."""
import time
import requests

PORTAL = "https://www.ebi.ac.uk/ena/portal/api/search"
PORTAL_FIELDS = (
    "run_accession,study_accession,sample_accession,secondary_sample_accession,"
    "study_title,experiment_title,sample_title,sample_description,"
    "scientific_name,tax_id,library_strategy,library_source,instrument_platform,"
    "instrument_model,center_name,first_public,country,collection_date,location,"
    "host,fastq_ftp,fastq_md5,fastq_bytes,read_count,base_count"
)
COUNTRIES = {
    "SA": "Saudi Arabia", "AE": "United Arab Emirates", "QA": "Qatar",
    "BH": "Bahrain", "KW": "Kuwait", "OM": "Oman", "YE": "Yemen",
}
MAX_ATTEMPTS = 6

class PortalError(RuntimeError):
    pass

def _get_page(http, country_value, offset, page_size):
    last = None
    for attempt in range(MAX_ATTEMPTS):
        try:
            r = http.get(
                PORTAL,
                params={
                    "result": "read_run",
                    "query": f'country="{country_value}"',
                    "fields": PORTAL_FIELDS,
                    "format": "json",
                    "limit": page_size,
                    "offset": offset,
                },
                headers={"Accept-Encoding": "gzip"},
                timeout=120,
            )
            r.raise_for_status()
            return r.json()
        except Exception as e:  # network or HTTP error — backoff and retry
            last = e
            time.sleep(min(2 ** attempt, 30))
    raise PortalError(f"failed to fetch {country_value} offset={offset}: {last}")

def fetch_country(country_value, http=requests, page_size=1000000):
    # ENA's portal search no longer supports offset pagination ("Unsupported
    # param offset"), but accepts very large limits, so a single request per
    # country returns the full slice; the pagination loop below then exits
    # after the first page.
    rows, offset = [], 0
    while True:
        page = _get_page(http, country_value, offset, page_size)
        rows.extend(page)
        if len(page) < page_size:
            return rows
        offset += page_size
