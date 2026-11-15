"""FR-02: baca PDF/foto per halaman, pilih jalur teks digital atau OCR (Tesseract).

Semua halaman, apa pun jalurnya, dikembalikan dalam bentuk ``Page`` yang sama
supaya pemotong klausul dan highlight tidak perlu tahu asal teksnya. Koordinat
selalu dalam satuan titik PDF (1/72 inci), sama dengan sistem koordinat PyMuPDF.

Router (FR-02 acceptance):
- OCR tidak dijalankan tanpa kebutuhan: halaman dengan cukup teks digital
  langsung dibaca sebagai teks.
- Nomor halaman selalu menempel pada teks hasil ekstraksi.
- Halaman yang gagal dibaca ditandai ``method="failed"`` dan ``needs_review``.

Modul ini diadaptasi dari pipeline ekstraksi tim (repo referensi) agar
koordinat kata identik dengan yang dipakai saat highlight.
"""
from __future__ import annotations

import argparse
import io
import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path

import pymupdf

from confidai.config import TESSERACT_CMD

MIN_CHARS = 40          # di bawah ini halaman dianggap tidak punya teks digital
SCAN_COVER = 0.5        # gambar menutupi >= 50% halaman -> kandidat hasil scan
OCR_DPI = 300
MAX_PIXELS = 4000       # sisi terpanjang gambar untuk OCR; foto HP 12 MP jangan dibesarkan lagi
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}
LOW_CONF = 60           # rata-rata keyakinan Tesseract (0-100) di bawah ini -> perlu dicek manusia
INVISIBLE = 3           # jenis teks di get_texttrace(): 3 = teks tak terlihat (lapisan OCR scan)
MAX_TILT = 0.1          # baris dengan kemiringan > ~6 derajat dianggap watermark ("CONFIDENTIAL", "DRAFT")


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
    """Hitung teks dan total area gambar yang menutupi halaman.

    Scan dapat tersimpan sebagai banyak potongan gambar. Mengambil gambar
    terbesar saja melewatkan dokumen semacam itu, jadi hitung area gabungan
    setelah setiap kotak gambar dipotong ke batas halaman.
    """
    visible = hidden = 0
    for span in page.get_texttrace():
        if span["type"] == INVISIBLE:
            hidden += len(span["chars"])
        else:
            visible += len(span["chars"])
    bounds = page.rect
    page_area = abs(bounds) or 1
    rects = []
    for image in page.get_image_info():
        rect = pymupdf.Rect(image["bbox"]) & bounds
        if not rect.is_empty and rect.width > 0 and rect.height > 0:
            rects.append((rect.x0, rect.y0, rect.x1, rect.y1))

    # Sweep over x slabs and merge y intervals. This computes union area
    # without double-counting overlapping image placements.
    cover_area = 0.0
    xs = sorted({x for rect in rects for x in (rect[0], rect[2])})
    for left, right in zip(xs, xs[1:]):
        if right <= left:
            continue
        intervals = sorted((y0, y1) for x0, y0, x1, y1 in rects
                           if x0 < right and x1 > left)
        merged_y = 0.0
        if intervals:
            start, end = intervals[0]
            for y0, y1 in intervals[1:]:
                if y0 <= end:
                    end = max(end, y1)
                else:
                    merged_y += end - start
                    start, end = y0, y1
            merged_y += end - start
        cover_area += (right - left) * merged_y
    cover = min(1.0, cover_area / page_area)
    return visible, hidden, cover


def route(page: pymupdf.Page) -> tuple[str, str]:
    visible, hidden, cover = inspect(page)
    # Prefer OCR for image-backed pages even when a scan contains a small
    # selectable header/footer or an incomplete hidden OCR layer.
    if cover >= SCAN_COVER and hidden:
        return "ocr", f"scan dengan lapisan teks OCR tersembunyi ({hidden} karakter), dibaca ulang"
    if cover >= SCAN_COVER:
        return "ocr", f"halaman berupa gambar ({cover:.0%} tertutup gambar)"
    if visible >= MIN_CHARS:
        return "pdf_text", f"{visible} karakter teks digital"
    if visible or hidden or cover:
        return "ocr", "teks digital terlalu sedikit"
    return "empty", "halaman kosong"


