"""
Sahee (సహీ) — Export & Vault Agent.
Runs after HITL approval. Generates the contract PDF, uploads to Supabase Storage,
and creates the vault record.
Uses GROQ_MODEL_FLASH (llama-3.1-8b-instant).
"""

import uuid

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from api.config import settings
from api.constants import GROQ_MODEL_FLASH
from graph.state import VaakyaState
from services.doc_generator import generate_contract_pdf
from services.storage import get_signed_url, upload_pdf

_llm = ChatGroq(model=GROQ_MODEL_FLASH, api_key=settings.GROQ_API_KEY, temperature=0)

# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are Sahee (సహీ), the export and vault agent for Vaakya.

## Your Role
You prepare the final approved contract for storage in the Vaakya contract vault.
Your output appears on the vault dashboard card that the SMB owner sees.

## Tasks
1. Generate a **formal document title** — the official name of the contract
   Format: "<Document Type> — <Party A> & <Party B>"
   Example: "Non-Disclosure Agreement — TechCorp Pvt Ltd & Sunrise Innovations Pvt Ltd"

2. Generate a **vault summary** — 2-3 sentences for the vault card
   Cover: what the contract is, who the parties are, key commercial terms, effective date,
   governing law (Indian Contract Act, 1872), and jurisdiction.
   Write in plain English that a non-lawyer SMB owner can immediately understand.

Keep the title concise (under 80 characters). Keep the summary under 80 words.
Return ONLY valid JSON."""


class SaheeOutput(BaseModel):
    document_title: str = Field(description="Formal title of the contract (under 80 chars)")
    vault_summary: str = Field(description="2-3 sentence summary for the vault card (under 80 words)")


_structured_llm = _llm.with_structured_output(SaheeOutput, method="json_mode")


def _fallback_title(state: VaakyaState) -> str:
    parties = state.get("parties", [])
    names = [p.get("name", "") for p in parties[:2]]
    doc_type = state.get("document_type", "Agreement")
    return f"{doc_type} — {' & '.join(n for n in names if n)}" if names else doc_type


def _build_human_message(state: VaakyaState) -> str:
    parties = state.get("parties", [])
    parties_text = ", ".join(
        f"{p.get('name', 'Unknown')} ({p.get('role', 'party')})"
        for p in parties
    ) if parties else "Parties not specified"

    key_terms = state.get("key_terms", {})
    terms_text = "; ".join(f"{k}: {v}" for k, v in key_terms.items()) if key_terms else ""

    return f"""Document Type: {state.get("document_type", "Agreement")}
Jurisdiction: {state.get("jurisdiction", "India")}
Parties: {parties_text}
{f"Key Terms: {terms_text}" if terms_text else ""}

Contract (first 800 chars for context):
{state.get("draft", "")[:800]}

Generate the formal document title and vault summary."""


async def run_sahee(state: VaakyaState) -> dict:
    vault_id = str(uuid.uuid4())
    document_title = _fallback_title(state)

    # ── 1. Generate title + vault summary via LLM ──────────────────────────────
    try:
        result: SaheeOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", _build_human_message(state)),
        ])
        document_title = result.document_title or document_title
    except Exception as exc:
        print(f"[WARN] Sahee LLM error (using fallback title): {exc}")

    # ── 2. Generate PDF ────────────────────────────────────────────────────────
    final_pdf_url = ""
    try:
        pdf_bytes = generate_contract_pdf(state, document_title)

        if settings.DEV_AUTH_BYPASS:
            print(f"[DEV] PDF generated ({len(pdf_bytes):,} bytes); upload skipped (DEV_AUTH_BYPASS)")
        else:
            storage_path = upload_pdf(state["user_id"], vault_id, pdf_bytes)
            final_pdf_url = get_signed_url(storage_path)

    except Exception as exc:
        print(f"[WARN] Sahee PDF generation/upload error: {exc}")
        return {
            "vault_id": vault_id,
            "esign_status": "pending_signature",
            "final_pdf_url": "",
            "errors": [f"Sahee PDF error: {exc}"],
        }

    return {
        "vault_id": vault_id,
        "esign_status": "pending_signature",
        "final_pdf_url": final_pdf_url,
    }
