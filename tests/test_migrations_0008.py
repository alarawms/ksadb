import sqlite3
from pathlib import Path

import pytest

MIGRATION = Path(__file__).resolve().parent.parent / "migrations" / "0008_taxonomy.sql"


def test_0008_applies_and_has_expected_shape():
    conn = sqlite3.connect(":memory:")
    conn.executescript(
        "CREATE TABLE samples (biosample_accession TEXT PRIMARY KEY);"
    )
    conn.executescript(MIGRATION.read_text())
    cols = {r[1] for r in conn.execute("PRAGMA table_info(taxonomy)")}
    assert {"tax_id", "scientific_name", "genus", "family", "tax_order",
            "tax_class", "phylum"} <= cols
    cols = {r[1] for r in conn.execute("PRAGMA table_info(ontology_terms)")}
    assert {"source_ontology", "term_id", "label", "iri", "field",
            "value_norm"} <= cols
    cols = {r[1] for r in conn.execute("PRAGMA table_info(sample_terms)")}
    assert {"biosample_accession", "field", "term_id"} <= cols
    conn.execute(
        "INSERT INTO ontology_terms VALUES ('uberon','UBERON:0000059','intestine',"
        "'http://purl.obolibrary.org/obo/UBERON_0000059','tissue','intestine')")
    # PK(field, value_norm) makes reruns idempotent
    with pytest.raises(sqlite3.IntegrityError):
        conn.execute(
            "INSERT INTO ontology_terms VALUES ('uberon','UBERON:0000059','intestine',"
            "'http://purl.obolibrary.org/obo/UBERON_0000059','tissue','intestine')")
