from __future__ import annotations

from app.database import initialize_database
from app.repositories import SqliteStore
from app.seed_data import build_seed_events, build_seed_users


def main() -> None:
    db_path = initialize_database()
    store = SqliteStore(db_path=db_path)
    store.seed_if_empty(users=build_seed_users(), events=build_seed_events())
    print(f"Database ready: {db_path}")


if __name__ == "__main__":
    main()
