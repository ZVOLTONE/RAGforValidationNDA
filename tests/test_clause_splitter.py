"""Tes BE-05: pemotong klausul. Semua input sintetis kecil, bukan PDF KUHP."""

import pymupdf
import pytest
from fastapi.testclient import TestClient

from app.clause_splitter import Clause, split_clauses
from app.document.extract import Page, Word, extract as extract_pages
from app.main import app


def page_dict(number: int, text: str, words=None, method: str = "pdf_text",
              needs_review: bool = False) -> dict:
    """Halaman dengan bentuk keluaran BE-03 (`app.extractor.extract_pdf_text`)."""
    return {
        "page_number": number,
        "extraction_method": method,
        "text": text,
        "words": words or [],
        "confidence": None,
        "needs_review": needs_review,
        "status": "success" if text else "empty",
        "error": None,
    }


def page_object(number: int, text: str, words=None, method: str = "ocr",
                confidence: float = 88.0, needs_review: bool = False) -> Page:
    """Halaman dengan bentuk keluaran BE-04 (`app.document.extract.Page`)."""
    return Page(number, method, "uji", text, list(words or []), confidence, needs_review)


SAMPLE = (
    "BAB I\n"
    "KETENTUAN UMUM\n"
    "Pasal 1\n"
    "(1) Dalam peraturan ini:\n"
    "a. pertama;\n"
    "b. kedua.\n"
    "Pasal 2\n"
    "(1) Isi pasal dua."
)


def sample_clauses() -> list[Clause]:
    return split_clauses([page_dict(1, SAMPLE)], document_id="doc-1")


def by_number(clauses: list[Clause], number: str) -> Clause:
    return next(c for c in clauses if c.clause_number == number)


def test_detects_structure_and_numbering() -> None:
    clauses = sample_clauses()
    assert [c.clause_type for c in clauses] == [
        "bab", "pasal", "ayat", "huruf", "huruf", "pasal", "ayat",
    ]
    assert [c.clause_number for c in clauses] == [
        "BAB I", "Pasal 1", "(1)", "a.", "b.", "Pasal 2", "(1)",
    ]


def test_detects_bagian_and_paragraf() -> None:
    text = "BAB II\nBagian Kesatu\nParagraf 1\nPasal 3\n(1) Isi."
    clauses = split_clauses([page_dict(1, text)], document_id="doc-1")
    assert [c.clause_type for c in clauses] == ["bab", "bagian", "paragraf", "pasal", "ayat"]
    assert [c.clause_number for c in clauses] == ["BAB II", "Bagian Kesatu", "Paragraf 1", "Pasal 3", "(1)"]


def test_parents_follow_hierarchy() -> None:
    clauses = sample_clauses()
    bab, pasal1, ayat, huruf_a = clauses[0], clauses[1], clauses[2], clauses[3]
    assert bab.parent_clause_id is None
    assert pasal1.parent_clause_id == bab.clause_id
    assert ayat.parent_clause_id == pasal1.clause_id
    assert huruf_a.parent_clause_id == ayat.clause_id
    # huruf b. bersaudara dengan a. (induknya ayat yang sama), bukan anak a.
    assert clauses[4].parent_clause_id == ayat.clause_id
    # Pasal 2 menggantikan Pasal 1 sebagai induk, bukan menumpuk di bawah ayat lama.
    assert clauses[5].parent_clause_id == bab.clause_id
    assert clauses[6].parent_clause_id == clauses[5].clause_id


def test_clause_ids_unique_and_deterministic() -> None:
    first = sample_clauses()
    second = sample_clauses()
    ids = [c.clause_id for c in first]
    assert len(ids) == len(set(ids))
    assert ids == [c.clause_id for c in second]
    assert ids[0] == "doc-1-C0001"
    assert all(c.document_id == "doc-1" for c in first)


