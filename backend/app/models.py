from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field, field_validator


class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"


class EventType(str, Enum):
    ONSITE = "Presencial"
    ONLINE = "En línea"


class RegistrationStatus(str, Enum):
    REGISTERED = "registered"
    CANCELLED = "cancelled"


class UserRecord(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    username: str
    full_name: str
    email: str
    role: Role
    password_hash: str
    is_active: bool = True
    student_id: str | None = None
    career: str | None = None
    semester: int | None = None
    phone: str | None = None
    phone_verified: bool = False
    created_at: datetime


class UserPublic(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    username: str
    full_name: str
    email: str
    role: Role
    student_id: str | None = None
    career: str | None = None
    semester: int | None = None
    phone: str | None = None
    phone_verified: bool = False


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=3, max_length=128)

    @field_validator("identifier")
    @classmethod
    def normalize_identifier(cls, value: str) -> str:
        return value.strip().lower()


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class TokenPayload(BaseModel):
    sub: str
    role: Role
    exp: int


class EventRecord(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    image: str
    name: str
    date: date
    time: str
    place: str
    location: str
    spots: int = Field(ge=0)
    type: EventType
    summary: str
    agenda: list[str]
    requirements: list[str]
    created_at: datetime
    updated_at: datetime


class EventSummary(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    image: str
    name: str
    date: date
    time: str
    place: str
    location: str
    spots: int
    type: EventType
    summary: str


class EventDetail(EventSummary):
    agenda: list[str]
    requirements: list[str]


class RegistrationRecord(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    event_id: str
    full_name: str
    student_id: str
    email: str
    career: str
    semester: int = Field(ge=1, le=12)
    phone: str
    status: RegistrationStatus
    created_at: datetime


class UserRegistrationData(BaseModel):
    full_name: str = Field(min_length=3, max_length=120)
    student_id: str = Field(min_length=3, max_length=40)
    email: str = Field(min_length=6, max_length=254)
    career: str = Field(min_length=3, max_length=120)
    semester: int = Field(ge=1, le=12)
    phone: str = Field(min_length=8, max_length=20)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.split("@")[-1]:
            raise ValueError("Invalid email format")
        return normalized

    @field_validator("full_name", "student_id", "career", "phone")
    @classmethod
    def normalize_strings(cls, value: str) -> str:
        return value.strip()


class RegistrationCreate(UserRegistrationData):
    event_id: str = Field(min_length=1)


class RegistrationEnrollRequest(BaseModel):
    event_id: str = Field(min_length=1)


class RegistrationPublic(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    event_id: str
    full_name: str
    student_id: str
    email: str
    career: str
    semester: int
    phone: str
    status: RegistrationStatus
    created_at: datetime


class SignUpRequest(UserRegistrationData):
    pass


class PendingSmsVerification(BaseModel):
    id: str
    code: str
    full_name: str
    student_id: str
    email: str
    career: str
    semester: int
    phone: str
    expires_at: datetime
    attempts: int = 0


class SignUpResponse(BaseModel):
    verification_id: str
    expires_in_seconds: int
    sms_destination: str
    dev_sms_code: str | None = None
    message: str


class VerifySmsRequest(BaseModel):
    verification_id: str = Field(min_length=8, max_length=80)
    code: str = Field(min_length=4, max_length=8)

    @field_validator("verification_id", "code")
    @classmethod
    def normalize_inputs(cls, value: str) -> str:
        return value.strip()


class AdminEventStats(BaseModel):
    event_id: str
    event_name: str
    total_registrations: int
    available_spots: int


class AdminSummary(BaseModel):
    total_users: int
    total_events: int
    total_registrations: int
    registrations_today: int
    top_events: list[AdminEventStats]
