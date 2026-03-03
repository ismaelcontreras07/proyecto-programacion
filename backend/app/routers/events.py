from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query, Response, status

from ..dependencies import get_current_user, get_event_service, get_registration_service, require_admin
from ..models import (
    EventCreateRequest,
    EventDetail,
    EventImageUploadResponse,
    EventLifecycleFilter,
    EventReviewCreateRequest,
    EventReviewPublic,
    EventSummary,
    EventType,
    EventUpdateRequest,
    RegistrationPublic,
    UserPublic,
)
from ..services import AuthorizationError, ConflictError, EventService, NotFoundError, RegistrationService


router = APIRouter(prefix="/api/events", tags=["events"])

UPLOADS_DIR = Path(__file__).resolve().parents[2] / "uploads"
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


@router.post("/upload-image", response_model=EventImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_event_image(
    file: UploadFile = File(...),
    _current_user: UserPublic = Depends(require_admin),
) -> EventImageUploadResponse:
    if file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image type. Use JPG, PNG or WEBP.",
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )
    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image is too large. Max size is 5 MB.",
        )

    extension = ALLOWED_IMAGE_CONTENT_TYPES[file.content_type]
    filename = f"event_{uuid4().hex}{extension}"
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    destination = UPLOADS_DIR / filename
    destination.write_bytes(contents)

    return EventImageUploadResponse(image_url=f"/uploads/{filename}")


@router.get("", response_model=list[EventSummary])
def list_events(
    event_service: EventService = Depends(get_event_service),
    event_type: EventType | None = Query(default=None, alias="type"),
    month: int | None = Query(default=None, ge=1, le=12),
    lifecycle: EventLifecycleFilter = Query(default=EventLifecycleFilter.ALL),
) -> list[EventSummary]:
    return event_service.list_events(event_type=event_type, month=month, lifecycle=lifecycle)


@router.get("/{event_id}", response_model=EventDetail)
def get_event(event_id: str, event_service: EventService = Depends(get_event_service)) -> EventDetail:
    try:
        return event_service.get_event(event_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=EventDetail, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreateRequest,
    event_service: EventService = Depends(get_event_service),
    _current_user: UserPublic = Depends(require_admin),
) -> EventDetail:
    return event_service.create_event(payload)


@router.put("/{event_id}", response_model=EventDetail)
def update_event(
    event_id: str,
    payload: EventUpdateRequest,
    event_service: EventService = Depends(get_event_service),
    _current_user: UserPublic = Depends(require_admin),
) -> EventDetail:
    try:
        return event_service.update_event(event_id, payload)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: str,
    event_service: EventService = Depends(get_event_service),
    _current_user: UserPublic = Depends(require_admin),
) -> Response:
    try:
        event_service.delete_event(event_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
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


@router.get("/{event_id}/reviews", response_model=list[EventReviewPublic])
def list_event_reviews(
    event_id: str,
    event_service: EventService = Depends(get_event_service),
) -> list[EventReviewPublic]:
    try:
        return event_service.list_event_reviews(event_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{event_id}/reviews", response_model=EventReviewPublic)
def create_or_update_event_review(
    event_id: str,
    payload: EventReviewCreateRequest,
    event_service: EventService = Depends(get_event_service),
    current_user: UserPublic = Depends(get_current_user),
) -> EventReviewPublic:
    try:
        return event_service.create_or_update_review(event_id, payload, current_user)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except AuthorizationError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
