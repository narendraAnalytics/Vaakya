"""
PDF text chunker for legal documents.
Cleans extracted text, splits into logical sections, and packs into token-safe batches
for multi-call LLM processing without truncation.

Only used by the redline (PDF upload) flow — the text-based new_doc flow never calls this.
"""

import re
from collections import Counter
from dataclasses import dataclass


@dataclass
class PDFSection:
    header: str
    text: str
    pages: str
    char_count: int


_PAGE_LABEL_RE = re.compile(r'\[Page ([^\]]+)\]')

_PAGE_NUM_RE = re.compile(r'^\s*(?:Page\s+)?\d+\s*(?:of\s+\d+)?\s*$', re.IGNORECASE)

# Matches Indian legal contract section openers (ARTICLE, SECTION, CLAUSE, WHEREAS, numbered)
_SECTION_RE = re.compile(
    r'^(?:'
    r'(?:ARTICLE|SECTION|CLAUSE|SCHEDULE|EXHIBIT|ANNEXURE|APPENDIX)\s+[\dIVXivx]+[.\s]'
    r'|(?:NOW[,\s]+THEREFORE|WHEREAS|IN\s+WITNESS\s+WHEREOF|RECITALS?)'
    r'|\d+\.\s{1,3}[A-Z]{2}'      # "1.  DEFINITIONS" — all-caps heading
    r'|\d+\.\d+\s{1,3}[A-Z]{2}'  # "1.1  CONFIDENTIAL INFORMATION"
    r')',
    re.MULTILINE | re.IGNORECASE,
)


def clean_text(text: str) -> str:
    """Remove running headers/footers, standalone page numbers, and excess whitespace.

    Preserves [Page N] markers inserted by pdf_extractor.py for clause traceability.
    Does NOT modify the caller's raw_input state field — call this locally.
    """
    lines = text.split('\n')

    # Lines < 80 chars appearing 3+ times across pages → running header/footer
    short_lines = [l.strip() for l in lines if l.strip() and len(l.strip()) < 80]
    repeats = {line for line, count in Counter(short_lines).items() if count >= 3}

    cleaned: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped in repeats:
            continue
        if _PAGE_NUM_RE.match(stripped):
            continue
        cleaned.append(line)

    # Collapse 3+ consecutive blank lines to 2
    result = re.sub(r'\n{3,}', '\n\n', '\n'.join(cleaned))
    return result.strip()


def split_sections(text: str) -> list[PDFSection]:
    """Split cleaned text into logical legal sections.

    Falls back to a single full-document section if no standard headers are found
    (handles non-standard or plain-format contracts).
    """
    matches = list(_SECTION_RE.finditer(text))

    if not matches:
        pages = _PAGE_LABEL_RE.findall(text)
        return [PDFSection(
            header="Full Document",
            text=text,
            pages=_page_range(pages),
            char_count=len(text),
        )]

    sections: list[PDFSection] = []

    # Preamble/parties block before the first detected section (if substantial)
    if matches[0].start() > 200:
        preamble = text[:matches[0].start()].strip()
        pages = _PAGE_LABEL_RE.findall(preamble)
        sections.append(PDFSection(
            header="Preamble / Parties",
            text=preamble,
            pages=_page_range(pages),
            char_count=len(preamble),
        ))

    for i, match in enumerate(matches):
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section_text = text[start:end].strip()

        newline_pos = section_text.find('\n')
        header = section_text[:newline_pos].strip() if newline_pos > 0 else section_text[:80]

        pages = _PAGE_LABEL_RE.findall(section_text)
        sections.append(PDFSection(
            header=header,
            text=section_text,
            pages=_page_range(pages),
            char_count=len(section_text),
        ))

    return sections


def pack_batches(sections: list[PDFSection], max_chars: int = 5500) -> list[list[PDFSection]]:
    """Greedy bin-pack sections into batches that stay within max_chars.

    A single oversized section is placed in its own batch (never split mid-clause).
    """
    batches: list[list[PDFSection]] = []
    current: list[PDFSection] = []
    current_chars = 0

    for section in sections:
        if current and current_chars + section.char_count > max_chars:
            batches.append(current)
            current = [section]
            current_chars = section.char_count
        else:
            current.append(section)
            current_chars += section.char_count

    if current:
        batches.append(current)

    return batches


def batch_text(batch: list[PDFSection]) -> str:
    """Render a batch of sections into a single string with section headings for the LLM.

    The ### headers give agents precise clause_reference values without guessing.
    """
    return "\n\n---\n\n".join(
        f"### {s.header} [Pages {s.pages}]\n{s.text}"
        for s in batch
    )


def _page_range(pages: list[str]) -> str:
    if not pages:
        return "?"
    return pages[0] if len(pages) == 1 else f"{pages[0]}–{pages[-1]}"
