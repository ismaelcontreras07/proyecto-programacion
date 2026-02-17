from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from pathlib import Path
from threading import Lock
from uuid import uuid4

from .database import get_connection, get_db_path
from .models import EventRecord, EventType, RegistrationRecord, UserRecord


def _to_datetime(value: str | datetime) -> datetime:
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(value)


def _to_date(value: str | date) -> date:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(value)


def _enum_value(value: str | Enum) -> str:
    if isinstance(value, Enum):
        return str(value.value)
    return str(value)


class InMemoryStore:
    def __init__(self, users: list[UserRecord], events: list[EventRecord]) -> None:
        self._lock = Lock()
        self._users_by_id = {user.id: user.model_copy(deep=True) for user in users}
        self._users_by_username = {user.username.casefold(): user.model_copy(deep=True) for user in users}
        self._users_by_student_id = {user.student_id.casefold(): user.model_copy(deep=True) for user in users}
        self._events_by_id = {event.id: event.model_copy(deep=True) for event in events}
        self._registrations_by_id: dict[str, RegistrationRecord] = {}

    def list_users(self) -> list[UserRecord]:
        return [user.model_copy(deep=True) for user in self._users_by_id.values()]

    def get_user_by_id(self, user_id: str) -> UserRecord | None:
        user = self._users_by_id.get(user_id)
        return user.model_copy(deep=True) if user else None

    def get_user_by_username(self, username: str) -> UserRecord | None:
        user = self._users_by_username.get(username.casefold())
        return user.model_copy(deep=True) if user else None

    def get_user_by_student_id(self, student_id: str) -> UserRecord | None:
        user = self._users_by_student_id.get(student_id.casefold())
        return user.model_copy(deep=True) if user else None

    def create_user(self, user: UserRecord) -> UserRecord:
        with self._lock:
            saved_user = user.model_copy(deep=True)
            self._users_by_id[saved_user.id] = saved_user
            self._users_by_username[saved_user.username.casefold()] = saved_user
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

    def create_event(self, event: EventRecord) -> EventRecord:
        with self._lock:
            saved_event = event.model_copy(deep=True)
            self._events_by_id[saved_event.id] = saved_event
            return saved_event.model_copy(deep=True)

    def update_event(self, event: EventRecord) -> EventRecord:
        with self._lock:
            if event.id not in self._events_by_id:
                raise KeyError(event.id)
            saved_event = event.model_copy(deep=True)
            self._events_by_id[saved_event.id] = saved_event
            return saved_event.model_copy(deep=True)

    def delete_event(self, event_id: str) -> bool:
        with self._lock:
            existing = self._events_by_id.pop(event_id, None)
            if not existing:
                return False
            self._registrations_by_id = {
                registration_id: registration
                for registration_id, registration in self._registrations_by_id.items()
                if registration.event_id != event_id
            }
            return True

    def create_registration(self, registration: RegistrationRecord) -> RegistrationRecord:
        with self._lock:
            saved_registration = registration.model_copy(deep=True)
            self._registrations_by_id[saved_registration.id] = saved_registration
            return saved_registration.model_copy(deep=True)

    def update_registration(self, registration: RegistrationRecord) -> RegistrationRecord:
        with self._lock:
            if registration.id not in self._registrations_by_id:
                raise KeyError(registration.id)
            saved_registration = registration.model_copy(deep=True)
            self._registrations_by_id[saved_registration.id] = saved_registration
            return saved_registration.model_copy(deep=True)

    def generate_registration_id(self) -> str:
        return f"reg_{uuid4().hex[:16]}"

    def generate_user_id(self) -> str:
        return f"usr_{uuid4().hex[:16]}"

    def generate_event_id(self) -> str:
        return f"evt_{uuid4().hex[:16]}"

    def has_registration_for_student(self, event_id: str, student_id: str) -> bool:
        student_key = student_id.casefold()
        return any(
            registration.event_id == event_id
            and registration.student_id.casefold() == student_key
            and registration.status == "registered"
            for registration in self._registrations_by_id.values()
        )

    def get_registration_by_event_and_student(self, event_id: str, student_id: str) -> RegistrationRecord | None:
        student_key = student_id.casefold()
        for registration in self._registrations_by_id.values():
            if registration.event_id == event_id and registration.student_id.casefold() == student_key:
                return registration.model_copy(deep=True)
        return None

    def list_registrations(
        self,
        event_id: str | None = None,
        student_id: str | None = None,
    ) -> list[RegistrationRecord]:
        records = list(self._registrations_by_id.values())
        if event_id is not None:
            records = [record for record in records if record.event_id == event_id]
        if student_id is not None:
            student_key = student_id.casefold()
            records = [record for record in records if record.student_id.casefold() == student_key]
        records.sort(key=lambda item: item.created_at, reverse=True)
        return [record.model_copy(deep=True) for record in records]

    def count_registrations_created_since(self, since: datetime) -> int:
        return sum(1 for registration in self._registrations_by_id.values() if registration.created_at >= since)


