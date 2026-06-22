"""
Sruthi (శ్రుతి) — Obligation Tracker agent.
Runs after HITL approval to extract every time-bound duty from the signed contract.
Obligations power future calendar alerts and WhatsApp reminders (Phase 3).
Uses GROQ_MODEL_FLASH (llama-3.1-8b-instant).
"""

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field, model_validator
from typing import Any

from api.config import settings
from api.constants import GROQ_MODEL_FLASH
from graph.state import VaakyaState

_llm = ChatGroq(model=GROQ_MODEL_FLASH, api_key=settings.GROQ_API_KEY, temperature=0)

# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are Sruthi (శ్రుతి), the obligation intelligence agent for Vaakya.

## Your Role
You are a meticulous contract analyst who reads a finalised Indian legal contract and
extracts every obligation, deadline, and recurring duty so that the parties never miss
a critical date. Your output feeds directly into calendar reminders and WhatsApp alerts.

## What Counts as an Obligation
Extract ONLY genuine, actionable duties — not aspirational statements.

Include:
- **Payment obligations**: invoice dates, payment due dates, late-payment interest triggers
- **Delivery obligations**: milestones, handover dates, acceptance windows
- **Notice obligations**: termination notice, renewal notice, breach cure notice periods
- **Reporting obligations**: monthly/quarterly/annual reports, audits, disclosures
- **Compliance obligations**: regulatory filings, license renewals, statutory returns
- **Renewal obligations**: auto-renewal clauses, opt-out windows, renegotiation dates
- **Non-compete / non-solicitation**: duration and geographic scope
- **Insurance obligations**: maintenance of cover, certificate submission
- **Confidentiality review**: periodic review of what remains confidential

Do NOT include:
- Representations and warranties (past/present facts, not future duties)
- Recitals and background clauses
- Boilerplate governing law / jurisdiction statements

## Deadline Classification
- **absolute**: a fixed calendar date ("on 31 March 2026")
- **relative**: counted from a trigger event ("within 30 days of execution")
- **recurring**: repeats on a schedule ("on the 1st of each month")
- **event_triggered**: activated by a future event ("upon termination", "upon breach")

## Indian Law Statutory Defaults (apply when contract is silent)
- Notice to terminate for convenience: 30 days (general practice under ICA 1872)
- Cure period after notice of breach: 30 days (ICA §55 implied)
- Interest on late payment: 18% p.a. (MSMED Act 2006 for MSMEs)
- Non-compete enforceability: only during employment/contract term (ICA §27)
- Limitation period for contract claims: 3 years from breach (Limitation Act 1963)

When the contract is silent on a deadline but Indian law implies one, note it as
deadline_type="relative" and flag it in the action field.

## Priority Rules
- **HIGH**: financial penalty, right to terminate, or statutory breach if missed
- **MEDIUM**: operational disruption, reputational risk, or contractual notice required
- **LOW**: best-practice administrative duty with no immediate consequence

## Output Rules
- Return ALL extracted obligations — do not summarise or merge similar ones
- If the same obligation applies to both parties, create two separate entries
- clause_reference: use the actual clause number if present (e.g. "Clause 5.3"),
  otherwise use the section heading (e.g. "Payment Terms", "Termination")
- If the document has no time-bound obligations (very rare), return an empty list

