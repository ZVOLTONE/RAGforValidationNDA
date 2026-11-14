"""BE-06 tahap E: embedding lewat Ollama (default `nomic-embed-text:latest`).

Tidak ada fallback diam-diam ke model lain: kalau model belum ada, `check()`
melempar `SetupError` berisi perintah yang harus dijalankan. Prefiks mengikuti
`app/config.py` (`DOC_PREFIX`/`QUERY_PREFIX`) supaya sama dengan koleksi lama
dan dengan `app/rag/retrieval.py`.
"""
from __future__ import annotations

import requests

from app.config import DOC_PREFIX, EMBED_MODEL, OLLAMA_URL, QUERY_PREFIX


class SetupError(RuntimeError):
    """Konfigurasi belum siap (Ollama mati atau model belum di-pull)."""


class OllamaEmbedder:
    def __init__(self, model: str = EMBED_MODEL, url: str = OLLAMA_URL,
                 doc_prefix: str = DOC_PREFIX, query_prefix: str = QUERY_PREFIX,
                 batch: int = 16, timeout: int = 120, session=None) -> None:
        self.model = model
        self.url = url.rstrip("/")
        self.doc_prefix = doc_prefix
        self.query_prefix = query_prefix
        self.batch = batch
        self.timeout = timeout
        self.session = session or requests

    def check(self) -> None:
        """Pastikan Ollama hidup dan model benar-benar tersedia."""
        try:
            response = self.session.get(f"{self.url}/api/tags", timeout=10)
            response.raise_for_status()
            data = response.json()
        except Exception as exc:  # RequestException, JSONDecodeError, dll.
            raise SetupError(
                f"Ollama tidak bisa dihubungi di {self.url} ({type(exc).__name__}). "
                "Jalankan 'ollama serve' di terminal lain, lalu ulangi."
            ) from exc

        names = set()
        for entry in data.get("models", []) or []:
            for key in ("name", "model"):
                if entry.get(key):
                    names.add(entry[key])
        if self.model not in names:
            raise SetupError(
                f"Model {self.model} belum ada di Ollama. Jalankan: ollama pull {self.model}"
            )

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._embed([self.doc_prefix + text for text in texts])

    def embed_query(self, text: str) -> list[float]:
        return self._embed([self.query_prefix + text])[0]

    def _embed(self, texts: list[str]) -> list[list[float]]:
        vectors: list[list[float]] = []
        for start in range(0, len(texts), self.batch):
            part = texts[start:start + self.batch]
            response = self.session.post(
                f"{self.url}/api/embed",
                json={"model": self.model, "input": part},
                timeout=self.timeout,
            )
            response.raise_for_status()
            vectors.extend(response.json().get("embeddings") or [])
        if len(vectors) != len(texts):
            raise SetupError(
                f"Respons embedding tidak sesuai: {len(vectors)} vektor untuk {len(texts)} teks."
            )
        return vectors
