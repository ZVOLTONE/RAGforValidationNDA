# Legal RAG Backend --- Project Context

## 1. Project overview

This repository contains the backend for a team Legal RAG
(Retrieval-Augmented Generation) project. The backend is built with
**Python and FastAPI** and processes legal PDF documents.

The current work is focused on PDF ingestion and preparation so that
legal content can later be stored, retrieved, and used by the RAG
system.

**Important working principle:** inspect the actual repository and
current code before making assumptions. This document is a handover
summary, not a replacement for source code, tests, Git history, or the
team's latest requirements.

## 2. Development environment

Known environment from the developer's recent test output:

-   Operating system: Windows
-   Python: 3.11.17
-   Conda environment: `legal-rag`
-   Test framework: `pytest` 9.1.1
-   Backend framework: FastAPI
-   IDE: VS Code
-   Project backend directory was previously:
    `C:\Users\Jayden\Documents\Jayden BINUSIAN\LOMBA\Lomba RAG\code\backend`

Do not assume this exact path is still the active working directory.
Inspect the current repository location.

Run tests from the backend directory using:

``` bash
python -m pytest -v
```

## 3. Team task breakdown

The relevant backend tasks are:

-   **BE-02 --- PDF Upload and Validation:** upload PDF files, validate
    them, and store them privately.
-   **BE-03 --- PDF Text Extraction:** extract digital PDF text page by
    page, including word coordinates where available.
-   **BE-04 --- OCR Routing and Integration:** detect pages requiring
    OCR and process scanned pages. This was implemented by teammate
    Daniel and has now been merged into the local `main` branch.
-   **BE-05 --- Document Clause Splitter:** split extracted legal
    document text into clauses and subclauses while preserving source
    information.
-   Later tasks include legal reference ingestion into ChromaDB,
    retrieval, analysis persistence, PDF highlighting/annotation, and
    report generation.

The team has discussed ChromaDB and the embedding model
`nomic-embed-text:latest`, but the final embedding runtime and
integration details should be verified from the current repository/team
instructions rather than assumed.

## 4. Completed work by Jayden: BE-02 and BE-03

Jayden implemented BE-02 and BE-03. Their individual tests and
integration tests passed before BE-04 was merged.

### BE-02 --- PDF Upload and Validation

Known behavior in `app/main.py`:

-   Endpoint: `POST /documents/upload`
-   Accepts PDF uploads.
-   Checks the `.pdf` filename extension.
-   Reads uploads in chunks.
-   Maximum upload size: 10 MB.
-   Rejects empty files.
-   Checks for a PDF signature.
-   Uses PyMuPDF to verify that the PDF can be opened.
-   Rejects encrypted PDFs and PDFs with no pages.
-   Generates a UUID document ID.
-   Stores the validated PDF in the backend `data/` directory using the
    UUID as the stored filename.
-   Returns metadata including `document_id`, original `filename`,
    `size_bytes`, `page_count`, and upload `status`.
-   Does not expose the private storage path in the response.

### BE-03 --- PDF Text Extraction

A dedicated module was created at `app/extractor.py`.

The known implementation uses:

-   `import pymupdf`
-   `pymupdf.open(pdf_path)`
-   `page.get_text("text")` to extract page text.
-   `page.get_text("words")` to extract individual words and their
    bounding boxes.

The known per-page output fields were:

-   `page_number`
-   `extraction_method` (for digital extraction, `"pdf_text"`)
-   `text`
-   `words`, each containing:
    -   `word`
    -   `bbox` as `[x0, y0, x1, y1]`
-   `confidence` (`None` for ordinary digital PDF extraction; do not
    invent a confidence score)
-   `needs_review`
-   `status` (`"success"`, `"empty"`, or `"failed"`)
-   `error`

The extractor catches page-level extraction errors and records a failed
page rather than stopping the entire page loop.

### BE-02/BE-03 API integration

A route was added in `app/main.py`:

`POST /documents/{document_id}/extract`

Known behavior:

-   Validates the document ID as a UUID.
-   Returns HTTP 400 for an invalid UUID.
-   Looks up the uploaded PDF at `UPLOAD_DIR / f"{valid_id}.pdf"`.
-   Returns HTTP 404 if the document does not exist.
-   Calls `extract_pdf_text(...)`.
-   Returns `document_id`, `total_pages`, and `pages`.

