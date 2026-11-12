"""BE-03 + BE-04: baca PDF per halaman, pilih jalur teks digital atau OCR (Tesseract).

Semua halaman, apa pun jalurnya, dikembalikan dalam bentuk `Page` yang sama supaya
pemotong klausul (BE-05) dan highlight (BE-11) tidak perlu tahu asal teksnya.
Koordinat selalu dalam satuan titik PDF (1/72 inci), sama dengan sistem koordinat PyMuPDF.
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict, dataclass, field

import pymupdf

from app.config import TESSERACT_CMD

MIN_CHARS = 40          # di bawah ini halaman dianggap tidak punya teks digital
SCAN_COVER = 0.5        # gambar menutupi >= 50% halaman -> kandidat hasil scan
OCR_DPI = 300
LOW_CONF = 60           # rata-rata keyakinan Tesseract (0-100) di bawah ini -> perlu dicek manusia
INVISIBLE = 3           # jenis teks di get_texttrace(): 3 = teks tak terlihat (lapisan OCR scan)


@dataclass
class Word:
    text: str
    bbox: tuple[float, float, float, float]  # x0, y0, x1, y1
    conf: float | None = None                # keyakinan OCR 0-100; None untuk teks digital


@dataclass
class Page:
    number: int                  # mulai dari 1
    method: str                  # pdf_text | ocr | empty | failed
    reason: str                  # alasan router memilih jalur ini
    text: str = ""
    words: list[Word] = field(default_factory=list)
    confidence: float | None = None
    needs_review: bool = False
    error: str | None = None


def inspect(page: pymupdf.Page) -> tuple[int, int, float]:
    """Hitung karakter terlihat, karakter tak terlihat, dan cakupan gambar terbesar."""
    visible = hidden = 0
    for span in page.get_texttrace():
        if span["type"] == INVISIBLE:
            hidden += len(span["chars"])
        else:
            visible += len(span["chars"])
    area = abs(page.rect) or 1
    cover = max((abs(pymupdf.Rect(i["bbox"]) & page.rect) / area for i in page.get_image_info()),
                default=0.0)
    return visible, hidden, cover


def route(page: pymupdf.Page) -> tuple[str, str]:
    visible, hidden, cover = inspect(page)
    if visible >= MIN_CHARS:
        return "pdf_text", f"{visible} karakter teks digital"
    if cover >= SCAN_COVER and hidden:
        return "ocr", f"scan dengan lapisan teks OCR tersembunyi ({hidden} karakter), dibaca ulang"
    if cover >= SCAN_COVER:
        return "ocr", f"halaman berupa gambar ({cover:.0%} tertutup gambar)"
    if visible or hidden or cover:
        return "ocr", "teks digital terlalu sedikit"
    return "empty", "halaman kosong"


def read_digital(page: pymupdf.Page, num: int, reason: str) -> Page:
    words = [Word(w[4], tuple(round(v, 2) for v in w[:4])) for w in page.get_text("words", sort=True)]
    return Page(num, "pdf_text", reason, page.get_text("text", sort=True), words)


_langs: str | None = None


def ocr_langs() -> str:
    global _langs
    if _langs is None:
        import pytesseract
        if TESSERACT_CMD:
            pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
        try:
            have = set(pytesseract.get_languages())
        except pytesseract.TesseractNotFoundError:
            raise RuntimeError("Tesseract tidak ditemukan. Pasang Tesseract, lalu isi TESSERACT_CMD "
                               "di .env dengan lokasi tesseract.exe") from None
        _langs = "+".join(l for l in ("ind", "eng") if l in have) or "eng"
        if "ind" not in have:
            print("PERINGATAN: data bahasa Indonesia (ind) untuk Tesseract belum ada; "
                  "hasil OCR akan lebih buruk.", file=sys.stderr)
    return _langs


def read_ocr(page: pymupdf.Page, num: int, reason: str) -> Page:
    import pytesseract
    from PIL import Image

    langs = ocr_langs()
    pix = page.get_pixmap(dpi=OCR_DPI)
    img = Image.frombytes("RGB" if pix.n < 4 else "RGBA", (pix.width, pix.height), pix.samples)
    d = pytesseract.image_to_data(img, lang=langs, output_type=pytesseract.Output.DICT)

    # piksel gambar 300 dpi -> titik PDF, lalu geser ke posisi halaman (rect bisa tidak mulai di 0,0)
    sx, sy = page.rect.width / pix.width, page.rect.height / pix.height
    ox, oy = page.rect.x0, page.rect.y0
    words, lines, last = [], [], None
    for i, raw in enumerate(d["text"]):
        text, conf = raw.strip(), float(d["conf"][i])
        if not text or conf < 0:
            continue
        x, y, w, h = d["left"][i], d["top"][i], d["width"][i], d["height"][i]
        words.append(Word(text, (round(ox + x * sx, 2), round(oy + y * sy, 2),
                                 round(ox + (x + w) * sx, 2), round(oy + (y + h) * sy, 2)), conf))
        key = (d["block_num"][i], d["par_num"][i], d["line_num"][i])
        if key != last:
            lines.append([])
            last = key
        lines[-1].append(text)

    conf = round(sum(w.conf for w in words) / len(words), 1) if words else None
    return Page(num, "ocr", f"{reason}; tesseract {langs}", "\n".join(" ".join(l) for l in lines),
                words, conf, needs_review=conf is None or conf < LOW_CONF)


def extract(path: str, force_ocr: bool = False) -> list[Page]:
    pages = []
    with pymupdf.open(path) as doc:
        for num, page in enumerate(doc, start=1):
            method, reason = ("ocr", "dipaksa --force-ocr") if force_ocr else route(page)
            try:
                if method == "pdf_text":
                    pages.append(read_digital(page, num, reason))
                elif method == "ocr":
                    pages.append(read_ocr(page, num, reason))
                else:
                    pages.append(Page(num, "empty", reason, needs_review=True))
            except Exception as e:  # satu halaman gagal tidak boleh menghentikan halaman lain
                pages.append(Page(num, "failed", reason, needs_review=True,
                                  error=f"{type(e).__name__}: {e}"))
    return pages


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Ekstrak teks PDF per halaman (teks digital / OCR).")
    ap.add_argument("pdf")
    ap.add_argument("--json", help="simpan hasil lengkap (teks + kata + koordinat) ke file ini")
    ap.add_argument("--show", help="tampilkan teks halaman tertentu, mis. 1,3")
    ap.add_argument("--force-ocr", action="store_true", help="OCR semua halaman (untuk uji kualitas OCR)")
    a = ap.parse_args()

    result = extract(a.pdf, a.force_ocr)
    for p in result:
        conf = f", keyakinan {p.confidence}" if p.confidence is not None else ""
        flag = "  <- PERLU DICEK" if p.needs_review else ""
        print(f"hal {p.number}: {p.method} ({p.reason}), {len(p.words)} kata{conf}{flag}")
        if p.error:
            print(f"    error: {p.error}")
    failed = [p.number for p in result if p.method == "failed"]
    if failed:
        print(f"\n{len(failed)} halaman gagal dibaca: {failed}")
    for n in (int(x) for x in a.show.split(",")) if a.show else ():
        print(f"\n===== HALAMAN {n} =====\n{result[n - 1].text}")
    if a.json:
        with open(a.json, "w", encoding="utf-8") as f:
            json.dump([asdict(p) for p in result], f, ensure_ascii=False, indent=1)
        print(f"\nHasil disimpan ke {a.json}")
