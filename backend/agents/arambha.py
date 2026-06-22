"""
Arambha (ఆరంభ) — Orchestrator / Intake agent.
Classifies document type and extracts parties, jurisdiction, key terms.
Uses GROQ_MODEL_FLASH (llama-3.1-8b-instant).
"""

import json
from typing import Any, Literal

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field, field_validator

from api.config import settings
from api.constants import GROQ_MODEL_FLASH
from graph.state import VaakyaState

_llm = ChatGroq(model=GROQ_MODEL_FLASH, api_key=settings.GROQ_API_KEY, temperature=0)

_SYSTEM_PROMPT = """You are Arambha, the intake agent for Vaakya — an Indian legal document system.

Your job is to analyze the user's request and extract structured information.

Rules:
- jurisdiction defaults to "India" unless the user specifies otherwise
- Cite the Indian Contract Act 1872 as the governing law by default
- document_type must be one of: NDA, Vendor Agreement, Employment Agreement,
  Service Agreement, Lease Agreement, Partnership Deed, MOU, Other
- sub_graph must be one of: new_doc, redline, dispute
  - new_doc: user wants a new document drafted
  - redline: user uploaded a document to review/negotiate
  - dispute: user has a legal dispute to resolve

Return ONLY a valid JSON object with these exact keys:
{
  "document_type": "<string>",
  "parties": [{"name": "<string>", "role": "<string>"}, ...],
  "jurisdiction": "<string>",
  "key_terms": {"duration": "<string>", "governing_law": "<string>"},
  "sub_graph": "new_doc" | "redline" | "dispute"
}
parties MUST be a JSON array of objects, NOT a string. No extra text outside the JSON."""


class Party(BaseModel):
    name: str
    role: str   # e.g. "Disclosing Party", "Receiving Party", "Employer", "Employee"


class ArambhaOutput(BaseModel):
    document_type: str = Field(description="Type of legal document")
    parties: list[Party] = Field(description="Parties involved in the document")
    jurisdiction: str = Field(default="India")
    key_terms: dict = Field(description="Key terms extracted: duration, governing_law, etc.")
    sub_graph: Literal["new_doc", "redline", "dispute"] = Field(default="new_doc")

    @field_validator("parties", mode="before")
    @classmethod
    def parse_parties(cls, v: Any) -> Any:
        # llama-3.1-8b-instant sometimes serializes arrays as JSON strings
        if isinstance(v, str):
            return json.loads(v)
        return v

    @field_validator("key_terms", mode="before")
    @classmethod
    def parse_key_terms(cls, v: Any) -> Any:
        if isinstance(v, str):
            return json.loads(v)
        return v


_structured_llm = _llm.with_structured_output(ArambhaOutput, method="json_mode")


async def run_arambha(state: VaakyaState) -> dict:
    human_message = f"""User request:
{state["raw_input"]}

Input mode: {state.get("input_mode", "text")}
"""
    try:
        result: ArambhaOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", human_message),
        ])
        return {
            "document_type": result.document_type,
            "parties": [p.model_dump() for p in result.parties],
            "jurisdiction": result.jurisdiction,
            "key_terms": result.key_terms,
            "sub_graph": result.sub_graph,
        }
    except Exception as exc:
        return {
            "document_type": "Unknown",
            "parties": [],
            "jurisdiction": "India",
            "key_terms": {},
            "sub_graph": "new_doc",
            "errors": [f"Arambha error: {exc}"],
        }
