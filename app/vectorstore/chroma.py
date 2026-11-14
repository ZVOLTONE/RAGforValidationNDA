"""BE-06 tahap F: ChromaDB persistent untuk referensi hukum.

Konfigurasi (path, nama koleksi, model embedding) ada di `StoreConfig`, terpisah
dari logika ingestion. Koleksi menyimpan `embed_model` di metadata — konvensi
yang sama dengan `app/rag/ingest.py` — supaya vektor dari model berbeda tidak
tercampur dalam satu koleksi.

`path` diambil dari `config.CHROMA_DB` (default `./chroma_db`, relatif ke root
repo), jadi tidak ada path absolut milik mesin tertentu yang tertulis di kode.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from app.config import CHROMA_DB, COLLECTION, EMBED_MODEL


@dataclass(frozen=True)
class StoreConfig:
    path: str = CHROMA_DB
    collection: str = COLLECTION
    embed_model: str = EMBED_MODEL


class VectorStore:
    """Pembungkus tipis ChromaDB: upsert, hapus, cari, dan baca id per dokumen."""

    def __init__(self, config: StoreConfig | None = None, client=None) -> None:
        self.config = config or StoreConfig()
        if client is None:
            import chromadb  # diimpor di sini agar modul lain tidak wajib punya chromadb

            Path(self.config.path).mkdir(parents=True, exist_ok=True)
            client = chromadb.PersistentClient(path=self.config.path)
        self._client = client
        self._collection = None

    @property
    def collection(self):
        if self._collection is None:
            collection = self._client.get_or_create_collection(
                self.config.collection,
                metadata={"hnsw:space": "cosine", "embed_model": self.config.embed_model},
            )
            stored = (collection.metadata or {}).get("embed_model")
            if stored and stored != self.config.embed_model:
                raise ValueError(
                    f"Koleksi '{self.config.collection}' dibuat dengan model {stored}, "
                    f"bukan {self.config.embed_model}. Satu koleksi hanya boleh satu model."
                )
            self._collection = collection
        return self._collection

    def count(self) -> int:
        return self.collection.count()

    def document_chunks(self, document_id: str) -> dict[str, str]:
        """Peta chunk_id -> doc_hash untuk satu dokumen (dokumen lain tidak dibaca)."""
        data = self.collection.get(where={"document_id": document_id}, include=["metadatas"])
        ids = data.get("ids") or []
        metas = data.get("metadatas") or []
        return {cid: (meta or {}).get("doc_hash", "") for cid, meta in zip(ids, metas)}

    def upsert(self, ids: list[str], texts: list[str], metadatas: list[dict],
               embeddings: list[list[float]]) -> None:
        if not ids:
            return
        self.collection.upsert(ids=ids, documents=texts, metadatas=metadatas,
                               embeddings=embeddings)

    def delete(self, ids: list[str]) -> None:
        if ids:
            self.collection.delete(ids=ids)

    def query(self, embedding: list[float], k: int = 5, where: dict | None = None) -> list[dict]:
        """Cari chunk terdekat; kembalikan teks + metadata (bukan vektor)."""
        result = self.collection.query(
            query_embeddings=[embedding],
            n_results=k,
            where=where or None,
            include=["documents", "metadatas", "distances"],
        )
        ids = (result.get("ids") or [[]])[0]
        documents = (result.get("documents") or [[]])[0]
        metadatas = (result.get("metadatas") or [[]])[0]
        distances = (result.get("distances") or [[]])[0]
        return [
            {
                "id": cid,
                "text": doc,
                "metadata": meta or {},
                "distance": None if distance is None else round(float(distance), 6),
            }
            for cid, doc, meta, distance in zip(ids, documents, metadatas, distances)
        ]
