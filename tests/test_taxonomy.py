import io, tarfile
from sync.taxonomy import parse_taxdump, build_taxonomy_statements, wanted_taxa

NODES = """\
1\t|\t1\t|\tno rank\t|\t\t|\t0\t|\t0\t|\t11\t|\t0\t|\t0\t|\t0\t|\t0\t|\t\t|
2\t|\t1\t|\tsuperkingdom\t|\t\t|\t0\t|\t2\t|\t11\t|\t0\t|\t0\t|\t0\t|\t0\t|\t\t|
9606\t|\t9605\t|\tspecies\t|\t\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t\t|
9605\t|\t9604\t|\tgenus\t|\t\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t\t|
9604\t|\t9526\t|\tfamily\t|\t\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t\t|
9526\t|\t314293\t|\tsuperfamily\t|\t\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t1\t|\t\t|
"""
NAMES = """\
1\t|\tall\t|\t\t|\tsynonym\t|
1\t|\troot\t|\t\t|\tscientific name\t|
9606\t|\tHomo sapiens\t|\t\t|\tscientific name\t|
9605\t|\tHomo\t|\t\t|\tscientific name\t|
9604\t|\tHominidae\t|\t\t|\tscientific name\t|
"""

def test_parse_taxdump_rolls_up_lineage():
    rows = parse_taxdump(NODES, NAMES)
    h = rows[9606]
    assert h["scientific_name"] == "Homo sapiens"
    assert h["genus"] == "Homo"
    assert h["family"] == "Hominidae"
    # superfamily is not a captured rank
    assert h["tax_order"] is None and h["phylum"] is None

def test_wanted_taxa_includes_ancestors():
    parent_of = {9606: 9605, 9605: 9604, 9604: 9526, 9526: 314293}
    assert wanted_taxa([9606], parent_of) == {9606, 9605, 9604, 9526, 314293}

def test_build_taxonomy_statements_upserts():
    stmts = build_taxonomy_statements(
        {9606: {"scientific_name": "Homo sapiens", "genus": "Homo",
                "family": "Hominidae", "tax_order": None, "tax_class": None,
                "phylum": None}})
    assert len(stmts) == 1
    assert "INSERT INTO taxonomy" in stmts[0]
    assert "ON CONFLICT(tax_id) DO UPDATE" in stmts[0]
    assert "'Homo sapiens'" in stmts[0]
