"""Parsing & segmentasi dokumen referensi hukum / keamanan siber.

Fokus awal: UU Nomor 11 Tahun 2008 (UU ITE) dalam bentuk teks.
Strategi:
  1. Bersihkan teks (normalisasi whitespace, hilangkan baris kosong berlebih).
  2. Deteksi struktur dokumen: BAB (bab), Bagian, dan Pasal.
  3. Pisahkan "batang tubuh" dari bagian "PENJELASAN" (elucidation),
     karena keduanya punya Pasal dengan nomor sama namun makna berbeda.
  4. Segmentasi menjadi unit chunk per-Pasal, dengan metadata lengkap.
  5. Pasal yang terlalu panjang dipecah menjadi sub-chunk dengan overlap.

Hasil: daftar objek Chunk yang siap di-embed dan disimpan ke ChromaDB.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Iterable


@dataclass
class Chunk:
    """Satu unit teks yang akan di-embed beserta metadata-nya."""

    text: str
    metadata: dict = field(default_factory=dict)

    def as_dict(self) -> dict:
        return asdict(self)


# --- Pola regex untuk struktur dokumen ---
_RE_BAB = re.compile(r"^BAB\s+([IVXLCDM]+)(?:\s+(.+))?$", re.IGNORECASE)
_RE_BAGIAN = re.compile(r"^Bagian\s+(.+)$", re.IGNORECASE)
_RE_PASAL = re.compile(r"^Pasal\s+(\d+)\s*$", re.IGNORECASE)
# Penanda awal bagian penjelasan.
_RE_PENJELASAN = re.compile(r"^PENJELASAN\b", re.IGNORECASE)
_RE_PASAL_DEMI_PASAL = re.compile(r"PASAL DEMI PASAL", re.IGNORECASE)


def clean_text(raw: str) -> str:
    """Pembersihan teks ringan yang menjaga struktur baris.

    - Normalisasi CRLF -> LF.
    - Rapikan spasi berlebih di dalam baris.
    - Hilangkan baris yang sepenuhnya kosong beruntun (sisakan satu).
    - Rapikan artefak pemisah kata akibat OCR/PDF seperti "Undang- Undang".
    """
    text = raw.replace("\r\n", "\n").replace("\r", "\n")

    # Gabungkan pemenggalan kata umum pada dokumen hukum Indonesia.
    text = re.sub(r"Undang-\s+Undang", "Undang-Undang", text)
    text = re.sub(r"Perundang-\s+undangan", "Perundang-undangan", text)

    lines = []
    blank = False
    for line in text.split("\n"):
        stripped = re.sub(r"[ \t]+", " ", line).strip()
        # Referensi di folder UU berbentuk Markdown. Heading markers bukan
        # bagian dari isi hukum dan harus dihapus sebelum structural parsing.
        stripped = re.sub(r"^#{1,6}\s+", "", stripped)
        if not stripped:
            if blank:
                continue  # lewati baris kosong beruntun
            blank = True
            lines.append("")
        else:
            blank = False
            lines.append(stripped)
    return "\n".join(lines).strip()


def _roman_to_int(roman: str) -> int:
    values = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    prev = 0
    for ch in reversed(roman.upper()):
        cur = values.get(ch, 0)
        if cur < prev:
            total -= cur
        else:
            total += cur
            prev = cur
    return total


def _split_long_text(text: str, max_chars: int, overlap: int) -> list[str]:
    """Pecah teks panjang menjadi beberapa bagian dengan overlap.

    Pemecahan dilakukan pada batas paragraf/kalimat bila memungkinkan agar
    tidak memotong di tengah kata.
    """
    if len(text) <= max_chars:
        return [text]

    parts: list[str] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + max_chars, n)
        if end < n:
            # Cari titik potong yang rapi: newline atau akhir kalimat.
            window = text[start:end]
            cut = max(
                window.rfind("\n"),
                window.rfind(". "),
                window.rfind("; "),
            )
            if cut > max_chars * 0.4:  # hanya pakai jika tidak terlalu awal
                end = start + cut + 1
        parts.append(text[start:end].strip())
        if end >= n:
            break
        start = max(0, end - overlap)
    return [p for p in parts if p]


def _source_identity(path: Path, document_title: str) -> tuple[str, str]:
    """Return stable source metadata for each curated legal document."""
    name = path.name.lower()
    if "27-2022" in name or "pdp" in name:
        return "UU_27_2022", "UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi"
    if "perdata" in name or "kitab" in name:
        return "KUH_PERDATA", "Kitab Undang-Undang Hukum Perdata"
    if "11_tahun_2008" in name or "ite" in name:
        return "UU_11_2008", "UU Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik"
    safe = re.sub(r"[^A-Z0-9]+", "_", path.stem.upper()).strip("_")
    return safe or "LEGAL_REFERENCE", document_title


def parse_uu_ite(
    path: str | Path,
    max_chunk_chars: int,
    overlap_chars: int,
) -> list[Chunk]:
    """Parse berkas teks UU ITE menjadi daftar Chunk per-Pasal."""
    path = Path(path)
    raw = path.read_text(encoding="utf-8")
    text = clean_text(raw)
    lines = text.split("\n")

    # Judul dokumen diambil dari baris pertama non-kosong.
    document_title = next((ln for ln in lines if ln.strip()), path.stem)

    # Identitas kanonik dokumen untuk metadata & deduplikasi ID.
    source_id, document_number = _source_identity(path, document_title)
    jurisdiction = "Indonesia"

    chunks: list[Chunk] = []

    current_bab: str | None = None
    current_bab_num: int | None = None
    current_bab_title: str | None = None
    current_bagian: str | None = None
    # section: "batang_tubuh" (isi pasal) atau "penjelasan" (elucidation)
    section = "batang_tubuh"

    # Buffer untuk pasal yang sedang dikumpulkan.
    pending_pasal: str | None = None
    pending_bab = None
    pending_bab_title = None
    pending_bagian = None
    pending_section = section
    buffer: list[str] = []

    def flush():
        """Keluarkan pasal yang terkumpul sebagai satu/lebih chunk."""
        nonlocal buffer
        if pending_pasal is None:
            buffer = []
            return
        body = "\n".join(buffer).strip()
        if not body:
            buffer = []
            return

        ref_type = "penjelasan" if pending_section == "penjelasan" else "pasal"
        heading = f"Pasal {pending_pasal}"
        full_text = f"{heading}\n{body}".strip()

        sub_texts = _split_long_text(full_text, max_chunk_chars, overlap_chars)
        total = len(sub_texts)
        for idx, sub in enumerate(sub_texts):
            meta = {
                "source_id": source_id,
                "source_type": "legal_reference",
                "reference_type": ref_type,
                "document_title": document_title,
                "document_number": document_number,
                "jurisdiction": jurisdiction,
                "pasal": f"Pasal {pending_pasal}",
                "pasal_number": int(pending_pasal),
                "bab": pending_bab or "",
                "bab_title": pending_bab_title or "",
                "bagian": pending_bagian or "",
                "section": pending_section,
                "chunk_index": idx,
                "chunk_total": total,
                "source_file": path.name,
            }
            chunks.append(Chunk(text=sub, metadata=meta))
        buffer = []

    i = 0
    while i < len(lines):
        line = lines[i]

        # Deteksi awal bagian PENJELASAN.
        if _RE_PENJELASAN.match(line) or _RE_PASAL_DEMI_PASAL.search(line):
            flush()
            pending_pasal = None
            section = "penjelasan"
            # Reset konteks struktur karena penjelasan punya penomoran sendiri.
            current_bab = None
            current_bab_num = None
            current_bab_title = None
            current_bagian = None
            i += 1
            continue

        m_bab = _RE_BAB.match(line)
        if m_bab:
            flush()
            pending_pasal = None
            current_bab_num = _roman_to_int(m_bab.group(1))
            current_bab = f"BAB {m_bab.group(1).upper()}"
            inline_title = (m_bab.group(2) or "").strip()
            # Judul BAB biasanya di baris berikutnya (bisa multi-baris kapital).
            title_parts = []
            if inline_title:
                title_parts.append(inline_title)
            j = i + 1
            while not inline_title and j < len(lines) and lines[j].strip() and not _RE_PASAL.match(
                lines[j]
            ) and not _RE_BAGIAN.match(lines[j]):
                title_parts.append(lines[j].strip())
                j += 1
                if len(title_parts) >= 2:
                    break
            current_bab_title = " ".join(title_parts).strip()
            i = j
            continue

        m_bagian = _RE_BAGIAN.match(line)
        if m_bagian:
            flush()
            pending_pasal = None
            current_bagian = f"Bagian {m_bagian.group(1).strip()}"
            i += 1
            continue

        m_pasal = _RE_PASAL.match(line)
        if m_pasal:
            flush()
            pending_pasal = m_pasal.group(1)
            pending_bab = current_bab
            pending_bab_title = current_bab_title
            pending_bagian = current_bagian
            pending_section = section
            buffer = []
            i += 1
            continue

        # Baris biasa: masuk ke buffer pasal berjalan (jika ada).
        if pending_pasal is not None:
            buffer.append(line)
        i += 1

    flush()
    return chunks


def parse_document(
    path: str | Path,
    max_chunk_chars: int,
    overlap_chars: int,
) -> list[Chunk]:
    """Dispatcher parser hukum generik untuk sumber di folder ``UU``.

    Format Markdown maupun teks polos yang memiliki penanda ``Pasal N``
    ditangani oleh parser yang sama; identitas sumber ditentukan dari nama
    file agar dokumen tidak tercampur dalam koleksi RAG.
    """
    return parse_uu_ite(path, max_chunk_chars, overlap_chars)


if __name__ == "__main__":
    import sys
    import config

    target = sys.argv[1] if len(sys.argv) > 1 else str(
        config.PROJECT_ROOT / "UU_Nomor_11_Tahun_2008.txt"
    )
    result = parse_document(target, config.MAX_CHUNK_CHARS, config.CHUNK_OVERLAP_CHARS)
    print(f"Total chunk: {len(result)}")
    for c in result[:3]:
        print("-" * 60)
        print("META:", {k: c.metadata[k] for k in ("pasal", "bab", "section", "reference_type", "chunk_index")})
        print(c.text[:200], "...")
