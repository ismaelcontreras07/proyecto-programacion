from __future__ import annotations

import re
from collections import Counter
from datetime import datetime, timedelta

from .models import (
    AdminEventStats,
    AdminSummary,
    EventDetail,
    EventCreateRequest,
    EventRecord,
    EventSummary,
    EventType,
    EventUpdateRequest,
    LoginRequest,
    LoginResponse,
    RegistrationCreate,
    RegistrationPublic,
    RegistrationRecord,
    RegistrationStatus,
    SignUpRequest,
    UserEventRegistration,
    UserPublic,
    UserRecord,
)
from .repositories import InMemoryStore
from .security import create_access_token, hash_password, verify_password


class ServiceError(Exception):
    pass


class AuthenticationError(ServiceError):
    pass


class NotFoundError(ServiceError):
    pass


class ConflictError(ServiceError):
    pass


class CapacityError(ServiceError):
    pass


class AuthorizationError(ServiceError):
    pass


class ProfileIncompleteError(ServiceError):
    pass


def _to_user_public(user: UserRecord) -> UserPublic:
    return UserPublic(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        role=user.role,
        student_id=user.student_id,
        career=user.career,
        semester=user.semester,
    )


def _to_event_summary(event: EventRecord) -> EventSummary:
    return EventSummary(
        id=event.id,
        image=event.image,
        name=event.name,
        date=event.date,
        time=event.time,
        place=event.place,
        location=event.location,
        spots=event.spots,
        type=event.type,
        summary=event.summary,
    )


def _to_event_detail(event: EventRecord) -> EventDetail:
    return EventDetail(
        **_to_event_summary(event).model_dump(),
        agenda=event.agenda,
        requirements=event.requirements,
    )


def _to_registration_public(registration: RegistrationRecord) -> RegistrationPublic:
    return RegistrationPublic(**registration.model_dump())


def _to_user_event_registration(registration: RegistrationRecord, event: EventRecord) -> UserEventRegistration:
    return UserEventRegistration(
        registration_id=registration.id,
        event_id=registration.event_id,
        status=registration.status,
        registered_at=registration.created_at,
        event=_to_event_summary(event),
    )


def _build_username_from_student_id(student_id: str) -> str:
    normalized = re.sub(r"[^A-Za-z0-9._-]", "", student_id)
    return (normalized or "user").lower()


class AuthService:
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    def login(self, payload: LoginRequest) -> LoginResponse:
        user = self.store.get_user_by_student_id(payload.student_id)
        if not user or not user.is_active:
            raise AuthenticationError("Invalid credentials")
        if not verify_password(payload.password, user.password_hash):
            raise AuthenticationError("Invalid credentials")

        token = create_access_token(subject=user.id, role=user.role)
        return LoginResponse(access_token=token, user=_to_user_public(user))

    def start_signup(self, payload: SignUpRequest) -> LoginResponse:
        if self.store.get_user_by_student_id(payload.student_id):
            raise ConflictError("Student ID is already registered")

        candidate_username = _build_username_from_student_id(payload.student_id)
        suffix = 1
        while self.store.get_user_by_username(candidate_username):
            suffix += 1
            candidate_username = f"{_build_username_from_student_id(payload.student_id)}{suffix}"

        new_user = UserRecord(
            id=self.store.generate_user_id(),
            username=candidate_username,
            full_name=payload.full_name,
            role="user",
            password_hash=hash_password(payload.password),
            is_active=True,
            student_id=payload.student_id,
            career=payload.career,
            semester=payload.semester,
            created_at=datetime.utcnow(),
        )
        saved_user = self.store.create_user(new_user)

        token = create_access_token(subject=saved_user.id, role=saved_user.role)
        return LoginResponse(access_token=token, user=_to_user_public(saved_user))

    def get_user_public_by_id(self, user_id: str) -> UserPublic:
        user = self.store.get_user_by_id(user_id)
        if not user or not user.is_active:
            raise AuthenticationError("Invalid user")
        return _to_user_public(user)


class EventService:
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    def list_events(self, event_type: EventType | None = None, month: int | None = None) -> list[EventSummary]:
        events = self.store.list_events(event_type=event_type, month=month)
        return [_to_event_summary(event) for event in events]

    def get_event(self, event_id: str) -> EventDetail:
        event = self.store.get_event_by_id(event_id)
        if not event:
            raise NotFoundError(f"Event {event_id} not found")
        return _to_event_detail(event)

    def create_event(self, payload: EventCreateRequest) -> EventDetail:
        now = datetime.utcnow()
        event = EventRecord(
            id=self.store.generate_event_id(),
            image=payload.image,
            name=payload.name,
            date=payload.date,
            time=payload.time,
            place=payload.place,
            location=payload.location,
            spots=payload.spots,
            type=payload.type,
            summary=payload.summary,
            agenda=payload.agenda,
            requirements=payload.requirements,
            created_at=now,
            updated_at=now,
        )
        created = self.store.create_event(event)
        return _to_event_detail(created)

    def update_event(self, event_id: str, payload: EventUpdateRequest) -> EventDetail:
        existing = self.store.get_event_by_id(event_id)
        if not existing:
            raise NotFoundError(f"Event {event_id} not found")

        updated = EventRecord(
            id=existing.id,
            image=payload.image,
            name=payload.name,
            date=payload.date,
            time=payload.time,
            place=payload.place,
            location=payload.location,
            spots=payload.spots,
            type=payload.type,
            summary=payload.summary,
            agenda=payload.agenda,
            requirements=payload.requirements,
            created_at=existing.created_at,
            updated_at=datetime.utcnow(),
        )
        saved = self.store.update_event(updated)
        return _to_event_detail(saved)

    def delete_event(self, event_id: str) -> None:
        if not self.store.delete_event(event_id):
            raise NotFoundError(f"Event {event_id} not found")


