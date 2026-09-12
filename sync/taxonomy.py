"""NCBI Taxonomy loader: parse taxdump, store lineage rollups for sample taxa.

Only taxa that appear in our samples table (plus their ancestors) are stored,
so the table stays small even though taxdump covers ~2.4M taxa.
"""
import io
import os
import tarfile

import requests

from sync.d1_push import DEFAULT_BASE_URL, sql_literal
from sync.star_push import push_star, write_sql_files as write_star_sql_files

TAXDUMP_URL = os.getenv(
    "TAXDUMP_URL",
    "https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdump.tar.gz",
)
RANKS = {"genus": "genus", "family": "family", "order": "tax_order",
         "class": "tax_class", "phylum": "phylum"}
CHUNK = 500


def _parse_nodes(text: str):
    parent_of, rank_of = {}, {}
    for line in text.splitlines():
        if not line.strip():
            continue
        f = [x.strip() for x in line.split("\t|\t")]
        tax_id, parent, rank = int(f[0]), int(f[1]), f[2]
        parent_of[tax_id] = parent
        rank_of[tax_id] = rank
    return parent_of, rank_of


def _parse_names(text: str):
    names = {}
    for line in text.splitlines():
        if not line.strip():
            continue
        f = [x.strip(" \t|") for x in line.split("\t|\t")]
        if len(f) >= 4 and f[3] == "scientific name":
            names[int(f[0])] = f[1]
    return names


def wanted_taxa(sample_tax_ids, parent_of):
    out = set()
    for t in sample_tax_ids:
        while t is not None and t not in out:
            out.add(t)
            t = parent_of.get(t)
    return out


def parse_taxdump(nodes_text, names_text):
    parent_of, rank_of = _parse_nodes(nodes_text)
    names = _parse_names(names_text)
    rows = {}
    for tax_id, name in names.items():
        lineage = {v: None for v in RANKS.values()}
        t, seen = tax_id, set()
        while t in parent_of and t not in seen:
            seen.add(t)
            rank = rank_of.get(t)
            if rank in RANKS:
                lineage[RANKS[rank]] = lineage[RANKS[rank]] or names.get(t)
            t = parent_of[t]
        rows[tax_id] = {"scientific_name": name, **lineage}
    return rows


def build_taxonomy_statements(rows):
    stmts = []
    for tax_id, r in rows.items():
        cols = "(tax_id, scientific_name, genus, family, tax_order, tax_class, phylum)"
        vals = ", ".join([
            str(tax_id), sql_literal(r["scientific_name"]), sql_literal(r["genus"]),
            sql_literal(r["family"]), sql_literal(r["tax_order"]),
            sql_literal(r["tax_class"]), sql_literal(r["phylum"]),
        ])
        updates = ", ".join(
            f"{c} = excluded.{c}" for c in
            ["scientific_name", "genus", "family", "tax_order", "tax_class", "phylum"])
        stmts.append(f"INSERT INTO taxonomy {cols} VALUES ({vals}) "
                     f"ON CONFLICT(tax_id) DO UPDATE SET {updates}")
    return stmts


def _d1_query(sql, account_id, database_id, api_token, base_url):
    url = f"{base_url}/accounts/{account_id}/d1/database/{database_id}/query"
    r = requests.post(url, headers={"Authorization": f"Bearer {api_token}"},
                      json={"batch": [{"sql": sql}]}, timeout=120)
    r.raise_for_status()
    return r.json()


def cmd_taxonomy():
    acct, db, tok = (os.environ["D1_ACCOUNT_ID"], os.environ["D1_DATABASE_ID"],
                     os.environ["D1_API_TOKEN"])
    base = os.getenv("CF_API_BASE_URL", DEFAULT_BASE_URL)
    out_dir = os.getenv("KSADB_D1_SQL_OUT")
    r = requests.get(TAXDUMP_URL, timeout=300)
    r.raise_for_status()
    with tarfile.open(fileobj=io.BytesIO(r.content)) as tf:
        nodes = tf.extractfile("nodes.dmp").read().decode()
        names = tf.extractfile("names.dmp").read().decode()
    parent_of, _ = _parse_nodes(nodes)
    body = _d1_query("SELECT DISTINCT tax_id FROM samples WHERE tax_id IS NOT NULL",
                     acct, db, tok, base)
    sample_tax_ids = [row["tax_id"] for res in body.get("result", [])
                      for row in res.get("results", [])]
    rows = parse_taxdump(nodes, names)
    keep = wanted_taxa(sample_tax_ids, parent_of)
    stmts = build_taxonomy_statements({t: rows[t] for t in keep if t in rows})
    if out_dir:
        files = write_star_sql_files(stmts, out_dir)
        print(f"sql written: {len(files)} files -> {out_dir}")
        return
    for i in range(0, len(stmts), CHUNK):
        push_star(stmts[i:i + CHUNK], account_id=acct, database_id=db,
                  api_token=tok, base_url=base)
    print(f"taxonomy upserted: {len(stmts)} taxa "
          f"({len(sample_tax_ids)} sample taxa)")