def read_digital(page: pymupdf.Page, num: int, reason: str) -> Page:
    """Ambil teks digital, buang baris miring (watermark) supaya tidak tercampur ke kalimat."""
    tp = page.get_textpage()
    keep, blocks = set(), []
    for b in tp.extractDICT()["blocks"]:
        if b["type"] != 0:
            continue
        lines = []
        for li, line in enumerate(b["lines"]):
            if abs(line["dir"][1]) > MAX_TILT:
                continue
            keep.add((b["number"], li))
            lines.append("".join(s["text"] for s in line["spans"]))
        if lines:
            blocks.append((round(b["bbox"][1]), b["bbox"][0], b["number"], "\n".join(lines)))
    blocks.sort()  # atas ke bawah, lalu kiri ke kanan
    rank = {b[2]: i for i, b in enumerate(blocks)}
    words = sorted((w for w in tp.extractWORDS() if (w[5], w[6]) in keep),
                   key=lambda w: (rank[w[5]], w[6], w[7]))
    return Page(num, "pdf_text", reason, "\n".join(b[3] for b in blocks),
                [Word(w[4], tuple(round(v, 2) for v in w[:4])) for w in words])


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
            raise RuntimeError(
                "Tesseract tidak ditemukan. Pasang Tesseract, lalu (opsional) isi "
                "TESSERACT_CMD di .env dengan lokasi binernya."
            ) from None
        _langs = "+".join(l for l in ("ind", "eng") if l in have) or "eng"
        if "ind" not in have:
            print("PERINGATAN: data bahasa Indonesia (ind) untuk Tesseract belum ada; "
                  "hasil OCR akan lebih buruk.", file=sys.stderr)
    return _langs


def read_ocr(page: pymupdf.Page, num: int, reason: str) -> Page:
    import pytesseract
    from PIL import Image

    langs = ocr_langs()
    dpi = min(OCR_DPI, int(72 * MAX_PIXELS / max(page.rect.width, page.rect.height)))
    pix = page.get_pixmap(dpi=dpi)
    img = Image.frombytes("RGB" if pix.n < 4 else "RGBA", (pix.width, pix.height), pix.samples)
    d = pytesseract.image_to_data(img, lang=langs, output_type=pytesseract.Output.DICT)

    # piksel gambar -> titik PDF, lalu geser ke posisi halaman (rect bisa tidak mulai di 0,0)
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


def open_document(path: str) -> pymupdf.Document:
    """PDF dibuka apa adanya; foto (JPG/PNG/...) dijadikan PDF satu halaman.

    Rotasi EXIF dari HP diterapkan dulu, supaya foto yang diambil tegak tidak
    terbaca miring.
    """
    if Path(path).suffix.lower() not in IMAGE_EXT:
        return pymupdf.open(path)
    from PIL import Image, ImageOps

    with Image.open(path) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        buf = io.BytesIO()
        im.save(buf, "PNG")
        width, height = im.width, im.height
    doc = pymupdf.open()
    page = doc.new_page(width=width, height=height)
    page.insert_image(page.rect, stream=buf.getvalue())
    return doc


def extract(path: str, force_ocr: bool = False) -> list[Page]:
    pages: list[Page] = []
    with open_document(path) as doc:
        for num, page in enumerate(doc, start=1):
            method, reason = ("ocr", "dipaksa force_ocr") if force_ocr else route(page)
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


def extraction_quality(pages: list[Page]) -> dict:
    """Ringkasan kualitas ekstraksi untuk menilai apakah analisis layak dilanjutkan.

    FR-02: sistem tidak boleh melanjutkan analisis seolah dokumen lengkap bila
    ekstraksi gagal secara signifikan.
    """
    total = len(pages)
    failed = [p.number for p in pages if p.method == "failed"]
    empty = [p.number for p in pages if p.method == "empty"]
    ocr = [p.number for p in pages if p.method == "ocr"]
    low_conf = [p.number for p in pages if p.needs_review]
    usable = total - len(failed) - len(empty)
    return {
        "total_pages": total,
        "usable_pages": usable,
        "failed_pages": failed,
        "empty_pages": empty,
        "ocr_pages": ocr,
        "needs_review_pages": low_conf,
        "significant_failure": total > 0 and usable / total < 0.5,
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Ekstrak teks PDF/foto per halaman (teks digital / OCR).")
    ap.add_argument("pdf", help="file PDF atau foto (JPG/PNG)")
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
