
import pymupdf


def extract_pdf_text(pdf_path: str) -> list[dict]:
    """
    Extract text and word coordinates from a PDF, page by page.
    """

    extracted_pages = []

    with pymupdf.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf, start=1):
            try:
                # Extract the page's text
                text = page.get_text("text").strip()

                # Extract individual words and their coordinates
                raw_words = page.get_text("words")

                words = [
                    {
                        "word": word[4],
                        "bbox": list(word[:4])
                    }
                    for word in raw_words
                ]

                extracted_pages.append({
                    "page_number": page_number,
                    "extraction_method": "pdf_text",
                    "text": text,
                    "words": words,
                    "confidence": None,
                    "needs_review": not bool(text),
                    "status": "success" if text else "empty",
                    "error": None
                })

            except Exception as exc:
                extracted_pages.append({
                    "page_number": page_number,
                    "extraction_method": "pdf_text",
                    "text": "",
                    "words": [],
                    "confidence": None,
                    "needs_review": True,
                    "status": "failed",
                    "error": str(exc)
                })

    return extracted_pages
