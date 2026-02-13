from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .models import UserPublic
from .repositories import InMemoryStore
from .seed_data import build_seed_events, build_seed_users
from .security import TokenError, decode_access_token
from .services import (
    AdminService,
    AuthService,
    AuthenticationError,
    EventService,
    RegistrationService,
)


_store = InMemoryStore(users=build_seed_users(), events=build_seed_events())
bearer_scheme = HTTPBearer(auto_error=False)


def get_store() -> InMemoryStore:
    return _store


def get_auth_service(store: InMemoryStore = Depends(get_store)) -> AuthService:
    return AuthService(store)


def get_event_service(store: InMemoryStore = Depends(get_store)) -> EventService:
    return EventService(store)


def get_registration_service(store: InMemoryStore = Depends(get_store)) -> RegistrationService:
    return RegistrationService(store)


def get_admin_service(store: InMemoryStore = Depends(get_store)) -> AdminService:
    return AdminService(store)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserPublic:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except TokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    try:
        return auth_service.get_user_public_by_username(payload.sub)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def require_admin(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return current_user

