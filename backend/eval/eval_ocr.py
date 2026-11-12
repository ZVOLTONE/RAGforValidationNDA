"""Ukur akurasi OCR yang sebenarnya (bukan keyakinan Tesseract).

PDF digital dipakai sebagai kunci jawaban: tiap halaman difoto ulang jadi "scan" bersih dan
"scan" jelek (miring, buram, JPEG), dibaca lewat extract() (router + Tesseract), lalu teksnya
dicocokkan dengan teks asli. Tanpa argumen, contoh NDA dibuat di data/samples/.
"""
from __future__ import annotations

import argparse
import difflib
import io
import re
import time
from pathlib import Path

import pymupdf
from PIL import Image, ImageFilter

from app.document.extract import extract

HERE = Path(__file__).parent
SAMPLES = HERE.parents[1] / "data" / "samples"

NDA_PAGES = [
    """PERJANJIAN KERAHASIAAN
Nomor: 017/NDA/PCS-VDN/XI/2026

Perjanjian ini dibuat pada hari Senin, tanggal 2 November 2026, oleh dan antara:
1. PT Contoh Sentosa, berkedudukan di Jakarta Selatan, selanjutnya disebut "Pihak Pertama"; dan
2. PT Vendor Digital Nusantara, berkedudukan di Bandung, selanjutnya disebut "Pihak Kedua".

Pasal 1
Definisi
(1) "Informasi Rahasia" (Confidential Information) adalah setiap data, dokumen, kode sumber, dan data pribadi yang diungkapkan Pihak Pertama kepada Pihak Kedua.
(2) "Insiden Keamanan" adalah setiap akses tidak sah, kebocoran, atau perubahan Informasi Rahasia.

Pasal 2
Kewajiban Kerahasiaan
(1) Pihak Kedua wajib:
a. menjaga kerahasiaan Informasi Rahasia dengan standar pengamanan paling rendah setara ISO/IEC 27001;
b. membatasi akses hanya kepada personel yang memerlukan untuk pelaksanaan pekerjaan;
c. tidak menyalin, mengubah, atau memindahkan Informasi Rahasia ke luar wilayah Indonesia.
(2) Kewajiban sebagaimana dimaksud pada ayat (1) berlaku selama 5 (lima) tahun sejak tanggal Perjanjian.""",
    """Pasal 3
Subkontraktor
Pihak Kedua dilarang menyerahkan sebagian atau seluruh pekerjaan kepada subkontraktor tanpa persetujuan tertulis dari Pihak Pertama paling lambat 14 (empat belas) hari kerja sebelumnya.

Pasal 4
Pelaporan Insiden
(1) Pihak Kedua wajib melaporkan setiap Insiden Keamanan kepada Pihak Pertama paling lambat 3 x 24 jam melalui surel security@contohsentosa.co.id.
(2) Laporan paling sedikit memuat:
a. waktu dan lokasi kejadian;
b. jenis data yang terdampak; dan
c. langkah penanganan yang telah dilakukan.

Pasal 5
Penghapusan Data
Dalam waktu 30 (tiga puluh) hari setelah Perjanjian berakhir, Pihak Kedua wajib menghapus seluruh Informasi Rahasia dan menyerahkan berita acara penghapusan.

Pasal 6
Sanksi
Pelanggaran atas Perjanjian ini dikenakan denda sebesar Rp 500.000.000,00 (lima ratus juta rupiah) untuk setiap kejadian, tanpa mengurangi hak Pihak Pertama untuk menuntut ganti rugi sebesar 100% dari kerugian nyata.""",
]

VARIANTS = {
    "bersih": "200 dpi, lurus",
    "jelek": "150 dpi, miring 1,5 derajat, buram, JPEG kualitas rendah",
}


def make_sample(path: Path) -> None:
    doc = pymupdf.open()
    for text in NDA_PAGES:
        page = doc.new_page()
        left = page.insert_textbox(pymupdf.Rect(72, 72, 523, 770), text, fontname="tiro", fontsize=11)
        assert left >= 0, "teks contoh tidak muat satu halaman"
    path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(path)


def make_scan(src: Path, dst: Path, variant: str) -> None:
    out = pymupdf.open()
    with pymupdf.open(src) as doc:
        for page in doc:
            if variant == "bersih":
                pix = page.get_pixmap(dpi=200)
                data = pix.tobytes("png")
            else:
                pix = page.get_pixmap(dpi=150, colorspace=pymupdf.csGRAY)
                img = Image.frombytes("L", (pix.width, pix.height), pix.samples)
                img = img.rotate(1.5, resample=Image.BICUBIC, fillcolor=255)
                img = img.filter(ImageFilter.GaussianBlur(0.8))
                buf = io.BytesIO()
                img.save(buf, "JPEG", quality=40)
                data = buf.getvalue()
            new = out.new_page(width=page.rect.width, height=page.rect.height)
            new.insert_image(new.rect, stream=data)
    out.save(dst)


