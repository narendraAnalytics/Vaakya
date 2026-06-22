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

