import pytest

from sync.embed import (
    ENTITY_TYPES,
    embed_texts,
    run_text,
    sample_text,
    statements_to_mark_embedded,
    study_text,
)


class FakeResp:
    def __init__(self, payload): self._p = payload
    def raise_for_status(self): pass
    def json(self): return self._p


class FakeHttp:
    def __init__(self, payload): self.payload = payload; self.calls = []
    def post(self, url, headers=None, json=None, timeout=None):
        self.calls.append((url, json, headers))
        return FakeResp(self.payload)


class RoutingHttp:
    """Returns a payload chosen by a substring of the first SQL in the batch."""
    def __init__(self, routes, default=None):
        self.routes = routes
        self.default = default or {"result": [{"results": []}]}
        self.calls = []

    def post(self, url, headers=None, json=None, timeout=None):
        self.calls.append((url, json, headers))
        sql = json["batch"][0]["sql"]
        for key, payload in self.routes.items():
            if key in sql:
                return FakeResp(payload)
        return FakeResp(self.default)


def test_embed_texts_posts_batch():
    http = FakeHttp({"result": {"data": [[0.1] * 384, [0.2] * 384]}})
    out = embed_texts(["a", "b"], "acct", "tok", http=http)
    assert len(out) == 2 and len(out[0]) == 384
    assert "ai/run/@cf/baai/bge-small-en-v1.5" in http.calls[0][0]
    assert http.calls[0][1]["text"] == ["a", "b"]


def test_embed_texts_sends_bearer_token():
    http = FakeHttp({"result": {"data": [[0.1] * 384]}})
    embed_texts(["a"], "acct", "tok", http=http)
    assert http.calls[0][2] == {"Authorization": "Bearer tok"}


def test_embed_texts_batches_large_inputs():
    class EchoHttp:
        def __init__(self): self.calls = []
        def post(self, url, headers=None, json=None, timeout=None):
            self.calls.append((url, json, headers))
            return FakeResp({"result": {"data": [[0.1] * 384] * len(json["text"])}})

    http = EchoHttp()
    texts = [f"t{i}" for i in range(250)]
    out = embed_texts(texts, "acct", "tok", http=http)
    assert len(out) == 250
    assert len(http.calls) == 3
    assert [len(c[1]["text"]) for c in http.calls] == [100, 100, 50]


def test_pending_select_sql_per_type_includes_sa_filter():
    assert [s["type"] for s in ENTITY_TYPES] == ["study", "sample", "run"]
    for spec in ENTITY_TYPES:
        assert "country = 'SA'" in spec["sql"], spec["type"]
    # studies are restricted via EXISTS over runs joined to SA samples
    study_sql = next(s["sql"] for s in ENTITY_TYPES if s["type"] == "study")
    assert "EXISTS" in study_sql
    assert "JOIN samples" in study_sql
    # samples table has no description column
    sample_sql = next(s["sql"] for s in ENTITY_TYPES if s["type"] == "sample")
    assert "description" not in sample_sql.lower()


def test_study_text_is_title_plus_abstract():
    row = {"accession": "PRJEB1", "title": "Camel study", "abstract": "Gut metagenome"}
    assert study_text(row) == "Camel study\nGut metagenome"


def test_sample_text_includes_metadata_fields():
    row = {"accession": "SAMEA1", "organism": "Camelus dromedarius", "host": "camel",
           "tissue": "gut", "country": "SA", "region": "Riyadh",
           "collection_date": "2022-01-01", "lat_lon": "24.7:46.7"}
    text = sample_text(row)
    for field in ("SAMEA1", "Camelus dromedarius", "camel", "gut", "SA",
                  "Riyadh", "2022-01-01", "24.7:46.7"):
        assert field in text


def test_run_text_includes_metadata_fields():
    row = {"accession": "ERR1", "study_title": "Camel study",
           "organism": "Camelus dromedarius", "platform": "ILLUMINA",
           "instrument_model": "NovaSeq 6000", "library_strategy": "WGS",
           "library_source": "METAGENOMIC", "submitted_date": "2022-02-02"}
    text = run_text(row)
    for field in ("ERR1", "Camel study", "Camelus dromedarius", "ILLUMINA",
                  "NovaSeq 6000", "WGS", "METAGENOMIC", "2022-02-02"):
        assert field in text


def test_statements_to_mark_embedded():
    stmts = statements_to_mark_embedded("sample", ["SAMEA1", "SAMEA2"])
    assert stmts == [
        "INSERT OR IGNORE INTO embedded_entities (type, accession) "
        "VALUES ('sample', 'SAMEA1')",
        "INSERT OR IGNORE INTO embedded_entities (type, accession) "
        "VALUES ('sample', 'SAMEA2')",
    ]


