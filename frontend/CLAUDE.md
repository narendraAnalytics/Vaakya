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
1. User logs in via Supabase Auth (frontend)
2. Supabase issues JWT
3. Every FastAPI call includes `Authorization: Bearer <jwt>`
4. Backend verifies JWT via JWKS — no extra auth needed

