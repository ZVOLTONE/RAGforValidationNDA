"""Utilitas retrieval untuk memverifikasi koleksi ChromaDB.

Menggunakan model embedding yang sama (nomic-embed-text) agar query dan
dokumen berada di ruang vektor yang konsisten.

Contoh:
    python query.py "akses ilegal ke sistem elektronik milik orang lain"
    python query.py "pidana penyadapan informasi elektronik" -k 3
"""

from __future__ import annotations

import argparse
import sys

import chromadb
from chromadb.config import Settings

import config
from embeddings import OllamaEmbedder


def retrieve(query_text: str, k: int = 5):
    client = chromadb.PersistentClient(
        path=config.CHROMA_PERSIST_DIR,
        settings=Settings(anonymized_telemetry=False),
    )
    collection = client.get_collection(config.CHROMA_COLLECTION)
    scheme = (collection.metadata or {}).get("embedding_scheme", "legacy_unprefixed")
    if scheme != config.EMBEDDING_SCHEME:
        raise RuntimeError(
            f"Indeks memakai embedding scheme '{scheme}', query memakai '{config.EMBEDDING_SCHEME}'. "
            "Bangun ulang indeks sebelum menjalankan retrieval agar vektornya konsisten."
        )

    embedder = OllamaEmbedder()
    query_vec = embedder.embed_one(query_text)

    results = collection.query(
        query_embeddings=[query_vec],
        n_results=k,
        include=["documents", "metadatas", "distances"],
    )
    return results


def main() -> int:
    ap = argparse.ArgumentParser(description="Query koleksi RAG ChromaDB")
    ap.add_argument("query", help="Teks pertanyaan / klausul")
    ap.add_argument("-k", type=int, default=5, help="Jumlah hasil teratas")
    args = ap.parse_args()

    res = retrieve(args.query, args.k)
    docs = res["documents"][0]
    metas = res["metadatas"][0]
    dists = res["distances"][0]

    print(f"Query: {args.query!r}\n")
    for rank, (doc, meta, dist) in enumerate(zip(docs, metas, dists), start=1):
        sim = 1 - dist  # cosine similarity
        print(f"#{rank}  similarity={sim:.4f}")
        print(
            f"    {meta.get('pasal')} | {meta.get('bab')} "
            f"| {meta.get('section')} | {meta.get('document_number')}"
        )
        preview = doc.replace("\n", " ")[:200]
        print(f"    {preview} ...")
        print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