def _env(monkeypatch):
    monkeypatch.setenv("D1_ACCOUNT_ID", "acct")
    monkeypatch.setenv("D1_DATABASE_ID", "db1")
    monkeypatch.setenv("D1_API_TOKEN", "d1-tok")
    monkeypatch.setenv("CF_API_TOKEN", "cf-tok")
    import sync.embed as embed_mod
    return embed_mod


def test_cmd_embed_embeds_each_type_and_marks_typed(monkeypatch):
    embed_mod = _env(monkeypatch)
    d1_http = RoutingHttp({
        "FROM studies st": {"result": [{"results": [
            {"accession": "PRJEB1", "title": "Camel study", "abstract": "Gut metagenome"},
        ]}]},
        "FROM samples s": {"result": [{"results": [
            {"accession": "SAMEA1", "organism": "Camelus dromedarius", "host": "camel",
             "tissue": "gut", "country": "SA", "region": "Riyadh",
             "collection_date": "2022-01-01", "lat_lon": "24.7:46.7"},
        ]}]},
        "FROM ena_runs r": {"result": [{"results": [
            {"accession": "ERR1", "study_title": "Camel study",
             "organism": "Camelus dromedarius", "platform": "ILLUMINA",
             "instrument_model": "NovaSeq 6000", "library_strategy": "WGS",
             "library_source": "METAGENOMIC", "submitted_date": "2022-02-02"},
        ]}]},
    })
    monkeypatch.setattr(embed_mod, "requests", d1_http)

    calls = {"embed": [], "upsert": []}

    def fake_embed_texts(texts, account_id, api_token, **kw):
        calls["embed"].append((texts, account_id, api_token))
        return [[0.1] * 384] * len(texts)

    def fake_upsert(account_id, api_token, index, rows, **kw):
        calls["upsert"].append((account_id, api_token, index, rows))

    monkeypatch.setattr(embed_mod, "embed_texts", fake_embed_texts)
    monkeypatch.setattr(embed_mod, "vectorize_upsert", fake_upsert)

    embed_mod.cmd_embed()

    # one AI/upsert round per entity type, all using the CF token
    assert len(calls["embed"]) == 3
    for texts, acct, tok in calls["embed"]:
        assert acct == "acct" and tok == "cf-tok"
    assert [t[0] for t in calls["embed"]] == [
        ["Camel study\nGut metagenome"],
        ["SAMEA1 Camelus dromedarius camel gut SA Riyadh 2022-01-01 24.7:46.7"],
        ["ERR1 Camel study Camelus dromedarius ILLUMINA NovaSeq 6000 WGS "
         "METAGENOMIC 2022-02-02"],
    ]
    assert len(calls["upsert"]) == 3
    for acct, tok, index, rows in calls["upsert"]:
        assert acct == "acct" and tok == "cf-tok"
        assert index == "studies-vec"
    assert calls["upsert"][0][3] == [
        {"id": "PRJEB1", "values": [0.1] * 384,
         "metadata": {"type": "study", "accession": "PRJEB1"}},
    ]
    assert calls["upsert"][1][3] == [
        {"id": "SAMEA1", "values": [0.1] * 384,
         "metadata": {"type": "sample", "accession": "SAMEA1"}},
    ]
    assert calls["upsert"][2][3] == [
        {"id": "ERR1", "values": [0.1] * 384,
         "metadata": {"type": "run", "accession": "ERR1"}},
    ]
    # D1 read + mark-embedded writes go to the D1 REST endpoint
    d1_urls = [u for u, _, _ in d1_http.calls]
    assert all("/d1/database/db1/query" in u for u in d1_urls)
    mark_calls = [j for _, j, _ in d1_http.calls
                  if any("INSERT OR IGNORE INTO embedded_entities" in s["sql"]
                         for s in j["batch"])]
    assert len(mark_calls) == 3
    assert mark_calls[0]["batch"][0]["sql"] == \
        "INSERT OR IGNORE INTO embedded_entities (type, accession) VALUES ('study', 'PRJEB1')"
    assert mark_calls[1]["batch"][0]["sql"] == \
        "INSERT OR IGNORE INTO embedded_entities (type, accession) VALUES ('sample', 'SAMEA1')"
    assert mark_calls[2]["batch"][0]["sql"] == \
        "INSERT OR IGNORE INTO embedded_entities (type, accession) VALUES ('run', 'ERR1')"


def test_cmd_embed_no_pending(monkeypatch, capsys):
    embed_mod = _env(monkeypatch)
    monkeypatch.setattr(embed_mod, "requests",
                        FakeHttp({"result": [{"results": []}]}))

    embed_mod.cmd_embed()
    assert capsys.readouterr().out.strip() == "nothing to embed"
