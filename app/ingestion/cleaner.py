"""BE-06 tahap C: rapikan teks halaman. Hanya artefak jelas yang dibuang.

Yang TIDAK dilakukan: menggabung baris, membetulkan ejaan, atau menyentuh
penomoran. "Pasal 1", "(2)", "a.", "BAB I" harus tetap apa adanya karena
pemotong klausul (BE-05) dan penunjuk pasal (BE-11) bergantung padanya.

Teks asli tetap disimpan di `Chunk.original_text`; fungsi di sini hanya
menghasilkan versi bersih untuk di-embed dan ditampilkan.
"""
from __future__ import annotations

import re

# Artefak nomor halaman hasil scan/PDF. Sengaja sempit supaya "1." atau "(1)"
# (penomoran asli) tidak ikut terhapus.
ARTIFACTS = (
    re.compile(r"^[-–—]\s*\d{1,3}\s*[-–—]$"),                  # - 7 -  /  — 12 —
    re.compile(r"^halaman\s+\d+(\s*(dari|of)\s*\d+)?$", re.I),  # Halaman 7 dari 76
    re.compile(r"^\d{1,3}\s*(dari|of)\s*\d{1,3}$", re.I),       # 7 dari 76
)

MULTI_SPACE = re.compile(r"[ \t\u00a0\u200b]{2,}")
BLANK_RUN = re.compile(r"\n{3,}")


def is_artifact(line: str) -> bool:
    """Baris ini artefak halaman (bukan isi pasal)?"""
    return any(pattern.match(line) for pattern in ARTIFACTS)


def clean_text(text: str) -> str:
    """Normalisasi spasi/baris dan buang artefak halaman; penomoran dipertahankan."""
    lines: list[str] = []
    normalized = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    for raw in normalized.split("\n"):
        line = MULTI_SPACE.sub(" ", raw).strip()
        if line and is_artifact(line):
            continue
        lines.append(line)
    cleaned = BLANK_RUN.sub("\n\n", "\n".join(lines))
    return cleaned.strip("\n")


def clean_pages(pages) -> list[str]:
    """Teks bersih per halaman (urutan halaman dipertahankan)."""
    return [clean_text(getattr(page, "text", "") or "") for page in pages or []]
