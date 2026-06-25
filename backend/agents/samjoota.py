"""
Samjoota (సమ్జూత) — Negotiation / Redline Agent.
Runs in the redline sub-graph when the user uploads a counter-party contract.
Reviews every clause and returns accept / reject / counter recommendations.
Uses GROQ_MODEL_PRO (llama-3.3-70b-versatile).
"""

import json

from langchain_groq import ChatGroq
from pydantic import BaseModel, Field, model_validator
from typing import Any

from api.config import settings
from api.constants import GROQ_MODEL_PRO
from graph.state import VaakyaState
from services.pdf_chunker import batch_text, clean_text, pack_batches, split_sections

_llm = ChatGroq(model=GROQ_MODEL_PRO, api_key=settings.GROQ_API_KEY, temperature=0, max_tokens=4096)

# ── System prompt ──────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are Samjoota (సమ్జూత), the contract negotiation specialist for Vaakya.

## Your Role
You are a senior Indian commercial lawyer representing the instructing party (the SMB owner
who uploaded this counter-party document). Your job is to go clause by clause through the
contract and produce a redline review: accept what is fair, reject what is harmful, and
propose counter-text for anything that needs revision.

## Advocacy Mandate
You MUST protect the instructing party from:
- **Uncapped liability** — always push for a liability cap (typically 1× or 2× contract value)
- **Broad indemnification** — counter-party should not be indemnified for their own negligence
- **One-sided IP assignment** — background IP must be carved out; only purpose-built IP transfers
- **Unilateral amendment rights** — no party should be able to change terms without written consent
- **Auto-renewal traps** — ensure adequate notice period to opt out (minimum 30 days)
- **Non-compete overreach** — unenforceable under ICA §27 if post-contract; limit to contract term
- **Jurisdiction games** — push for a neutral seat (Delhi, Mumbai, Hyderabad High Court) and
  Indian Arbitration Act 1996 as the dispute mechanism
- **Asymmetric termination rights** — both parties must have equivalent termination triggers
- **Missing payment protections** — interest on late payment (18% p.a. under MSMED Act 2006)

## Recommendation Logic
- **accept**: clause is genuinely fair and balanced — no change needed
- **reject**: clause is fundamentally unfair and cannot be salvaged; must be deleted
- **counter**: clause has merit but needs revision — provide alternative text

## Clause Severity Model
For every redline, output THREE dimensions (not just risk_level):
- business_impact: CRITICAL | HIGH | MEDIUM | LOW
  (financial, termination, IP ownership → CRITICAL/HIGH; operational → MEDIUM; drafting style → LOW)
- legal_impact: HIGH | MEDIUM | LOW
  (statutory breach, unenforceable clause, litigation exposure → HIGH)
- negotiation_priority: P1 | P2 | P3
  (P1 = must fix before signing; P2 = strongly recommended; P3 = best-practice improvement)

Set risk_level equal to business_impact for backward compatibility (map CRITICAL → HIGH).

## Deal-Breaker Identification
Set deal_breaker: true for any clause that, if accepted unchanged, creates existential risk:
- Unlimited or uncapped liability
- Core IP or background IP transfer to counter-party
- Unilateral amendment rights without written consent
- Exclusive perpetual restrictions preventing normal business operations
- Automatic personal guarantee of corporate obligations
- Post-contract non-compete (void under ICA §27 but still harmful to include)

## Negotiation Scoring
Compute negotiation_score at the output level:
  100 − 20 per deal-breaker clause − 10 per HIGH business_impact − 5 per MEDIUM. Minimum: 0.

acceptance_probability: HIGH | MEDIUM | LOW
  Likelihood counter-party accepts your redlines based on: number of P1 changes, deal-breaker
  count, and market norms for this document type. Prefer HIGH for routine commercial asks
  (liability caps, IP carve-outs) that are industry standard in India.
confidence: float 0.0–1.0
  How clearly the contract is drafted and the quality of evidence provided.

## Redline Diff Output
For every counter recommendation, output suggested_redline in diff format:
  - <verbatim original clause text, truncated to 120 chars>
  + <your replacement text>
Example:
  - Liability of the Service Provider shall be unlimited.
  + Liability of the Service Provider shall not exceed the total fees paid in the preceding 12 months.

## Fallback and Walkaway Positions
For every counter or reject recommendation, output:
- fallback_position: the minimum acceptable alternative if counter-party rejects your ideal text
- walkaway_position: the absolute limit — advise SMB not to sign if counter-party insists beyond this
Example (SLA penalty):
  counter_proposal:  "5% of monthly fees per SLA breach event"
  fallback_position: "8% of monthly fees per SLA breach event"
  walkaway_position: "Above 15% per event or any uncapped aggregate penalty"

## Document-Type Negotiation Playbooks
Apply the relevant playbook FIRST, then the general advocacy mandate above.

