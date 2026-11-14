"""Uji BE-11: apakah highlight jatuh di tempat yang benar, dan tidak ada highlight palsu.

Kunci jawaban posisi diambil dari PDF digital nda_contoh.pdf memakai page.search_for() milik
PyMuPDF (cara pencarian yang berbeda dari highlight.py, jadi bukan menilai diri sendiri).
Untuk scan "jelek" yang dimiringkan 1,5 derajat, kotak kunci jawaban ikut diputar.

Ukuran:
- Ketemu      : kutipan positif yang diberi highlight.
- IoU         : luas irisan / luas gabungan antara highlight dan kunci jawaban (1 = pas).
- Tanpa palsu : kasus negatif yang memang TIDAK diberi highlight.

Jalankan dari folder backend:  python -m eval.eval_highlight
"""
from __future__ import annotations

import math
from pathlib import Path

import numpy as np
import pymupdf

from app.document.highlight import annotate
from eval.eval_ocr import SAMPLES, VARIANTS, make_sample, make_scan

HERE = Path(__file__).parent
DOC = SAMPLES / "nda_contoh.pdf"

POSITIVE = [
    ("F-01", "high", 2, "melaporkan setiap Insiden Keamanan kepada Pihak Pertama paling lambat 3 x 24 jam"),
    ("F-02", "medium", 2, "dilarang menyerahkan sebagian atau seluruh pekerjaan kepada subkontraktor"),
    ("F-03", "low", 1, "membatasi akses hanya kepada personel yang memerlukan untuk pelaksanaan pekerjaan"),
    ("F-04", "critical", 2, "wajib menghapus seluruh Informasi Rahasia dan menyerahkan berita acara penghapusan"),
    ("F-05", "medium", 1, "berlaku selama 5 (lima) tahun sejak tanggal Perjanjian"),
]
# (id, keterangan, temuan) -> semuanya harus berakhir TANPA highlight
NEGATIVE = [
    ("N-01", "kutipan tidak ada di dokumen",
     {"risk_level": "high", "evidence": [{"page_number": 1, "quote": "Pihak Kedua boleh menjual data kepada pihak lain"}]}),
    ("N-02", "kutipan benar tapi halaman salah",
     {"risk_level": "high", "evidence": [{"page_number": 1, "quote": POSITIVE[0][3]}]}),
    ("N-03", "kutipan terlalu pendek",
     {"risk_level": "medium", "evidence": [{"page_number": 1, "quote": "Pihak Kedua"}]}),
    ("N-04", "kutipan muncul berkali-kali",
     {"risk_level": "medium", "evidence": [{"page_number": 1, "quote": "Informasi Rahasia"}]}),
    ("N-05", "belum tervalidasi",
     {"risk_level": "high", "validation_status": "pending", "evidence": [{"page_number": 2, "quote": POSITIVE[1][3]}]}),
    ("N-06", "finding_type inconclusive",
     {"risk_level": "medium", "finding_type": "inconclusive", "evidence": [{"page_number": 2, "quote": POSITIVE[1][3]}]}),
    ("N-07", "halaman di luar dokumen",
     {"risk_level": "low", "evidence": [{"page_number": 9, "quote": POSITIVE[2][3]}]}),
]


def findings() -> list[dict]:
    out = [{"finding_id": fid, "risk_level": lvl, "finding_type": "contractual_gap", "validation_status": "validated",
            "reasoning_summary": "Contoh temuan untuk uji highlight.",
            "evidence": [{"page_number": pg, "quote": q}]} for fid, lvl, pg, q in POSITIVE]
    for fid, _, extra in NEGATIVE:
        out.append({"finding_id": fid, "finding_type": "contractual_gap", "validation_status": "validated",
                    "reasoning_summary": "Kasus negatif.", **extra})
    return out


