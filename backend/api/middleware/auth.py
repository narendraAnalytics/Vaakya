"""
Auth middleware — two modes:

  DEV_AUTH_BYPASS=true  Bearer token value is used directly as user_id.
                        Set in .env for local testing only. Never in production.

  Production            JWT verified locally via Supabase JWKS public keys.
                        No per-request Supabase API call — faster and decoupled.
                        Requires SUPABASE_JWKS_URL in .env.
"""

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt

from api.config import settings

_bearer = HTTPBearer()
_jwks_cache: dict | None = None   # fetched once, cached for process lifetime


async def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            r = await client.get(settings.SUPABASE_JWKS_URL, timeout=10)
            r.raise_for_status()
            _jwks_cache = r.json()
    return _jwks_cache


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> str:
    """
    FastAPI dependency. Returns authenticated user_id (UUID string).
    Raises HTTP 401 on invalid/missing token.
    """
    token = credentials.credentials

    # Dev bypass — no JWT verification
    if settings.DEV_AUTH_BYPASS:
        return token or "dev-user"

    # Production — verify JWT locally using Supabase JWKS
    if not settings.SUPABASE_JWKS_URL:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_JWKS_URL not configured",
        )
    try:
        jwks = await _get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        key = next(
            (k for k in jwks.get("keys", []) if k.get("kid") == unverified_header.get("kid")),
            None,
        )
        if key is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No matching JWKS key")
        public_key = jwk.construct(key)
        payload = jwt.decode(token, public_key, algorithms=["RS256"], audience="authenticated")
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing sub claim")
        return user_id
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token invalid: {exc}")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Auth error: {exc}")
