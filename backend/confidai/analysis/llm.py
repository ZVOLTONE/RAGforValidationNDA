"""Klien LLM lokal (Ollama / qwen3:1.7b) untuk analisis klausul.

Tanggung jawab:
- Memanggil endpoint /api/chat Ollama dengan ``format="json"`` agar keluaran
  berupa JSON (FR-07).
- Memisahkan instruksi sistem dari konten dokumen. Isi klausul dibungkus
  penanda eksplisit dan model diperintahkan memperlakukannya sebagai DATA,
  bukan instruksi (section 12 no. 7-8: mitigasi prompt injection).
- Membersihkan blok <think>...</think> khas qwen3 sebelum parsing JSON.
- Menangani kegagalan LLM dengan exception yang jelas (NFR-03).

Model ini kecil (1.7B), jadi prompt dibuat spesifik dan bertugas tunggal
(section 15: "Batasi tugas, validasi output").
"""

from __future__ import annotations

import json
import re
import time
from typing import Any

import requests

from confidai import config

# Blok penalaran qwen3 yang harus dibuang sebelum JSON di-parse.
_THINK = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)
# Pagar untuk konten dokumen agar tidak tertukar dengan instruksi.
DOC_START = "<<<DOKUMEN_KLAUSUL_MULAI>>>"
DOC_END = "<<<DOKUMEN_KLAUSUL_SELESAI>>>"


class LLMError(RuntimeError):
    """Kegagalan pemanggilan atau parsing LLM."""


class OllamaLLM:
    """Pembungkus tipis endpoint chat Ollama dengan keluaran JSON."""

    def __init__(
        self,
        model: str | None = None,
        base_url: str | None = None,
        timeout: float | None = None,
        max_retries: int = 2,
    ) -> None:
        self.model = model or config.LLM_MODEL
        self.base_url = (base_url or config.OLLAMA_BASE_URL).rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self._chat = f"{self.base_url}/api/chat"

    def health_check(self) -> None:
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=10)
            resp.raise_for_status()
        except requests.RequestException as exc:
            raise LLMError(
                f"Tidak dapat terhubung ke Ollama di {self.base_url}. "
                f"Pastikan Ollama berjalan. Detail: {exc}"
            ) from exc
        names = {m.get("name") for m in resp.json().get("models", [])}
        if self.model not in names:
            raise LLMError(
                f"Model '{self.model}' tidak ditemukan di Ollama. "
                f"Jalankan: ollama pull {self.model}\n"
                f"Model tersedia: {sorted(n for n in names if n)}"
            )

    def chat_json(self, system: str, user: str, temperature: float = 0.1) -> dict[str, Any]:
        """Kirim prompt, kembalikan dict hasil parse JSON. Melempar LLMError bila gagal."""
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "stream": False,
            "format": "json",
            # Qwen3 defaults to a long reasoning phase. For this extraction task,
            # disable it and cap output so local CPU inference returns promptly.
            "think": False,
            "options": {"temperature": temperature, "num_ctx": 4096, "num_predict": 500},
        }
        last_exc: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            try:
                resp = requests.post(self._chat, json=payload, timeout=self.timeout)
                resp.raise_for_status()
                content = resp.json().get("message", {}).get("content", "")
                return self._parse_json(content)
            except (requests.RequestException, LLMError) as exc:
                last_exc = exc
                if attempt < self.max_retries:
                    time.sleep(1.5 * attempt)
        raise LLMError(f"Gagal memanggil/parse LLM setelah {self.max_retries} percobaan: {last_exc}") from last_exc

    @staticmethod
    def _parse_json(content: str) -> dict[str, Any]:
        text = _THINK.sub("", content or "").strip()
        # Ambil blok JSON pertama bila model menambahkan teks pembungkus.
        if not text.startswith("{"):
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                text = text[start : end + 1]
        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            raise LLMError(f"Keluaran LLM bukan JSON valid: {exc}. Cuplikan: {text[:200]!r}") from exc
        if not isinstance(data, dict):
            raise LLMError(f"Keluaran JSON LLM bukan objek: {type(data).__name__}")
        return data


def wrap_document(text: str) -> str:
    """Bungkus teks klausul dengan pagar agar diperlakukan sebagai data."""
    # Hilangkan penanda palsu yang mungkin ada di dokumen (anti prompt injection).
    cleaned = text.replace(DOC_START, "").replace(DOC_END, "")
    return f"{DOC_START}\n{cleaned}\n{DOC_END}"