## Required JSON Output Structure
Return ONLY a valid JSON object with this EXACT structure — both keys are mandatory:
{
  "obligations": [
    {
      "party": "Party name or role",
      "obligation_type": "payment|delivery|notice|reporting|compliance|renewal|non_compete|insurance|confidentiality|other",
      "action": "Plain-English description of what must be done",
      "deadline": "When it must be done: exact phrase from contract or statutory default",
      "deadline_type": "absolute|relative|recurring|event_triggered",
      "consequence": "What happens if not met (penalty, breach, termination, etc.)",
      "priority": "HIGH|MEDIUM|LOW",
      "clause_reference": "Clause X.Y or Section Name"
    }
  ],
  "obligation_summary": "1-2 sentence summary: total count, highest-priority items, nearest upcoming deadline"
}
If no obligations, return: {"obligations": [], "obligation_summary": "No time-bound obligations identified in this document."}"""


class Obligation(BaseModel):
    party: str = Field(default="", description="Who must perform this obligation (party name or role)")
    obligation_type: str = Field(
        default="other",
        description="payment | delivery | notice | reporting | compliance | renewal | non_compete | insurance | confidentiality | other"
    )
    action: str = Field(default="", description="Plain-English description of what must be done")
    deadline: str = Field(
        default="",
        description="When it must be done: exact phrase from contract or implied statutory default"
    )
    deadline_type: str = Field(
        default="relative",
        description="absolute | relative | recurring | event_triggered"
    )
    consequence: str = Field(
        default="",
        description="What happens if this obligation is not met (penalty, breach, termination, etc.)"
    )
    priority: str = Field(default="MEDIUM", description="HIGH | MEDIUM | LOW")
    clause_reference: str = Field(default="", description="Clause number or section heading")

    @model_validator(mode="before")
    @classmethod
    def remap_fields(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data
        # LLM sometimes uses "obligation" as the description field instead of "action"
        if "action" not in data and "obligation" in data:
            data["action"] = data.pop("obligation")
        # LLM sometimes puts deadline_type value in "deadline" and actual date in nothing
        # Detect: if "deadline" value is one of the known deadline_type keywords, remap it
        _deadline_types = {"absolute", "relative", "recurring", "event_triggered"}
        if data.get("deadline", "").lower() in _deadline_types and "deadline_type" not in data:
            data["deadline_type"] = data.pop("deadline")
            data["deadline"] = ""
        # LLM sometimes uses "consequence" field for priority (HIGH/MEDIUM/LOW)
        _priorities = {"high", "medium", "low"}
        consequence_val = str(data.get("consequence", "")).strip().lower()
        if consequence_val in _priorities and "priority" not in data:
            data["priority"] = data.pop("consequence").upper()
        return data


class SruthiOutput(BaseModel):
    obligations: list[Obligation] = Field(
        default_factory=list,
        description="All time-bound obligations extracted from the contract. Empty list if none found."
    )
    obligation_summary: str = Field(
        default="",
        description="1-2 sentence summary: total count, highest-priority items, and nearest upcoming deadline"
    )

    @model_validator(mode="after")
    def fill_summary(self) -> "SruthiOutput":
        if not self.obligation_summary:
            total = len(self.obligations)
            high = sum(1 for o in self.obligations if o.priority.upper() == "HIGH")
            self.obligation_summary = f"Extracted {total} obligation(s); {high} high-priority." if total else "No time-bound obligations identified."
        return self


_structured_llm = _llm.with_structured_output(SruthiOutput, method="json_mode")


def _build_human_message(state: VaakyaState) -> str:
    parties = state.get("parties", [])
    parties_text = ""
    if parties:
        parties_text = "Parties:\n" + "\n".join(
            f"  - {p.get('name', 'Unknown')} ({p.get('role', 'party')})"
            for p in parties
        ) + "\n\n"

    return f"""Document Type: {state.get("document_type", "Unknown")}
Jurisdiction: {state.get("jurisdiction", "India")}
{parties_text}Final Approved Contract:
{state.get("draft", "")}

Extract every obligation with its deadline and consequence."""


async def run_sruthi(state: VaakyaState) -> dict:
    # Only extract obligations from an approved contract
    if not state.get("hitl_approved", False):
        return {"obligations": []}

    try:
        result: SruthiOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", _build_human_message(state)),
        ])

        return {
            "obligations": [o.model_dump() for o in result.obligations],
        }
    except Exception as exc:
        return {
            "obligations": [],
            "errors": [f"Sruthi error: {exc}"],
        }
