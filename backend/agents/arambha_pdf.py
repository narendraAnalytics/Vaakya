"""
Arambha PDF (ఆరంభ — PDF variant) — Intake agent for the redline sub-graph only.
Completely isolated from arambha.py — no shared imports, no shared LLM instances.
Extracts document_type (16 types), document_title, parties, jurisdiction, key_terms
from uploaded PDF text.
"""

import json
from typing import Any, Literal

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field, field_validator

from api.config import settings
from api.constants import GROQ_MODEL_FLASH
from graph.state import VaakyaState
from services.pdf_chunker import clean_text

_PDF_SYSTEM_PROMPT = """You are Arambha, the intake agent for Vaakya — an Indian legal document system.

You are analyzing the full text of an uploaded PDF contract. Extract structured information from it.

Rules:
- jurisdiction defaults to "India" unless stated otherwise in the document
- Cite the Indian Contract Act 1872 as the governing law by default
- document_type must be one of: NDA, Vendor Agreement, Employment Agreement,
  Service Agreement, Lease Agreement, Partnership Deed, MOU, MSA,
  IP Assignment Agreement, Loan Agreement, Legal Notice, Privacy Policy,
  Terms of Service, Non-Compete Agreement, Distribution Agreement,
  Joint Venture Agreement, Other
- document_title: extract the formal title exactly as it appears in the document heading
  (e.g. "NON-DISCLOSURE AGREEMENT between Acme Corp and TechStar Pvt Ltd").
  If no title heading is present, generate a concise one: "<document_type> between <party1> and <party2>".
  Keep it under 80 characters.
- sub_graph is always "redline" for uploaded PDFs

Return ONLY a valid JSON object with these exact keys:
{
  "document_type": "<string>",
  "document_title": "<string>",
  "parties": [{"name": "<string>", "role": "<string>"}, ...],
  "jurisdiction": "<string>",
  "key_terms": {"duration": "<string>", "governing_law": "<string>"},
  "sub_graph": "redline"
}
parties MUST be a JSON array of objects, NOT a string. No extra text outside the JSON."""


class _Party(BaseModel):
    name: str
    role: str


_ALLOWED_DOC_TYPES = {
    "NDA", "Vendor Agreement", "Employment Agreement", "Service Agreement",
    "Lease Agreement", "Partnership Deed", "MOU", "MSA",
    "IP Assignment Agreement", "Loan Agreement", "Legal Notice", "Privacy Policy",
    "Terms of Service", "Non-Compete Agreement", "Distribution Agreement",
    "Joint Venture Agreement", "Other",
}


class ArambhaPdfOutput(BaseModel):
    document_type: str = Field(default="Other")
    document_title: str = Field(default="")
    parties: list[_Party] = Field(default_factory=list)
    jurisdiction: str = Field(default="India")
    key_terms: dict = Field(default_factory=dict)
    sub_graph: Literal["redline"] = Field(default="redline")

    @field_validator("document_type", mode="before")
    @classmethod
    def constrain_doc_type(cls, v: Any) -> str:
        if isinstance(v, str) and v in _ALLOWED_DOC_TYPES:
            return v
        return "Other"

    @field_validator("parties", mode="before")
    @classmethod
    def parse_parties(cls, v: Any) -> Any:
        if isinstance(v, str):
            return json.loads(v)
        return v

    @field_validator("key_terms", mode="before")
    @classmethod
    def parse_key_terms(cls, v: Any) -> Any:
        if isinstance(v, str):
            return json.loads(v)
        return v


async def run_arambha_pdf(state: VaakyaState) -> dict:
    """PDF intake: 16 document types + document_title. Used by redline sub-graph only."""
    llm = ChatGroq(model=GROQ_MODEL_FLASH, api_key=settings.GROQ_API_KEY, temperature=0)
    structured_llm = llm.with_structured_output(ArambhaPdfOutput, method="json_mode")

    # Clean and trim for classification — raw_input in state is left untouched
    # so downstream agents (samjoota, jokhim) still receive the full extracted text.
    classification_text = clean_text(state["raw_input"])
    if len(classification_text) > 8000:
        classification_text = classification_text[:8000]

    human_message = f"""Uploaded PDF text:
{classification_text}
"""
    try:
        result: ArambhaPdfOutput = await structured_llm.ainvoke([
            ("system", _PDF_SYSTEM_PROMPT),
            ("human", human_message),
        ])
        return {
            "document_type":  result.document_type,
            "document_title": result.document_title,
            "parties":        [p.model_dump() for p in result.parties],
            "jurisdiction":   result.jurisdiction,
            "key_terms":      result.key_terms,
            "sub_graph":      result.sub_graph,
        }
    except Exception as exc:
        return {
            "document_type":  "Unknown",
            "document_title": "",
            "parties":        [],
            "jurisdiction":   "India",
            "key_terms":      {},
            "sub_graph":      "redline",
            "errors":         [f"Arambha PDF error: {exc}"],
        }