class SqliteStore:
    def __init__(self, db_path: Path | None = None) -> None:
        self._db_path = db_path or get_db_path()
        self._lock = Lock()

    def _conn(self):
        return get_connection(self._db_path)

    @staticmethod
    def _row_to_user(row) -> UserRecord:
        return UserRecord(
            id=row["id"],
            username=row["username"],
            full_name=row["full_name"],
            role=row["role"],
            password_hash=row["password_hash"],
            is_active=bool(row["is_active"]),
            student_id=row["student_id"],
            career=row["career"],
            semester=row["semester"],
            created_at=_to_datetime(row["created_at"]),
        )

    @staticmethod
    def _event_text_items(connection, table_name: str, event_id: str) -> list[str]:
        if table_name not in {"event_agenda_items", "event_requirements"}:
            raise ValueError("Invalid event table name")
        rows = connection.execute(
            f"SELECT description FROM {table_name} WHERE event_id = ? ORDER BY item_order ASC",
            (event_id,),
        ).fetchall()
        return [row["description"] for row in rows]

    @classmethod
    def _row_to_event(cls, connection, row) -> EventRecord:
        event_id = row["id"]
        return EventRecord(
            id=event_id,
            image=row["image"],
            name=row["name"],
            date=_to_date(row["event_date"]),
            time=row["event_time"],
            place=row["place"],
            location=row["location"],
            spots=row["spots"],
            type=row["event_type"],
            summary=row["summary"],
            agenda=cls._event_text_items(connection, "event_agenda_items", event_id),
            requirements=cls._event_text_items(connection, "event_requirements", event_id),
            created_at=_to_datetime(row["created_at"]),
            updated_at=_to_datetime(row["updated_at"]),
        )

    @staticmethod
    def _row_to_registration(row) -> RegistrationRecord:
        return RegistrationRecord(
            id=row["id"],
            event_id=row["event_id"],
            full_name=row["full_name"],
            student_id=row["student_id"],
            career=row["career"],
            semester=row["semester"],
            status=row["status"],
            created_at=_to_datetime(row["created_at"]),
        )

    @staticmethod
    def _format_datetime(value: datetime) -> str:
        return value.isoformat(sep=" ", timespec="seconds")

    def seed_if_empty(self, users: list[UserRecord], events: list[EventRecord]) -> None:
        with self._lock:
            with self._conn() as connection:
                users_count = connection.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"]
                events_count = connection.execute("SELECT COUNT(*) AS total FROM events").fetchone()["total"]
                admin_seed = next((user for user in users if _enum_value(user.role) == "admin"), None)

                if users_count == 0:
                    for user in users:
                        created_at = self._format_datetime(user.created_at)
                        connection.execute(
                            """
                            INSERT INTO users (
                                id, username, full_name, student_id, career, semester, role,
                                password_hash, is_active, created_at, updated_at
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (
                                user.id,
                                user.username,
                                user.full_name,
                                user.student_id,
                                user.career,
                                user.semester,
                                _enum_value(user.role),
                                user.password_hash,
                                int(user.is_active),
                                created_at,
                                created_at,
                            ),
                        )
                elif admin_seed is not None:
                    admin_count = connection.execute(
                        "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'"
                    ).fetchone()["total"]
                    if admin_count == 0:
                        existing = connection.execute(
                            """
                            SELECT id
                            FROM users
                            WHERE username = ? COLLATE NOCASE
                               OR student_id = ? COLLATE NOCASE
                            LIMIT 1
                            """,
                            (admin_seed.username, admin_seed.student_id),
                        ).fetchone()
                        if existing:
                            connection.execute(
                                """
                                UPDATE users
                                SET
                                    full_name = ?,
                                    role = 'admin',
                                    password_hash = ?,
                                    is_active = 1,
                                    updated_at = ?
                                WHERE id = ?
                                """,
                                (
                                    admin_seed.full_name,
                                    admin_seed.password_hash,
                                    self._format_datetime(admin_seed.created_at),
                                    existing["id"],
                                ),
                            )
                        else:
                            created_at = self._format_datetime(admin_seed.created_at)
                            connection.execute(
                                """
                                INSERT INTO users (
                                    id, username, full_name, student_id, career, semester, role,
                                    password_hash, is_active, created_at, updated_at
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                """,
                                (
                                    admin_seed.id,
                                    admin_seed.username,
                                    admin_seed.full_name,
                                    admin_seed.student_id,
                                    admin_seed.career,
                                    admin_seed.semester,
                                    _enum_value(admin_seed.role),
                                    admin_seed.password_hash,
                                    int(admin_seed.is_active),
                                    created_at,
                                    created_at,
                                ),
                            )

                if events_count == 0:
                    for event in events:
                        connection.execute(
                            """
                            INSERT INTO events (
                                id, image, name, event_date, event_time, place, location, spots, event_type,
                                summary, is_active, created_at, updated_at
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """,
                            (
                                event.id,
                                event.image,
                                event.name,
                                event.date.isoformat(),
                                event.time,
                                event.place,
                                event.location,
                                event.spots,
                                _enum_value(event.type),
                                event.summary,
                                1,
                                self._format_datetime(event.created_at),
                                self._format_datetime(event.updated_at),
                            ),
                        )

                        for index, item in enumerate(event.agenda, start=1):
                            connection.execute(
                                """
                                INSERT INTO event_agenda_items (event_id, item_order, description)
                                VALUES (?, ?, ?)
                                """,
                                (event.id, index, item),
                            )

                        for index, item in enumerate(event.requirements, start=1):
                            connection.execute(
                                """
                                INSERT INTO event_requirements (event_id, item_order, description)
                                VALUES (?, ?, ?)
                                """,
                                (event.id, index, item),
                            )

                connection.commit()

    def list_users(self) -> list[UserRecord]:
        with self._conn() as connection:
            rows = connection.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
        return [self._row_to_user(row) for row in rows]

    def get_user_by_id(self, user_id: str) -> UserRecord | None:
        with self._conn() as connection:
            row = connection.execute("SELECT * FROM users WHERE id = ? LIMIT 1", (user_id,)).fetchone()
        return self._row_to_user(row) if row else None

    def get_user_by_username(self, username: str) -> UserRecord | None:
        with self._conn() as connection:
            row = connection.execute(
                "SELECT * FROM users WHERE username = ? COLLATE NOCASE LIMIT 1",
                (username,),
            ).fetchone()
        return self._row_to_user(row) if row else None

    def get_user_by_student_id(self, student_id: str) -> UserRecord | None:
        with self._conn() as connection:
            row = connection.execute(
                "SELECT * FROM users WHERE student_id = ? COLLATE NOCASE LIMIT 1",
                (student_id,),
            ).fetchone()
        return self._row_to_user(row) if row else None

    def create_user(self, user: UserRecord) -> UserRecord:
        with self._lock:
            with self._conn() as connection:
                created_at = self._format_datetime(user.created_at)
                connection.execute(
                    """
                    INSERT INTO users (
                        id, username, full_name, student_id, career, semester, role,
                        password_hash, is_active, created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        user.id,
                        user.username,
                        user.full_name,
                        user.student_id,
                        user.career,
                        user.semester,
                        _enum_value(user.role),
                        user.password_hash,
                        int(user.is_active),
                        created_at,
                        created_at,
                    ),
                )
                connection.commit()
        return user.model_copy(deep=True)

    def list_events(self, event_type: EventType | None = None, month: int | None = None) -> list[EventRecord]:
        query = "SELECT * FROM events WHERE is_active = 1"
        params: list[object] = []
        if event_type is not None:
            query += " AND event_type = ?"
            params.append(_enum_value(event_type))
        if month is not None:
            query += " AND CAST(strftime('%m', event_date) AS INTEGER) = ?"
            params.append(month)
        query += " ORDER BY event_date ASC, event_time ASC, id ASC"

        with self._conn() as connection:
            rows = connection.execute(query, tuple(params)).fetchall()
            return [self._row_to_event(connection, row) for row in rows]

    def get_event_by_id(self, event_id: str) -> EventRecord | None:
        with self._conn() as connection:
            row = connection.execute(
                "SELECT * FROM events WHERE id = ? AND is_active = 1 LIMIT 1",
                (event_id,),
            ).fetchone()
            if not row:
                return None
            return self._row_to_event(connection, row)

    def save_event(self, event: EventRecord) -> None:
        with self._lock:
            with self._conn() as connection:
                connection.execute(
                    """
                    UPDATE events
                    SET
                        image = ?,
                        name = ?,
                        event_date = ?,
                        event_time = ?,
                        place = ?,
                        location = ?,
                        spots = ?,
                        event_type = ?,
                        summary = ?,
                        is_active = ?,
                        updated_at = ?
                    WHERE id = ?
                    """,
                    (
                        event.image,
                        event.name,
                        event.date.isoformat(),
                        event.time,
                        event.place,
                        event.location,
                        event.spots,
                        _enum_value(event.type),
                        event.summary,
                        1,
                        self._format_datetime(event.updated_at),
                        event.id,
                    ),
                )
                connection.commit()

    def create_event(self, event: EventRecord) -> EventRecord:
        with self._lock:
            with self._conn() as connection:
                connection.execute(
                    """
                    INSERT INTO events (
                        id, image, name, event_date, event_time, place, location, spots, event_type,
                        summary, is_active, created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        event.id,
                        event.image,
                        event.name,
                        event.date.isoformat(),
                        event.time,
                        event.place,
                        event.location,
                        event.spots,
                        _enum_value(event.type),
                        event.summary,
                        1,
                        self._format_datetime(event.created_at),
                        self._format_datetime(event.updated_at),
                    ),
                )

                for index, item in enumerate(event.agenda, start=1):
                    connection.execute(
                        """
                        INSERT INTO event_agenda_items (event_id, item_order, description)
                        VALUES (?, ?, ?)
                        """,
                        (event.id, index, item),
                    )

                for index, item in enumerate(event.requirements, start=1):
                    connection.execute(
                        """
                        INSERT INTO event_requirements (event_id, item_order, description)
                        VALUES (?, ?, ?)
                        """,
                        (event.id, index, item),
                    )
                connection.commit()
        return event.model_copy(deep=True)

    def update_event(self, event: EventRecord) -> EventRecord:
        with self._lock:
            with self._conn() as connection:
                row = connection.execute(
                    "SELECT 1 FROM events WHERE id = ? AND is_active = 1 LIMIT 1",
                    (event.id,),
                ).fetchone()
                if row is None:
                    raise KeyError(event.id)

                connection.execute(
                    """
                    UPDATE events
                    SET
                        image = ?,
                        name = ?,
                        event_date = ?,
                        event_time = ?,
                        place = ?,
                        location = ?,
                        spots = ?,
                        event_type = ?,
                        summary = ?,
                        updated_at = ?
                    WHERE id = ?
                    """,
                    (
                        event.image,
                        event.name,
                        event.date.isoformat(),
                        event.time,
                        event.place,
                        event.location,
                        event.spots,
                        _enum_value(event.type),
                        event.summary,
                        self._format_datetime(event.updated_at),
                        event.id,
                    ),
                )

                connection.execute("DELETE FROM event_agenda_items WHERE event_id = ?", (event.id,))
                connection.execute("DELETE FROM event_requirements WHERE event_id = ?", (event.id,))

                for index, item in enumerate(event.agenda, start=1):
                    connection.execute(
                        """
                        INSERT INTO event_agenda_items (event_id, item_order, description)
                        VALUES (?, ?, ?)
                        """,
                        (event.id, index, item),
                    )

                for index, item in enumerate(event.requirements, start=1):
                    connection.execute(
                        """
                        INSERT INTO event_requirements (event_id, item_order, description)
                        VALUES (?, ?, ?)
                        """,
                        (event.id, index, item),
                    )
                connection.commit()
        return event.model_copy(deep=True)

    def delete_event(self, event_id: str) -> bool:
        with self._lock:
            with self._conn() as connection:
                deleted = connection.execute("DELETE FROM events WHERE id = ?", (event_id,)).rowcount
                connection.commit()
        return deleted > 0

    def create_registration(self, registration: RegistrationRecord) -> RegistrationRecord:
        with self._lock:
            with self._conn() as connection:
                created_at = self._format_datetime(registration.created_at)
                connection.execute(
                    """
                    INSERT INTO event_registrations (
                        id, event_id, full_name, student_id, career, semester,
                        status, created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        registration.id,
                        registration.event_id,
                        registration.full_name,
                        registration.student_id,
                        registration.career,
                        registration.semester,
                        _enum_value(registration.status),
                        created_at,
                        created_at,
                    ),
                )
                connection.commit()
        return registration.model_copy(deep=True)

    def update_registration(self, registration: RegistrationRecord) -> RegistrationRecord:
        with self._lock:
            with self._conn() as connection:
                updated_at = self._format_datetime(datetime.utcnow())
                updated = connection.execute(
                    """
                    UPDATE event_registrations
                    SET
                        full_name = ?,
                        student_id = ?,
                        career = ?,
                        semester = ?,
                        status = ?,
                        updated_at = ?
                    WHERE id = ?
                    """,
                    (
                        registration.full_name,
                        registration.student_id,
                        registration.career,
                        registration.semester,
                        _enum_value(registration.status),
                        updated_at,
                        registration.id,
                    ),
                ).rowcount
                if updated == 0:
                    raise KeyError(registration.id)
                connection.commit()
        return registration.model_copy(deep=True)

    def generate_registration_id(self) -> str:
        return f"reg_{uuid4().hex[:16]}"

    def generate_user_id(self) -> str:
        return f"usr_{uuid4().hex[:16]}"

    def generate_event_id(self) -> str:
        return f"evt_{uuid4().hex[:16]}"

    def has_registration_for_student(self, event_id: str, student_id: str) -> bool:
        with self._conn() as connection:
            row = connection.execute(
                """
                SELECT 1
                FROM event_registrations
                WHERE event_id = ?
                  AND LOWER(student_id) = LOWER(?)
                  AND status = 'registered'
                LIMIT 1
                """,
                (event_id, student_id),
            ).fetchone()
        return row is not None

    def get_registration_by_event_and_student(self, event_id: str, student_id: str) -> RegistrationRecord | None:
        with self._conn() as connection:
            row = connection.execute(
                """
                SELECT *
                FROM event_registrations
                WHERE event_id = ?
                  AND LOWER(student_id) = LOWER(?)
                LIMIT 1
                """,
                (event_id, student_id),
            ).fetchone()
        return self._row_to_registration(row) if row else None

    def list_registrations(
        self,
        event_id: str | None = None,
        student_id: str | None = None,
    ) -> list[RegistrationRecord]:
        query = "SELECT * FROM event_registrations"
        params: list[object] = []
        conditions: list[str] = []
        if event_id is not None:
            conditions.append("event_id = ?")
            params.append(event_id)
        if student_id is not None:
            conditions.append("LOWER(student_id) = LOWER(?)")
            params.append(student_id)
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY created_at DESC"

        with self._conn() as connection:
            rows = connection.execute(query, tuple(params)).fetchall()
        return [self._row_to_registration(row) for row in rows]

    def count_registrations_created_since(self, since: datetime) -> int:
        with self._conn() as connection:
            row = connection.execute(
                "SELECT COUNT(*) AS total FROM event_registrations WHERE created_at >= ?",
                (self._format_datetime(since),),
            ).fetchone()
        return int(row["total"])
