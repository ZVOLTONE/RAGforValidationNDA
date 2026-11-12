from __future__ import annotations

import argparse
import re

import chromadb
import requests
from rank_bm25 import BM25Okapi

from app.config import CHROMA_DB, COLLECTION, OLLAMA_URL, PREFIXES

METHODS = ("vector", "bm25", "hybrid")
RRF_K = 60
TOKEN = re.compile(r"[a-z0-9]+")


def tokens(text: str) -> list[str]:
    return TOKEN.findall(text.lower())


def doc_text(doc: str, meta: dict) -> str:
    return f"{meta['short_name'] or meta['document_title']} {meta['article']}\n{doc}"


def embed(texts: list[str], model: str, url: str = OLLAMA_URL, query: bool = False,
          batch: int = 16) -> list[list[float]]:
    prefix = PREFIXES.get(model, ("", ""))[1 if query else 0]
    vecs = []
    for i in range(0, len(texts), batch):
        r = requests.post(f"{url}/api/embed",
                          json={"model": model, "input": [prefix + t for t in texts[i:i + batch]]},
                          timeout=600)
        r.raise_for_status()
        vecs.extend(r.json()["embeddings"])
    return vecs


def rrf(rankings: list[list[str]]) -> list[tuple[str, float]]:
    score: dict[str, float] = {}
    for ranking in rankings:
        for pos, cid in enumerate(ranking, 1):
            score[cid] = score.get(cid, 0.0) + 1 / (RRF_K + pos)
    return sorted(score.items(), key=lambda x: -x[1])


def copy_collection(model: str, src: str = COLLECTION, db: str = CHROMA_DB,
                    url: str = OLLAMA_URL) -> str:
    client = chromadb.PersistentClient(path=db)
    data = client.get_collection(src).get()
    name = f"{src}__{re.sub(r'[^a-zA-Z0-9]+', '-', model).strip('-')}"
    col = client.get_or_create_collection(name, metadata={"hnsw:space": "cosine", "embed_model": model})
    if col.count() == len(data["ids"]):
        return name
    metas = [{**m, "embed_model": model} for m in data["metadatas"]]
    vecs = embed([doc_text(d, m) for d, m in zip(data["documents"], metas)], model, url)
    col.upsert(ids=data["ids"], documents=data["documents"], metadatas=metas, embeddings=vecs)
    return name


class Retriever:
    def __init__(self, collection: str = COLLECTION, db: str = CHROMA_DB, url: str = OLLAMA_URL):
        self.col = chromadb.PersistentClient(path=db).get_collection(collection)
        self.model = self.col.metadata["embed_model"]
        self.url = url
        data = self.col.get()
        self.ids, self.docs, self.metas = data["ids"], data["documents"], data["metadatas"]
        self.pos = {cid: i for i, cid in enumerate(self.ids)}
        self.bm25 = BM25Okapi([tokens(doc_text(d, m)) for d, m in zip(self.docs, self.metas)])

    def _vector(self, query: str, n: int, source: str | None) -> list[str]:
        vec = embed([query], self.model, self.url, query=True)[0]
        res = self.col.query(query_embeddings=[vec], n_results=min(n, len(self.ids)),
                             where={"source_id": source} if source else None)
        return res["ids"][0]

    def _bm25(self, query: str, n: int, source: str | None) -> list[str]:
        scores = self.bm25.get_scores(tokens(query))
        order = sorted(range(len(self.ids)), key=lambda i: -scores[i])
        return [self.ids[i] for i in order
                if scores[i] > 0 and (not source or self.metas[i]["source_id"] == source)][:n]

    def search(self, query: str, k: int = 5, method: str = "hybrid", source: str | None = None,
               pool: int = 20) -> list[dict]:
        if method == "vector":
            ranked = [(cid, 1 / (RRF_K + p)) for p, cid in enumerate(self._vector(query, pool, source), 1)]
        elif method == "bm25":
            ranked = [(cid, 1 / (RRF_K + p)) for p, cid in enumerate(self._bm25(query, pool, source), 1)]
        elif method == "hybrid":
            ranked = rrf([self._vector(query, pool, source), self._bm25(query, pool, source)])
        else:
            raise ValueError(f"method harus salah satu dari {METHODS}")
        hits = []
        for cid, score in ranked[:k]:
            i = self.pos[cid]
            m = self.metas[i]
            hits.append({"id": cid, "score": round(score, 4), "source_id": m["source_id"],
                         "short_name": m["short_name"], "article": m["article"],
                         "section": m["section"], "page_number": m["page_number"],
                         "text": self.docs[i]})
        return hits


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("--method", choices=METHODS, default="hybrid")
    ap.add_argument("--collection", default=COLLECTION)
    ap.add_argument("--source", help="filter source_id, mis. UU-27-2022")
    ap.add_argument("-k", type=int, default=5)
    a = ap.parse_args()
    for h in Retriever(a.collection).search(a.query, a.k, a.method, a.source):
        print(f"\n[{h['score']:.4f}] {h['short_name'] or h['source_id']} {h['article']} "
              f"({h['section']}, hal {h['page_number']})")
        print(h["text"][:250].replace("\n", " "))
