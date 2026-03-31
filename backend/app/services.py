from __future__ import annotations

import os
import re
from collections import Counter
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from .models import (
    AdminEventStats,
    AdminSummary,
    EventDetail,
    EventCreateRequest,
    EventLifecycle,
    EventLifecycleFilter,
    EventRecord,
    EventReviewCreateRequest,
    EventReviewPublic,
    EventReviewRecord,
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

APP_TIMEZONE = os.getenv("APP_TIMEZONE", "America/Mexico_City")
try:
    APP_ZONE = ZoneInfo(APP_TIMEZONE)
except Exception:
    APP_ZONE = ZoneInfo("UTC")


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
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        student_id=user.student_id,
        career=user.career,
        semester=user.semester,
    )


def _to_event_summary(event: EventRecord) -> EventSummary:
    lifecycle = _event_lifecycle(event)
    return EventSummary(
        id=event.id,
        image=event.image,
        name=event.name,
        date=event.date,
        time=_normalize_event_time_for_output(event.time),
        place=event.place,
        location=event.location,
        spots=event.spots,
        type=event.type,
        summary=event.summary,
        lifecycle=lifecycle,
    )


def _to_event_detail(event: EventRecord) -> EventDetail:
    return EventDetail(
        **_to_event_summary(event).model_dump(),
        agenda=event.agenda,
        requirements=event.requirements,
    )


def _to_registration_public(registration: RegistrationRecord) -> RegistrationPublic:
    return RegistrationPublic(**registration.model_dump())


