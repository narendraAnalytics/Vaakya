@AGENTS.md

# Vaakya Frontend

Next.js 16 + React 19 + Tailwind v4 + Supabase SSR + shadcn/ui

## Backend API
- **Production:** https://vaakya.onrender.com
- **Health:** `GET /health` → `{"status":"ok","db":"connected"}`
- All API calls need `Authorization: Bearer <supabase_jwt>` header
- CORS origin must match this frontend's Vercel URL (set `ALLOWED_ORIGIN` in Render env)

## Key API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/document/new` | Text input → draft contract (returns 202 + document_id) |
| POST | `/document/upload` | PDF upload → redline review (returns 202 + document_id) |
| GET | `/document/{id}/status` | Poll graph state / HITL payload |
| POST | `/document/{id}/approve` | Resume after HITL approval |
| GET | `/vault` | List user's documents |
| GET | `/vault/{id}` | Get single document |

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_URL=https://vaakya.onrender.com
```

## Auth Flow
1. User signs up (`/auth/login` → Sign up tab) → auto sign-in → `/onboarding`
2. User sets username → synced to `user_metadata` + `public.profiles` table → redirect `/`
3. Returning user: sign in with **email or username** + password
4. Supabase issues JWT → every FastAPI call includes `Authorization: Bearer <jwt>`
5. Backend verifies JWT via JWKS — no extra auth needed
6. Session refresh handled by `src/proxy.ts` (Next.js 16 — was `middleware.ts` in v14/15)

## Supabase Database — Auth-Related Tables & Functions

### `public.profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `username` | TEXT UNIQUE | Set on onboarding, used for username login |
| `created_at` | TIMESTAMPTZ | |

RLS: SELECT open to all (needed for username lookup). UPDATE restricted to owner.

### `get_email_by_username(p_username TEXT) → TEXT`
SECURITY DEFINER function. Joins `profiles` → `auth.users` to return email for a given username.
Used by the login form when the identifier has no `@`.

## Frontend Pages
| Route | File | Notes |
|-------|------|-------|
| `/features` | `src/app/features/page.tsx` | Public page; nav link routes here if logged in, `/auth/login` if not |
| `/dashboard` | `src/app/dashboard/page.tsx` + `DashboardClient.tsx` | Server fetches vault; client renders UI |
| `/dashboard/documents/[id]` | `src/app/dashboard/documents/[id]/page.tsx` | Client-only; polls status every 3s |

## Document Types (Dashboard Dropdown + Icons)
16 types supported in `DashboardClient.tsx` `getDocIcon()` and `<select>` dropdown:
NDA 📄, Vendor Agreement 🤝, Employment Contract 👔, Service/Freelancer Agreement 💼, Lease Agreement 🏠, Partnership Deed 🤝, Consulting Agreement 🧠, MSA 🗂️, IP Assignment 💡, Loan Agreement 💰, Legal Notice ⚖️, Privacy Policy 🔒, Terms of Service 📜, Non-Compete Agreement 🚫, Distribution Agreement 📦, Joint Venture Agreement 🏢.

## Status Response — Extended Fields
`GET /document/{id}/status` now returns these additional fields beyond the base set:
- `dispute_summary: string` — Vivada full analysis (Markdown)
- `obligations: Array<{party, obligation_type, action, deadline, deadline_type, deadline_days, deadline_date, trigger_event, reminder_schedule, estimated_penalty, consequence, priority, clause_reference}>` — Sruthi output
- `obligations_count: number`
- `negotiation_redlines: Array<{clause_reference, current_text, recommendation, counter_proposal, risk_level, reason, business_impact, legal_impact, negotiation_priority, deal_breaker, suggested_redline, fallback_position, walkaway_position}>` — Samjoota output

## Agent Progress Page — Result Panels
Three conditional panels render in the left column after agent completion (`page.tsx`):

**Dispute Analysis** (`sub_graph === 'dispute'` + `dispute_summary` present)
- Renders full Vivada markdown via `<MarkdownRenderer />`
- Right panel heading switches to "Dispute Summary"

**Obligations & Deadlines** (`obligations.length > 0`)
- Priority-colored left border cards (HIGH=red, MEDIUM=amber, LOW=green)
- Shows: action, deadline phrase + days count, clause reference, estimated_penalty (⚠ red), reminder_schedule chips

**Redline Analysis** (`sub_graph === 'redline'` + `negotiation_redlines.length > 0`)
- Computed score badge (100 − 20×deal-breakers − 10×HIGH − 5×MEDIUM), deal-breaker count, P1 must-fix count
- Clause cards sorted P1→P2→P3, left-bordered by business_impact (CRITICAL=red, HIGH=amber, MEDIUM=blue, LOW=green)
- 🚨 Deal-Breaker badge; diff block with `- old` (red) / `+ new` (green); fallback + walkaway positions

