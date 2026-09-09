"""Embed study title+abstract via Workers AI REST; upsert into Vectorize."""
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


def statements_to_mark_embedded(accessions):
    return [
        f"INSERT OR IGNORE INTO embedded_studies (accession) VALUES ('{a}')"
        for a in accessions
    ]


def cmd_embed():
    acct = os.environ["D1_ACCOUNT_ID"]
    d1_token = os.environ["D1_API_TOKEN"]
    cf_token = os.environ["CF_API_TOKEN"]  # wrangler token: Workers AI + Vectorize
    db = os.environ["D1_DATABASE_ID"]
    base = f"{DEFAULT_BASE_URL}/accounts/{acct}/d1/database/{db}/query"
    h = {"Authorization": f"Bearer {d1_token}"}
    pending = requests.post(base, headers=h, json={"batch": [{"sql":
        "SELECT st.accession, st.title, st.abstract FROM studies st "
        "LEFT JOIN embedded_studies e ON e.accession = st.accession "
        "WHERE e.accession IS NULL AND st.abstract IS NOT NULL LIMIT 5000"}]}, timeout=120
    ).json()["result"][0].get("results", [])
    if not pending:
        print("nothing to embed"); return
    texts = [(s["title"] or "") + "\n" + (s["abstract"] or "") for s in pending]
    vectors = embed_texts(texts, acct, cf_token)
    vectorize_upsert(acct, cf_token, "studies-vec", [
        {"id": s["accession"], "values": v, "metadata": {"accession": s["accession"]}}
        for s, v in zip(pending, vectors)
    ])
    # mark embedded; SQL strings come from D1 itself, no injection surface
    stmts = statements_to_mark_embedded([s["accession"] for s in pending])
    for i in range(0, len(stmts), 25):
        requests.post(base, headers=h,
                      json={"batch": [{"sql": s} for s in stmts[i:i + 25]]}, timeout=120).raise_for_status()
    print(f"embedded {len(pending)} studies")
