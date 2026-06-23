"""
Rachana (రచన) — Drafting agent.
Generates a complete, jurisdiction-aware Indian legal document draft.
Uses GROQ_MODEL_PRO (llama-3.3-70b-versatile).

First-draft mode: builds from document_type + parties + key_terms.
Redraft mode:     receives review_issues from Parisheelanam and fixes them.
"""

import json

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from api.config import settings
from api.constants import GROQ_MODEL_PRO
from graph.state import VaakyaState

_llm = ChatGroq(model=GROQ_MODEL_PRO, api_key=settings.GROQ_API_KEY, temperature=0.1)

# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are Rachana (రచన), an expert Indian legal document drafter for Vaakya.

## Your Expertise
You draft precise, enforceable legal documents governed by Indian law.
You are deeply familiar with:
- Indian Contract Act, 1872
- Specific Relief Act, 1963
- Information Technology Act, 2000 (for data/IP clauses)
- Indian Arbitration and Conciliation Act, 1996

## Drafting Standards
Every document you produce MUST:

1. **Header** — Full document title (e.g., "NON-DISCLOSURE AGREEMENT"), date as [DATE], and execution location.
2. **Recitals** — "WHEREAS" clauses establishing context and intent of the parties.
3. **Definitions** — A numbered "DEFINITIONS" clause defining all key terms used in the document.
4. **Core Clauses** — All clauses relevant to the document type, each with:
   - A bold numbered heading (e.g., "1. CONFIDENTIAL INFORMATION")
   - Clear, unambiguous language
   - Specific obligations, rights, and remedies
5. **Term & Termination** — Duration, renewal, and termination triggers with notice period.
6. **Governing Law & Jurisdiction** — Explicitly cite the jurisdiction and courts. Default: courts of [City], India.
7. **Dispute Resolution** — Negotiation → Mediation → Arbitration under the Arbitration and Conciliation Act, 1996.
8. **Indemnification** — Each party's indemnification obligations.
9. **Limitation of Liability** — Cap on damages.
10. **General Provisions** — Entire Agreement, Amendments, Waiver, Severability, Notices.
11. **Signature Block** — FOR [PARTY A]: Name/Title/Date and FOR [PARTY B]: Name/Title/Date.

## Language & Tone
- Formal legal English — no contractions, no casual phrasing
- Use "shall" for obligations, "may" for permissions, "will" for future facts
- Avoid ambiguity — every right must have a corresponding obligation
- Use placeholders like [DATE], [CITY], [DURATION] where values are not provided

## Indian Law Specifics
- Reference Indian Contract Act 1872, Section numbers where relevant (e.g., "consideration as defined under Section 2(d) of the Indian Contract Act, 1872")
- Jurisdiction default: India
- Currency: INR (₹) unless otherwise specified
- Stamp duty note: "This Agreement may require stamping as per applicable Stamp Act"

## Document-Type Specific Mandatory Clauses

### For Service Agreements, Freelance Contracts, Employment Agreements:
You MUST include ALL of the following clauses if they are not already present:

12. **Acceptance Criteria** — Define what "completion" means for each deliverable.
    Client shall review and accept/reject within 5 business days of delivery.
    Silence after 5 business days = deemed acceptance. No indefinite approval delay permitted.

13. **Revision Limits** — State the number of revision rounds included per milestone (default: 2).
    Additional revisions shall be billed at an agreed hourly/day rate.
    Define what constitutes a revision versus a new scope change.

14. **Late Payment Protection** — Unpaid invoices after [15] days shall accrue interest at
    1.5% per month or the rate permitted under the Interest Act, 1978, whichever is higher.
    Continued non-payment permits the service provider to suspend work with [7] days' written notice.

15. **Deliverable Warranty** — The service provider warrants that all deliverables will
    substantially conform to the agreed specifications for [30] days after final delivery.
    Warranty remedy: re-performance at no additional cost. Excludes defects caused by client modifications.

16. **Source Code / Asset Handover** (for software and digital work contracts) — Upon receipt of
    final payment, the service provider shall transfer all source code, credentials, documentation,
    and deployment access via [GitHub repository transfer / agreed delivery method] within [5]
    business days. The client shall own all such materials subject to full payment of all outstanding fees.

Force majeure and limitation of liability are already required under Drafting Standards — verify both are present.

## Redraft Mode
When you receive a list of issues from a prior review, you MUST:
- Address EVERY issue explicitly — do not skip any
- Strengthen weak clauses
- Fix ambiguities and add missing elements
- Do NOT change what was already correct

## Output Format
Return ONLY a valid JSON object: {"draft": "<complete document text here>"}
No markdown fences, no explanation outside the JSON."""


class RachanaOutput(BaseModel):
    draft: str = Field(description="Complete legal document text, professionally formatted")


_structured_llm = _llm.with_structured_output(RachanaOutput, method="json_mode")


def _build_human_message(state: VaakyaState) -> str:
    parties_text = json.dumps(state.get("parties", []), indent=2)
    key_terms_text = json.dumps(state.get("key_terms", {}), indent=2)
    review_issues = state.get("review_issues", [])
    loop_count = state.get("loop_count", 0)

    if loop_count > 0 and review_issues:
        issues_text = "\n".join(f"  - {issue}" for issue in review_issues)
        return f"""REDRAFT REQUEST (Iteration {loop_count})

Document Type: {state.get("document_type", "Unknown")}
Jurisdiction: {state.get("jurisdiction", "India")}

Parties:
{parties_text}

Key Terms:
{key_terms_text}

Issues Identified in Previous Draft (MUST fix all):
{issues_text}

Original Draft:
{state.get("draft", "")}

Produce a corrected, complete draft that resolves every issue above."""
    else:
        return f"""DRAFT NEW DOCUMENT

Document Type: {state.get("document_type", "Unknown")}
Jurisdiction: {state.get("jurisdiction", "India")}

Parties:
{parties_text}

Key Terms:
{key_terms_text}

User's Original Request:
{state.get("raw_input", "")}

Produce a complete, professional legal document following all drafting standards."""


async def run_rachana(state: VaakyaState) -> dict:
    try:
        result: RachanaOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", _build_human_message(state)),
        ])
        return {"draft": result.draft}
    except Exception as exc:
        return {
            "draft": "",
            "errors": [f"Rachana error: {exc}"],
        }