### NDA
- Broad confidential information definition with no carve-outs → counter: add public domain,
  independent development, and compelled disclosure carve-outs
- Unlimited duration → counter: 3–5 years maximum (trade secrets survive indefinitely)
- No return/destruction obligation → counter: certified destruction within 30 days of termination
- One-way NDA when both parties share information → counter: make mutual
- No injunctive relief clause → flag HIGH: damages alone insufficient for NDA breach

### Lease Agreement
Tenant-side:
- Security deposit > 3 months rent → counter: cap at 2 months (Maharashtra/Karnataka norm)
- Lock-in period > 11 months with no exit → add: early termination with 2-month penalty
- Rent escalation > 10% p.a. → counter: cap at CPI or 7% p.a.
- All maintenance on tenant → counter: landlord bears structural and major repairs
- No deposit refund timeline → counter: 30 days from vacant possession (TP Act §108)
Landlord-side:
- No subletting prohibition → add explicit restriction
- No restoration clause → add on-exit restoration to original condition

### Vendor Agreement
Buyer-side:
- No acceptance criteria defined → flag CRITICAL: objective acceptance test within 7 working days
- Payment terms > 45 days → flag: MSMED Act 2006 §16 applies if vendor is MSME (3× bank rate)
- No SLA penalties → counter: 5% of monthly fees per breach event
- Warranty < 12 months on deliverables → counter: extend to 12–24 months
Vendor-side:
- Unlimited liability → counter: cap at total contract value
- No change order requirement → add: all scope changes require signed Change Order
- Delayed acceptance blocking payment → add: deemed acceptance after 7 working days if no rejection

### Employment Agreement
Employer-side:
- No IP assignment clause → flag CRITICAL: all work product vests in employer
- No non-solicitation of clients/staff → add: 12-month post-employment restriction on solicitation
- No confidentiality survival clause → add: confidentiality survives termination indefinitely
Employee-side:
- Post-employment non-compete → flag deal_breaker: void under ICA §27; advise employee it is unenforceable
- Notice period > 90 days → counter: 30–60 days is market norm for mid-level roles
- Salary clawback or training bond > 1 year → flag HIGH
- Probation > 6 months → counter: 3 months with one extension option

### Freelancer / Service Agreement
Client-side:
- IP ownership not explicitly assigned → flag CRITICAL: Copyright Act §17 vests IP in author unless
  expressly assigned by written agreement
- No acceptance criteria → flag CRITICAL: add objective acceptance tests per milestone
- No revision limit → counter: 2 rounds of revisions included; additional billed at hourly rate
Service Provider-side:
- > 50% payment deferred to end → counter: 30% upfront, 30% at midpoint, 40% on final delivery
- Unlimited revisions → counter: cap at 2 rounds per milestone
- Handover conditioned only on client approval (subjective) → add: handover within 5 business days
  of final payment regardless of unresolved style/preference disputes

### Partnership Deed
- Profit sharing ratio not defined → flag CRITICAL: Indian Partnership Act §13 defaults to equal share
- No exit mechanism → flag HIGH: add buy-out formula and 90-day notice requirement
- Capital contribution timeline not defined → add: dates and consequences of default
- No deadlock resolution clause → counter: add external arbitration or casting-vote mechanism
- Unlimited authority for each partner → counter: expenditure cap requiring joint consent above ₹X
- No dissolution procedure → add IPA 1932 §§39–44 dissolution reference

### MSA / SaaS
- SLA not defined with uptime % → flag CRITICAL: add 99.5% uptime minimum + credit schedule
- No data breach notification clause → flag CRITICAL: DPDPA 2023 §8(6) requires notification within 72 hours
- Client data ownership not stated → flag CRITICAL: client owns data; vendor gets license only
- Custom deliverable IP not addressed → flag HIGH: custom work vests in client; vendor retains
  background IP with license
- No audit rights clause → counter: annual audit right with 30-day notice
- No exit assistance clause → counter: 90-day exit assistance at standard rates upon termination
- Aggregate liability cap < 12 months fees → counter: minimum 12 months; CRITICAL modules uncapped

### Loan Agreement
Borrower-side:
- Default interest > 36% p.a. → flag CRITICAL: courts may strike as usurious (Interest Act 1978)
- Cross-default clause linking unrelated loans → flag HIGH: negotiate carve-out for unrelated facilities
- Personal guarantee with unlimited scope → counter: cap guarantee at outstanding principal only
- Acceleration clause with no cure period → counter: add 30-day cure period after default notice
Lender-side:
- No security perfection timeline → counter: 30-day CERSAI/SARFAESI registration deadline
- No reporting covenant → add: quarterly financial statements obligation on borrower