def _to_event_review_public(review: EventReviewRecord) -> EventReviewPublic:
    return EventReviewPublic(
        id=review.id,
        event_id=review.event_id,
        first_name=review.first_name,
        last_name=review.last_name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


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


TIME_TOKEN_REGEX = re.compile(r"(\d{1,2}:\d{2}\s*(?:[ap]\.?m\.?)?)", re.IGNORECASE)


def _normalize_meridiem(token: str) -> tuple[str, str | None]:
    cleaned = token.strip().lower().replace(" ", "")
    meridiem: str | None = None
    if re.search(r"a\.?m\.?$", cleaned):
        meridiem = "am"
    elif re.search(r"p\.?m\.?$", cleaned):
        meridiem = "pm"
    cleaned = re.sub(r"(a\.?m\.?|p\.?m\.?)$", "", cleaned)
    cleaned = cleaned.replace(".", "")
    return cleaned, meridiem


def _time_token_to_minutes(token: str) -> int | None:
    normalized_token, meridiem = _normalize_meridiem(token)
    match = re.fullmatch(r"(\d{1,2}):(\d{2})", normalized_token)
    if not match:
        return None

    hours = int(match.group(1))
    minutes = int(match.group(2))

    if minutes < 0 or minutes > 59:
        return None

    if meridiem is not None:
        if hours < 1 or hours > 12:
            return None
        if meridiem == "am":
            hours = 0 if hours == 12 else hours
        else:
            hours = 12 if hours == 12 else hours + 12
    else:
        if hours < 0 or hours > 23:
            return None

    return hours * 60 + minutes


def _extract_time_window(raw_time: str) -> tuple[int, int] | None:
    tokens = TIME_TOKEN_REGEX.findall(raw_time)
    if not tokens:
        return None

    first = _time_token_to_minutes(tokens[0])
    if first is None:
        return None

    if len(tokens) == 1:
        return first, first

    second = _time_token_to_minutes(tokens[1])
    if second is None:
        return None

    if second < first:
        # Gracefully support rare ranges that cross midnight.
        second += 24 * 60

    return first, second


def _normalize_interval(start: int, end: int) -> tuple[int, int]:
    if end == start:
        return start, start + 1
    return start, end


def _has_time_overlap(window_a: tuple[int, int] | None, window_b: tuple[int, int] | None) -> bool:
    if window_a is not None and window_b is not None:
        a_start, a_end = _normalize_interval(*window_a)
        b_start, b_end = _normalize_interval(*window_b)
        return max(a_start, b_start) < min(a_end, b_end)

    return False


def _normalize_time_text(raw_time: str) -> str:
    return re.sub(r"\s+", "", raw_time.casefold())


def _minutes_to_hhmm(total_minutes: int) -> str:
    minutes_per_day = 24 * 60
    normalized = ((total_minutes % minutes_per_day) + minutes_per_day) % minutes_per_day
    hours, minutes = divmod(normalized, 60)
    return f"{hours:02d}:{minutes:02d}"


def _normalize_event_time_for_output(raw_time: str) -> str:
    time_window = _extract_time_window(raw_time)
    if time_window is None:
        return raw_time.strip()

    start_minutes, end_minutes = time_window
    if end_minutes <= start_minutes:
        return raw_time.strip()

    return f"{_minutes_to_hhmm(start_minutes)} - {_minutes_to_hhmm(end_minutes)}"


def _local_now() -> datetime:
    # Compare event schedule with a stable app timezone to avoid server-tz drift.
    return datetime.now(APP_ZONE).replace(tzinfo=None)


def _to_csv_cell(value: object) -> str:
    text = "" if value is None else str(value)
    if text.startswith(("=", "+", "-", "@")):
        return f"'{text}"
    return text


def _event_end_datetime(event: EventRecord) -> datetime:
    base = datetime.combine(event.date, datetime.min.time())
    time_window = _extract_time_window(event.time)
    if time_window is None:
        # Unknown formats are treated as whole-day events to avoid early "past" transitions.
        return base + timedelta(hours=23, minutes=59, seconds=59)

    _, end_minutes = _normalize_interval(*time_window)
    return base + timedelta(minutes=end_minutes)


def _event_lifecycle(event: EventRecord, now: datetime | None = None) -> EventLifecycle:
    reference = now or _local_now()
    if _event_end_datetime(event) < reference:
        return EventLifecycle.PAST
    return EventLifecycle.ACTIVE


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
            first_name=payload.first_name,
            last_name=payload.last_name,
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

    def list_events(
        self,
        event_type: EventType | None = None,
        month: int | None = None,
        lifecycle: EventLifecycleFilter = EventLifecycleFilter.ALL,
    ) -> list[EventSummary]:
        events = self.store.list_events(event_type=event_type, month=month)
        if lifecycle != EventLifecycleFilter.ALL:
            target_lifecycle = EventLifecycle.ACTIVE if lifecycle == EventLifecycleFilter.ACTIVE else EventLifecycle.PAST
            now = _local_now()
            events = [event for event in events if _event_lifecycle(event, now) == target_lifecycle]
        return [_to_event_summary(event) for event in events]

    def get_event(self, event_id: str) -> EventDetail:
        event = self.store.get_event_by_id(event_id)
        if not event:
            raise NotFoundError(f"Event {event_id} not found")
        return _to_event_detail(event)

    def list_event_reviews(self, event_id: str) -> list[EventReviewPublic]:
        event = self.store.get_event_by_id(event_id)
        if not event:
            raise NotFoundError(f"Event {event_id} not found")
        reviews = self.store.list_reviews(event_id=event_id)
        return [_to_event_review_public(review) for review in reviews]

    def create_or_update_review(
        self,
        event_id: str,
        payload: EventReviewCreateRequest,
        current_user: UserPublic,
    ) -> EventReviewPublic:
        if current_user.role != "user":
            raise AuthorizationError("Only student accounts can post event reviews")
        if not current_user.student_id:
            raise AuthorizationError("Student account without student ID cannot post event reviews")

        event = self.store.get_event_by_id(event_id)
        if not event:
            raise NotFoundError(f"Event {event_id} not found")
        if _event_lifecycle(event) != EventLifecycle.PAST:
            raise ConflictError("Solo puedes calificar eventos que ya finalizaron")

        registration = self.store.get_registration_by_event_and_student(event_id, current_user.student_id)
        if not registration or registration.status != RegistrationStatus.REGISTERED:
            raise AuthorizationError("Solo alumnos registrados pueden calificar este evento")

        existing = self.store.get_review_by_event_and_student(event_id, current_user.student_id)
        now = datetime.utcnow()
        if existing:
            existing.rating = payload.rating
            existing.comment = payload.comment
            existing.first_name = current_user.first_name
            existing.last_name = current_user.last_name
            existing.updated_at = now
            saved = self.store.update_review(existing)
            return _to_event_review_public(saved)

        review = EventReviewRecord(
            id=self.store.generate_review_id(),
            event_id=event_id,
            student_id=current_user.student_id,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            rating=payload.rating,
            comment=payload.comment,
            created_at=now,
            updated_at=now,
        )
        saved = self.store.create_review(review)
        return _to_event_review_public(saved)

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

    def _has_schedule_conflict(self, student_id: str, target_event: EventRecord) -> bool:
        target_window = _extract_time_window(target_event.time)

        registrations = self.store.list_registrations(student_id=student_id)
        for registration in registrations:
            if registration.status != RegistrationStatus.REGISTERED:
                continue
            if registration.event_id == target_event.id:
                continue

            existing_event = self.store.get_event_by_id(registration.event_id)
            if not existing_event:
                continue
            if existing_event.date != target_event.date:
                continue

            existing_window = _extract_time_window(existing_event.time)
            if _has_time_overlap(target_window, existing_window):
                return True

            # Fallback for uncommon/invalid time formats: if both strings are effectively equal, treat as conflict.
            if (
                (target_window is None or existing_window is None)
                and _normalize_time_text(target_event.time) == _normalize_time_text(existing_event.time)
            ):
                return True

        return False

    def create_registration(self, payload: RegistrationCreate) -> RegistrationPublic:
        event = self.store.get_event_by_id(payload.event_id)
        if not event:
            raise NotFoundError(f"Event {payload.event_id} not found")
        if _event_lifecycle(event) == EventLifecycle.PAST:
            raise ConflictError("No puedes registrarte a un evento que ya finalizó")

        if self._has_schedule_conflict(payload.student_id, event):
            raise ConflictError("Ya tienes otro evento registrado que se empalma en fecha y horario")

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
            first_name=payload.first_name,
            last_name=payload.last_name,
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
            first_name=current_user.first_name,
            last_name=current_user.last_name,
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

    def events_report(self) -> tuple[list[str], list[list[str]]]:
        events = self.store.list_events()
        registrations = self.store.list_registrations()

        registered_counter = Counter(
            registration.event_id
            for registration in registrations
            if registration.status == RegistrationStatus.REGISTERED
        )
        cancelled_counter = Counter(
            registration.event_id
            for registration in registrations
            if registration.status == RegistrationStatus.CANCELLED
        )

        headers = [
            "event_id",
            "event_name",
            "date",
            "time",
            "type",
            "place",
            "location",
            "registered_count",
            "cancelled_count",
            "available_spots",
        ]
        rows: list[list[str]] = []
        for event in events:
            rows.append(
                [
                    _to_csv_cell(event.id),
                    _to_csv_cell(event.name),
                    _to_csv_cell(event.date.isoformat()),
                    _to_csv_cell(_normalize_event_time_for_output(event.time)),
                    _to_csv_cell(event.type),
                    _to_csv_cell(event.place),
                    _to_csv_cell(event.location),
                    _to_csv_cell(registered_counter.get(event.id, 0)),
                    _to_csv_cell(cancelled_counter.get(event.id, 0)),
                    _to_csv_cell(event.spots),
                ]
            )

        return headers, rows

    def registrations_report(self) -> tuple[list[str], list[list[str]]]:
        events_by_id = {event.id: event for event in self.store.list_events()}
        registrations = self.store.list_registrations()

        headers = [
            "registration_id",
            "event_id",
            "event_name",
            "event_date",
            "event_time",
            "status",
            "student_id",
            "first_name",
            "last_name",
            "career",
            "semester",
            "registered_at",
        ]
        rows: list[list[str]] = []
        for registration in registrations:
            event = events_by_id.get(registration.event_id)
            rows.append(
                [
                    _to_csv_cell(registration.id),
                    _to_csv_cell(registration.event_id),
                    _to_csv_cell(event.name if event else ""),
                    _to_csv_cell(event.date.isoformat() if event else ""),
                    _to_csv_cell(_normalize_event_time_for_output(event.time) if event else ""),
                    _to_csv_cell(registration.status),
                    _to_csv_cell(registration.student_id),
                    _to_csv_cell(registration.first_name),
                    _to_csv_cell(registration.last_name),
                    _to_csv_cell(registration.career),
                    _to_csv_cell(registration.semester),
                    _to_csv_cell(registration.created_at.isoformat(sep=" ", timespec="seconds")),
                ]
            )

        return headers, rows
