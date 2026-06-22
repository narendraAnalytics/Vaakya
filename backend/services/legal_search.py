"""
Legal Search Service — Tavily-powered Indian law retrieval.
Called by Jokhim (risk analysis) and Vivada (dispute resolution) to ground
their LLM reasoning with current Indian legal references.

Pattern: fetch THEN inject into prompt — not LangChain bind_tools.
Returns [] on any failure so callers degrade gracefully.
"""

from tavily import TavilyClient

from api.config import settings

LEGAL_DOMAINS = [
    "indiankanoon.org",
    "barandbench.com",
    "livelaw.in",
    "scconline.com",
    "indiacode.nic.in",
    "msme.gov.in",
]

TAVILY_SCORE_THRESHOLD = 0.40  # lower than generic search — legal is a niche domain

_RESEARCH_KEYWORDS = frozenset({
    "dpdpa", "data protection", "privacy", "personal data",
    "gst", "tax",
    "msme", "msmed",
    "labour", "labor",
    "arbitration",
    "dispute",
    "regulatory", "compliance",
    "intellectual property", "trademark", "copyright", "patent",
    "insurance", "banking", "nbfc", "rbi",
    "franchise", "technology transfer",
})


def needs_legal_research(document_type: str) -> bool:
    """True if doc_type warrants a live Tavily search; False for standard contracts."""
    doc_lower = document_type.lower()
    return any(kw in doc_lower for kw in _RESEARCH_KEYWORDS)


def search_indian_law(query: str, max_results: int = 5) -> list[dict]:
    """
    Search Indian legal sources via Tavily.
    Returns list of {url, content, score} dicts sorted by score descending.
    Returns [] if API key missing or search fails — callers must handle this.
    """
    if not settings.TAVILY_API_KEY:
        return []
    try:
        client = TavilyClient(api_key=settings.TAVILY_API_KEY)
        response = client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",
            include_domains=LEGAL_DOMAINS,
        )
        results = response.get("results", [])
        filtered = [
            {
                "url":     r["url"],
                "content": r["content"][:600],   # cap to keep prompt size manageable
                "score":   float(r.get("score", 0.0)),
            }
            for r in results
            if float(r.get("score", 0.0)) >= TAVILY_SCORE_THRESHOLD
        ]
        return sorted(filtered, key=lambda x: x["score"], reverse=True)
    except Exception:
        return []


def format_refs_block(refs: list[dict]) -> str:
    """Format Tavily results into a prompt injection block."""
    if not refs:
        return ""
    lines = "\n".join(f"- [{r['url']}]: {r['content']}" for r in refs)
    return f"\n\nCURRENT LEGAL REFERENCES (live search):\n{lines}"
