"""Konfigurasi terpusat ConfidAI.

Semua nilai dibaca dari file ``.env`` di root proyek sehingga kredensial dan
parameter tidak di-hardcode (NFR-01). Path relatif dihitung dari root proyek.

Catatan konsistensi embedding: ConfidAI memakai ulang koleksi ChromaDB yang
sudah dibangun oleh folder ``RAG/`` (lihat ``RAG/chroma_store``). Default di
sini menunjuk ke store itu agar retrieval dan ingestion memakai ruang vektor
yang sama (FR-04).
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Root proyek = parent dari paket confidai/.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
PACKAGE_DIR = Path(__file__).resolve().parent
REPOSITORY_ROOT = PROJECT_ROOT.parent

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(REPOSITORY_ROOT / ".env", override=False)


def _resolve(value: str) -> str:
    """Path absolut dari nilai yang bisa relatif terhadap root proyek."""
    p = Path(value).expanduser()
    return str(p if p.is_absolute() else PROJECT_ROOT / p)


# --- Ollama: embedding + LLM ---
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
# MODEL_NAME dipakai untuk embedding (konsisten dengan RAG/config.py).
EMBED_MODEL: str = os.getenv("MODEL_NAME", "nomic-embed-text:latest")
LLM_MODEL: str = os.getenv("LLM_MODEL", "qwen3:1.7b")

# nomic-embed-text membutuhkan prefiks terpisah untuk dokumen vs query.
if EMBED_MODEL.split(":", 1)[0] == "nomic-embed-text":
    EMBED_DOC_PREFIX, EMBED_QUERY_PREFIX = "search_document: ", "search_query: "
    EMBEDDING_SCHEME = "nomic_search_prefix_v1"
else:
    EMBED_DOC_PREFIX, EMBED_QUERY_PREFIX = "", ""
    EMBEDDING_SCHEME = "unprefixed_v1"

# --- ChromaDB (dipakai bersama dengan folder RAG/) ---
CHROMA_PERSIST_DIR: str = _resolve(
    os.getenv("CHROMA_PERSIST_DIR", "RAG/chroma_store")
)
CHROMA_COLLECTION: str = os.getenv("CHROMA_COLLECTION", "legal_security_references")

# --- OCR ---
# Kosong = cari biner tesseract di PATH.
TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "")

# --- Penyimpanan pekerjaan & artefak ---
# Semua data pekerjaan (PDF asli, hasil, laporan) di bawah folder ini.
DATA_DIR: str = _resolve(os.getenv("CONFIDAI_DATA_DIR", "confidai_data"))

# --- Batas upload & pemrosesan ---
MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE_BYTES", str(20 * 1024 * 1024)))  # 20 MB
UPLOAD_CHUNK_SIZE: int = 1024 * 1024  # baca 1 MB per iterasi

# Batas sumber daya worker (FR-11).
JOB_TIMEOUT_SECONDS: int = int(os.getenv("JOB_TIMEOUT_SECONDS", "1800"))
MAX_CONCURRENT_JOBS: int = int(os.getenv("MAX_CONCURRENT_JOBS", "1"))
MAX_CLAUSES_PER_DOC: int = int(os.getenv("MAX_CLAUSES_PER_DOC", "400"))
MAX_RETRIES_PER_STAGE: int = int(os.getenv("MAX_RETRIES_PER_STAGE", "2"))
# Batas konteks klausul per panggilan LLM. Teks asli tetap disimpan; batas ini
# mencegah satu klausul panjang membuat satu job menggantung terlalu lama.
MAX_ANALYSIS_CHARS: int = int(os.getenv("MAX_ANALYSIS_CHARS", "4000"))

# Kebijakan retensi (NFR-02, section 12): hapus artefak lebih tua dari ini.
RETENTION_HOURS: int = int(os.getenv("CONFIDAI_RETENTION_HOURS", "72"))

# --- Retrieval ---
RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "5"))
# Ambang similarity minimum agar sebuah referensi dianggap relevan (0..1).
RAG_MIN_SIMILARITY: float = float(os.getenv("RAG_MIN_SIMILARITY", "0.0"))


def summary() -> str:
    """Ringkasan konfigurasi yang aman dicetak (tanpa secret)."""
    return (
        f"OLLAMA_BASE_URL   = {OLLAMA_BASE_URL}\n"
        f"EMBED_MODEL       = {EMBED_MODEL}\n"
        f"LLM_MODEL         = {LLM_MODEL}\n"
        f"CHROMA_PERSIST_DIR= {CHROMA_PERSIST_DIR}\n"
        f"CHROMA_COLLECTION = {CHROMA_COLLECTION}\n"
        f"DATA_DIR          = {DATA_DIR}\n"
        f"MAX_FILE_SIZE     = {MAX_FILE_SIZE}\n"
        f"JOB_TIMEOUT       = {JOB_TIMEOUT_SECONDS}s\n"
        f"RETENTION_HOURS   = {RETENTION_HOURS}"
    )
