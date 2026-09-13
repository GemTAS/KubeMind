"""KubeMind Backend — Auth Pydantic Schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ---- Request Schemas ----


class RegisterRequest(BaseModel):
    """User registration request."""

    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    """User login request."""

    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Token refresh request."""

    refresh_token: str


# ---- Response Schemas ----


class UserResponse(BaseModel):
    """User data response."""

    id: uuid.UUID
    email: str
    username: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Authentication token pair response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
