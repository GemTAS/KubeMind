"""KubeMind Backend — Shared FastAPI Dependencies.

Dependencies for database sessions, Supabase authentication, and role authorization.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User
from src.core.database import get_db
from src.core.security import decode_supabase_token, extract_user_claims

# HTTP Bearer token scheme
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Extract and validate the current user from a Supabase Auth JWT Bearer token.

    Args:
        credentials: The HTTP Bearer authorization credentials.
        db: The async database session.

    Returns:
        The authenticated User object (synced from Supabase claims).

    Raises:
        HTTPException: If the token is invalid, expired, or missing.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in via Supabase.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate Supabase credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_supabase_token(credentials.credentials)
        claims = extract_user_claims(payload)
    except (JWTError, ValueError, KeyError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Supabase token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = claims["id"]

    # Check if user already exists in local DB
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        # Check if email is already registered under another ID
        email_result = await db.execute(select(User).where(User.email == claims["email"]))
        existing_email_user = email_result.scalar_one_or_none()

        if existing_email_user:
            user = existing_email_user
        else:
            # Auto-provision/sync Supabase user into database
            user = User(
                id=user_id,
                email=claims["email"],
                username=claims["username"],
                full_name=claims["full_name"],
                role=claims["role"],
                is_active=True,
            )
            db.add(user)
            await db.flush()
            await db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    return user


def require_role(*roles: str):
    """Create a dependency that checks the user's role.

    Args:
        *roles: Allowed role names (e.g., "admin", "developer").

    Returns:
        A FastAPI dependency function.
    """

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' does not have permission for this action.",
            )
        return current_user

    return role_checker


# Commonly used type aliases
CurrentUser = Annotated[User, Depends(get_current_user)]
AdminUser = Annotated[User, Depends(require_role("admin"))]
DbSession = Annotated[AsyncSession, Depends(get_db)]
