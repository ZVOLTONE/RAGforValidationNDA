import pymupdf
import pytest

from app.extractor import extract_pdf_text


@pytest.fixture
def sample_pdf(tmp_path):
    """Create a PDF containing two pages of text."""
    pdf_path = tmp_path / "sample.pdf"

    with pymupdf.open() as pdf:
        page1 = pdf.new_page()
        page1.insert_text((72, 72), "Hello from page 1")

        page2 = pdf.new_page()
        page2.insert_text((72, 72), "Hello from page 2")

        pdf.save(pdf_path)

    return pdf_path


def test_extract_multiple_pages(sample_pdf):
    result = extract_pdf_text(str(sample_pdf))

    assert len(result) == 2
    assert result[0]["text"] == "Hello from page 1"
    assert result[1]["text"] == "Hello from page 2"
    assert result[0]["extraction_method"] == "pdf_text"
    assert isinstance(result[0]["words"], list)
    assert result[0]["confidence"] is None
    assert result[0]["error"] is None


def test_page_numbers_are_correct(sample_pdf):
    result = extract_pdf_text(str(sample_pdf))

    assert result[0]["page_number"] == 1
    assert result[1]["page_number"] == 2


def test_extraction_status_is_success(sample_pdf):
    result = extract_pdf_text(str(sample_pdf))

    assert result[0]["status"] == "success"
    assert result[1]["status"] == "success"


def test_empty_page(sample_pdf, tmp_path):
    pdf_path = tmp_path / "empty.pdf"

    with pymupdf.open() as pdf:
        pdf.new_page()
        pdf.save(pdf_path)

    result = extract_pdf_text(str(pdf_path))

    assert len(result) == 1
    assert result[0]["text"] == ""
    assert result[0]["status"] == "empty"
    assert result[0]["needs_review"] is True


def test_invalid_pdf():
    with pytest.raises(Exception):
        extract_pdf_text("nonexistent.pdf")