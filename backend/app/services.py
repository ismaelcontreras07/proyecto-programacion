from __future__ import annotations

import random
import re
from collections import Counter
from datetime import datetime, timedelta

from .models import (
    AdminEventStats,
    AdminSummary,
    EventDetail,
    EventRecord,
    EventSummary,
    EventType,
    LoginRequest,
    LoginResponse,
    PendingSmsVerification,
    RegistrationCreate,
    RegistrationPublic,
    RegistrationRecord,
    RegistrationStatus,
    SignUpRequest,
    SignUpResponse,
    UserPublic,
    UserRecord,
    VerifySmsRequest,
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


class VerificationError(ServiceError):
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
        email=user.email,
        role=user.role,
        student_id=user.student_id,
        career=user.career,
        semester=user.semester,
        phone=user.phone,
        phone_verified=user.phone_verified,
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


def _mask_phone(phone: str) -> str:
    digits = re.sub(r"\D+", "", phone)
    if len(digits) <= 4:
        return phone
    return f"{'*' * (len(digits) - 4)}{digits[-4:]}"


def _build_username_from_email(email: str) -> str:
    local_part = email.split("@", 1)[0]
    local_part = re.sub(r"[^a-zA-Z0-9._-]", "", local_part)
    return (local_part or "user").lower()


class AuthService:
    SMS_CODE_TTL_SECONDS = 300
    MAX_SMS_ATTEMPTS = 5

    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    def login(self, payload: LoginRequest) -> LoginResponse:
        user = self.store.get_user_by_identifier(payload.identifier)
        if not user or not user.is_active:
            raise AuthenticationError("Invalid credentials")
        if not verify_password(payload.password, user.password_hash):
            raise AuthenticationError("Invalid credentials")

        token = create_access_token(subject=user.username, role=user.role)
        return LoginResponse(access_token=token, user=_to_user_public(user))

    def start_signup(self, payload: SignUpRequest) -> SignUpResponse:
        if self.store.get_user_by_email(payload.email):
            raise ConflictError("Email is already registered")
        if self.store.get_user_by_student_id(payload.student_id):
            raise ConflictError("Student ID is already registered")

        verification_id = self.store.generate_sms_verification_id()
        sms_code = f"{random.randint(0, 999999):06d}"
        pending = PendingSmsVerification(
            id=verification_id,
            code=sms_code,
            full_name=payload.full_name,
            student_id=payload.student_id,
            email=payload.email,
            career=payload.career,
            semester=payload.semester,
            phone=payload.phone,
            expires_at=datetime.utcnow() + timedelta(seconds=self.SMS_CODE_TTL_SECONDS),
            attempts=0,
        )
        self.store.save_pending_sms_verification(pending)

        print(f"[SMS] Sending verification code {sms_code} to {payload.phone}")

        return SignUpResponse(
            verification_id=verification_id,
            expires_in_seconds=self.SMS_CODE_TTL_SECONDS,
            sms_destination=_mask_phone(payload.phone),
            dev_sms_code=sms_code,
            message="Verification code sent via SMS. Your initial password will be your student ID.",
        )

    def verify_sms(self, payload: VerifySmsRequest) -> LoginResponse:
        pending = self.store.get_pending_sms_verification(payload.verification_id)
        if not pending:
            raise NotFoundError("Verification request not found")
        if pending.expires_at < datetime.utcnow():
            self.store.delete_pending_sms_verification(pending.id)
            raise VerificationError("Verification code expired")
        if pending.attempts >= self.MAX_SMS_ATTEMPTS:
            self.store.delete_pending_sms_verification(pending.id)
            raise VerificationError("Verification attempts exceeded")

        if pending.code != payload.code:
            pending.attempts += 1
            self.store.update_pending_sms_verification(pending)
            raise VerificationError("Invalid verification code")

        if self.store.get_user_by_email(pending.email):
            self.store.delete_pending_sms_verification(pending.id)
            raise ConflictError("Email is already registered")
        if self.store.get_user_by_student_id(pending.student_id):
            self.store.delete_pending_sms_verification(pending.id)
            raise ConflictError("Student ID is already registered")

        candidate_username = _build_username_from_email(pending.email)
        suffix = 1
        while self.store.get_user_by_username(candidate_username):
            suffix += 1
            candidate_username = f"{_build_username_from_email(pending.email)}{suffix}"

        new_user = UserRecord(
            id=self.store.generate_user_id(),
            username=candidate_username,
            full_name=pending.full_name,
            email=pending.email,
            role="user",
            password_hash=hash_password(pending.student_id),
            is_active=True,
            student_id=pending.student_id,
            career=pending.career,
            semester=pending.semester,
            phone=pending.phone,
            phone_verified=True,
            created_at=datetime.utcnow(),
        )
        saved_user = self.store.create_user(new_user)
        self.store.delete_pending_sms_verification(pending.id)

        token = create_access_token(subject=saved_user.username, role=saved_user.role)
        return LoginResponse(access_token=token, user=_to_user_public(saved_user))

    def get_user_public_by_username(self, username: str) -> UserPublic:
        user = self.store.get_user_by_username(username)
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


class RegistrationService:
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    def create_registration(self, payload: RegistrationCreate) -> RegistrationPublic:
        event = self.store.get_event_by_id(payload.event_id)
        if not event:
            raise NotFoundError(f"Event {payload.event_id} not found")

        if event.spots <= 0:
            raise CapacityError("No spots available for this event")

        if self.store.has_registration_for_student(payload.event_id, payload.student_id, payload.email):
            raise ConflictError("This student is already registered for the event")

        registration = RegistrationRecord(
            id=self.store.generate_registration_id(),
            event_id=payload.event_id,
            full_name=payload.full_name,
            student_id=payload.student_id,
            email=payload.email,
            career=payload.career,
            semester=payload.semester,
            phone=payload.phone,
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

    def create_registration_from_user(self, event_id: str, current_user: UserPublic) -> RegistrationPublic:
        if current_user.role != "user":
            raise AuthorizationError("Only student accounts can register to events")

        if (
            not current_user.student_id
            or not current_user.career
            or current_user.semester is None
            or not current_user.phone
        ):
            raise ProfileIncompleteError("Your account profile is incomplete to register an event")

        payload = RegistrationCreate(
            event_id=event_id,
            full_name=current_user.full_name,
            student_id=current_user.student_id,
            email=current_user.email,
            career=current_user.career,
            semester=current_user.semester,
            phone=current_user.phone,
        )
        return self.create_registration(payload)


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