def test_text_is_preserved_exactly() -> None:
    clauses = sample_clauses()
    rebuilt = "\n".join(c.text for c in clauses)
    assert rebuilt == SAMPLE
    assert "KETENTUAN UMUM" in clauses[0].text          # teks di bawah judul tidak hilang
    assert clauses[2].text == "(1) Dalam peraturan ini:"


def test_text_preserved_across_pages_without_duplicates() -> None:
    pages = [
        page_dict(1, "Pasal 1\n(1) Kalimat yang"),
        page_dict(2, "berlanjut di halaman dua."),
    ]
    clauses = split_clauses(pages, document_id="doc-2")
    assert "\n".join(c.text for c in clauses) == "Pasal 1\n(1) Kalimat yang\nberlanjut di halaman dua."


def test_multi_page_clause_keeps_all_pages() -> None:
    pages = [
        page_dict(1, "Pasal 1\n(1) Kalimat yang"),
        page_dict(2, "berlanjut di halaman dua."),
    ]
    clauses = split_clauses(pages, document_id="doc-2")
    ayat = next(c for c in clauses if c.clause_type == "ayat")
    assert ayat.page_numbers == [1, 2]
    assert len(ayat.bboxes) == 2
    assert ayat.bboxes == [None, None]          # tanpa kata berkoordinat, jangan dikarang


def test_bbox_comes_from_word_coordinates() -> None:
    words = [
        {"word": "Pasal", "bbox": [72.0, 100.0, 120.0, 112.0]},
        {"word": "1", "bbox": [125.0, 100.0, 134.0, 112.0]},
        {"word": "(1)", "bbox": [72.0, 120.0, 90.0, 132.0]},
        {"word": "Isi.", "bbox": [95.0, 120.0, 120.0, 132.0]},
    ]
    clauses = split_clauses([page_dict(1, "Pasal 1\n(1) Isi.", words)], document_id="doc-3")
    assert clauses[0].bboxes == [(72.0, 100.0, 134.0, 112.0)]
    assert clauses[1].bboxes == [(72.0, 120.0, 120.0, 132.0)]
    assert clauses[0].page_numbers == [1]


def test_bbox_is_null_when_coordinates_are_incomplete() -> None:
    # Satu kata tanpa bbox: koordinat dianggap tidak pasti, jadi null (bukan tebakan).
    words = [{"word": "Pasal", "bbox": [72.0, 100.0, 120.0, 112.0]}, {"word": "1", "bbox": None}]
    clauses = split_clauses([page_dict(1, "Pasal 1", words)], document_id="doc-3")
    assert clauses[0].bboxes == [None]


def test_ocr_page_format_is_understood() -> None:
    words = [
        Word("Pasal", (72.0, 100.0, 120.0, 112.0), 91.0),
        Word("1", (125.0, 100.0, 134.0, 112.0), 88.0),
        Word("(1)", (72.0, 120.0, 90.0, 132.0), 83.0),
        Word("Isi.", (95.0, 120.0, 120.0, 132.0), 79.0),
    ]
    clauses = split_clauses([page_object(1, "Pasal 1\n(1) Isi.", words, needs_review=True)],
                            document_id="doc-4")
    assert [c.clause_type for c in clauses] == ["pasal", "ayat"]
    assert clauses[0].bboxes == [(72.0, 100.0, 134.0, 112.0)]
    assert all(c.needs_review for c in clauses)   # halaman OCR bertanda -> klausul ikut ditandai


def test_low_confidence_page_flags_clauses() -> None:
    pages = [page_object(1, "Pasal 1\n(1) Isi.", needs_review=True)]
    clauses = split_clauses(pages, document_id="doc-4")
    assert clauses[0].needs_review is True


def test_numbering_gap_is_flagged_not_repaired() -> None:
    text = "Pasal 1\n(1) Satu.\nPasal 4\n(1) Empat."
    clauses = split_clauses([page_dict(1, text)], document_id="doc-5")
    assert [c.clause_number for c in clauses] == ["Pasal 1", "(1)", "Pasal 4", "(1)"]
    assert clauses[0].needs_review is False
    assert clauses[2].needs_review is True        # loncat 1 -> 4


