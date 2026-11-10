from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")


def _path(value: str) -> str:
    p = Path(value)
    return str(p if p.is_absolute() else ROOT / p)


COLLECTION = os.getenv("COLLECTION", "legal_references")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text:latest")
CHROMA_DB = _path(os.getenv("CHROMA_DB", "chroma_db"))
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
TESSERACT_CMD = os.getenv("TESSERACT_CMD", "")  # kosong = cari tesseract di PATH
PREFIXES = {"nomic-embed-text:latest": ("search_document: ", "search_query: ")}
DOC_PREFIX, QUERY_PREFIX = PREFIXES.get(EMBED_MODEL, ("", ""))
