"""Env base-URL seams: unset = Cloudflare defaults, set = local overrides."""
import os

import pytest

from sync.d1_push import DEFAULT_BASE_URL, cf_base_url
from sync import embed


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    for var in ("CF_API_BASE_URL", "AI_BASE_URL", "VECTORIZE_BASE_URL"):
        monkeypatch.delenv(var, raising=False)


def test_cf_base_url_defaults():
    assert cf_base_url() == DEFAULT_BASE_URL


def test_cf_base_url_override(monkeypatch):
    monkeypatch.setenv("CF_API_BASE_URL", "http://d1-shim:8000")
    assert cf_base_url() == "http://d1-shim:8000"


class _FakeResp:
    def raise_for_status(self):
        pass

    def json(self):
        return {"result": {"data": [[0.1] * 384]}}


class _FakeHttp:
    def __init__(self):
        self.calls = []

    def post(self, url, **kwargs):
        self.calls.append((url, kwargs))
        return _FakeResp()


def test_embed_texts_uses_ai_base_url(monkeypatch):
    monkeypatch.setenv("AI_BASE_URL", "http://embedder:8000")
    http = _FakeHttp()
    embed.embed_texts(["hello"], "local", "token", http=http)
    assert http.calls[0][0] == (
        "http://embedder:8000/accounts/local/ai/run/@cf/baai/bge-small-en-v1.5")


def test_embed_texts_default_url():
    http = _FakeHttp()
    embed.embed_texts(["hello"], "acct", "token", http=http)
    assert http.calls[0][0] == (
        f"{DEFAULT_BASE_URL}/accounts/acct/ai/run/@cf/baai/bge-small-en-v1.5")


def test_vectorize_upsert_uses_vectorize_base_url(monkeypatch):
    monkeypatch.setenv("VECTORIZE_BASE_URL", "http://embedder:8000")

    class Ok:
        def raise_for_status(self):
            pass

    calls = []

    def fake_post(url, **kwargs):
        calls.append(url)
        return Ok()

    monkeypatch.setattr(embed.requests, "post", fake_post)
    embed.vectorize_upsert("local", "token", "studies-vec",
                           [{"id": "x", "values": [0.0] * 384,
                             "metadata": {"type": "study", "accession": "x"}}])
    assert calls[0] == ("http://embedder:8000/accounts/local/"
                        "vectorize/v2/indexes/studies-vec/upsert")
