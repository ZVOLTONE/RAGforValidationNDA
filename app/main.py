
from pathlib import Path
from tempfile import NamedTemporaryFile
import os

import pymupdf
from uuid import UUID, uuid4
from app.clause_splitter import Clause, split_clauses
from app.document.extract import extract as extract_pages
from app.extractor import extract_pdf_text
from fastapi import FastAPI, File, HTTPException, UploadFile, status

app = FastAPI(
    title="Legal RAG Backend",
    description="Backend API for legal document processing",
    version="0.1.0",
)

# Storage directory: data/ at the repository root
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "data"

# Upload limits
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
CHUNK_SIZE = 1024 * 1024  # Read 1 MB at a time


UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.get("/")
def root():
    return {"message": "Legal RAG Backend is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/documents/upload", status_code=status.HTTP_201_CREATED)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload, validate, and privately store a PDF document.
    """

    # 1. Validate the filename extension
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        await file.close()
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )

    temp_path = None

    try:
        # 2. Write to a temporary file while enforcing the size limit
        with NamedTemporaryFile(
            mode="wb",
            suffix=".pdf",
            prefix=".upload-",
            dir=UPLOAD_DIR,
            delete=False,
        ) as temp_file:
            temp_path = Path(temp_file.name)
            total_size = 0

            while True:
                chunk = await file.read(CHUNK_SIZE)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="File exceeds the 10 MB upload limit.",
                    )

                temp_file.write(chunk)

        # 3. Reject empty files
        if total_size == 0:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        # 4. Check for a PDF signature near the beginning
        with temp_path.open("rb") as uploaded_file:
            header = uploaded_file.read(1024)

        if b"%PDF-" not in header:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file does not have a valid PDF header.",
            )

        # 5. Ask PyMuPDF to open the PDF
        try:
            pdf_bytes = temp_path.read_bytes()

            with pymupdf.open(stream=pdf_bytes, filetype="pdf") as pdf:
                if pdf.is_encrypted:
                    raise HTTPException(
                        status_code=400,
                        detail="Password-protected PDFs are not supported.",
                    )

                page_count = pdf.page_count

                if page_count < 1:
                    raise HTTPException(
                        status_code=400,
                        detail="The PDF contains no pages.",
                    )

        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail="The PDF is corrupted or cannot be opened.",
            ) from exc

        # 6. Generate a unique document ID
        document_id = str(uuid4())

        # 7. Move the validated file to its permanent private location
        final_path = UPLOAD_DIR / f"{document_id}.pdf"
        os.replace(temp_path, final_path)
        temp_path = None

        # 8. Return upload information without exposing the storage path
        return {
            "document_id": document_id,
            "filename": file.filename,
            "size_bytes": total_size,
            "page_count": page_count,
            "status": "uploaded",
        }

    
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)

        await file.close()

def locate_document(document_id: str) -> tuple[UUID, Path]:
    """Validate a document ID and return its stored PDF path."""

    try:
        valid_id = UUID(document_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid document ID.",
        )

    pdf_path = UPLOAD_DIR / f"{valid_id}.pdf"

    if not pdf_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return valid_id, pdf_path


@app.post("/documents/{document_id}/extract")
def extract_document(document_id: str):

    # 1-2. Validate document ID and find the uploaded PDF
    valid_id, pdf_path = locate_document(document_id)

    # 3. Extract PDF content
    pages = extract_pdf_text(str(pdf_path))

    # 4. Return results
    return {
        "document_id": str(valid_id),
        "total_pages": len(pages),
        "pages": pages,
    }


@app.post("/documents/{document_id}/clauses", response_model=list[Clause])
def document_clauses(document_id: str, force_ocr: bool = False):
    """Split an already uploaded document into clauses (BE-05).

    Reuses the existing pipeline: BE-04 routes each page to digital text or OCR,
    then BE-05 splits the page text into clauses. Nothing is re-extracted in a
    different way, so the returned text is the same text BE-03/BE-04 produce.
    """

    valid_id, pdf_path = locate_document(document_id)
    pages = extract_pages(str(pdf_path), force_ocr=force_ocr)
    return split_clauses(pages, document_id=str(valid_id))