## Supabase Client Usage
- **Server components / route handlers:** `import { createClient } from '@/lib/server'` (cookie-based)
- **Client components:** `import { createClient } from '@/lib/client'` (browser session)

## Status Polling — Agent State Inference
No per-node streaming. Infer from: `review_score > 0` (Arambha/Rachana done), `loop_count > 0` (Rachana done), `vault_id !== ''` (Sahee done), `obligations_count > 0` (Sruthi done), `status === 'awaiting_approval'` (HITL paused).

Status response also includes `sub_graph: 'new_doc' | 'redline' | 'dispute'` — use this to filter `ALL_AGENTS` for the correct pipeline display.

Agent transition detection pattern: store previous states in `prevStatesRef = useRef<Record<string, string>>({})`, compare on each poll to detect done transitions for activity log entries.

## Agent Pipeline Pattern
`ALL_AGENTS` (8 entries in `page.tsx`) has `flows: string[]`, `tavily: boolean`, `tavilyLabel: string`, `avatarUrl: string` fields. Filter at render: `ALL_AGENTS.filter(a => a.flows.includes(subGraph))`. Never hard-code a 6-agent list — always use the filtered view.

`avatarUrl` — Cloudinary image URLs sourced from `../projectworkflow.txt`. Use `<img src={agent.avatarUrl}>` in agent cards; never use emoji as the primary avatar.

Tavily badges are driven by `agent.tavily` / `agent.tavilyLabel` — do not add separate Tavily UI.

## Agent Workflow Page Layout
`src/app/dashboard/documents/[id]/page.tsx` uses a 2-column grid (left: vertical workflow graph, right: sticky panel). Helper components defined inside the main component: `AgentNode`, `Connector`, `ParallelSection`, `HitlNode`. CSS state classes: `node-done/active/waiting/pending`, `connector-done/active/waiting` (`connector-active` is animated dashes via `connFlow`), `pipe-green/pipe-gray` for fork/merge bars.

Reference design: `frontend/samplecode/Vaakya Agent Workflow.dc.html` — canonical visual spec for the workflow page.

`frontend/samplecode/*.dc.html` — HTML design comps. Implement by translating HTML → JSX 1:1: inline JSX styles, same palette/fonts, zero design deviations. Never add Tailwind or change colors.

`projectworkflow.txt` and `vaakya_doc.txt` (repo root) are the user's design notes files — do not commit either.

## Markdown Rendering
LLM agent responses contain raw Markdown. Always render via `<MarkdownRenderer content={...} />` (`src/components/MarkdownRenderer.tsx`) — never display in `<textarea readOnly>` or `pre-wrap` div. Uses `react-markdown` + `remark-gfm` + `rehype-sanitize`. Component uses inline JSX styles matching Vaakya palette; `pre` renderer returns `<>{children}</>` to avoid double-wrapping.

## TypeScript Check
Run `npx tsc --noEmit` before every commit to verify zero type errors.

## Render Backend — CORS
`ALLOWED_ORIGIN=https://vaakya-tau.vercel.app` must be set in Render env. Server-side fetches (`page.tsx`) bypass CORS; browser fetches (client components) do not.

## Render Free Tier
Backend sleeps after inactivity — first request can take ~30s. Handle in UI with a warm-up message after 6s timeout, keep polling (don't error out).

## Styling Convention
All styles are **inline JSX** (not Tailwind utilities). Palette: `#FEF9EF` bg, `#0F2D1F` text, `#1EA851` accent, `#1A5C35` CTA. Animations defined in `<style dangerouslySetInnerHTML>` at component root.

## Git Commits (PowerShell)
Use `@'...'@` single-quoted heredoc — bash `cat <<'EOF'` syntax causes parse errors in PowerShell 5.1.
When using the **Bash tool** (not PowerShell tool), use plain `git commit -m "..."` double-quoted strings — `@'...'@` is PowerShell-only and corrupts the subject line.

## Known Issues Resolved

### Signup 500 — `relation "profiles" does not exist`
Supabase project had an `on_auth_user_created` trigger calling `handle_new_user()` which
tried to `INSERT INTO profiles`. Table didn't exist → every signup returned 500 with `{}` body.
**Fix:** dropped the trigger + function; created `profiles` table manually with correct schema.

### Next.js 16 — `middleware.ts` deprecated
Next.js 16 renamed Middleware → Proxy. Having both `src/middleware.ts` and `src/proxy.ts`
throws `Unhandled Rejection`. **Fix:** deleted `middleware.ts`, created `src/proxy.ts` exporting
`async function proxy(request)` (not `middleware`).

### Username not updating after onboarding
`updateUser()` writes to `user_metadata` but the session JWT still carries old claims.
Proxy reads stale JWT → no username → redirects back to `/onboarding` loop.
**Fix:** call `supabase.auth.refreshSession()` after `updateUser()` before `router.replace('/')`.

