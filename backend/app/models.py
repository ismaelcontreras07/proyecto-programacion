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


class EventLifecycle(str, Enum):
    ACTIVE = "active"
    PAST = "past"


class EventLifecycleFilter(str, Enum):
    ACTIVE = "active"
    PAST = "past"
    ALL = "all"


class RegistrationStatus(str, Enum):
    REGISTERED = "registered"
    CANCELLED = "cancelled"


STUDENT_ID_REGEX = re.compile(r"^[A-Z0-9]{8}-[A-Z0-9]{2}$")
TIME_TOKEN_REGEX = re.compile(r"(\d{1,2}:\d{2}\s*(?:[ap]\.?m\.?)?)", re.IGNORECASE)


def _normalize_student_id(value: str) -> str:
    normalized = value.strip().upper()
    if not STUDENT_ID_REGEX.fullmatch(normalized):
        raise ValueError("Student ID must match XXXXXXXX-XX")
    return normalized


def _normalize_meridiem(token: str) -> tuple[str, str | None]:
    cleaned = token.strip().lower().replace(" ", "")
    meridiem: str | None = None
    if re.search(r"a\.?m\.?$", cleaned):
        meridiem = "am"
    elif re.search(r"p\.?m\.?$", cleaned):
        meridiem = "pm"
    cleaned = re.sub(r"(a\.?m\.?|p\.?m\.?)$", "", cleaned).replace(".", "")
    return cleaned, meridiem


def _time_token_to_minutes(token: str) -> int | None:
    normalized, meridiem = _normalize_meridiem(token)
    match = re.fullmatch(r"(\d{1,2}):(\d{2})", normalized)
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
    elif hours < 0 or hours > 23:
        return None

    return (hours * 60) + minutes


def _extract_time_window(raw_time: str) -> tuple[int, int] | None:
    tokens = TIME_TOKEN_REGEX.findall(raw_time)
    if len(tokens) < 2:
        return None

    start = _time_token_to_minutes(tokens[0])
    end = _time_token_to_minutes(tokens[1])
    if start is None or end is None:
        return None

    if end < start:
        end += 24 * 60
    return start, end


def _minutes_to_hhmm(total_minutes: int) -> str:
    minutes_per_day = 24 * 60
    normalized = ((total_minutes % minutes_per_day) + minutes_per_day) % minutes_per_day
    hours, minutes = divmod(normalized, 60)
    return f"{hours:02d}:{minutes:02d}"


def _normalize_event_time_range(raw_time: str) -> str:
    time_window = _extract_time_window(raw_time)
    if time_window is None:
        raise ValueError("Time must be in range format HH:MM - HH:MM")

    start_minutes, end_minutes = time_window
    if end_minutes <= start_minutes:
        raise ValueError("End time must be later than start time")

    return f"{_minutes_to_hhmm(start_minutes)} - {_minutes_to_hhmm(end_minutes)}"


class UserRecord(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    username: str
    first_name: str
    last_name: str
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
    first_name: str
    last_name: str
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
    lifecycle: EventLifecycle


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

    @field_validator("image", "name", "place", "location", "summary")
    @classmethod
    def normalize_text_fields(cls, value: str) -> str:
        return value.strip()

    @field_validator("time")
    @classmethod
    def normalize_event_time(cls, value: str) -> str:
        return _normalize_event_time_range(value.strip())

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
    first_name: str
    last_name: str
    student_id: str
    career: str
    semester: int = Field(ge=1, le=12)
    status: RegistrationStatus
    created_at: datetime


class UserRegistrationData(BaseModel):
    first_name: str = Field(min_length=2, max_length=80)
    last_name: str = Field(min_length=2, max_length=80)
    student_id: str = Field(min_length=3, max_length=40)
    career: str = Field(min_length=3, max_length=120)
    semester: int = Field(ge=1, le=12)

    @field_validator("student_id")
    @classmethod
    def normalize_student_id(cls, value: str) -> str:
        return _normalize_student_id(value)

    @field_validator("first_name", "last_name", "career")
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
    first_name: str
    last_name: str
    student_id: str
    career: str
    semester: int
    status: RegistrationStatus
    created_at: datetime


class EventReviewRecord(BaseModel):
    id: str
    event_id: str
    student_id: str
    first_name: str
    last_name: str
    rating: int = Field(ge=1, le=5)
    comment: str
    created_at: datetime
    updated_at: datetime


class EventReviewCreateRequest(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=3, max_length=1200)

    @field_validator("comment")
    @classmethod
    def normalize_comment(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 3:
            raise ValueError("Comment must be at least 3 characters")
        return normalized


class EventReviewPublic(BaseModel):
    id: str
    event_id: str
    first_name: str
    last_name: str
    rating: int
    comment: str
    created_at: datetime
    updated_at: datetime


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
