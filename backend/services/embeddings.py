"""
Embeddings Service — BGE model + Supabase pgvector clause retrieval.

RAG STUB: search_clauses() returns [] until the Supabase pgvector schema
('clause_library' table + match_clauses RPC function) is provisioned.
Wire into new_doc graph between arambha and rachana in Phase 3.

Usage (Phase 3):
    from services.embeddings import search_clauses
    clauses = await search_clauses(query, document_type)
    # inject into Rachana's human message as "RELEVANT CLAUSES:" block
"""

from sentence_transformers import SentenceTransformer

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("BAAI/bge-small-en-v1.5")
    return _model


def embed(text: str) -> list[float]:
    """Embed a single text string using BGE-small."""
    return get_model().encode(text).tolist()


async def search_clauses(
    query: str,
    document_type: str,
    top_k: int = 5,
) -> list[dict]:
    """
    Search Supabase pgvector for relevant clauses matching the query.

    Returns list of {clause_text, clause_type, document_type, similarity} dicts.
    Returns [] until pgvector schema is provisioned (Phase 3).

    Phase 3 implementation:
        from services.supabase_client import get_supabase
        query_vec = embed(query)
        supabase = get_supabase()
        result = supabase.rpc(
            "match_clauses",
            {
                "query_embedding": query_vec,
                "filter_document_type": document_type,
                "match_count": top_k,
            },
        ).execute()
        return result.data or []
    """
    # TODO: implement when Supabase pgvector table + RPC are ready
    return []
