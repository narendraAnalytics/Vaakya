"""
Sruthi (శ్రుతి) — Obligation Tracker agent.
Runs after HITL approval to extract every time-bound duty from the signed contract.
Obligations power future calendar alerts and WhatsApp reminders (Phase 3).
Uses GROQ_MODEL_FLASH (llama-3.1-8b-instant).
"""

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

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
Return ONLY valid JSON."""


class Obligation(BaseModel):
    party: str = Field(description="Who must perform this obligation (party name or role)")
    obligation_type: str = Field(
        description="payment | delivery | notice | reporting | compliance | renewal | non_compete | insurance | confidentiality | other"
    )
    action: str = Field(description="Plain-English description of what must be done")
    deadline: str = Field(
        description="When it must be done: exact phrase from contract or implied statutory default"
    )
    deadline_type: str = Field(
        description="absolute | relative | recurring | event_triggered"
    )
    consequence: str = Field(
        description="What happens if this obligation is not met (penalty, breach, termination, etc.)"
    )
    priority: str = Field(description="HIGH | MEDIUM | LOW")
    clause_reference: str = Field(description="Clause number or section heading")


class SruthiOutput(BaseModel):
    obligations: list[Obligation] = Field(
        description="All time-bound obligations extracted from the contract. Empty list if none found."
    )
    obligation_summary: str = Field(
        description="1-2 sentence summary: total count, highest-priority items, and nearest upcoming deadline"
    )


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
