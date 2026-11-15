"""FR-03: pemotong klausul dokumen (BAB, Bagian, Paragraf, Pasal, ayat, huruf, angka).

Input adalah keluaran pipeline ekstraksi per halaman (``extract.extract`` ->
list[Page]). Kontrak NDA tidak selalu memakai penomoran "Pasal"; parser ini
juga mengenali penomoran "1.", "a.", "(1)", judul "Section"/"Article", dan
menyimpan paragraf biasa sebagai klausul ``body`` yang tetap bisa dianalisis.

Prinsip (FR-03 acceptance):
- Setiap baris masuk ke tepat satu klausul dan urutan dokumen dijaga.
- Baris bungkus disambung untuk keterbacaan; isi tidak diparafrasekan.
- Penomoran tidak pernah dikarang: nomor hanya diambil dari baris yang ada.
  Batas yang meragukan tetap disimpan sebagai teks dengan ``needs_review=True``.
- ``bbox`` hanya dihitung dari kata yang punya koordinat; kalau tidak lengkap,
  nilainya ``None`` (tidak pernah ditebak).
- Setiap klausul punya ``clause_id`` unik & deterministik dalam satu dokumen.

Diadaptasi dari pemotong klausul tim (repo referensi).
"""
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel

# Urutan hierarki: makin besar makin dalam. `body` = teks yang belum masuk heading mana pun.
LEVELS = {"bab": 0, "bagian": 1, "paragraf": 2, "pasal": 3, "ayat": 4, "huruf": 5, "angka": 6, "body": 7}

# Judul harus berdiri sendiri di satu baris; kalau tidak dianggap teks biasa.
STANDALONE = (
    ("bab", re.compile(r"^BAB\s+([IVXLCDM]+|\d+)$", re.I)),
    ("bagian", re.compile(r"^(Bagian|Section)\s+(Ke-?\d+|Ke(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh)|[IVXLCDM]+|\d+)$", re.I)),
    ("paragraf", re.compile(r"^(Paragraf|Paragraph)\s+(\d+|[IVXLCDM]+)$", re.I)),
    ("pasal", re.compile(r"^(Pasal|Article|Pasal\s+Ke)\s+(\d+[A-Z]?)(?:\s*[-–:]\s*.*)?$", re.I)),
)
AYAT = re.compile(r"^\((\d+[a-z]?)\)")
DECIMAL_CLAUSE = re.compile(r"^(\d+(?:\.\d+)+)\.?(?=\s|$)")
HURUF = re.compile(r"^([a-z])\.(?=\s|$)")
ANGKA = re.compile(r"^(\d+)\.(?=\s|$)")
HEADING_START = re.compile(r"^(BAB|Bagian|Section|Paragraf|Paragraph|Pasal|Article)\b", re.I)

PASAL_NO = re.compile(r"^(?:Pasal|Article)\s+(\d+)", re.I)
TOL_Y = 3.0  # titik PDF; kata dalam satu baris punya pusat y yang praktis sama


class Clause(BaseModel):
    """Satu klausul terpotong dengan whitespace dibersihkan tanpa parafrasa."""

    clause_id: str                      # deterministik: <document_id>-C0001, ...
    document_id: str
    clause_number: str | None           # penomoran apa adanya, mis. "Pasal 5", "(2)", "a."
    parent_clause_id: str | None        # klausul induk menurut hierarki, None untuk level teratas
    clause_type: str                    # bab | bagian | paragraf | pasal | ayat | huruf | angka | body
    text: str
    page_numbers: list[int]             # semua halaman yang memuat klausul ini
    bboxes: list[tuple[float, float, float, float] | None]  # sejajar page_numbers; None kalau tak ada
    needs_review: bool = False


@dataclass
class _Line:
    text: str
    page: int
    bbox: tuple[float, float, float, float] | None
    page_needs_review: bool


def _val(obj: Any, *names: str, default: Any = None) -> Any:
    """Ambil field dari dataclass (Page/Word) atau dict."""
    for name in names:
        if isinstance(obj, dict):
            if name in obj:
                return obj[name]
        elif hasattr(obj, name):
            return getattr(obj, name)
    return default


def _word_boxes(page: Any) -> list[tuple[float, float, float, float]]:
    """Kotak semua kata di halaman. Kosong kalau ada kata tanpa koordinat."""
    boxes = []
    for word in _val(page, "words", default=None) or []:
        box = _val(word, "bbox")
        if not _val(word, "word", "text") or not box or len(box) < 4:
            return []
        boxes.append((float(box[0]), float(box[1]), float(box[2]), float(box[3])))
    return boxes


