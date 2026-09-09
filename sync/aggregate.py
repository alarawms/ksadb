"""Precompute dashboard aggregates from D1 into R2-ready JSON files."""
import json
from pathlib import Path

from sync.d1_push import DEFAULT_BASE_URL
import requests

AGGREGATES = {
    "summary": "SELECT COUNT(*) AS runs, COUNT(DISTINCT r.study_accession) AS studies, COUNT(DISTINCT r.biosample_accession) AS samples, COALESCE(SUM(r.bytes),0) AS bytes, MIN(r.submitted_date) AS date_min, MAX(r.submitted_date) AS date_max FROM ena_runs r",
    "by-month": "SELECT substr(r.submitted_date,1,7) AS month, COUNT(*) AS runs, COALESCE(SUM(r.bytes),0) AS bytes FROM ena_runs r WHERE r.submitted_date IS NOT NULL GROUP BY month ORDER BY month",
    "by-country": "SELECT s.country AS name, COUNT(*) AS runs, COALESCE(SUM(r.bytes),0) AS bytes FROM ena_runs r JOIN samples s ON s.biosample_accession = r.biosample_accession WHERE s.country IS NOT NULL GROUP BY s.country ORDER BY runs DESC",
    "by-region": "SELECT s.region AS name, COUNT(*) AS runs FROM ena_runs r JOIN samples s ON s.biosample_accession = r.biosample_accession WHERE s.region IS NOT NULL GROUP BY s.region ORDER BY runs DESC",
    "by-organism": "SELECT s.organism AS name, COUNT(*) AS runs FROM ena_runs r JOIN samples s ON s.biosample_accession = r.biosample_accession WHERE s.organism IS NOT NULL GROUP BY s.organism ORDER BY runs DESC LIMIT 100",
    "by-submitter": "SELECT sub.center_name AS name, COUNT(*) AS runs, COUNT(DISTINCT r.study_accession) AS studies FROM ena_runs r JOIN studies st ON st.accession = r.study_accession JOIN submitters sub ON sub.id = st.submitter_id GROUP BY sub.center_name ORDER BY runs DESC LIMIT 100",
    "by-platform": "SELECT r.platform AS name, COUNT(*) AS runs FROM ena_runs r WHERE r.platform IS NOT NULL GROUP BY r.platform ORDER BY runs DESC",
    "by-strategy": "SELECT r.library_strategy AS name, COUNT(*) AS runs FROM ena_runs r WHERE r.library_strategy IS NOT NULL GROUP BY r.library_strategy ORDER BY runs DESC",
}

def run_aggregates(account_id, database_id, api_token, out_dir, http=requests,
                   base_url=DEFAULT_BASE_URL, batch=None):
    out = []
    url = f"{base_url}/accounts/{account_id}/d1/database/{database_id}/query"
    headers = {"Authorization": f"Bearer {api_token}"}
    for name, sql in AGGREGATES.items():
        r = http.post(url, headers=headers, json={"batch": [{"sql": sql}]}, timeout=120)
        r.raise_for_status()
        body = r.json()
        result = body["result"][0]
        if not result.get("success"):
            raise RuntimeError(f"aggregate {name} failed: {body.get('errors')}")
        rows = result.get("results", [])
        path = Path(out_dir) / f"{name}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(rows if name != "summary" else (rows[0] if rows else {})))
        out.append(path)
    return out