def test_ambiguous_heading_boundary_keeps_text_and_flags() -> None:
    text = "Pasal 1\n(1) Isi.\nPasal 5 mengatur bahwa semua pihak wajib lapor."
    clauses = split_clauses([page_dict(1, text)], document_id="doc-6")
    assert [c.clause_number for c in clauses] == ["Pasal 1", "(1)"]   # nomor tidak dikarang
    assert clauses[1].needs_review is True
    assert "Pasal 5 mengatur" in clauses[1].text
    assert "\n".join(c.text for c in clauses) == text


def test_text_before_first_heading_becomes_body_flagged() -> None:
    text = "Pembukaan tanpa judul.\nPasal 1\n(1) Isi."
    clauses = split_clauses([page_dict(1, text)], document_id="doc-7")
    assert clauses[0].clause_type == "body"
    assert clauses[0].clause_number is None
    assert clauses[0].parent_clause_id is None
    assert clauses[0].needs_review is True
    assert clauses[0].text == "Pembukaan tanpa judul."


def test_empty_and_missing_text_returns_no_clauses() -> None:
    assert split_clauses([page_dict(1, "")]) == []
    assert split_clauses([{"page_number": 1}]) == []
    assert split_clauses([]) == []


def test_failed_page_does_not_crash() -> None:
    page = page_dict(1, "", method="failed", needs_review=True)
    page["status"] = "failed"
    page["error"] = "boom"
    assert split_clauses([page]) == []


def make_pdf(path, lines) -> str:
    with pymupdf.open() as pdf:
        page = pdf.new_page()
        for i, line in enumerate(lines):
            page.insert_text((72, 72 + i * 20), line)
        pdf.save(path)
    return str(path)


def test_pipeline_output_feeds_splitter(tmp_path) -> None:
    """Integrasi: keluaran BE-04 (routing teks digital/OCR) langsung dipotong BE-05."""
    lines = [
        "BAB I",
        "Pasal 1",
        "(1) Setiap pihak wajib menjaga kerahasiaan informasi yang diterimanya.",
        "(2) Kewajiban ini berlaku selama perjanjian masih berjalan.",
    ]
    pdf_path = make_pdf(tmp_path / "clauses.pdf", lines)

    pages = extract_pages(pdf_path)
    assert pages[0].method == "pdf_text"          # teks cukup, tidak memicu OCR

    clauses = split_clauses(pages, document_id="doc-8")
    assert [c.clause_type for c in clauses] == ["bab", "pasal", "ayat", "ayat"]
    assert clauses[1].clause_number == "Pasal 1"
    assert clauses[2].bboxes[0] is not None
    assert "\n".join(c.text for c in clauses) == "\n".join(lines)


def test_clauses_endpoint(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr("app.main.UPLOAD_DIR", tmp_path)
    client = TestClient(app)

    lines = [
        "Pasal 1",
        "(1) Setiap pihak wajib menjaga kerahasiaan informasi yang diterimanya.",
    ]
    pdf_bytes = (tmp_path / "src.pdf")
    make_pdf(pdf_bytes, lines)
    upload = client.post(
        "/documents/upload",
        files={"file": ("nda.pdf", pdf_bytes.read_bytes(), "application/pdf")},
    )
    assert upload.status_code == 201
    document_id = upload.json()["document_id"]

    response = client.post(f"/documents/{document_id}/clauses")
    assert response.status_code == 200
    body = response.json()
    assert [c["clause_type"] for c in body] == ["pasal", "ayat"]
    assert body[0]["clause_number"] == "Pasal 1"
    assert body[0]["clause_id"] == f"{document_id}-C0001"
    assert body[0]["page_numbers"] == [1]
    assert body[0]["needs_review"] is False

    assert client.post("/documents/not-a-uuid/clauses").status_code == 400
    import uuid

    assert client.post(f"/documents/{uuid.uuid4()}/clauses").status_code == 404
