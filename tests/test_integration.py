
import pymupdf
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_upload_and_extract_pdf(tmp_path, monkeypatch):
    # 1. Use a temporary directory for uploaded PDFs
    monkeypatch.setattr("app.main.UPLOAD_DIR", tmp_path)

    # 2. Create a sample PDF
    pdf_bytes = None

    with pymupdf.open() as pdf:
        page = pdf.new_page()
        page.insert_text((72, 72), "Integration test legal document")

        pdf_bytes = pdf.tobytes()

    # 3. Upload the PDF
    upload_response = client.post(
        "/documents/upload",
        files={
            "file": ("test.pdf", pdf_bytes, "application/pdf")
        },
    )

    assert upload_response.status_code == 201

    document_id = upload_response.json()["document_id"]

    # 4. Extract the uploaded PDF
    extract_response = client.post(
        f"/documents/{document_id}/extract"
    )

    assert extract_response.status_code == 200

    result = extract_response.json()

    assert result["document_id"] == document_id
    assert result["total_pages"] == 1
    assert result["pages"][0]["text"] == "Integration test legal document"
    assert result["pages"][0]["status"] == "success"


def test_extract_invalid_document_id():
    response = client.post("/documents/invalid-id/extract")

    assert response.status_code == 400


def test_extract_nonexistent_document():
    import uuid

    document_id = str(uuid.uuid4())

    response = client.post(
        f"/documents/{document_id}/extract"
    )

    assert response.status_code == 404
