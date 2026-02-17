from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_current_user, get_registration_service
from ..models import RegistrationEnrollRequest, RegistrationPublic, UserEventRegistration, UserPublic
from ..services import (
    AuthorizationError,
    CapacityError,
    ConflictError,
    NotFoundError,
    ProfileIncompleteError,
    RegistrationService,
)


router = APIRouter(prefix="/api/registrations", tags=["registrations"])


@router.get("/me", response_model=list[UserEventRegistration])
def list_my_registrations(
    registration_service: RegistrationService = Depends(get_registration_service),
    current_user: UserPublic = Depends(get_current_user),
) -> list[UserEventRegistration]:
    try:
        return registration_service.list_registrations_by_current_user(current_user)
    except AuthorizationError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.post("", response_model=RegistrationPublic, status_code=status.HTTP_201_CREATED)
def create_registration(
    payload: RegistrationEnrollRequest,
    registration_service: RegistrationService = Depends(get_registration_service),
    current_user: UserPublic = Depends(get_current_user),
) -> RegistrationPublic:
    try:
        return registration_service.create_registration_from_user(payload.event_id, current_user)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except CapacityError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    except ProfileIncompleteError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    except AuthorizationError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.delete("/event/{event_id}", response_model=RegistrationPublic)
def cancel_registration(
    event_id: str,
    registration_service: RegistrationService = Depends(get_registration_service),
    current_user: UserPublic = Depends(get_current_user),
) -> RegistrationPublic:
    try:
        return registration_service.cancel_registration_from_user(event_id, current_user)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except AuthorizationError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