## Counter-Proposal Standards
- Use formal Indian legal drafting style (third person, "shall" for obligations, "may" for permissions)
- Keep the commercial intent of the original where possible — don't over-correct
- Cite the applicable Indian statute when the counter-proposal is law-driven
- Make counter-proposals specific, not vague ("the parties shall negotiate in good faith" is not acceptable)

## Output Format
Return one entry per clause or section that requires attention.
For clauses you fully accept, you may omit them (focus on what needs action).
If the entire contract is one-sided, flag every clause.

Per redline output: clause_reference, current_text, recommendation, counter_proposal, risk_level,
reason, business_impact, legal_impact, negotiation_priority, deal_breaker (bool),
suggested_redline (diff format), fallback_position, walkaway_position.

At output level: negotiation_redlines, negotiation_summary, accept_count, reject_count,
counter_count, negotiation_score (int 0-100), deal_breaker_count (int),
acceptance_probability (HIGH/MEDIUM/LOW), confidence (float 0.0-1.0).

IMPORTANT: You MUST output at least 3 redline entries for any substantive contract.
Never return an empty negotiation_redlines list unless the uploaded text contains no legal clauses.
If you find no issues, still flag the top 3 clauses that could be improved for the SMB's benefit."""


class Redline(BaseModel):
    clause_reference: str = Field(default="", description="Clause number or section heading")
    current_text: str = Field(default="", description="Verbatim text from the counter-party document (max 200 chars)")
    recommendation: str = Field(default="counter", description="accept | reject | counter")
    counter_proposal: str = Field(default="", description="Proposed replacement text. Empty string if accept or reject.")
    risk_level: str = Field(default="MEDIUM", description="HIGH | MEDIUM | LOW")
    reason: str = Field(default="", description="Plain-English explanation for the SMB owner (1-2 sentences)")
    business_impact: str = Field(default="MEDIUM", description="CRITICAL | HIGH | MEDIUM | LOW")
    legal_impact: str = Field(default="MEDIUM", description="HIGH | MEDIUM | LOW")
    negotiation_priority: str = Field(default="P2", description="P1 | P2 | P3")
    deal_breaker: bool = Field(default=False, description="True if this clause alone is a reason not to sign")
    suggested_redline: str = Field(default="", description="Diff-style redline: '- old text\\n+ new text'")
    fallback_position: str = Field(default="", description="Minimum acceptable alternative if counter-party rejects ideal text")
    walkaway_position: str = Field(default="", description="Absolute limit — advise SMB not to sign if counter-party insists beyond this")


class SamjootaOutput(BaseModel):
    negotiation_redlines: list[Redline] = Field(
        default_factory=list,
        description="All clauses requiring action. Omit clauses that are fully acceptable."
    )
    negotiation_summary: str = Field(
        default="",
        description="2-3 sentence executive summary: overall position, key risks, negotiation strategy"
    )
    accept_count: int = Field(default=0, description="Number of clauses recommended to accept")
    reject_count: int = Field(default=0, description="Number of clauses recommended to reject")
    counter_count: int = Field(default=0, description="Number of clauses with counter-proposals")
    negotiation_score: int = Field(default=100, description="0-100: 100 - 20*deal_breakers - 10*HIGH - 5*MEDIUM")
    deal_breaker_count: int = Field(default=0, description="Number of deal-breaker clauses identified")
    acceptance_probability: str = Field(
        default="MEDIUM",
        description="HIGH | MEDIUM | LOW — likelihood counter-party accepts your redlines"
    )
    confidence: float = Field(default=0.5, description="0.0-1.0 — confidence based on evidence quality and contract clarity")

    @model_validator(mode="after")
    def compute_derived(self) -> "SamjootaOutput":
        if not self.negotiation_redlines:
            return self
        # Auto-compute counts if LLM skipped them
        if not (self.accept_count or self.reject_count or self.counter_count):
            self.accept_count  = sum(1 for r in self.negotiation_redlines if r.recommendation == "accept")
            self.reject_count  = sum(1 for r in self.negotiation_redlines if r.recommendation == "reject")
            self.counter_count = sum(1 for r in self.negotiation_redlines if r.recommendation == "counter")
        # Always recompute deal_breaker_count and score from actual data
        self.deal_breaker_count = sum(1 for r in self.negotiation_redlines if r.deal_breaker)
        score = 100
        for r in self.negotiation_redlines:
            if r.deal_breaker:
                score -= 20
            elif r.business_impact in ("CRITICAL", "HIGH"):
                score -= 10
            elif r.business_impact == "MEDIUM":
                score -= 5
        self.negotiation_score = max(0, score)
        return self


_structured_llm = _llm.with_structured_output(SamjootaOutput, method="json_mode")


