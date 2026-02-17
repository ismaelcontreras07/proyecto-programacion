from __future__ import annotations

import os
import sqlite3
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
SCHEMA_PATH = BACKEND_DIR / "schema.sql"
DEFAULT_DB_PATH = BACKEND_DIR / "unimex.db"


def get_db_path() -> Path:
    configured = os.getenv("APP_DB_PATH")
    if configured:
        return Path(configured).expanduser()
    return DEFAULT_DB_PATH


def _schema_for_sqlite(raw_schema: str) -> str:
    # SQLite does not support PostgreSQL identity syntax used in schema.sql.
    return raw_schema.replace(
        "BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY",
        "INTEGER PRIMARY KEY AUTOINCREMENT",
    )


def _table_has_column(connection: sqlite3.Connection, table_name: str, column_name: str) -> bool:
    rows = connection.execute(f"PRAGMA table_info({table_name})").fetchall()
    return any(row["name"] == column_name for row in rows)


def _drop_all_tables(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        DROP TABLE IF EXISTS event_registrations;
        DROP TABLE IF EXISTS event_requirements;
        DROP TABLE IF EXISTS event_agenda_items;
        DROP TABLE IF EXISTS auth_sms_verifications;
        DROP TABLE IF EXISTS events;
        DROP TABLE IF EXISTS users;
        """
    )


def get_connection(db_path: Path | None = None) -> sqlite3.Connection:
    target_path = db_path or get_db_path()
    target_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(target_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON;")
    return connection


def initialize_database(db_path: Path | None = None) -> Path:
    target_path = db_path or get_db_path()
    with get_connection(target_path) as connection:
        users_table_exists = connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'users' LIMIT 1"
        ).fetchone()
        if users_table_exists:
            # One-time local migration: reset schema variants that still include legacy auth fields.
            has_auth_sms_table = connection.execute(
                "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'auth_sms_verifications' LIMIT 1"
            ).fetchone()
            legacy_schema = (
                has_auth_sms_table
                or _table_has_column(connection, "users", "email")
                or _table_has_column(connection, "users", "phone")
                or _table_has_column(connection, "users", "phone_verified")
                or (
                    connection.execute(
                        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'event_registrations' LIMIT 1"
                    ).fetchone()
                    and _table_has_column(connection, "event_registrations", "phone")
                )
            )
            if legacy_schema:
                _drop_all_tables(connection)

        table_exists = connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'users' LIMIT 1"
        ).fetchone()
        if not table_exists:
            raw_schema = SCHEMA_PATH.read_text(encoding="utf-8")
            sqlite_schema = _schema_for_sqlite(raw_schema)
            connection.executescript(sqlite_schema)
            connection.commit()
    return target_path
