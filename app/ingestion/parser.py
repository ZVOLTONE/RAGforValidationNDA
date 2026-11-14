"""BE-06 tahap A: baca PDF lewat extractor yang SUDAH ADA (BE-04).

Tidak ada extractor kedua di sini: `app/document/extract.py` yang memilih jalur
teks digital atau OCR per halaman, dan sudah menangani kegagalan satu halaman
tanpa membuang halaman lain (halaman gagal jadi method "failed" + error).
"""
from __future__ import annotations

from pathlib import Path

from app.document.extract import Page, extract


def parse_pdf(path: str | Path) -> list[Page]:
    """Kembalikan halaman PDF (urut) memakai `extract()` BE-04."""
    return extract(str(path))


def pages_with_text(pages) -> list[Page]:
    """Halaman yang benar-benar punya teks; halaman kosong/gagal dilewati."""
    return [page for page in pages or [] if (getattr(page, "text", "") or "").strip()]