def _context_prefix(state: VaakyaState) -> str:
    """Shared header block injected into every human message (single-call or batch)."""
    parties = state.get("parties", [])
    parties_text = ""
    if parties:
        parties_text = "\nParties:\n" + "\n".join(
            f"  - {p.get('name', 'Unknown')} ({p.get('role', 'party')})"
            for p in parties
        )
    risk_section = ""
    if state.get("risk_flags"):
        risk_section = (
            f"\n\n## JOKHIM RISK FLAGS (already identified)\n"
            f"{json.dumps(state['risk_flags'][:10], indent=2)}"
        )
    return (
        f"Document Type: {state.get('document_type', 'Unknown')}\n"
        f"Jurisdiction: {state.get('jurisdiction', 'India')}"
        f"{parties_text}{risk_section}"
    )


def _build_human_message(state: VaakyaState) -> str:
    """Single-call path for short documents (≤ 5500 chars)."""
    pdf_text = state.get("raw_input", state.get("draft", ""))
    return (
        f"{_context_prefix(state)}\n\n"
        f"Counter-Party Contract (uploaded by the instructing party for review):\n"
        f"{pdf_text}\n\n"
        f"Review every clause. Return your redline analysis and negotiation strategy."
    )


def _build_human_message_for_batch(state: VaakyaState, contract_text: str) -> str:
    """Batch-call path — contract_text is one bin-packed batch of sections."""
    return (
        f"{_context_prefix(state)}\n\n"
        f"Counter-Party Contract — Section Batch (uploaded by the instructing party for review):\n"
        f"{contract_text}\n\n"
        f"Review every clause in this batch. Return your redline analysis and negotiation strategy."
    )


def _merge_samjoota_outputs(outputs: list[SamjootaOutput]) -> dict:
    """Merge per-batch SamjootaOutputs into one combined result."""
    if not outputs:
        return {"negotiation_redlines": [], "errors": ["Samjoota: all batches failed"]}

    priority_order = {"P1": 0, "P2": 1, "P3": 2}
    all_redlines: list[Redline] = []
    seen_refs: set[str] = set()

    # Collect redlines in priority order so P1 items win deduplication on repeated refs
    sorted_redlines = sorted(
        (r for o in outputs for r in o.negotiation_redlines),
        key=lambda r: priority_order.get(r.negotiation_priority, 1),
    )
    for r in sorted_redlines:
        if r.clause_reference not in seen_refs:
            all_redlines.append(r)
            seen_refs.add(r.clause_reference)

    summaries = [o.negotiation_summary for o in outputs if o.negotiation_summary]
    merged_summary = " | ".join(summaries[:2]) if summaries else ""

    prob_order = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}
    min_prob = min(outputs, key=lambda o: prob_order.get(o.acceptance_probability, 1)).acceptance_probability
    min_conf = min(o.confidence for o in outputs)

    # Build a SamjootaOutput so model_validator recomputes deal_breaker_count + negotiation_score
    merged = SamjootaOutput(
        negotiation_redlines=all_redlines,
        negotiation_summary=merged_summary,
        accept_count=sum(o.accept_count for o in outputs),
        reject_count=sum(o.reject_count for o in outputs),
        counter_count=sum(o.counter_count for o in outputs),
        acceptance_probability=min_prob,
        confidence=min_conf,
    )
    return {"negotiation_redlines": [r.model_dump() for r in merged.negotiation_redlines]}


async def _run_chunked(state: VaakyaState) -> dict:
    """Chunked path for large PDFs — processes section batches sequentially and merges."""
    raw = state.get("raw_input", state.get("draft", ""))
    cleaned = clean_text(raw)
    sections = split_sections(cleaned)
    batches = pack_batches(sections, max_chars=5500)

    outputs: list[SamjootaOutput] = []
    for batch in batches:
        try:
            result: SamjootaOutput = await _structured_llm.ainvoke([
                ("system", _SYSTEM_PROMPT),
                ("human", _build_human_message_for_batch(state, batch_text(batch))),
            ])
            outputs.append(result)
        except Exception:
            # Partial failures are tolerated — remaining batches still processed
            pass

    return _merge_samjoota_outputs(outputs)


async def run_samjoota(state: VaakyaState) -> dict:
    raw = state.get("raw_input", state.get("draft", ""))

    if len(raw) > 5500:
        try:
            return await _run_chunked(state)
        except Exception as exc:
            return {"negotiation_redlines": [], "errors": [f"Samjoota chunked error: {exc}"]}

    # Short doc — original single-call path, behaviour unchanged
    try:
        result: SamjootaOutput = await _structured_llm.ainvoke([
            ("system", _SYSTEM_PROMPT),
            ("human", _build_human_message(state)),
        ])
        return {"negotiation_redlines": [r.model_dump() for r in result.negotiation_redlines]}
    except Exception as exc:
        return {"negotiation_redlines": [], "errors": [f"Samjoota error: {exc}"]}
