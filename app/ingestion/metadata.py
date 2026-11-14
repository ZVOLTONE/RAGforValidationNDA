"""BE-06 tahap D: metadata chunk. Hanya nilai yang benar-benar diketahui.

Chroma hanya menerima metadata datar (str/int/float/bool) dan tidak menerima
None, jadi nilai yang tidak ada ditulis sebagai string kosong - bukan dikarang.

`source_id` diisi sama dengan `document_id` supaya filter `source_id` milik
`app/rag/retrieval.py` (BE-07) tetap jalan untuk chunk baru.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.ingestion.chunker import Chunk

FIELDS = (
    "source", "source_id", "document_id", "title", "reference_type",
    "page_start", "page_end", "section", "chunk_index", "chunk_id", "doc_hash",
)


@dataclass(frozen=True)
class DocumentMeta:
    document_id: str
    source: str          # nama file, bukan path absolut
    title: str
    reference_type: str  # mis. "UU", "NDA"; kosong kalau tidak diberikan
    doc_hash: str        # sha256 isi file, untuk deteksi perubahan


def chunk_metadata(chunk: Chunk, document: DocumentMeta) -> dict:
    """Metadata datar untuk satu chunk (semua nilai Chroma-safe)."""
    return {
        "source": document.source,
        "source_id": document.document_id,
        "document_id": document.document_id,
        "title": document.title,
        "reference_type": document.reference_type,
        "page_start": int(chunk.page_start),
        "page_end": int(chunk.page_end),
        "section": chunk.section or "",
        "chunk_index": int(chunk.chunk_index),
        "chunk_id": chunk.chunk_id,
        "doc_hash": document.doc_hash,
    }