def rotate_rect(r: pymupdf.Rect, page: pymupdf.Rect, deg: float) -> pymupdf.Rect:
    """Putar kotak seperti PIL Image.rotate(deg) (berlawanan jarum jam, poros di tengah halaman)."""
    t = math.radians(deg)
    cx, cy = page.width / 2, page.height / 2
    pts = []
    for x, y in ((r.x0, r.y0), (r.x1, r.y0), (r.x0, r.y1), (r.x1, r.y1)):
        dx, dy = x - cx, y - cy
        pts.append((cx + dx * math.cos(t) + dy * math.sin(t), cy - dx * math.sin(t) + dy * math.cos(t)))
    xs, ys = zip(*pts)
    return pymupdf.Rect(min(xs), min(ys), max(xs), max(ys))


def mask(rects, size) -> np.ndarray:
    m = np.zeros((int(size.height) + 1, int(size.width) + 1), bool)
    for r in rects:
        r = pymupdf.Rect(r)
        m[int(r.y0):int(math.ceil(r.y1)), int(r.x0):int(math.ceil(r.x1))] = True
    return m


def main() -> None:
    if not DOC.exists():
        make_sample(DOC)
    files = {"digital": DOC}
    for v in VARIANTS:
        f = SAMPLES / f"{DOC.stem}_scan_{v}.pdf"
        if not f.exists():
            make_scan(DOC, f, v)
        files[f"scan {v}"] = f

    truth = {}
    with pymupdf.open(DOC) as d:
        size = d[0].rect
        for fid, _, pg, q in POSITIVE:
            truth[fid] = d[pg - 1].search_for(q)
            assert truth[fid], f"kunci jawaban {fid} tidak ditemukan oleh search_for"

    rows, details = [], []
    for name, path in files.items():
        out = path.with_name(path.stem + "_highlight.pdf")
        result = {p.finding_id: p for p in annotate(str(path), findings(), str(out))}
        ious, found = [], 0
        for fid, *_ in POSITIVE:
            p = result[fid]
            if p.status != "highlighted":
                details.append(f"| {name} | {fid} | tidak di-highlight: {p.status} ({p.reason}) |")
                continue
            found += 1
            ref = truth[fid]
            if name == "scan jelek":
                ref = [rotate_rect(r, size, 1.5) for r in ref]
            a, b = mask(p.rects, size), mask(ref, size)
            iou = (a & b).sum() / max((a | b).sum(), 1)
            ious.append(iou)
            details.append(f"| {name} | {fid} | IoU {iou:.2f} |")
        clean = sum(result[fid].status != "highlighted" for fid, *_ in NEGATIVE)
        for fid, desc, _ in NEGATIVE:
            p = result[fid]
            ok = "benar" if p.status != "highlighted" else "SALAH, ada highlight palsu"
            details.append(f"| {name} | {fid} ({desc}) | {p.status}: {ok} |")
        iou = f"{np.mean(ious):.2f}" if ious else "-"
        rows.append(f"| {name} | {found}/{len(POSITIVE)} | {iou} | {clean}/{len(NEGATIVE)} | {out.name} |")

    report = "\n".join([
        "# Hasil uji highlight PDF (BE-11)",
        "",
        "Dibuat oleh `python -m eval.eval_highlight`. Dokumen: `data/samples/nda_contoh.pdf` dan versi scan-nya.",
        "Kunci jawaban posisi dari `page.search_for()` PyMuPDF pada PDF digital (diputar 1,5 derajat untuk scan jelek).",
        "Kutipan positif diambil dari teks asli, jadi pada scan satu salah baca OCR di dalam kutipan sudah cukup",
        "membuat kutipan tidak ditemukan. Itu disengaja: lebih baik tidak ada highlight daripada highlight di tempat salah.",
        "IoU scan lebih rendah dari digital karena kotak kata Tesseract memeluk huruf, sedangkan kunci jawaban memakai",
        "tinggi baris penuh. Kata yang di-highlight tetap sama; cek visual ada di file hasil.",
        "",
        "| Dokumen | Ketemu | IoU rata-rata | Tanpa highlight palsu | File hasil |",
        "|---|---|---|---|---|",
        *rows,
        "",
        "## Rincian",
        "",
        "| Dokumen | Temuan | Hasil |",
        "|---|---|---|",
        *details,
        "",
    ])
    (HERE / "highlight_results.md").write_text(report, encoding="utf-8")
    print("\n".join(rows))
    print(f"\nLaporan: {HERE / 'highlight_results.md'}")


if __name__ == "__main__":
    main()
