import pytest

from sync.embed import embed_texts, statements_to_mark_embedded


class FakeResp:
    def __init__(self, payload): self._p = payload
    def raise_for_status(self): pass
    def json(self): return self._p


class FakeHttp:
    def __init__(self, payload): self.payload = payload; self.calls = []
    def post(self, url, headers=None, json=None, timeout=None):
        self.calls.append((url, json, headers))
        return FakeResp(self.payload)


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


def test_statements_to_mark_embedded():
    stmts = statements_to_mark_embedded(["PRJEB1", "PRJEB2"])
    assert stmts == [
        "INSERT OR IGNORE INTO embedded_studies (accession) VALUES ('PRJEB1')",
        "INSERT OR IGNORE INTO embedded_studies (accession) VALUES ('PRJEB2')",
    ]


def test_cmd_embed_uses_cf_token_for_ai_and_marks_studies(monkeypatch):
    import sync.embed as embed_mod

    monkeypatch.setenv("D1_ACCOUNT_ID", "acct")
    monkeypatch.setenv("D1_DATABASE_ID", "db1")
    monkeypatch.setenv("D1_API_TOKEN", "d1-tok")
    monkeypatch.setenv("CF_API_TOKEN", "cf-tok")

    d1_http = FakeHttp({"result": [{"results": [
        {"accession": "PRJEB1", "title": "Camel study", "abstract": "Gut metagenome"},
    ]}]})
    monkeypatch.setattr(embed_mod, "requests", d1_http)

    calls = {}

    def fake_embed_texts(texts, account_id, api_token, **kw):
        calls["embed"] = (texts, account_id, api_token)
        return [[0.1] * 384] * len(texts)

    def fake_upsert(account_id, api_token, index, rows, **kw):
        calls["upsert"] = (account_id, api_token, index, rows)

    monkeypatch.setattr(embed_mod, "embed_texts", fake_embed_texts)
    monkeypatch.setattr(embed_mod, "vectorize_upsert", fake_upsert)

    embed_mod.cmd_embed()

    assert calls["embed"] == (["Camel study\nGut metagenome"], "acct", "cf-tok")
    assert calls["upsert"][0] == "acct" and calls["upsert"][1] == "cf-tok"
    assert calls["upsert"][2] == "studies-vec"
    assert calls["upsert"][3] == [
        {"id": "PRJEB1", "values": [0.1] * 384,
         "metadata": {"accession": "PRJEB1"}},
    ]
    # D1 read + mark-embedded writes go to the D1 REST endpoint
    d1_urls = [u for u, _, _ in d1_http.calls]
    assert all("/d1/database/db1/query" in u for u in d1_urls)
    mark_calls = [j for _, j, _ in d1_http.calls
                  if any(s["sql"].startswith("INSERT OR IGNORE INTO embedded_studies")
                         for s in j["batch"])]
    assert len(mark_calls) == 1
    assert mark_calls[0]["batch"][0]["sql"] == \
        "INSERT OR IGNORE INTO embedded_studies (accession) VALUES ('PRJEB1')"


def test_cmd_embed_no_pending(monkeypatch, capsys):
    import sync.embed as embed_mod

    monkeypatch.setenv("D1_ACCOUNT_ID", "acct")
    monkeypatch.setenv("D1_DATABASE_ID", "db1")
    monkeypatch.setenv("D1_API_TOKEN", "d1-tok")
    monkeypatch.setenv("CF_API_TOKEN", "cf-tok")
    monkeypatch.setattr(embed_mod, "requests",
                        FakeHttp({"result": [{"results": []}]}))

    embed_mod.cmd_embed()
    assert capsys.readouterr().out.strip() == "nothing to embed"
