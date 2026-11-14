"""Tes ekspor TSV BE-04 (`export_tsv`) dan flag CLI `--tsv`.

Semua halaman dibuat sintetis; tidak ada OCR sungguhan yang dijalankan.
"""

import csv
import json
import subprocess
import sys
from pathlib import Path

import pymupdf

from app.document.extract import Page, Word, TSV_COLUMNS, export_tsv

ROOT = Path(__file__).resolve().parents[1]


def read_tsv(path) -> list[list[str]]:
    with open(path, encoding="utf-8", newline="") as handle:
        return list(csv.reader(handle, delimiter="\t"))


def make_pdf(path, lines) -> str:
    """PDF kecil dengan teks digital (cukup panjang agar router memilih pdf_text)."""
    with pymupdf.open() as pdf:
        page = pdf.new_page()
        for i, line in enumerate(lines):
            page.insert_text((72, 72 + i * 20), line)
        pdf.save(path)
    return str(path)


def page_with_words(number: int, words, method: str = "pdf_text", text: str = "",
                    confidence: float | None = None, needs_review: bool = False,
                    error: str | None = None) -> Page:
    return Page(number, method, "uji", text, words, confidence, needs_review, error)


def test_export_creates_file_with_header(tmp_path) -> None:
    out = tmp_path / "hasil.tsv"
    export_tsv([page_with_words(1, [Word("kata", (1.0, 2.0, 3.0, 4.0), 90.0)])], str(out))

    assert out.exists()
    rows = read_tsv(out)
    assert rows[0] == list(TSV_COLUMNS)
    assert TSV_COLUMNS[:5] == ("page_number", "extraction_method", "reason", "word_index", "word_text")
    assert "\t" in out.read_text(encoding="utf-8").splitlines()[0]


def test_multiple_pages_and_words_keep_order_and_coordinates(tmp_path) -> None:
    pages = [
        page_with_words(1, [Word("Pasal", (72.0, 100.0, 120.0, 112.0), 91.0),
                            Word("1", (125.0, 100.0, 134.0, 112.0), 88.0)],
                        method="ocr", text="Pasal 1", confidence=89.5),
        page_with_words(2, [Word("Isi", (72.0, 120.0, 90.0, 132.0), 80.0)],
                        method="pdf_text", text="Isi"),
    ]
    out = tmp_path / "kata.tsv"
    export_tsv(pages, str(out))
    rows = read_tsv(out)[1:]

    assert len(rows) == 3
    assert [r[0] for r in rows] == ["1", "1", "2"]          # page_number
    assert [r[1] for r in rows] == ["ocr", "ocr", "pdf_text"]
    assert [r[3] for r in rows] == ["0", "1", "0"]          # word_index per halaman
    assert [r[4] for r in rows] == ["Pasal", "1", "Isi"]
    assert rows[0][5:9] == ["72.0", "100.0", "120.0", "112.0"]
    assert rows[0][9] == "91.0"                             # word_confidence
    assert rows[0][10] == "89.5"                            # page_confidence, diulang per kata
    assert rows[0][11] == "false"
    assert rows[0][12] == "Pasal 1"                         # page_text
    assert rows[0][2] == "uji"                              # reason
    assert len(rows[0]) == len(TSV_COLUMNS)


def test_missing_bbox_and_confidence_are_empty(tmp_path) -> None:
    pages = [page_with_words(1, [Word("kata", None, None)], text="kata",
                             confidence=None, needs_review=True)]
    out = tmp_path / "kosong.tsv"
    export_tsv(pages, str(out))
    row = read_tsv(out)[1]

    assert row[4] == "kata"
    assert row[5:9] == ["", "", "", ""]     # bbox tidak dikarang
    assert row[9] == ""                     # word_confidence
    assert row[10] == ""                    # page_confidence
    assert row[11] == "true"
    assert row[12] == "kata"


def test_partial_bbox_is_not_invented(tmp_path) -> None:
    # bbox kurang dari 4 angka: jangan tebak, biarkan kosong.
    pages = [page_with_words(1, [Word("kata", (1.0, 2.0), 70.0)])]
    out = tmp_path / "sebagian.tsv"
    export_tsv(pages, str(out))
    assert read_tsv(out)[1][5:9] == ["", "", "", ""]


