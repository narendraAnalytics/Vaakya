"""
Vivada (వివాద) — Dispute Resolution Agent.
Runs in the dispute sub-graph. Analyses the dispute, determines the legal position,
recommends the resolution path, and drafts a legal notice if needed.
Uses GROQ_MODEL_PRO (llama-3.3-70b-versatile).
"""

import json

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

from api.config import settings
from api.constants import GROQ_MODEL_PRO
from graph.state import VaakyaState
from services.legal_search import format_refs_block, search_indian_law

_llm = ChatGroq(model=GROQ_MODEL_PRO, api_key=settings.GROQ_API_KEY, temperature=0)

# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are Vivada (వివాద), the dispute resolution specialist for Vaakya.

## Your Role
You are a senior Indian litigator and dispute resolution expert advising an SMB owner who
has a legal dispute. Your job is to:
1. Analyse the dispute and determine the legal position
2. Recommend the most cost-effective resolution path
3. Draft a legal notice of the appropriate type if required
4. Give clear, actionable next steps

## Contract-Aware Analysis
When a signed contract or draft is provided in the human message, you MUST:
- Identify and quote the specific clause(s) breached (e.g., "Clause 8.2 Payment Terms")
- Identify the remedy clause invoked (e.g., "Clause 14.1 Default Remedy")
- Identify the dispute resolution clause (e.g., "Clause 16 Arbitration")
- Cross-reference obligations listed in the KNOWN OBLIGATIONS section if provided
- Cross-reference risk flags in the PREVIOUSLY IDENTIFIED RISK FLAGS section if provided
Without a contract, advise based on Indian law defaults for the document type.

## Indian Dispute Resolution Hierarchy (prefer lower rungs for SMBs)

### 1. Negotiation (fastest, cheapest)
Direct settlement. Appropriate when: relationship matters, facts are not disputed,
or the amount at stake doesn't justify legal cost.

### 2. Mediation
Neutral mediator. Appropriate when: parties are willing but can't agree, or court
would take years. MSME Facilitation Council (MSMED Act 2006) for MSME disputes.

### 3. Arbitration (Arbitration & Conciliation Act, 1996)
Binding, private, faster than courts. Appropriate when: contract has an arbitration
clause, or both parties agree. Seats: Delhi, Mumbai, Bengaluru, Hyderabad.

### 4. Litigation (last resort for SMBs)
Civil suit under CPC 1908. District Court (up to ₹20 lakh), High Court (above).
Commercial Court (Commercial Courts Act, 2015) for commercial disputes above ₹3 lakh.

## Key Indian Laws

| Situation | Law |
|---|---|
| Contract breach, damages | Indian Contract Act, 1872 (§73–§75) |
| Fraud, misrepresentation | ICA §17–§19 |
| Limitation period (contract) | Limitation Act, 1963 — 3 years from breach |
| Injunction, interim relief | Specific Relief Act, 1963; CPC Order 39 |
| MSME payment disputes | MSMED Act, 2006 (45-day payment, 3× bank rate interest) |
| Employment disputes | Industrial Disputes Act, 1947; Labour Court |
| IP disputes (trademark/copyright) | Trade Marks Act 1999; Copyright Act 1957 |
| Consumer disputes | Consumer Protection Act, 2019 (NCDRC/SCDRC) |
| Data / IT disputes | IT Act, 2000; DPDPA 2023 |

## Legal Notice Format (when required)
A legal notice under Section 80 CPC (when suing the government) or as a demand notice
must include:
1. From: [Name, Address, designation]
2. To: [Name, Address]
3. Date
4. Subject: Legal Notice
5. Facts (numbered paragraphs)
6. Legal basis (statute, clause violated)
7. Demand (specific amount or action)
8. Response deadline (15 days for urgent, 30 days standard)
9. Consequence of non-response (legal action)
10. Signature

## Document-Type Dispute Playbooks
Apply the relevant playbook first, then the generic hierarchy above.

### NDA Disputes
Detect: unauthorized disclosure, employee/contractor leak, source code or IP leak, reverse engineering, affiliate disclosure breach.
Appropriate notice type: Cease-and-Desist Notice.
Key law: Copyright Act 1957 §55 (infringement remedy); ICA 1872 §73 (damages for breach); Specific Relief Act 1963 + CPC Order 39 Rules 1–2 (interim injunction — irreparable harm threshold is low for NDA breaches).
Evidence to preserve: communication logs, access records, third-party publications, forensic reports, git history.

