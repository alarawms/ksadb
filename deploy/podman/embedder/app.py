"""Workers-AI + Vectorize compatible sidecar for local development.

Serves bge-small-en-v1.5 (384-dim, L2-normalized) embeddings and a
brute-force cosine vector store with Vectorize-shaped responses.
Container-only dependencies (fastapi, uvicorn, sentence-transformers, numpy).
"""
import os
import sqlite3

import numpy as np
from fastapi import FastAPI, HTTPException, Request
from sentence_transformers import SentenceTransformer

MODEL_ID = "@cf/baai/bge-small-en-v1.5"
HF_MODEL = "BAAI/bge-small-en-v1.5"
DIM = 384
DB_PATH = os.environ.get("EMBEDDER_DB", "/data/vectors.db")

model = SentenceTransformer(HF_MODEL)
app = FastAPI()

_conn = sqlite3.connect(DB_PATH, check_same_thread=False)
_conn.execute("CREATE TABLE IF NOT EXISTS vectors ("
              "id TEXT PRIMARY KEY, type TEXT, accession TEXT, vec BLOB)")


@app.post("/accounts/{acct}/ai/run/{model_name:path}")
async def ai_run(model_name: str, request: Request):
    if model_name != MODEL_ID:
        raise HTTPException(404, f"unknown model {model_name}")
    body = await request.json()
    embs = model.encode(body["text"], normalize_embeddings=True).tolist()
    # Both consumers read the same payload: sync/embed.py expects the Cloudflare
    # REST wrapper (r.json()["result"]["data"]), while the Pages Function
    # (functions/api/v2/semantic.ts) uses the Workers-AI binding shape (.data).
    return {"data": embs, "result": {"data": embs}}


@app.post("/accounts/{acct}/vectorize/v2/indexes/{index}/upsert")
async def upsert(request: Request):
    rows = await request.json()
    with _conn:
        for row in rows:
            meta = row.get("metadata") or {}
            vec = np.asarray(row["values"], dtype=np.float32)
            if vec.shape != (DIM,):
                raise HTTPException(400, f"expected {DIM} dims, got {vec.shape}")
            _conn.execute(
                "INSERT OR REPLACE INTO vectors VALUES (?,?,?,?)",
                (row["id"], meta.get("type"), meta.get("accession"),
                 vec.tobytes()))
    return {"success": True}


@app.post("/accounts/{acct}/vectorize/v2/indexes/{index}/query")
async def query(request: Request):
    body = await request.json()
    q = np.asarray(body["vector"], dtype=np.float32)
    q = q / (np.linalg.norm(q) or 1.0)
    top_k = int(body.get("topK", 20))
    matches = []
    for vid, vtype, vacc, blob in _conn.execute(
            "SELECT id, type, accession, vec FROM vectors"):
        vec = np.frombuffer(blob, dtype=np.float32)
        score = float(vec @ q)  # both L2-normalized → cosine
        matches.append({"id": vid, "score": score,
                        "metadata": {"type": vtype, "accession": vacc}})
    matches.sort(key=lambda m: m["score"], reverse=True)
    return {"matches": matches[:top_k]}
