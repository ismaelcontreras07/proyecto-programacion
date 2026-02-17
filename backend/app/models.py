from __future__ import annotations

from datetime import date, datetime
from enum import Enum
import re
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


STUDENT_ID_REGEX = re.compile(r"^[A-Z0-9]{8}-[A-Z0-9]{2}$")


def _normalize_student_id(value: str) -> str:
    normalized = value.strip().upper()
    if not STUDENT_ID_REGEX.fullmatch(normalized):
        raise ValueError("Student ID must match XXXXXXXX-XX")
    return normalized


class UserRecord(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    username: str
    full_name: str
    role: Role
    password_hash: str
    is_active: bool = True
    student_id: str
    career: str | None = None
    semester: int | None = None
    created_at: datetime


class UserPublic(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    username: str
    full_name: str
    role: Role
    student_id: str
    career: str | None = None
    semester: int | None = None


class LoginRequest(BaseModel):
    student_id: str = Field(min_length=3, max_length=40)
    password: str = Field(min_length=3, max_length=128)

    @field_validator("student_id")
    @classmethod
    def normalize_student_id(cls, value: str) -> str:
        return _normalize_student_id(value)


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


class EventMutationBase(BaseModel):
    image: str = Field(min_length=1, max_length=255)
    name: str = Field(min_length=3, max_length=255)
    date: date
    time: str = Field(min_length=1, max_length=80)
    place: str = Field(min_length=1, max_length=180)
    location: str = Field(min_length=3, max_length=600)
    spots: int = Field(ge=0, le=50000)
    type: EventType
    summary: str = Field(min_length=10, max_length=2000)
    agenda: list[str] = Field(default_factory=list)
    requirements: list[str] = Field(default_factory=list)

    @field_validator("image", "name", "time", "place", "location", "summary")
    @classmethod
    def normalize_text_fields(cls, value: str) -> str:
        return value.strip()

    @field_validator("agenda", "requirements")
    @classmethod
    def normalize_text_lists(cls, value: list[str]) -> list[str]:
        return [item.strip() for item in value if item.strip()]


class EventCreateRequest(EventMutationBase):
    pass


class EventUpdateRequest(EventMutationBase):
    pass


class EventImageUploadResponse(BaseModel):
    image_url: str


class RegistrationRecord(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    event_id: str
    full_name: str
    student_id: str
    career: str
    semester: int = Field(ge=1, le=12)
    status: RegistrationStatus
    created_at: datetime


class UserRegistrationData(BaseModel):
    full_name: str = Field(min_length=3, max_length=120)
    student_id: str = Field(min_length=3, max_length=40)
    career: str = Field(min_length=3, max_length=120)
    semester: int = Field(ge=1, le=12)

    @field_validator("student_id")
    @classmethod
    def normalize_student_id(cls, value: str) -> str:
        return _normalize_student_id(value)

    @field_validator("full_name", "career")
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
    career: str
    semester: int
    status: RegistrationStatus
    created_at: datetime


class UserEventRegistration(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    registration_id: str
    event_id: str
    status: RegistrationStatus
    registered_at: datetime
    event: EventSummary


class SignUpRequest(UserRegistrationData):
    password: str = Field(min_length=3, max_length=128)

    @field_validator("password")
    @classmethod
    def normalize_password(cls, value: str) -> str:
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
