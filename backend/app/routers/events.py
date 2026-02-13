from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..dependencies import get_event_service, get_registration_service, require_admin
from ..models import EventDetail, EventSummary, EventType, RegistrationPublic, UserPublic
from ..services import EventService, NotFoundError, RegistrationService


router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[EventSummary])
def list_events(
    event_service: EventService = Depends(get_event_service),
    event_type: EventType | None = Query(default=None, alias="type"),
    month: int | None = Query(default=None, ge=1, le=12),
) -> list[EventSummary]:
    return event_service.list_events(event_type=event_type, month=month)


@router.get("/{event_id}", response_model=EventDetail)
def get_event(event_id: str, event_service: EventService = Depends(get_event_service)) -> EventDetail:
    try:
        return event_service.get_event(event_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/{event_id}/registrations", response_model=list[RegistrationPublic])
def list_event_registrations(
    event_id: str,
    registration_service: RegistrationService = Depends(get_registration_service),
    _current_user: UserPublic = Depends(require_admin),
) -> list[RegistrationPublic]:
    try:
        return registration_service.list_registrations_by_event(event_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

