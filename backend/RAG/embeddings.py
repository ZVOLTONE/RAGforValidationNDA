"""Client embedding berbasis Ollama untuk model nomic-embed-text.

Membungkus endpoint /api/embeddings milik Ollama. Model diambil dari
config (MODEL_NAME) sehingga konsisten di seluruh pipeline — syarat agar
embedding yang disimpan dan yang dipakai saat retrieval berasal dari
model yang sama.
"""

from __future__ import annotations

import time
from typing import Sequence

import requests

try:  # package import from the API
    from . import config
except ImportError:  # direct CLI execution from RAG/
    import config


class OllamaEmbedder:
    """Pembuat embedding dengan model Ollama yang konsisten."""

    def __init__(
        self,
        model: str | None = None,
        base_url: str | None = None,
        timeout: int = 120,
        max_retries: int = 3,
    ) -> None:
        self.model = model or config.MODEL_NAME
        self.base_url = (base_url or config.OLLAMA_BASE_URL).rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self._endpoint = f"{self.base_url}/api/embeddings"

    def health_check(self) -> None:
        """Pastikan server Ollama hidup dan model tersedia.

        Melempar RuntimeError dengan pesan yang jelas bila tidak.
        """
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=10)
            resp.raise_for_status()
        except requests.RequestException as exc:  # pragma: no cover
            raise RuntimeError(
                f"Tidak dapat terhubung ke Ollama di {self.base_url}. "
                f"Pastikan Ollama berjalan. Detail: {exc}"
            ) from exc

        names = {m.get("name") for m in resp.json().get("models", [])}
        if self.model not in names:
            raise RuntimeError(
                f"Model '{self.model}' tidak ditemukan di Ollama. "
                f"Jalankan: ollama pull {self.model}\n"
                f"Model tersedia: {sorted(n for n in names if n)}"
            )

    def embed_one(self, text: str, input_type: str = "query") -> list[float]:
        """Buat satu vektor; Nomic membedakan prefiks dokumen dan query."""
        if input_type not in {"document", "query"}:
            raise ValueError("input_type harus 'document' atau 'query'.")
        prefix = config.EMBED_DOC_PREFIX if input_type == "document" else config.EMBED_QUERY_PREFIX
        payload = {"model": self.model, "prompt": prefix + text}
        last_exc: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            try:
                resp = requests.post(
                    self._endpoint, json=payload, timeout=self.timeout
                )
                resp.raise_for_status()
                data = resp.json()
                vector = data.get("embedding")
                if not vector:
                    raise RuntimeError(
                        f"Respons embedding kosong untuk model {self.model}: {data}"
                    )
                return vector
            except requests.RequestException as exc:
                last_exc = exc
                if attempt < self.max_retries:
                    time.sleep(1.5 * attempt)
        raise RuntimeError(
            f"Gagal membuat embedding setelah {self.max_retries} percobaan: {last_exc}"
        )

    def embed_many(self, texts: Sequence[str]) -> list[list[float]]:
        """Buat embedding dokumen untuk banyak teks (berurutan)."""
        return [self.embed_one(t, input_type="document") for t in texts]
