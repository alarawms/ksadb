from sync.ontology import (normalize_value, term_id_from_iri, pick_term,
                           ols_search, FIELD_POLICY)

def test_normalize_value():
    assert normalize_value("  Human   Gut ") == "human gut"
    assert normalize_value("Blood") == "blood"

def test_term_id_from_iri():
    assert term_id_from_iri("http://purl.obolibrary.org/obo/UBERON_0000059") == "UBERON:0000059"
    assert term_id_from_iri("http://www.ebi.ac.uk/efo/EFO_0002755") == "EFO:0002755"

def test_pick_term_prefers_exact_label_match():
    docs = [
        {"label": "Intestine", "iri": "http://purl.obolibrary.org/obo/UBERON_0000059",
         "ontology_name": "uberon", "score": 8.1, "synonym": []},
        {"label": "intestinal villus", "iri": "http://x/UBERON_0001213",
         "ontology_name": "uberon", "score": 22.5, "synonym": []},
    ]
    term = pick_term(docs, "intestine")
    assert term["term_id"] == "UBERON:0000059"

def test_pick_term_rejects_low_scores():
    docs = [{"label": "something unrelated", "iri": "http://x/Y_1",
             "ontology_name": "uberon", "score": 0.3, "synonym": []}]
    assert pick_term(docs, "intestine") is None

class FakeResp:
    def __init__(self, payload): self._p = payload
    def raise_for_status(self): pass
    def json(self): return self._p

class FakeHttp:
    def __init__(self, payload): self.payload = payload; self.urls = []
    def get(self, url, params=None, timeout=None):
        self.urls.append((url, params))
        return FakeResp(self.payload)

def test_ols_search_builds_policy_query():
    http = FakeHttp({"response": {"docs": [
        {"label": "intestine", "iri": "http://purl.obolibrary.org/obo/UBERON_0000059",
         "ontology_name": "uberon", "score": 20.0, "synonym": []}]}})
    term = ols_search(http, "https://www.ebi.ac.uk/ols4", "Intestine",
                      FIELD_POLICY["tissue"])
    assert term["term_id"] == "UBERON:0000059"
    url, params = http.urls[0]
    assert "ols4/api/search" in url
    assert set(params["ontology"].split(",")) == {"uberon", "cl", "bto", "envo"}

def test_ols_search_unavailable_returns_none():
    class DeadHttp:
        def get(self, url, params=None, timeout=None):
            raise ConnectionError("nope")
    assert ols_search(DeadHttp(), "https://x", "blood", ["ncbitaxon"]) is None
