"""
Embeddings Service — BGE model + Supabase pgvector clause retrieval.

Usage:
    from services.embeddings import search_clauses
    clauses = await search_clauses(query, document_type)
    # returns list of {id, document_type, clause_name, clause_text, jurisdiction, similarity}
"""

import asyncio
from functools import lru_cache
from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer("BAAI/bge-small-en-v1.5")


def embed(text: str) -> list[float]:
    """Embed a single text string using BGE-small. Returns 384-dim vector."""
    return get_model().encode(text, normalize_embeddings=True).tolist()


async def search_clauses(
    query: str,
    document_type: str | None = None,
    top_k: int = 5,
    threshold: float = 0.3,
) -> list[dict]:
    """
    Semantic search over clause_library via Supabase pgvector match_clauses RPC.

    Returns list of {id, document_type, clause_name, clause_text, jurisdiction, similarity}.
    Returns [] gracefully if the table is empty or RPC fails.
    """
    try:
        from services.supabase_client import get_supabase

        # Embed in thread pool — SentenceTransformer is sync/CPU-bound
        loop = asyncio.get_event_loop()
        query_vec = await loop.run_in_executor(None, embed, query)

        supabase = get_supabase()
        result = supabase.rpc(
            "match_clauses",
            {
                "query_embedding": query_vec,
                "filter_document_type": document_type,
                "match_count": top_k,
                "match_threshold": threshold,
            },
        ).execute()

        return result.data or []

    except Exception as exc:
        # Degrade gracefully — clause search is enhancement, not blocker
        import logging
        logging.getLogger(__name__).warning("search_clauses failed: %s", exc)
        return []