def test_wordless_page_gives_one_row(tmp_path) -> None:
    pages = [page_with_words(3, [], method="empty", text="", confidence=None,
                             needs_review=True, error=None)]
    out = tmp_path / "kosong-halaman.tsv"
    export_tsv(pages, str(out))
    rows = read_tsv(out)

    assert len(rows) == 2                   # header + satu baris halaman
    row = rows[1]
    assert len(row) == len(TSV_COLUMNS)
    assert row[0] == "3"
    assert row[1] == "empty"
    assert row[3:10] == [""] * 7            # kolom kata kosong
    assert row[11] == "true"


def test_indonesian_and_special_characters_round_trip(tmp_path) -> None:
    page_text = "Kerahasiaan pihak — Pasal 1 ayat (2) UU PDP é"
    words = [
        Word("Kerahasiaan", (1.0, 1.0, 2.0, 2.0), 95.0),
        Word("tab\tdi dalam", (3.0, 3.0, 4.0, 4.0), 90.0),
        Word('kata "kutip"', (5.0, 5.0, 6.0, 6.0), 85.0),
        Word("baris1\nbaris2", (7.0, 7.0, 8.0, 8.0), 80.0),
    ]
    out = tmp_path / "khusus.tsv"
    export_tsv([page_with_words(1, words, text=page_text)], str(out))

    rows = read_tsv(out)[1:]
    assert [r[4] for r in rows] == ["Kerahasiaan", "tab\tdi dalam", 'kata "kutip"', "baris1\nbaris2"]
    assert rows[0][12] == page_text                    # teks halaman utuh
    assert all(len(r) == len(TSV_COLUMNS) for r in rows)


def test_extract_still_returns_pages(tmp_path) -> None:
    pdf = make_pdf(tmp_path / "doc.pdf", ["Pasal 1", "(1) Setiap pihak wajib menjaga kerahasiaan."])
    from app.document.extract import extract

    pages = extract(pdf)
    assert isinstance(pages, list)
    assert all(isinstance(p, Page) for p in pages)
    assert all(isinstance(w, Word) for p in pages for w in p.words)
    assert pages[0].method == "pdf_text"


def run_cli(pdf: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-m", "app.document.extract", pdf, *args],
        cwd=ROOT, capture_output=True, text=True, encoding="utf-8",
    )


def test_cli_tsv_flag_writes_file(tmp_path) -> None:
    pdf = make_pdf(tmp_path / "cli.pdf", ["Pasal 1", "(1) Setiap pihak wajib menjaga kerahasiaan."])
    out = tmp_path / "cli.tsv"
    result = run_cli(pdf, "--tsv", str(out))

    assert result.returncode == 0, result.stderr
    assert out.exists()
    rows = read_tsv(out)
    assert rows[0] == list(TSV_COLUMNS)
    assert len(rows) > 1
    assert f"TSV disimpan ke {out}" in result.stdout


def test_cli_json_and_tsv_together(tmp_path) -> None:
    pdf = make_pdf(tmp_path / "dua.pdf", ["Pasal 2", "(1) Isi pasal dua wajib dilaporkan."])
    js, tsv = tmp_path / "dua.json", tmp_path / "dua.tsv"
    result = run_cli(pdf, "--json", str(js), "--tsv", str(tsv))

    assert result.returncode == 0, result.stderr
    assert js.exists() and tsv.exists()
    data = json.loads(js.read_text(encoding="utf-8"))
    assert data[0]["number"] == 1 and data[0]["method"] == "pdf_text"
    assert len(read_tsv(tsv)) == len(data[0]["words"]) + 1


def test_cli_default_output_is_unchanged(tmp_path) -> None:
    pdf = make_pdf(tmp_path / "polos.pdf", ["Pasal 3", "(1) Ketentuan ini wajib dipatuhi pihak."])
    before = set(p.name for p in tmp_path.iterdir())
    result = run_cli(pdf)

    assert result.returncode == 0, result.stderr
    assert "hal 1: pdf_text" in result.stdout
    assert "kata" in result.stdout
    assert "TSV disimpan" not in result.stdout
    assert "Hasil disimpan" not in result.stdout
    assert set(p.name for p in tmp_path.iterdir()) == before   # tidak ada file tambahan
