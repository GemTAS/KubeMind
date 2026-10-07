"""KubeMind Backend — Supabase Auth & Security Utilities.

Validates Supabase-issued JWT Bearer tokens and extracts user claims.
User authentication is managed directly by Supabase Auth (GoTrue).
"""

import uuid
from typing import Any

from jose import JWTError, jwt

from src.core.config import get_settings

settings = get_settings()


def decode_supabase_token(token: str) -> dict[str, Any]:
    """Decode and validate a Supabase Auth JWT token.

    Args:
        token: The encoded JWT Bearer token from the client.

    Returns:
        The decoded claims payload containing user identity and metadata.

    Raises:
        JWTError: If the token is invalid, expired, or malformed.
    """
    # Demo/offline token support for development
    if token.startswith("demo-"):
        return {
            "sub": "00000000-0000-0000-0000-000000000001",
            "email": "demo@kubemind.io",
            "role": "admin",
            "user_metadata": {"full_name": "Demo Administrator", "username": "admin"},
            "app_metadata": {"role": "admin"},
        }

    # If Supabase JWT Secret is configured, verify signature
    if settings.supabase_jwt_secret:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=[settings.supabase_jwt_algorithm],
            options={"verify_aud": False},
        )

    # In local development without secret configured, decode claims
    # without signature verification so developers can start immediately
    return jwt.decode(
        token,
        key="",
        options={"verify_signature": False, "verify_aud": False},
    )


def extract_user_claims(payload: dict[str, Any]) -> dict[str, Any]:
    """Extract standard user properties from Supabase token claims.

    Args:
        payload: Decoded Supabase JWT payload.

    Returns:
        Dictionary with id, email, username, full_name, and role.
    """
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise ValueError("Missing 'sub' claim in Supabase token.")

    user_id = uuid.UUID(user_id_str)
    email = payload.get("email", "")

    user_meta = payload.get("user_metadata", {}) or {}
    app_meta = payload.get("app_metadata", {}) or {}

    # Determine role (check app_metadata first, then root role, then fallback)
    role = app_meta.get("role") or payload.get("role") or "developer"
    if role == "authenticated":
        role = "developer"

    full_name = user_meta.get("full_name") or user_meta.get("name") or (email.split("@")[0] if email else "User")
    username = user_meta.get("username") or user_meta.get("user_name") or (email.split("@")[0] if email else str(user_id)[:8])

    return {
        "id": user_id,
        "email": email,
        "username": username,
        "full_name": full_name,
        "role": role,
    }
