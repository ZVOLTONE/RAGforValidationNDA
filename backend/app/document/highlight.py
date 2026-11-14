"""BE-11: beri highlight pada PDF asli di lokasi kutipan setiap temuan.

Alurnya:
1. Halaman dibaca dengan extract() (BE-03/04), atau memakai hasil baca yang sudah ada, supaya
   koordinat kata sama persis dengan teks yang dipotong jadi klausul dan dikutip AI.
2. Kutipan dicari di halaman yang disebut temuan. Pencocokan tahan beda huruf besar-kecil,
   tanda baca, spasi, dan kata yang terpotong tanda hubung di akhir baris.
3. Kalau kutipan ditemukan tepat sekali, kata-katanya digabung per baris lalu diberi highlight.
   Kalau tidak ketemu, terlalu pendek, atau muncul lebih dari sekali, TIDAK ada highlight;
   statusnya dicatat supaya temuan tetap muncul di laporan (FR-09: tidak ada highlight palsu).
4. Hasilnya disimpan ke file baru. File asli tidak pernah ditimpa, dan isi halaman asli tidak
   diubah: yang ditambahkan hanya anotasi highlight dan satu halaman legenda di akhir.

Aturan warna (FR-09 PRD, mengikuti risk_level temuan):
    critical, high  -> merah   : risiko tinggi berdasarkan bukti dan rubrik
    medium          -> oranye  : risiko sedang atau kontrol lemah
    low             -> kuning  : perlu ditinjau
Temuan yang tidak di-highlight: validation_status selain "validated", finding_type
no_issue_identified / inconclusive, atau risk_level tidak dikenal.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import asdict, dataclass, field
from pathlib import Path

import pymupdf

from app.document.extract import Page, Word, extract, open_document

COLORS = {  # RGB 0-1
    "critical": (0.86, 0.15, 0.15),
    "high": (0.95, 0.30, 0.30),
    "medium": (1.00, 0.60, 0.15),
    "low": (1.00, 0.88, 0.20),
}
LEGEND = [
    ("Merah", "high", "Critical / High: risiko tinggi berdasarkan bukti dan rubrik"),
    ("Oranye", "medium", "Medium: risiko sedang atau kontrol lemah"),
    ("Kuning", "low", "Low: perlu ditinjau"),
]
NO_HIGHLIGHT_TYPES = {"no_issue_identified", "inconclusive"}
MIN_CHARS = 15  # kutipan lebih pendek dari ini terlalu mudah cocok di tempat yang salah


@dataclass
class Placement:
    finding_id: str
    status: str            # highlighted | not_located | ambiguous | too_short | skipped | bad_page
    reason: str
    page_number: int | None = None
    risk_level: str | None = None
    rects: list[tuple[float, float, float, float]] = field(default_factory=list)


def norm(token: str) -> str:
    """Huruf kecil, tanpa tanda baca. "Pihak," -> "pihak", "(1)" -> "1", "—" -> ""."""
    token = unicodedata.normalize("NFKC", token).lower()
    return re.sub(r"[\W_]+", "", token)


def find_quote(words: list[Word], quote: str) -> tuple[list[int] | None, str]:
    """Cari kutipan di daftar kata. Kembalikan indeks kata yang tertutup kutipan, atau None + alasan.

    Kata dan kutipan diratakan jadi satu deret huruf tanpa spasi, jadi "kerahasi-" + "aan"
    di dua baris tetap cocok dengan "kerahasiaan".
    """
    target = "".join(norm(t) for t in quote.split())
    if len(target) < MIN_CHARS:
        return None, f"too_short: kutipan hanya {len(target)} huruf setelah dibersihkan"
    stream, owner = [], []
    for i, w in enumerate(words):
        t = norm(w.text)
        stream.append(t)
        owner.extend([i] * len(t))
    text = "".join(stream)
    hits = [m.start() for m in re.finditer(f"(?={re.escape(target)})", text)]
    if not hits:
        return None, "not_located: kutipan tidak ditemukan di halaman ini"
    if len(hits) > 1:
        return None, f"ambiguous: kutipan muncul {len(hits)} kali di halaman ini"
    start = hits[0]
    return sorted(set(owner[start:start + len(target)])), "ok"


def line_rects(words: list[Word], idx: list[int]) -> list[pymupdf.Rect]:
    """Gabungkan kotak kata yang sebaris jadi satu kotak per baris."""
    rects: list[pymupdf.Rect] = []
    for i in idx:
        r = pymupdf.Rect(words[i].bbox)
        last = rects[-1] if rects else None
        mid = (r.y0 + r.y1) / 2
        if last is not None and last.y0 <= mid <= last.y1 and r.x0 >= last.x0:
            rects[-1] = last | r  # Rect |= tidak mengubah objek di dalam list
        else:
            rects.append(r)
    return rects


def color_for(finding: dict) -> str | None:
    level = str(finding.get("risk_level", "")).lower()
    return level if level in COLORS else None


def plan(findings: list[dict], pages: list[Page]) -> list[Placement]:
    """Tentukan untuk setiap temuan: di-highlight di mana, atau kenapa tidak."""
    out = []
    for f in findings:
        fid = str(f.get("finding_id", "?"))
        level = color_for(f)
        if f.get("validation_status") != "validated":
            out.append(Placement(fid, "skipped", f"validation_status = {f.get('validation_status')!r}, "
                                                 "hanya temuan tervalidasi yang di-highlight"))
            continue
        if f.get("finding_type") in NO_HIGHLIGHT_TYPES:
            out.append(Placement(fid, "skipped", f"finding_type = {f['finding_type']}"))
            continue
        if level is None:
            out.append(Placement(fid, "skipped", f"risk_level tidak dikenal: {f.get('risk_level')!r}"))
            continue
        evidence = f.get("evidence") or []
        if not evidence:
            out.append(Placement(fid, "not_located", "temuan tidak punya kutipan bukti", risk_level=level))
            continue
        for ev in evidence:
            num, quote = ev.get("page_number"), ev.get("quote", "")
            if not isinstance(num, int) or not 1 <= num <= len(pages):
                out.append(Placement(fid, "bad_page", f"page_number {num!r} di luar dokumen",
                                     num, level))
                continue
            page = pages[num - 1]
            idx, why = find_quote(page.words, quote)
            if idx is None:
                status, reason = why.split(": ", 1)
                out.append(Placement(fid, status, reason, num, level))
                continue
            rects = line_rects(page.words, idx)
            note = "lokasi dari OCR, perlu dicek" if page.method == "ocr" else "lokasi dari teks digital"
            out.append(Placement(fid, "highlighted", note, num, level,
                                 [tuple(round(v, 2) for v in r) for r in rects]))
    return out


def add_legend(doc: pymupdf.Document, placements: list[Placement]) -> None:
    """Halaman terakhir: arti warna, dan daftar temuan yang tidak bisa diberi highlight."""
    w, h = doc[-1].rect.width, doc[-1].rect.height
    page = doc.new_page(width=w, height=h)
    x, y = 50, 60
    page.insert_text((x, y), "Legenda highlight ConfidAI", fontsize=16, fontname="hebo")
    y += 18
    page.insert_text((x, y), "Halaman ini ditambahkan ConfidAI. Halaman sebelumnya adalah dokumen asli "
                     "yang hanya diberi anotasi.", fontsize=8.5, fontname="helv", color=(0.35, 0.35, 0.4))
    y += 30
    for name, level, desc in LEGEND:
        page.draw_rect(pymupdf.Rect(x, y - 10, x + 30, y + 3), color=None, fill=COLORS[level])
        page.insert_text((x + 40, y), f"{name}: {desc}", fontsize=10, fontname="helv")
        y += 22
    y += 4
    page.insert_text((x, y), "Tanpa highlight: tidak ada temuan yang perlu ditandai berdasarkan analisis saat ini.",
                     fontsize=10, fontname="helv")
    y += 34

    done = [p for p in placements if p.status == "highlighted"]
    missing = [p for p in placements if p.status != "highlighted"]
    page.insert_text((x, y), f"{len(done)} kutipan diberi highlight, {len(missing)} tidak.",
                     fontsize=11, fontname="hebo")
    y += 20
    if missing:
        page.insert_text((x, y), "Temuan tanpa highlight (tetap lihat di laporan):", fontsize=10, fontname="helv")
        y += 16
        for p in missing:
            if y > h - 50:
                page.insert_text((x, y), "... (daftar lengkap ada di file JSON hasil)", fontsize=9, fontname="helv")
                break
            where = f"hal. {p.page_number}, " if p.page_number else ""
            line = f"- {p.finding_id}: {p.status} ({where}{p.reason})"
            page.insert_text((x, y), line[:115] + ("..." if len(line) > 115 else ""), fontsize=9, fontname="helv")
            y += 14


def annotate(src: str, findings: list[dict], out: str, pages: list[Page] | None = None,
             legend: bool = True) -> list[Placement]:
    """Simpan salinan PDF berisi highlight ke `out`. File `src` tidak diubah."""
    if Path(out).resolve() == Path(src).resolve():
        raise ValueError("File hasil harus berbeda dari file asli; PDF asli wajib dipertahankan.")
    pages = pages if pages is not None else extract(src)
    placements = plan(findings, pages)
    by_id = {str(f.get("finding_id", "?")): f for f in findings}
    with open_document(src) as doc:
        n_original = len(doc)
        for p in placements:
            if p.status != "highlighted":
                continue
            page = doc[p.page_number - 1]
            # koordinat teks mengikuti tampilan halaman; anotasi butuh koordinat sebelum rotasi
            quads = [(pymupdf.Rect(r) * page.derotation_matrix).quad for r in p.rects]
            annot = page.add_highlight_annot(quads=quads)
            annot.set_colors(stroke=COLORS[p.risk_level])
            f = by_id[p.finding_id]
            annot.set_info(
                title=f"ConfidAI {p.finding_id}",
                subject=f"{p.risk_level} / {f.get('finding_type', '-')}",
                content="\n".join(s for s in (
                    f.get("reasoning_summary", ""),
                    f"Rekomendasi: {f['recommendation']}" if f.get("recommendation") else "",
                    f"({p.reason})",
                ) if s),
            )
            annot.update()
        if legend:
            add_legend(doc, placements)
        assert len(doc) == n_original + (1 if legend else 0), "jumlah halaman asli berubah"
        doc.save(out, garbage=1, deflate=True)
    return placements


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Highlight kutipan temuan pada salinan PDF asli (BE-11).")
    ap.add_argument("pdf", help="PDF atau foto kontrak asli")
    ap.add_argument("findings", help="file JSON berisi daftar temuan (format Risk Finding di PRD 9.3)")
    ap.add_argument("--out", help="file PDF hasil (default: <nama>_highlight.pdf)")
    ap.add_argument("--pages", help="hasil `ocr --json` yang sudah ada, supaya tidak OCR ulang")
    ap.add_argument("--no-legend", action="store_true", help="jangan tambahkan halaman legenda")
    ap.add_argument("--json", help="simpan status setiap temuan ke file ini")
    a = ap.parse_args()

    findings = json.loads(Path(a.findings).read_text(encoding="utf-8"))
    if isinstance(findings, dict):
        findings = findings.get("findings", [findings])
    pages = None
    if a.pages:
        raw = json.loads(Path(a.pages).read_text(encoding="utf-8"))
        pages = [Page(**{**p, "words": [Word(w["text"], tuple(w["bbox"]), w.get("conf")) for w in p["words"]]})
                 for p in raw]
    out = a.out or str(Path(a.pdf).with_name(Path(a.pdf).stem + "_highlight.pdf"))
    result = annotate(a.pdf, findings, out, pages, legend=not a.no_legend)
    for p in result:
        where = f"hal {p.page_number}" if p.page_number else "-"
        print(f"{p.finding_id:>12}  {p.status:<12} {where:<7} {p.reason}")
    print(f"\n{sum(p.status == 'highlighted' for p in result)}/{len(result)} kutipan di-highlight -> {out}")
    if a.json:
        Path(a.json).write_text(json.dumps([asdict(p) for p in result], ensure_ascii=False, indent=1),
                                encoding="utf-8")
    sys.exit(0)
