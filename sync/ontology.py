"""ENA metadata enrichment: resolve sample host/tissue values to ontology
terms via EBI OLS4, value-driven (only distinct unmapped values are queried)
and resumable (ontology_terms PK (field, value_norm) is the cache).
"""
import os

import requests

from sync.d1_push import DEFAULT_BASE_URL, sql_literal
from sync.star_push import push_star, write_sql_files as write_star_sql_files

OLS_BASE_URL = os.getenv("OLS_BASE_URL", "https://www.ebi.ac.uk/ols4")
SCORE_THRESHOLD = 0.85
# Field -> ontologies allowed, per ENA checklist conventions (spec 5.2).
# envo sits in the tissue list as best-effort fallback for environmental
# values like "soil"/"seawater" (samples has no dedicated environment field).
FIELD_POLICY = {
    "host": ["ncbitaxon"],
    "tissue": ["uberon", "cl", "bto", "envo"],
}


def normalize_value(v):
    return " ".join(v.strip().lower().split())


def term_id_from_iri(iri):
    tail = iri.rsplit("/", 1)[-1].rsplit("#", 1)[-1].rsplit("_", 1)[-1]
    prefix = iri.rsplit("/", 1)[-1].rsplit("#", 1)[-1].rsplit("_", 1)[0]
    if prefix.isupper() and "_" in iri.rsplit("/", 1)[-1]:
        return f"{prefix}:{tail}"
    return iri.rsplit("/", 1)[-1].rsplit("#", 1)[-1]


def pick_term(docs, value):
    want = normalize_value(value)
    best = None
    for d in docs:
        labels = [d.get("label", "")] + list(d.get("synonym") or [])
        if any(normalize_value(x) == want for x in labels if x):
            best = d
            break
        if best is None or d.get("score", 0) > best.get("score", 0):
            best = d
    if best is None:
        return None
    if normalize_value(best.get("label", "")) != want and \
            best.get("score", 0) < SCORE_THRESHOLD:
        return None
    return {
        "source_ontology": best.get("ontology_name", ""),
        "term_id": term_id_from_iri(best.get("iri", "")),
        "label": best.get("label", ""),
        "iri": best.get("iri", ""),
    }


def ols_search(http, base_url, value, ontologies):
    try:
        r = http.get(f"{base_url}/api/search",
                     params={"q": value, "ontology": ",".join(ontologies),
                             "rows": 10, "type": "class"},
                     timeout=30)
        r.raise_for_status()
        docs = r.json().get("response", {}).get("docs", [])
        return pick_term(docs, value)
    except Exception as e:
        print(f"ols lookup failed for {value!r}: {e}")
        return None


def _d1_query(sql, account_id, database_id, api_token, base_url):
    url = f"{base_url}/accounts/{account_id}/d1/database/{database_id}/query"
    r = requests.post(url, headers={"Authorization": f"Bearer {api_token}"},
                      json={"batch": [{"sql": sql}]}, timeout=120)
    r.raise_for_status()
    return r.json()


def _results(body):
    return [row for res in body.get("result", []) for row in res.get("results", [])]


def cmd_ontology(http=requests):
    acct, db, tok = (os.environ["D1_ACCOUNT_ID"], os.environ["D1_DATABASE_ID"],
                     os.environ["D1_API_TOKEN"])
    base = os.getenv("CF_API_BASE_URL", DEFAULT_BASE_URL)
    out_dir = os.getenv("KSADB_D1_SQL_OUT")
    stmts = []
    resolved = skipped = 0
    for field, ontologies in FIELD_POLICY.items():
        values = [r["v"] for r in _results(_d1_query(
            f"SELECT DISTINCT {field} AS v FROM samples WHERE country = 'SA' "
            f"AND {field} IS NOT NULL", acct, db, tok, base))]
        cached = {r["value_norm"] for r in _results(_d1_query(
            f"SELECT value_norm FROM ontology_terms WHERE field = {sql_literal(field)}",
            acct, db, tok, base))}
        for value in values:
            norm = normalize_value(value)
            if norm in cached:
                continue
            term = ols_search(http, OLS_BASE_URL, value, ontologies)
            if not term:
                skipped += 1
                continue
            stmts.append(
                "INSERT INTO ontology_terms (source_ontology, term_id, label, iri, "
                f"field, value_norm) VALUES ({sql_literal(term['source_ontology'])}, "
                f"{sql_literal(term['term_id'])}, {sql_literal(term['label'])}, "
                f"{sql_literal(term['iri'])}, {sql_literal(field)}, "
                f"{sql_literal(norm)}) ON CONFLICT(field, value_norm) DO UPDATE SET "
                "source_ontology = excluded.source_ontology, "
                "term_id = excluded.term_id, label = excluded.label, iri = excluded.iri")
            rows = _results(_d1_query(
                f"SELECT biosample_accession FROM samples WHERE country = 'SA' "
                f"AND lower({field}) = {sql_literal(norm)}", acct, db, tok, base))
            stmts += [
                "INSERT OR IGNORE INTO sample_terms (biosample_accession, field, "
                f"term_id) VALUES ({sql_literal(r['biosample_accession'])}, "
                f"{sql_literal(field)}, {sql_literal(term['term_id'])})"
                for r in rows
            ]
            cached.add(norm)
            resolved += 1
    if out_dir:
        files = write_star_sql_files(stmts, out_dir)
        print(f"sql written: {len(files)} files -> {out_dir}")
    else:
        for i in range(0, len(stmts), 25):
            push_star(stmts[i:i + 25], account_id=acct, database_id=db,
                      api_token=tok, base_url=base)
    print(f"ontology enrichment: {resolved} values resolved, {skipped} skipped")
