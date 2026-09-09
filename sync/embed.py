"""Embed study/sample/run metadata via Workers AI REST; upsert into Vectorize.

Saudi-only: only entities linked to samples with country = 'SA' are embedded,
and each vector's metadata carries {type, accession} so the query endpoint can
resolve it with its own SA-restricted SQL.
"""

import os

import requests

from sync.d1_push import DEFAULT_BASE_URL

AI_URL = "https://api.cloudflare.com/client/v4/accounts/{acct}/ai/run/{model}"
EMBED_MODEL = "@cf/baai/bge-small-en-v1.5"
BATCH = 100  # texts per AI call


def embed_texts(texts, account_id, api_token, http=requests, model=EMBED_MODEL):
    vectors = []
    for i in range(0, len(texts), BATCH):
        chunk = texts[i:i + BATCH]
        r = http.post(
            AI_URL.format(acct=account_id, model=model),
            headers={"Authorization": f"Bearer {api_token}"},
            json={"text": chunk}, timeout=120,
        )
        r.raise_for_status()
        vectors.extend(r.json()["result"]["data"])
    return vectors


def vectorize_upsert(account_id, api_token, index, rows, http=requests):
    """rows: [{id, values, metadata}] — max 1000 per call."""
    url = (f"https://api.cloudflare.com/client/v4/accounts/{account_id}"
           f"/vectorize/v2/indexes/{index}/upsert")
    for i in range(0, len(rows), 1000):
        r = http.post(url, headers={"Authorization": f"Bearer {api_token}"},
                      json=rows[i:i + 1000], timeout=120)
        r.raise_for_status()


def statements_to_mark_embedded(entity_type, accessions):
    return [
        f"INSERT OR IGNORE INTO embedded_entities (type, accession) "
        f"VALUES ('{entity_type}', '{a}')"
        for a in accessions
    ]


# Saudi-only at embed time: every pending select filters samples.country = 'SA'
# (non-Saudi rows have country = NULL from normalize_country, so = 'SA' is right).
PENDING_STUDY_SQL = (
    "SELECT st.accession, st.title, st.abstract FROM studies st "
    "LEFT JOIN embedded_entities e ON e.type = 'study' AND e.accession = st.accession "
    "WHERE e.accession IS NULL AND st.abstract IS NOT NULL "
    "AND EXISTS (SELECT 1 FROM ena_runs r "
    "JOIN samples s ON s.biosample_accession = r.biosample_accession "
    "WHERE r.study_accession = st.accession AND s.country = 'SA') LIMIT 5000"
)

PENDING_SAMPLE_SQL = (
    "SELECT s.biosample_accession AS accession, s.organism, s.host, s.tissue, "
    "s.country, s.region, s.collection_date, s.lat_lon FROM samples s "
    "LEFT JOIN embedded_entities e ON e.type = 'sample' AND e.accession = s.biosample_accession "
    "WHERE e.accession IS NULL AND s.country = 'SA' LIMIT 5000"
)

PENDING_RUN_SQL = (
    "SELECT r.run_accession AS accession, st.title AS study_title, s.organism, "
    "r.platform, r.instrument_model, r.library_strategy, r.library_source, "
    "r.submitted_date FROM ena_runs r "
    "JOIN studies st ON st.accession = r.study_accession "
    "JOIN samples s ON s.biosample_accession = r.biosample_accession "
    "LEFT JOIN embedded_entities e ON e.type = 'run' AND e.accession = r.run_accession "
    "WHERE e.accession IS NULL AND s.country = 'SA' LIMIT 5000"
)


def study_text(row):
    return (row.get("title") or "") + "\n" + (row.get("abstract") or "")


def sample_text(row):
    parts = [row.get(k) for k in (
        "accession", "organism", "host", "tissue", "country",
        "region", "collection_date", "lat_lon")]
    return " ".join(str(p) for p in parts if p)


def run_text(row):
    parts = [row.get(k) for k in (
        "accession", "study_title", "organism", "platform", "instrument_model",
        "library_strategy", "library_source", "submitted_date")]
    return " ".join(str(p) for p in parts if p)


ENTITY_TYPES = [
    {"type": "study", "sql": PENDING_STUDY_SQL, "text": study_text},
    {"type": "sample", "sql": PENDING_SAMPLE_SQL, "text": sample_text},
    {"type": "run", "sql": PENDING_RUN_SQL, "text": run_text},
]


def cmd_embed():
    acct = os.environ["D1_ACCOUNT_ID"]
    d1_token = os.environ["D1_API_TOKEN"]
    cf_token = os.environ["CF_API_TOKEN"]  # wrangler token: Workers AI + Vectorize
    db = os.environ["D1_DATABASE_ID"]
    base = f"{DEFAULT_BASE_URL}/accounts/{acct}/d1/database/{db}/query"
    h = {"Authorization": f"Bearer {d1_token}"}
    total = 0
    for spec in ENTITY_TYPES:
        pending = requests.post(base, headers=h, json={"batch": [{"sql":
            spec["sql"]}]}, timeout=120
        ).json()["result"][0].get("results", [])
        if not pending:
            continue
        texts = [spec["text"](row) for row in pending]
        vectors = embed_texts(texts, acct, cf_token)
        vectorize_upsert(acct, cf_token, "studies-vec", [
            {"id": row["accession"], "values": v,
             "metadata": {"type": spec["type"], "accession": row["accession"]}}
            for row, v in zip(pending, vectors)
        ])
        # mark embedded; SQL strings come from D1 itself, no injection surface
        stmts = statements_to_mark_embedded(
            spec["type"], [row["accession"] for row in pending])
        for i in range(0, len(stmts), 25):
            requests.post(base, headers=h,
                          json={"batch": [{"sql": s} for s in stmts[i:i + 25]]}, timeout=120).raise_for_status()
        print(f"embedded {len(pending)} {spec['type']}s")
        total += len(pending)
    if not total:
        print("nothing to embed")