class RegistrationService:
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    def create_registration(self, payload: RegistrationCreate) -> RegistrationPublic:
        event = self.store.get_event_by_id(payload.event_id)
        if not event:
            raise NotFoundError(f"Event {payload.event_id} not found")

        existing = self.store.get_registration_by_event_and_student(payload.event_id, payload.student_id)
        if existing and existing.status == RegistrationStatus.REGISTERED:
            raise ConflictError("Ya te encuentras registrado en este evento")

        if event.spots <= 0:
            raise CapacityError("No spots available for this event")

        # Reuse the same registration row if it was previously cancelled.
        if existing and existing.status == RegistrationStatus.CANCELLED:
            existing.status = RegistrationStatus.REGISTERED
            saved = self.store.update_registration(existing)

            event.spots -= 1
            event.updated_at = datetime.utcnow()
            self.store.save_event(event)
            return _to_registration_public(saved)

        registration = RegistrationRecord(
            id=self.store.generate_registration_id(),
            event_id=payload.event_id,
            full_name=payload.full_name,
            student_id=payload.student_id,
            career=payload.career,
            semester=payload.semester,
            status=RegistrationStatus.REGISTERED,
            created_at=datetime.utcnow(),
        )
        saved = self.store.create_registration(registration)

        event.spots -= 1
        event.updated_at = datetime.utcnow()
        self.store.save_event(event)

        return _to_registration_public(saved)

    def list_registrations_by_event(self, event_id: str) -> list[RegistrationPublic]:
        if not self.store.get_event_by_id(event_id):
            raise NotFoundError(f"Event {event_id} not found")
        records = self.store.list_registrations(event_id=event_id)
        return [_to_registration_public(record) for record in records]

    def list_registrations_by_current_user(self, current_user: UserPublic) -> list[UserEventRegistration]:
        if current_user.role != "user":
            raise AuthorizationError("Only student accounts can list personal registrations")

        records = self.store.list_registrations(student_id=current_user.student_id)
        registrations: list[UserEventRegistration] = []
        for record in records:
            event = self.store.get_event_by_id(record.event_id)
            if event:
                registrations.append(_to_user_event_registration(record, event))
        return registrations

    def create_registration_from_user(self, event_id: str, current_user: UserPublic) -> RegistrationPublic:
        if current_user.role != "user":
            raise AuthorizationError("Only student accounts can register to events")

        if (
            not current_user.student_id
            or not current_user.career
            or current_user.semester is None
        ):
            raise ProfileIncompleteError("Your account profile is incomplete to register an event")

        payload = RegistrationCreate(
            event_id=event_id,
            full_name=current_user.full_name,
            student_id=current_user.student_id,
            career=current_user.career,
            semester=current_user.semester,
        )
        return self.create_registration(payload)

    def cancel_registration_from_user(self, event_id: str, current_user: UserPublic) -> RegistrationPublic:
        if current_user.role != "user":
            raise AuthorizationError("Only student accounts can cancel event registrations")

        if not current_user.student_id:
            raise AuthorizationError("Student account without student ID cannot cancel registrations")

        event = self.store.get_event_by_id(event_id)
        if not event:
            raise NotFoundError(f"Event {event_id} not found")

        existing = self.store.get_registration_by_event_and_student(event_id, current_user.student_id)
        if not existing:
            raise NotFoundError("You are not registered for this event")

        if existing.status == RegistrationStatus.CANCELLED:
            raise ConflictError("This registration is already cancelled")

        existing.status = RegistrationStatus.CANCELLED
        saved = self.store.update_registration(existing)

        event.spots += 1
        event.updated_at = datetime.utcnow()
        self.store.save_event(event)

        return _to_registration_public(saved)


class AdminService:
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    def summary(self) -> AdminSummary:
        users = self.store.list_users()
        events = self.store.list_events()
        registrations = self.store.list_registrations()
        registrations_today = self.store.count_registrations_created_since(
            datetime.utcnow() - timedelta(days=1)
        )

        registrations_counter = Counter(registration.event_id for registration in registrations)
        top_events: list[AdminEventStats] = []
        for event in events:
            total = registrations_counter.get(event.id, 0)
            if total == 0:
                continue
            top_events.append(
                AdminEventStats(
                    event_id=event.id,
                    event_name=event.name,
                    total_registrations=total,
                    available_spots=event.spots,
                )
            )
        top_events.sort(key=lambda item: item.total_registrations, reverse=True)

        return AdminSummary(
            total_users=len(users),
            total_events=len(events),
            total_registrations=len(registrations),
            registrations_today=registrations_today,
            top_events=top_events[:5],
        )
