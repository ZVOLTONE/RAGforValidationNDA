
from pathlib import Path

import fitz
import pytest
from fastapi.testclient import TestClient

import app.main as main


@pytest.fixture
def client(tmp_path, monkeypatch):
    # Keep test uploads isolated from your real documents.
    monkeypatch.setattr(main, "UPLOAD_DIR", tmp_path)
    return TestClient(main.app)


def make_pdf() -> bytes:
    """Create a small, valid PDF entirely in memory."""
    document = fitz.open()
    page = document.new_page()
    page.insert_text((72, 72), "Test legal document")
    pdf_bytes = document.tobytes()
    document.close()
    return pdf_bytes


def test_valid_pdf_upload(client, tmp_path):
    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "example.pdf",
                make_pdf(),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 201

    data = response.json()
    assert data["filename"] == "example.pdf"
    assert data["page_count"] == 1
    assert data["status"] == "uploaded"

    saved_file = tmp_path / f'{data["document_id"]}.pdf'
    assert saved_file.exists()


def test_reject_wrong_extension(client, tmp_path):
    response = client.post(
        "/documents/upload",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )

    assert response.status_code == 400
    assert list(tmp_path.iterdir()) == []


def test_reject_empty_file(client, tmp_path):
    response = client.post(
        "/documents/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )

    assert response.status_code == 400
    assert list(tmp_path.iterdir()) == []


def test_reject_non_pdf_content(client, tmp_path):
    response = client.post(
        "/documents/upload",
        files={
            "file": (
                "fake.pdf",
                b"This is not a PDF",
                "application/pdf",
            )
        },
    )

    assert response.status_code == 400
    assert list(tmp_path.iterdir()) == []



def test_reject_corrupted_pdf(client, tmp_path):
    # Looks like a PDF, but has no valid PDF structure.
    corrupted = b"%PDF-1.7\n" + (b"not a valid PDF object\n" * 100)

    response = client.post(
        "/documents/upload",
        files={
            "file": ("corrupted.pdf", corrupted, "application/pdf")
        },
    )

    assert response.status_code == 400
    assert list(tmp_path.iterdir()) == []



def test_reject_file_over_size_limit(client, tmp_path):
    oversized = b"x" * (main.MAX_FILE_SIZE + 1)

    response = client.post(
        "/documents/upload",
        files={
            "file": ("large.pdf", oversized, "application/pdf")
        },
    )

    assert response.status_code == 413
    assert list(tmp_path.iterdir()) == []
