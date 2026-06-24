"""
Supabase Storage helpers for Vaakya.
Bucket: vaakya-contracts  — path: {user_id}/{document_id}.pdf
"""

from services.supabase_client import get_supabase

_BUCKET = "vaakya-contracts"
_UPLOADS_BUCKET = "vaakya-uploads"


def upload_pdf(user_id: str, document_id: str, data: bytes) -> str:
    """Upload a PDF to vaakya-contracts. Returns the storage path."""
    path = f"{user_id}/{document_id}.pdf"
    get_supabase().storage.from_(_BUCKET).upload(
        path, data, {"content-type": "application/pdf", "upsert": "true"}
    )
    return path


def get_signed_url(path: str, expires_in: int = 3600) -> str:
    """Return a signed download URL (default 1 hour)."""
    res = get_supabase().storage.from_(_BUCKET).create_signed_url(path, expires_in)
    # SDK v2 returns 'signedUrl'; v1 returned 'signedURL' — handle both
    return res.get("signedUrl") or res.get("signedURL") or ""


def upload_user_pdf(user_id: str, document_id: str, data: bytes) -> str:
    """Upload a user-provided PDF (redline flow) to vaakya-uploads."""
    path = f"{user_id}/{document_id}.pdf"
    get_supabase().storage.from_(_UPLOADS_BUCKET).upload(
        path, data, {"content-type": "application/pdf", "upsert": "true"}
    )
    return path
