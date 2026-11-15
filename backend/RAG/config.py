"""Konfigurasi terpusat untuk pipeline ingestion RAG ConfidAI.

Semua nilai dibaca dari file .env di root proyek (satu level di atas folder RAG),
sehingga kredensial dan parameter tidak di-hardcode di dalam kode sumber.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Root proyek = parent dari folder RAG tempat file ini berada.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAG_DIR = Path(__file__).resolve().parent
REPOSITORY_ROOT = PROJECT_ROOT.parent

# Muat .env dari root proyek.
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(REPOSITORY_ROOT / ".env", override=False)

# --- Model & endpoint embedding (Ollama) ---
MODEL_NAME: str = os.getenv("MODEL_NAME", "nomic-embed-text:latest")
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
if MODEL_NAME.split(":", 1)[0] == "nomic-embed-text":
    EMBED_DOC_PREFIX, EMBED_QUERY_PREFIX = "search_document: ", "search_query: "
    EMBEDDING_SCHEME = "nomic_search_prefix_v1"
else:
    EMBED_DOC_PREFIX, EMBED_QUERY_PREFIX = "", ""
    EMBEDDING_SCHEME = "unprefixed_v1"

# --- ChromaDB ---
# Direktori persisten untuk koleksi ChromaDB.
CHROMA_PERSIST_DIR: str = os.getenv(
    "CHROMA_PERSIST_DIR", str(RAG_DIR / "chroma_store")
)
# Nama koleksi untuk referensi hukum & keamanan siber.
CHROMA_COLLECTION: str = os.getenv("CHROMA_COLLECTION", "legal_security_references")

# --- Parameter chunking ---
# Batas maksimum karakter per chunk. Pasal yang lebih panjang dari ini akan
# dipecah lebih lanjut berdasarkan batas kalimat/paragraf.
MAX_CHUNK_CHARS: int = int(os.getenv("MAX_CHUNK_CHARS", "1800"))
# Overlap karakter antar sub-chunk agar konteks tidak terputus.
CHUNK_OVERLAP_CHARS: int = int(os.getenv("CHUNK_OVERLAP_CHARS", "200"))


def summary() -> str:
    """Ringkasan konfigurasi yang aman untuk dicetak (tanpa secret)."""
    return (
        f"MODEL_NAME        = {MODEL_NAME}\n"
        f"OLLAMA_BASE_URL   = {OLLAMA_BASE_URL}\n"
        f"CHROMA_PERSIST_DIR= {CHROMA_PERSIST_DIR}\n"
        f"CHROMA_COLLECTION = {CHROMA_COLLECTION}\n"
        f"MAX_CHUNK_CHARS   = {MAX_CHUNK_CHARS}\n"
        f"CHUNK_OVERLAP     = {CHUNK_OVERLAP_CHARS}"
    )