def norm(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def distance(ref: list | str, hyp: list | str) -> int:
    """Jumlah huruf/kata yang harus diganti, dihapus, atau ditambah (Levenshtein)."""
    prev = list(range(len(hyp) + 1))
    for i, r in enumerate(ref, 1):
        cur = [i]
        for j, h in enumerate(hyp, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (r != h)))
        prev = cur
    return prev[-1]


def mistakes(ref: list[str], hyp: list[str]) -> list[str]:
    out = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, ref, hyp, autojunk=False).get_opcodes():
        if op != "equal":
            out.append(f'"{" ".join(ref[i1:i2])}" -> "{" ".join(hyp[j1:j2])}"')
    return out


def score(name: str, variant: str, desc: str, truth: list[str], files: list[str],
          rows: list, errors: list) -> None:
    """Baca `files` berurutan (halaman ke-1 dicocokkan dengan kunci halaman ke-1, dst.)."""
    t0 = time.perf_counter()
    pages = [p for f in files for p in extract(f)]
    secs = (time.perf_counter() - t0) / max(len(pages), 1)
    if len(pages) != len(truth):
        print(f"PERINGATAN: {len(pages)} halaman/foto dibaca, kunci jawaban punya {len(truth)} halaman; "
              f"yang dicocokkan hanya {min(len(pages), len(truth))} halaman pertama.")

    ch = ch_err = wd = wd_err = 0
    for num, (ref, page) in enumerate(zip(truth, pages), start=1):
        hyp = norm(page.text)
        ch, ch_err = ch + len(ref), ch_err + distance(ref, hyp)
        wd, wd_err = wd + len(ref.split()), wd_err + distance(ref.split(), hyp.split())
        errors += [f"{name} {variant} hal {num}: {m}" for m in mistakes(ref.split(), hyp.split())]
        if page.error:
            errors.append(f"{name} {variant} hal {num}: ERROR {page.error}")
    confs = [p.confidence for p in pages if p.confidence is not None]
    conf = sum(confs) / len(confs) if confs else 0
    rows.append((name, variant, desc, len(pages), 1 - ch_err / max(ch, 1),
                 1 - wd_err / max(wd, 1), conf, secs))
    print(f"{name} [{variant}] akurasi huruf {rows[-1][4]:.1%}, "
          f"akurasi kata {rows[-1][5]:.1%}, keyakinan Tesseract {conf:.1f}, {secs:.1f} detik/halaman")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf", nargs="*", help="PDF digital sebagai kunci jawaban (default: contoh NDA)")
    ap.add_argument("--foto", nargs="+", metavar="FILE",
                    help="foto/scan asli dari kunci jawaban, urut per halaman (JPG/PNG/PDF); "
                         "kalau diisi, versi scan buatan dilewati")
    ap.add_argument("--out", help="default: eval/ocr_results.md, atau eval/ocr_results_foto.md untuk --foto")
    a = ap.parse_args()
    a.out = a.out or str(HERE / ("ocr_results_foto.md" if a.foto else "ocr_results.md"))

    pdfs = [Path(p) for p in a.pdf]
    if not pdfs:
        pdfs = [SAMPLES / "nda_contoh.pdf"]
        if not pdfs[0].exists():
            make_sample(pdfs[0])
    if a.foto and len(pdfs) != 1:
        ap.error("--foto hanya bisa dipakai dengan satu PDF kunci jawaban")

    rows, errors = [], []
    for src in pdfs:
        with pymupdf.open(src) as doc:
            truth = [norm(p.get_text("text", sort=True)) for p in doc]
        if a.foto:
            score(src.stem, "foto", ", ".join(Path(f).name for f in a.foto), truth, a.foto, rows, errors)
            continue
        for variant, desc in VARIANTS.items():
            scan = SAMPLES / f"{src.stem}_scan_{variant}.pdf"
            make_scan(src, scan, variant)
            score(src.stem, variant, desc, truth, [str(scan)], rows, errors)

    lines = ["# Akurasi OCR (Tesseract)", "",
             "Kunci jawaban = teks PDF digital. Versi scan dibuat dari PDF yang sama lalu dibaca lewat "
             "`app.document.extract`. Akurasi = 1 - (jumlah huruf/kata salah, hilang, atau berlebih) / "
             "jumlah huruf/kata asli.", "",
             "| Dokumen | Scan | Kondisi | Hal | Akurasi huruf | Akurasi kata | Keyakinan Tesseract | Detik/hal |",
             "|---|---|---|---|---|---|---|---|"]
    for r in rows:
        lines.append(f"| {r[0]} | {r[1]} | {r[2]} | {r[3]} | {r[4]:.1%} | {r[5]:.1%} | {r[6]:.1f} | {r[7]:.1f} |")
    lines += ["", f"## Contoh kesalahan ({len(errors)})", "", "Format: \"teks asli\" -> \"hasil OCR\"", ""]
    lines += [f"- {e}" for e in errors]
    Path(a.out).write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nRincian kesalahan: {a.out}")


if __name__ == "__main__":
    main()