def _line_boxes(page: Any, line_count: int) -> list[tuple[float, float, float, float]] | None:
    """Gabungkan kata per baris (berdasarkan pusat y). None kalau tidak bisa dipastikan."""
    boxes = _word_boxes(page)
    if not boxes or line_count == 0:
        return None

    groups: list[list[tuple[float, float, float, float]]] = []
    centers: list[float] = []
    for box in boxes:
        center = (box[1] + box[3]) / 2
        if groups and abs(center - centers[-1]) <= TOL_Y:
            groups[-1].append(box)
        else:
            groups.append([box])
            centers.append(center)

    # Jumlah baris teks dan baris kata harus sama, kalau tidak koordinat dianggap tidak pasti.
    if len(groups) != line_count:
        return None
    return [
        (min(b[0] for b in g), min(b[1] for b in g), max(b[2] for b in g), max(b[3] for b in g))
        for g in groups
    ]


def _lines(pages: Any) -> list[_Line]:
    """Normalisasi halaman menjadi baris teks berurutan."""
    out: list[_Line] = []
    for index, page in enumerate(pages or [], start=1):
        number = int(_val(page, "number", "page_number", default=index) or index)
        text = _val(page, "text", default="") or ""
        method = (_val(page, "method", "extraction_method", default="") or "").lower()
        review = bool(_val(page, "needs_review", default=False)) or method in ("failed", "empty")
        raw_lines = text.splitlines()
        boxes = _line_boxes(page, len(raw_lines))
        for i, raw in enumerate(raw_lines):
            out.append(_Line(raw, number, boxes[i] if boxes else None, review))
    return out


def _classify(text: str) -> tuple[str | None, str | None, bool]:
    """Tentukan (jenis, nomor apa adanya, perlu dicek) untuk satu baris."""
    stripped = text.strip()
    if not stripped:
        return None, None, False
    for clause_type, pattern in STANDALONE:
        match = pattern.match(stripped)
        if match:
            if clause_type == "pasal":
                return clause_type, f"Pasal {match.group(2)}", False
            return clause_type, stripped, False
    decimal = DECIMAL_CLAUSE.match(stripped)
    if decimal:
        return "ayat", decimal.group(1), False
    for clause_type, pattern in (("ayat", AYAT), ("huruf", HURUF), ("angka", ANGKA)):
        match = pattern.match(stripped)
        if match:
            return clause_type, match.group(0), False
    # Mirip judul tapi ada teks lanjutan: batasnya tidak jelas, simpan sebagai teks biasa.
    if HEADING_START.match(stripped):
        return None, None, True
    return None, None, False


def _normalize_clause_text(lines: list[str]) -> str:
    """Join wrapped OCR/PDF lines while keeping paragraph breaks readable."""
    normalized: list[str] = []
    for raw in lines:
        line = raw.replace("\u00a0", " ").replace("\u202f", " ").replace("\u2007", " ")
        line = line.replace("\u00ad", "").replace("\u200b", "").strip()
        line = re.sub(r"[\t\f\v\r ]+", " ", line)
        if not line:
            if normalized and normalized[-1] != "":
                normalized.append("")
            continue
        if normalized and normalized[-1]:
            previous = normalized[-1]
            # OCR often inserts a line break in a hyphenated word. Keep common
            # lexical compounds (e.g. Undang-Undang), join other broken words.
            compound = re.search(r"(?i)(undang|non|kerja|tanggung)-$", previous)
            if previous.endswith("-") and line[:1].islower() and not compound:
                normalized[-1] = previous[:-1] + line
            elif previous.endswith("-") and (compound or line[:1].isupper()):
                # Preserve lexical hyphens across line/page boundaries,
                # including the capitalized compound "Undang-Undang".
                normalized[-1] = previous + line
            else:
                normalized[-1] = previous + " " + line
        else:
            normalized.append(line)
    return "\n".join(normalized).strip()


class _Builder:
    """Mengumpulkan baris milik satu klausul, lalu membekukannya jadi ``Clause``."""

    def __init__(self, clause_id: str, document_id: str, number: str | None,
                 parent: str | None, clause_type: str, needs_review: bool) -> None:
        self.clause_id = clause_id
        self.document_id = document_id
        self.clause_number = number
        self.parent_clause_id = parent
        self.clause_type = clause_type
        self.needs_review = needs_review
        self.by_page: dict[int, list[_Line]] = {}
        self.page_order: list[int] = []

    def add(self, line: _Line) -> None:
        if line.page not in self.by_page:
            self.by_page[line.page] = []
            self.page_order.append(line.page)
        self.by_page[line.page].append(line)
        if line.page_needs_review:
            self.needs_review = True

    def build(self) -> Clause:
        bboxes: list[tuple[float, float, float, float] | None] = []
        for page in self.page_order:
            boxes = [line.bbox for line in self.by_page[page]]
            if boxes and all(boxes):
                bboxes.append((min(b[0] for b in boxes), min(b[1] for b in boxes),
                               max(b[2] for b in boxes), max(b[3] for b in boxes)))
            else:
                bboxes.append(None)
        text = _normalize_clause_text(
            [line.text for page in self.page_order for line in self.by_page[page]]
        )
        return Clause(
            clause_id=self.clause_id,
            document_id=self.document_id,
            clause_number=self.clause_number,
            parent_clause_id=self.parent_clause_id,
            clause_type=self.clause_type,
            text=text,
            page_numbers=list(self.page_order),
            bboxes=bboxes,
            needs_review=self.needs_review,
        )


