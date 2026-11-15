"""Service untuk mencari referensi yang relevan dari koleksi ChromaDB."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import chromadb
from chromadb.config import Settings

try:  # package import from the API
    from . import config
    from .embeddings import OllamaEmbedder
except ImportError:  # direct CLI execution from RAG/
    import config
    from embeddings import OllamaEmbedder


@dataclass(frozen=True)
class ReferenceResult:
    """Satu potongan referensi beserta metadata dan skor retrieval."""

    text: str
    metadata: dict[str, Any]
    distance: float | None = None
    similarity: float | None = None
    chunk_id: str | None = None
    chunk_ids: tuple[str, ...] = ()


class ReferenceSearchService:
    """Mencari top-k referensi menggunakan model embedding yang sama dengan ingest."""

    def __init__(
        self,
        collection=None,
        embedder: OllamaEmbedder | None = None,
        persist_dir: str | None = None,
        collection_name: str | None = None,
    ) -> None:
        self._collection = collection
        self._embedder = embedder or OllamaEmbedder()
        self._persist_dir = persist_dir or config.CHROMA_PERSIST_DIR
        self._collection_name = collection_name or config.CHROMA_COLLECTION

    def _get_collection(self):
        if self._collection is None:
            client = chromadb.PersistentClient(
                path=self._persist_dir,
                settings=Settings(anonymized_telemetry=False),
            )
            try:
                self._collection = client.get_collection(self._collection_name)
            except Exception as exc:
                # Koleksi belum dibuat saat belum ada referensi yang di-ingest.
                if exc.__class__.__name__ == "NotFoundError":
                    return None
                raise
        return self._collection

    def search(self, clause: str, top_k: int = 5) -> list[ReferenceResult]:
        """Ambil top-k referensi terdekat; daftar kosong berarti tidak ada hasil.

        Skor Chroma berupa cosine distance untuk koleksi yang dibuat oleh
        pipeline ini. Similarity diturunkan sebagai ``1 - distance``.
        """
        if not isinstance(clause, str) or not clause.strip():
            raise ValueError("Klausul pencarian tidak boleh kosong.")
        if isinstance(top_k, bool) or not isinstance(top_k, int) or top_k < 1:
            raise ValueError("top_k harus berupa integer positif.")

        collection = self._get_collection()
        if collection is None or collection.count() == 0:
            return []
        scheme = (collection.metadata or {}).get("embedding_scheme", "legacy_unprefixed")
        if scheme != config.EMBEDDING_SCHEME:
            raise RuntimeError(
                f"Indeks memakai embedding scheme '{scheme}', query memakai '{config.EMBEDDING_SCHEME}'. "
                "Bangun ulang indeks sebelum menjalankan retrieval agar vektornya konsisten."
            )

        query_embedding = self._embedder.embed_one(clause.strip())
        raw = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
        documents = (raw.get("documents") or [[]])[0] or []
        metadatas = (raw.get("metadatas") or [[]])[0] or []
        distances = (raw.get("distances") or [[]])[0] or []

        results: list[ReferenceResult] = []
        for index, text in enumerate(documents):
            if text is None:
                continue
            metadata = metadatas[index] if index < len(metadatas) else None
            distance = distances[index] if index < len(distances) else None
            results.append(
                ReferenceResult(
                    text=text,
                    metadata=metadata or {},
                    distance=float(distance) if distance is not None else None,
                    similarity=1.0 - float(distance) if distance is not None else None,
                    chunk_id=(raw.get("ids") or [[]])[0][index]
                    if index < len((raw.get("ids") or [[]])[0]) else None,
                )
            )
        return results

    def get_articles(self, articles: dict[str, list[int]]) -> list[ReferenceResult]:
        """Fetch exact curated law articles by source ID and article number.

        This avoids attaching arbitrary nearest-neighbor results as legal
        citations. Only body-of-law chunks are returned; explanatory notes are
        intentionally excluded.
        """
        collection = self._get_collection()
        if collection is None or collection.count() == 0:
            return []
        scheme = (collection.metadata or {}).get("embedding_scheme", "legacy_unprefixed")
        if scheme != config.EMBEDDING_SCHEME:
            raise RuntimeError(
                f"Indeks memakai embedding scheme '{scheme}', query memakai '{config.EMBEDDING_SCHEME}'. "
                "Bangun ulang indeks sebelum menjalankan retrieval agar vektornya konsisten."
            )

        output: list[ReferenceResult] = []
        for source_id, numbers in articles.items():
            wanted = sorted({int(number) for number in numbers})
            if not wanted:
                continue
            raw = collection.get(
                where={"$and": [
                    {"source_id": source_id},
                    {"reference_type": "pasal"},
                    {"section": "batang_tubuh"},
                    {"pasal_number": {"$in": wanted}},
                ]},
                include=["documents", "metadatas"],
            )
            grouped: dict[int, list[tuple[int, str, dict, str]]] = {}
            ids = raw.get("ids") or []
            for index, (document, metadata) in enumerate(zip(raw.get("documents") or [], raw.get("metadatas") or [])):
                number = int(metadata.get("pasal_number", -1))
                if number not in wanted:
                    continue
                grouped.setdefault(number, []).append((
                    int(metadata.get("chunk_index", 0)), document or "", metadata or {},
                    ids[index] if index < len(ids) else "",
                ))
            for number in wanted:
                chunks = sorted(grouped.get(number, []), key=lambda item: item[0])
                if not chunks:
                    continue
                metadata = dict(chunks[0][2])
                output.append(ReferenceResult(
                    text="\n".join(text for _, text, _, _ in chunks),
                    metadata=metadata,
                    chunk_id=chunks[0][3] or None,
                    chunk_ids=tuple(chunk_id for _, _, _, chunk_id in chunks if chunk_id),
                ))
        return output
