from __future__ import annotations

from datetime import datetime
from threading import Lock
from uuid import uuid4

from .models import EventRecord, EventType, PendingSmsVerification, RegistrationRecord, UserRecord


class InMemoryStore:
    """
    Temporary persistence layer while the SQL repository is not connected yet.
    Replace this class with a DB-backed implementation later.
    """

    def __init__(self, users: list[UserRecord], events: list[EventRecord]) -> None:
        self._lock = Lock()
        self._users_by_username = {user.username.casefold(): user.model_copy(deep=True) for user in users}
        self._users_by_email = {user.email.casefold(): user.model_copy(deep=True) for user in users}
        self._users_by_student_id = {
            user.student_id.casefold(): user.model_copy(deep=True)
            for user in users
            if user.student_id is not None
        }
        self._events_by_id = {event.id: event.model_copy(deep=True) for event in events}
        self._registrations_by_id: dict[str, RegistrationRecord] = {}
        self._pending_sms_by_id: dict[str, PendingSmsVerification] = {}

    def list_users(self) -> list[UserRecord]:
        return [user.model_copy(deep=True) for user in self._users_by_username.values()]

    def get_user_by_username(self, username: str) -> UserRecord | None:
        user = self._users_by_username.get(username.casefold())
        return user.model_copy(deep=True) if user else None

    def get_user_by_email(self, email: str) -> UserRecord | None:
        user = self._users_by_email.get(email.casefold())
        return user.model_copy(deep=True) if user else None

    def get_user_by_student_id(self, student_id: str) -> UserRecord | None:
        user = self._users_by_student_id.get(student_id.casefold())
        return user.model_copy(deep=True) if user else None

    def get_user_by_identifier(self, identifier: str) -> UserRecord | None:
        by_username = self.get_user_by_username(identifier)
        if by_username:
            return by_username
        return self.get_user_by_email(identifier)

    def create_user(self, user: UserRecord) -> UserRecord:
        with self._lock:
            saved_user = user.model_copy(deep=True)
            self._users_by_username[saved_user.username.casefold()] = saved_user
            self._users_by_email[saved_user.email.casefold()] = saved_user
            if saved_user.student_id:
                self._users_by_student_id[saved_user.student_id.casefold()] = saved_user
            return saved_user.model_copy(deep=True)

    def list_events(self, event_type: EventType | None = None, month: int | None = None) -> list[EventRecord]:
        events = list(self._events_by_id.values())
        if event_type is not None:
            events = [event for event in events if event.type == event_type]
        if month is not None:
            events = [event for event in events if event.date.month == month]
        events.sort(key=lambda event: (event.date, event.time, event.id))
        return [event.model_copy(deep=True) for event in events]

    def get_event_by_id(self, event_id: str) -> EventRecord | None:
        event = self._events_by_id.get(event_id)
        return event.model_copy(deep=True) if event else None

    def save_event(self, event: EventRecord) -> None:
        with self._lock:
            self._events_by_id[event.id] = event.model_copy(deep=True)

    def create_registration(self, registration: RegistrationRecord) -> RegistrationRecord:
        with self._lock:
            saved_registration = registration.model_copy(deep=True)
            self._registrations_by_id[saved_registration.id] = saved_registration
            return saved_registration.model_copy(deep=True)

    def generate_registration_id(self) -> str:
        return f"reg_{uuid4().hex[:16]}"

    def generate_user_id(self) -> str:
        return f"usr_{uuid4().hex[:16]}"

    def generate_sms_verification_id(self) -> str:
        return f"ver_{uuid4().hex[:18]}"

    def has_registration_for_student(self, event_id: str, student_id: str, email: str) -> bool:
        student_key = student_id.casefold()
        email_key = email.casefold()
        return any(
            registration.event_id == event_id
            and (
                registration.student_id.casefold() == student_key
                or registration.email.casefold() == email_key
            )
            for registration in self._registrations_by_id.values()
        )

    def list_registrations(self, event_id: str | None = None) -> list[RegistrationRecord]:
        records = list(self._registrations_by_id.values())
        if event_id is not None:
            records = [record for record in records if record.event_id == event_id]
        records.sort(key=lambda item: item.created_at, reverse=True)
        return [record.model_copy(deep=True) for record in records]

    def count_registrations_created_since(self, since: datetime) -> int:
        return sum(1 for registration in self._registrations_by_id.values() if registration.created_at >= since)

    def save_pending_sms_verification(self, pending: PendingSmsVerification) -> PendingSmsVerification:
        with self._lock:
            saved = pending.model_copy(deep=True)
            self._pending_sms_by_id[saved.id] = saved
            return saved.model_copy(deep=True)

    def get_pending_sms_verification(self, verification_id: str) -> PendingSmsVerification | None:
        pending = self._pending_sms_by_id.get(verification_id)
        return pending.model_copy(deep=True) if pending else None

    def update_pending_sms_verification(self, pending: PendingSmsVerification) -> None:
        with self._lock:
            self._pending_sms_by_id[pending.id] = pending.model_copy(deep=True)

    def delete_pending_sms_verification(self, verification_id: str) -> None:
        with self._lock:
            self._pending_sms_by_id.pop(verification_id, None)