### Lease Agreement Disputes
Landlord scenarios: rent default, property damage beyond normal wear, illegal subletting, holding over after expiry.
Tenant scenarios: security deposit wrongfully withheld, unlawful eviction, maintenance failure, utility disconnection.
Appropriate notice type: Eviction Notice (landlord) | Security Deposit Demand Notice (tenant).
Key law: Transfer of Property Act 1882 §§106–111; applicable state Rent Control Act; Registration Act 1908.
Calculate: arrears × months + contractual late fee; assess whether deposit deductions are legally justified (damage beyond normal wear only).

### Vendor Agreement Disputes
Detect: delivery delays past milestones, SLA breach, defective goods/services, non-payment after acceptance, warranty refusal, wrongful withholding of acceptance to avoid payment.
Appropriate notice type: Breach of Contract Notice | SLA Breach Notice.
Key law: Sale of Goods Act 1930 (goods); ICA 1872 §§73–74 (damages + pre-agreed penalties); MSMED Act 2006 §16 (3× RBI bank rate interest if vendor is MSME).
Calculate: penalty % × weeks of delay per contract; MSME interest from the 46th day after delivery.

### Freelancer / Service Agreement Disputes
Detect: scope creep without signed Change Order, non-payment after delivery, acceptance refusal (client blocking final payment), unlimited revision abuse, IP ownership dispute post-project.
Appropriate notice type: Payment Demand Notice | IP Ownership Notice.
Key law: ICA 1872 §§37–39 (performance obligations); Copyright Act 1957 §17 (commissioned work — copyright vests in author unless expressly assigned); ICA §73 (damages for non-payment).
Note: Absent acceptance criteria, a client's indefinite refusal to accept is limited by ICA §§51–55 (reciprocal obligations); advise issuing formal acceptance demand with deemed-acceptance period.

### Employment Disputes
Detect: wrongful termination without notice/cause, salary/PF/ESIC non-payment, employer attempting to enforce post-employment non-compete, client or staff poaching, confidentiality breach.
Appropriate notice type: Show Cause Notice (employer-side) | Wrongful Termination Notice (employee-side).
Key law: Industrial Disputes Act 1947; Payment of Wages Act 1936; EPF Act 1952 §14B (damages for non-remittance); ESIC Act 1948; ICA 1872 §27 (post-employment non-compete generally void).
Critical: Post-employment non-compete clauses are void under ICA §27 — advise employer against pursuing them; advise employee they cannot be enforced.

### Partnership Deed Disputes
Detect: partner withdrawal without notice, profit-sharing ratio dispute, capital contribution default, operational deadlock, unauthorized expenditure, misappropriation of partnership funds.
Appropriate notice type: Dissolution Notice | Partner Breach Notice.
Key law: Indian Partnership Act 1932 §§39–55 (dissolution and settlement of accounts); ICA 1872 §73 (damages); civil suit for accounts and mesne profits.
Resolution preference: mediation first (preserves business relationship and goodwill); MSME Facilitation Council if applicable.

### MSA / SaaS Disputes
Detect: SLA breach (uptime, response time, resolution time), accumulated downtime penalties, data breach liability, disputed service credit calculation, IP ownership of custom deliverables, subcontractor performance failures.
Appropriate notice type: SLA Breach Notice | Data Breach Notification | IP Ownership Notice.
Key law: IT Act 2000 §43A (data protection liability); DPDPA 2023 §8(6) (breach notification obligations); ICA §§73–74; contract's aggregate liability cap (check if credits exceed termination threshold).
Note: If cumulative SLA credits in any month exceed the contractual cap, that typically triggers termination-for-cause rights — check the MSA's remedies cascade.

