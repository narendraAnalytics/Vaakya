"""
PDF text extraction using PyMuPDF (fitz), with page labels for clause traceability.
Page labels let agents cite exact locations (e.g. "Page 3", "Page iv") in risk flags.
"""

import fitz  # PyMuPDF


def extract_text(pdf_bytes: bytes, *, max_pages: int = 50) -> str:
    """
    Extract text from PDF bytes.
    Prefixes each page with '[Page N]' so agents can cite clause locations.
    Raises ValueError on image-only (no extractable text) PDFs.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages_text: list[str] = []
    page_labels = doc.get_page_labels() or []

    for i, page in enumerate(doc):
        if i >= max_pages:
            break
        text = page.get_text("text").strip()
        if text:
            label = page_labels[i] if i < len(page_labels) else str(i + 1)
            pages_text.append(f"[Page {label}]\n{text}")

    doc.close()

    if not pages_text:
        raise ValueError(
            "No extractable text found. This may be a scanned image PDF. "
            "Please upload a text-based PDF."
        )
    return "\n\n".join(pages_text)


def extract_metadata(pdf_bytes: bytes) -> dict:
    """Return basic PDF metadata (title, author, page count)."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    meta = doc.metadata or {}
    page_count = doc.page_count
    doc.close()
    return {
        "title":      meta.get("title", ""),
        "author":     meta.get("author", ""),
        "page_count": page_count,
    }
