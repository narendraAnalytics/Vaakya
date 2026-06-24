"""
Vault routes — contract library for the authenticated user.

GET /vault          → list all signed/pending vault cards (newest first)
GET /vault/{id}     → full detail: metadata + draft preview + obligations + fresh PDF URL
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from api.config import settings
from api.middleware.auth import get_current_user
from services.storage import get_signed_url
from services.supabase_client import get_supabase

router = APIRouter()


# ── Response models ───────────────────────────────────────────────────────────

class VaultCard(BaseModel):
    id: str
    document_id: str
    document_type: str
    parties: list[dict]
    jurisdiction: str
    status: str
    final_pdf_url: str
    created_at: str
    risk_flags: list = []


class ObligationItem(BaseModel):
    party: str = ""
    obligation_type: str = ""
    action: str = ""
    deadline: str = ""
    priority: str = "MEDIUM"
    clause_reference: str = ""


class VaultDetail(BaseModel):
    vault_id: str
    document_id: str
    document_type: str
    parties: list[dict]
    jurisdiction: str
    esign_status: str
    pdf_url: str
    draft_preview: str
    obligations: list[ObligationItem]
    created_at: str
    updated_at: str


# ── Helper ────────────────────────────────────────────────────────────────────

def _try_get_pdf_url(user_id: str, vault_id: str) -> str:
    """Return a fresh 1-hour signed URL for the vault PDF, or '' on any error."""
    try:
        return get_signed_url(f"{user_id}/{vault_id}.pdf")
    except Exception:
        return ""


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[VaultCard])
async def list_vault(
    user_id: str = Depends(get_current_user),
) -> list[VaultCard]:
    """
    List all vault documents for the authenticated user, newest first.
    Returns an empty list in DEV_AUTH_BYPASS mode (no real rows exist).
    """
    if settings.DEV_AUTH_BYPASS:
        return []

    try:
        rows = (
            get_supabase()
            .table("vault_documents")
            .select("*")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .execute()
        ).data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch vault: {exc}",
        )

    return [
        VaultCard(
            id=row["id"],
            document_id=row.get("document_id", ""),
            document_type=row.get("document_type", ""),
            parties=row.get("parties") or [],
            jurisdiction=row.get("jurisdiction", "India"),
            status=row.get("esign_status", "processing"),
            final_pdf_url=_try_get_pdf_url(user_id, row["id"]),
            created_at=row.get("updated_at", ""),
            risk_flags=[],
        )
        for row in rows
    ]


@router.get("/{vault_id}", response_model=VaultDetail)
async def get_vault_item(
    vault_id: str,
    user_id: str = Depends(get_current_user),
) -> VaultDetail:
    """
    Full vault document detail: metadata, draft preview, obligations, fresh PDF URL.
    RLS on vault_documents ensures users can only see their own documents.
    """
    if settings.DEV_AUTH_BYPASS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vault not available in dev mode (DEV_AUTH_BYPASS=true).",
        )

    sb = get_supabase()

    # Vault record
    try:
        vault_rows = (
            sb.table("vault_documents")
            .select("*")
            .eq("id", vault_id)
            .eq("user_id", user_id)
            .execute()
        ).data
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc))

    if not vault_rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vault document not found.",
        )

    row = vault_rows[0]
    doc_id = row.get("document_id", "")

    # Draft preview + created_at from documents table
    doc: dict = {}
    if doc_id:
        try:
            doc_rows = (
                sb.table("documents")
                .select("draft, created_at")
                .eq("id", doc_id)
                .eq("user_id", user_id)
                .execute()
            ).data
            doc = doc_rows[0] if doc_rows else {}
        except Exception:
            pass

    draft = doc.get("draft", "")
    draft_preview = (draft[:500] + "…") if len(draft) > 500 else draft

    # Obligations
    obligations: list[ObligationItem] = []
    if doc_id:
        try:
            obl_rows = (
                sb.table("obligations")
                .select("party, obligation_type, action, deadline, priority, clause_reference")
                .eq("document_id", doc_id)
                .eq("user_id", user_id)
                .execute()
            ).data or []
            obligations = [
                ObligationItem(
                    party=obl.get("party", ""),
                    obligation_type=obl.get("obligation_type", ""),
                    action=obl.get("action", ""),
                    deadline=obl.get("deadline", ""),
                    priority=obl.get("priority", "MEDIUM"),
                    clause_reference=obl.get("clause_reference", ""),
                )
                for obl in obl_rows
            ]
        except Exception:
            pass

    return VaultDetail(
        vault_id=vault_id,
        document_id=doc_id,
        document_type=row.get("document_type", ""),
        parties=row.get("parties") or [],
        jurisdiction=row.get("jurisdiction", "India"),
        esign_status=row.get("esign_status", ""),
        pdf_url=_try_get_pdf_url(user_id, vault_id),
        draft_preview=draft_preview,
        obligations=obligations,
        created_at=doc.get("created_at", ""),
        updated_at=row.get("updated_at", ""),
    )