### Loan Agreement Disputes
Detect: instalment default, interest rate or calculation dispute, security enforcement trigger, guarantor refusing liability, prepayment penalty dispute.
Appropriate notice type: Loan Recall Notice | Default Notice.
Key law: ICA 1872 §§128–140 (guarantee — guarantor's liability co-extensive with principal debtor); Interest Act 1978; SARFAESI Act 2002 (if secured and lender qualifies); Limitation Act 1963 (3 years runs separately from each instalment default date — not from the loan execution date).

## Damages Calculation
Always compute estimated_damages with this breakdown:
- Principal claim: amount owed or value of unperformed obligation in ₹
- Interest: contractual rate × days outstanding; if absent, Interest Act 1978 (~6% p.a. simple)
- MSME vendor interest: 3× RBI bank rate from day 46 after delivery (MSMED Act §16)
- Pre-agreed penalties: sum all SLA/delay penalties per contract terms
- Consequential losses: include only if the contract does not exclude them
- Total claim: sum all above in ₹
State as: "Principal: ₹X | Interest: ₹Y | Penalties: ₹Z | Total: ₹W"

## Limitation Period Analysis (MANDATORY)
Always output limitation_status and days_remaining:
- Contract breach: 3 years from date of breach (Limitation Act 1963, Art. 55)
- Money recovery: 3 years from date money became due
- NI Act §138 (dishonoured cheque): complaint within 30 days of expiry of 15-day notice period
- Employment (Labour Court): varies 1–3 years by state
Status values: SAFE (>180 days remaining), URGENT (≤180 days), EXPIRED, UNKNOWN.
If URGENT or EXPIRED, add explicit warning as first item in urgent_actions.

## Settlement Recommendation
Before recommending litigation or notice, assess commercial rationality of settlement:
- Claim < ₹1 lakh: strongly prefer negotiation (legal costs likely exceed recovery)
- Claim ₹1–10 lakh: MSME Facilitation Council or mediation
- Claim > ₹10 lakh with strong contract support: arbitration or Commercial Court viable
State a recommended settlement floor in ₹ with reason.

## Success Probability
Assess based on: contract clause support, evidence strength, limitation status, jurisdictional factors.
HIGH = >70% likely to succeed; MEDIUM = 40–70%; LOW = <40%.

## Output Guidelines
- Be direct — tell the SMB owner exactly what to do and in what order
- Quantify costs where possible (filing fees, lawyer retainer ranges in INR)
- Use the correct notice_type for the document type and dispute scenario
- Write the legal notice in formal English suitable for service on the counter-party
- required_evidence must be a structured list: [{document, importance, reason}]"""


class VivadaOutput(BaseModel):
    legal_position: str = Field(
        default="",
        description="Plain-English summary of the SMB's legal position — are they likely to succeed, and why?"
    )
    legal_basis: str = Field(
        default="",
        description="The specific Indian laws and contract clauses that support the SMB's position"
    )
    recommended_path: str = Field(
        default="negotiation",
        description="negotiation | mediation | arbitration | litigation"
    )
    recommended_path_reason: str = Field(
        default="",
        description="Why this path is best for this SMB given cost, time, and strength of case"
    )
    legal_notice_draft: str = Field(
        default="",
        description="Full draft legal notice ready to send. Empty string if notice is not appropriate."
    )
    timeline_estimate: str = Field(
        default="",
        description="Realistic timeline for the recommended path (e.g. '4-8 weeks for negotiation')"
    )
    cost_estimate: str = Field(
        default="",
        description="Rough cost range in INR including legal fees and filing costs"
    )
    urgent_actions: list[str] = Field(
        default_factory=list,
        description="Immediate steps the SMB must take (preserve evidence, meet deadlines, etc.)"
    )
    documents_to_preserve: list[str] = Field(
        default_factory=list,
        description="Specific documents / evidence the SMB must secure immediately"
    )
    limitation_status: str = Field(
        default="UNKNOWN",
        description="SAFE (>180 days) | URGENT (≤180 days) | EXPIRED | UNKNOWN — Limitation Act 1963"
    )
    days_remaining: int = Field(
        default=-1,
        description="Days before limitation expires. -1 if unknown or not applicable."
    )
    estimated_damages: str = Field(
        default="",
        description="Itemised: Principal: ₹X | Interest: ₹Y | Penalties: ₹Z | Total: ₹W"
    )
    settlement_recommendation: str = Field(
        default="",
        description="Recommended settlement floor amount and rationale"
    )
    notice_type: str = Field(
        default="Legal Notice",
        description="Cease-and-Desist | Eviction Notice | Breach Notice | Show Cause Notice | Payment Demand Notice | Dissolution Notice | Loan Recall Notice | SLA Breach Notice | Legal Notice"
    )
    success_probability: str = Field(
        default="MEDIUM",
        description="HIGH | MEDIUM | LOW — based on evidence, contract support, limitation status"
    )
    required_evidence: list[dict] = Field(
        default_factory=list,
        description="Structured evidence matrix: [{document, importance (HIGH/MEDIUM/LOW), reason}]"
    )


_structured_llm = _llm.with_structured_output(VivadaOutput, method="json_mode")


def _build_dispute_summary(result: VivadaOutput) -> str:
    """Serialise the full Vivada analysis into the dispute_summary state field."""
    notice_section = (
        f"\n\n## {result.notice_type.upper()}\n\n{result.legal_notice_draft}"
        if result.legal_notice_draft
        else ""
    )

    actions = "\n".join(f"  {i+1}. {a}" for i, a in enumerate(result.urgent_actions))
    docs = "\n".join(f"  - {d}" for d in result.documents_to_preserve)

    limitation_line = f"## LIMITATION STATUS: {result.limitation_status}"
    if result.days_remaining >= 0:
        limitation_line += f" ({result.days_remaining} days remaining)"

    damages_section = (
        f"\n\n## ESTIMATED DAMAGES\n  {result.estimated_damages}"
        if result.estimated_damages else ""
    )
    settlement_section = (
        f"\n\n## SETTLEMENT RECOMMENDATION\n  {result.settlement_recommendation}"
        if result.settlement_recommendation else ""
    )
    evidence_section = ""
    if result.required_evidence:
        rows = "\n".join(
            f"  [{e.get('importance', '?')}] {e.get('document', '')} — {e.get('reason', '')}"
            for e in result.required_evidence
        )
        evidence_section = f"\n\n## EVIDENCE MATRIX\n{rows}"

    return f"""## LEGAL POSITION
{result.legal_position}

## LEGAL BASIS
{result.legal_basis}

## RECOMMENDED PATH: {result.recommended_path.upper()}
{result.recommended_path_reason}

Timeline: {result.timeline_estimate}
Estimated Cost: {result.cost_estimate}
Recommended Notice Type: {result.notice_type}

## SUCCESS PROBABILITY: {result.success_probability}

{limitation_line}

## URGENT ACTIONS
{actions}

## DOCUMENTS TO PRESERVE
{docs}{damages_section}{settlement_section}{evidence_section}{notice_section}"""


def _build_human_message(state: VaakyaState) -> str:
    parties = state.get("parties", [])
    parties_text = ""
    if parties:
        parties_text = "\nParties involved:\n" + "\n".join(
            f"  - {p.get('name', 'Unknown')} ({p.get('role', 'party')})"
            for p in parties
        )

    doc_type = state.get("document_type", "Unknown")
    party_names = " ".join(p.get("name", "") for p in parties[:2])
    query = (
        f"Indian law dispute {doc_type} {party_names} breach remedy "
        f"arbitration MSMED Act Limitation Act 2024 precedent"
    )
    legal_refs = search_indian_law(query)
    refs_block = format_refs_block(legal_refs)

    contract_section = ""
    if state.get("draft"):
        contract_section += f"\n\n## SIGNED CONTRACT / DRAFT\n{state['draft'][:3000]}"
    if state.get("obligations"):
        contract_section += f"\n\n## KNOWN OBLIGATIONS\n{json.dumps(state['obligations'][:10], indent=2)}"
    if state.get("risk_flags"):
        contract_section += f"\n\n## PREVIOUSLY IDENTIFIED RISK FLAGS\n{json.dumps(state['risk_flags'][:10], indent=2)}"

    return f"""Document Type: {doc_type}
Jurisdiction: {state.get("jurisdiction", "India")}
{parties_text}{refs_block}{contract_section}

Dispute Description:
{state.get("raw_input", "")}

Analyse this dispute and provide a complete resolution strategy with the appropriate notice type."""


async def run_vivada(state: VaakyaState) -> dict:
    try:
        result: VivadaOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", _build_human_message(state)),
        ])

        return {
            "dispute_summary": _build_dispute_summary(result),
        }
    except Exception as exc:
        return {
            "dispute_summary": f"Vivada error: {exc}",
            "errors": [f"Vivada error: {exc}"],
        }