def split_clauses(pages: Any, document_id: str = "") -> list[Clause]:
    """Potong halaman hasil ekstraksi menjadi klausul berurutan.

    ``document_id`` dipakai sebagai awalan ``clause_id``; id tetap sama untuk
    input yang sama (deterministik).
    """
    doc = document_id or "doc"
    clauses: list[_Builder] = []
    stack: dict[int, _Builder] = {}
    pending: list[_Line] = []   # baris sebelum klausul pertama (mis. baris kosong)
    current: _Builder | None = None
    seq = 0

    def open_clause(clause_type: str, number: str | None, review: bool) -> _Builder:
        nonlocal seq, current
        seq += 1
        level = LEVELS[clause_type]
        parent = next((stack[l] for l in sorted(stack, reverse=True) if l < level), None)
        builder = _Builder(f"{doc}-C{seq:04d}", doc, number,
                           parent.clause_id if parent else None, clause_type, review)
        for deeper in [l for l in stack if l >= level]:
            del stack[deeper]
        stack[level] = builder
        clauses.append(builder)
        current = builder
        for line in pending:
            builder.add(line)
        pending.clear()
        return builder

    lines = _lines(pages)
    i = 0
    while i < len(lines):
        line = lines[i]
        consumed = [line]
        candidate = line.text.strip()
        # A page boundary or OCR line wrap can separate a heading label from
        # its number ("PASAL" / "5"). Classify it together but retain both
        # source lines and their page coordinates in the same clause.
        if re.fullmatch(r"(?i)(BAB|PASAL|ARTICLE|BAGIAN|SECTION|PARAGRAF|PARAGRAPH)", candidate) and i + 1 < len(lines):
            # PDF/OCR may put the heading number on the next page and insert
            # empty lines at the page boundary. Look past those separators,
            # while retaining them as source lines for page/bbox provenance.
            lookahead = i + 1
            while lookahead < len(lines) and not lines[lookahead].text.strip():
                lookahead += 1
            if lookahead < len(lines):
                following = lines[lookahead]
                if re.fullmatch(r"(?i)(?:KE-?)?(?:[IVXLCDM]+|\d+[A-Z]?)", following.text.strip()):
                    candidate = candidate + " " + following.text.strip()
                    consumed.extend(lines[i + 1:lookahead + 1])
        clause_type, number, ambiguous = _classify(candidate)

        if clause_type is None:
            if current is None:
                if not line.text.strip():
                    pending.extend(consumed)
                    i += len(consumed)
                    continue
                current = open_clause("body", None, True)
                for source_line in consumed:
                    current.add(source_line)
                if ambiguous:
                    current.needs_review = True
                i += len(consumed)
                continue
            for source_line in consumed:
                current.add(source_line)
            if ambiguous:
                current.needs_review = True   # batas meragukan: teks tetap disimpan
            i += len(consumed)
            continue

        current = open_clause(clause_type, number, line.page_needs_review)
        for source_line in consumed:
            current.add(source_line)
        i += len(consumed)

    if current is None and pending:
        current = open_clause("body", None, True)
        for line in pending:
            current.add(line)
        pending.clear()

    return [builder.build() for builder in clauses]


def split_pdf(path: str, document_id: str = "", force_ocr: bool = False) -> list[Clause]:
    """Jalankan pipeline ekstraksi lalu potong jadi klausul."""
    from confidai.document.extract import extract

    return split_clauses(extract(path, force_ocr=force_ocr), document_id=document_id)


def main() -> None:
    parser = argparse.ArgumentParser(description="Potong PDF menjadi klausul.")
    parser.add_argument("pdf")
    parser.add_argument("--document-id", default="", help="awalan clause_id (mis. uuid dokumen)")
    parser.add_argument("--json", help="simpan hasil ke file JSON ini")
    parser.add_argument("--force-ocr", action="store_true", help="paksa OCR semua halaman")
    args = parser.parse_args()

    clauses = split_pdf(args.pdf, document_id=args.document_id, force_ocr=args.force_ocr)
    review = sum(1 for c in clauses if c.needs_review)
    print(f"{len(clauses)} klausul, {review} perlu dicek")
    for clause in clauses:
        label = f" {clause.clause_number}" if clause.clause_number else ""
        flag = "  <- PERLU DICEK" if clause.needs_review else ""
        print(f"{clause.clause_id} [{clause.clause_type}{label}] hal {clause.page_numbers}{flag}")
    if args.json:
        with open(args.json, "w", encoding="utf-8") as handle:
            json.dump([c.model_dump() for c in clauses], handle, ensure_ascii=False, indent=1)
        print(f"\nHasil disimpan ke {args.json}")


if __name__ == "__main__":
    main()