**Important:** BE-04 has since been merged. Inspect the current
`main.py` and extraction modules to see whether the route or data
contract has changed. Do not overwrite the teammate's OCR integration.

## 5. Known test status before BE-04 merge

Before BE-04 was merged, the full suite contained 14 tests:

-   6 BE-02 upload tests passed.
-   5 BE-03 extractor tests passed.
-   3 integration tests passed.

The command `python -m pytest -v` reported:

`14 passed, 2 warnings`

Warnings at that time:

1.  A Starlette deprecation warning about using `httpx` with
    `starlette.testclient`, suggesting `httpx2`.
2.  A PyMuPDF-related `fitz` FutureWarning, even though the current
    `main.py` had been changed to use `import pymupdf`. The source of
    the remaining warning had not yet been investigated.

These results are historical and predate the BE-04 merge. **Run the
current full test suite after inspecting the merged repository.** Do not
assume that the current branch still has exactly 14 tests or that all
tests still pass.

## 6. Current Git situation

The latest user-provided status:

-   BE-04 has been merged into the local `main` branch.
-   BE-04 was implemented by teammate Daniel.
-   The teammate's branch was named `Daniel_ingest_PDP`.
-   Jayden's branch was named `Jayden`.
-   The requested merging was local only; the user explicitly said not
    to push to GitHub yet.

Before making changes:

1.  Check `git status`.
2.  Check `git branch --show-current`.
3.  Inspect recent Git history and verify the current branch.
4.  Confirm the BE-04 merge is present in local `main`.
5.  Preserve uncommitted changes. Do not reset, clean, force, or discard
    work.
6.  Do not push to any remote.

The user wants BE-05 work based on the integrated local `main`. If
appropriate and the working tree is clean, create a local feature branch
named `BE-05-clause-splitter` from the current integrated `main`. Do not
merge the BE-05 branch into `main` automatically unless the user
explicitly asks.

## 7. Current task: BE-05 --- Document Clause Splitter

### Official task description

"Membagi teks dokumen menjadi klausul dan subklausul dengan
mempertahankan teks asli, clause ID, nomor halaman, dan koordinat jika
tersedia."

### Acceptance criteria

1.  Setiap klausul memiliki ID.
2.  Penomoran klausul dipertahankan jika terdeteksi.
3.  Klausul yang tidak dapat dipisahkan dengan yakin ditandai untuk
    review.

In English:

-   Split document text into clauses and subclauses.
-   Preserve the original text.
-   Assign an ID to every clause.
-   Preserve clause numbering when detected.
-   Preserve page numbers.
-   Preserve coordinates when available.
-   Mark clauses for review when boundaries cannot be determined
    confidently.

### Recommended implementation direction

A dedicated module is preferred, for example:

`app/clause_splitter.py`

Keep the clause-splitting logic separate from FastAPI routing.

The splitter should accept page-level extraction results from the actual
integrated BE-03/BE-04 pipeline. Inspect the real BE-04 output schema
before designing function signatures or writing code. Do not assume that
BE-04 output matches BE-03 output exactly.

The implementation should:

1.  Preserve the original order of text.
2.  Detect legal structures where possible, potentially including:
    -   BAB
    -   Bagian
    -   Paragraf
    -   Pasal
    -   Ayat
    -   Huruf
    -   Angka
3.  Preserve detected original numbering; never invent numbering.
4.  Assign a stable, unique clause ID to every emitted clause.
5.  Preserve exact original text; do not paraphrase, normalize away
    meaningful content, silently correct, or discard text.
6.  Preserve page references.
7.  Preserve word/region coordinates when available.
8.  Handle clauses that span multiple pages.
9.  Mark uncertain boundaries with `needs_review = true`.
10. Retain unclassified or ambiguous text in an output item and flag it
    for review rather than dropping it.
11. Avoid duplicate or missing text during splitting.
12. Work with both digital text extraction and OCR-derived text where
    the actual BE-04 data supports it.
