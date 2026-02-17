from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_auth_service, get_current_user
from ..models import (
    LoginRequest,
    LoginResponse,
    SignUpRequest,
    UserPublic,
)
from ..services import AuthService, AuthenticationError, ConflictError


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, auth_service: AuthService = Depends(get_auth_service)) -> LoginResponse:
    try:
        return auth_service.login(payload)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
def register(payload: SignUpRequest, auth_service: AuthService = Depends(get_auth_service)) -> LoginResponse:
    try:
        return auth_service.start_signup(payload)
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/me", response_model=UserPublic)
def me(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    return current_user