13. Avoid hardcoding the implementation exclusively to KUHP. The backend
    is intended to support multiple legal documents, including KUHP,
    ITE, and PDP.

Possible output fields to consider (adapt to the existing project
conventions):

-   `clause_id`
-   `document_id`, if available
-   `parent_clause_id`, for hierarchy when applicable
-   `clause_type`, if detectable
-   `clause_number`, if detected
-   `text`
-   `page_number` or a list of page references for multi-page clauses
-   `bbox` or coordinate references, if available
-   `needs_review`

This is a design suggestion, not a fixed schema. Avoid unnecessary
complexity and maintain consistency with the current backend.

### Coordinates and multi-page clauses

Coordinates must be traceable to the original PDF page. Do not invent
coordinates.

If the extraction output contains word-level bounding boxes, preserve or
associate the relevant boxes with the clause text. If only page-level
text exists, preserve the page number and use a consistent null/empty
representation for unavailable coordinates.

For a clause spanning multiple pages, retain all relevant page
references and coordinates rather than pretending it belongs to only one
page.

### Uncertainty and review

Use a conservative approach. If a boundary cannot be determined
reliably:

-   Keep the relevant original text.
-   Mark the output as needing review.
-   Do not silently force a potentially incorrect split.

Do not claim a confidence score unless a real, justified scoring method
exists. A boolean `needs_review` may be sufficient for the acceptance
criterion.

## 8. Testing expectations for BE-05

Create a dedicated test module, preferably:

`tests/test_clause_splitter.py`

Test at least:

1.  Detection of clauses.
2.  Detection of subclauses.
3.  Preservation of original numbering.
4.  Unique clause IDs.
5.  Exact preservation of original text.
6.  Preservation of page numbers.
7.  Preservation of coordinates when supplied.
8.  Handling of clauses spanning multiple pages.
9.  Ambiguous/uncertain boundaries being flagged for review.
10. Empty or missing text behavior.
11. Compatibility with the actual digital extraction output.
12. Compatibility with the actual OCR output from BE-04.

Use small synthetic test inputs for unit tests. Do not rely only on the
KUHP PDF.

Add integration tests for the actual pipeline and API as appropriate.
Run all existing and new tests:

``` bash
python -m pytest -v
```

Do not skip, delete, or weaken existing tests just to make the suite
pass.

## 9. Working style and constraints

The user prefers beginner-friendly, step-by-step guidance and wants to
understand the implementation. However, the user is asking the coding
agent to perform the implementation.

For the agent:

-   First inspect the repository and summarize the current BE-03/BE-04
    interfaces.
-   Then propose a concise implementation plan.
-   Implement BE-05 in small, reviewable changes.
-   Keep existing BE-02/BE-03/BE-04 functionality intact.
-   Do not duplicate OCR or PDF extraction logic.
-   Avoid unnecessary dependencies.
-   Follow the existing code style and project architecture.
-   Explain important design decisions in the final report.
-   Do not claim acceptance criteria are satisfied unless tests verify
    them.

### Git and remote restrictions

-   Work locally only.
-   Do not push to GitHub.
-   Do not push branches, commits, or tags.
-   Do not force-push.
-   Do not rewrite existing commit history.
-   Do not delete existing branches.
-   Do not discard uncommitted changes.
-   Do not automatically merge BE-05 into `main`.

If the working tree is dirty, the branch is unexpected, or the BE-04
integration is unclear, stop and report the situation before proceeding.

## 10. Final report expected

When BE-05 is implemented, report:

1.  Current branch and Git status.
2.  Files created and modified.
3.  How the actual BE-04 output is consumed.
4.  Clause-splitting strategy and supported legal structures.
5.  How clause IDs are generated and whether they remain stable.
6.  How original text, numbering, page numbers, and coordinates are
    preserved.
7.  How uncertain clauses are flagged.
8.  API endpoint and example response, if an endpoint was added.
9.  Test counts and results, including existing regression tests.
10. Known limitations and remaining issues.
11. Confirmation that nothing was pushed to GitHub and BE-05 was not
    merged into `main`.

**Priority order:** preserve legal text accurately, integrate correctly
with BE-04, satisfy the acceptance criteria, and keep the implementation
maintainable.
