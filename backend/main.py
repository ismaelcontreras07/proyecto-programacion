from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Load backend/.env before importing modules that read environment variables.
load_dotenv(Path(__file__).resolve().parent / ".env")

from app.routers import (
    admin_router,
    auth_router,
    events_router,
    health_router,
    registrations_router,
)


def _get_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


def create_app() -> FastAPI:
    app = FastAPI(
        title="UNIMEX API",
        version="1.0.0",
        description=(
            "Backend base para autenticación, catálogo de eventos y registros de alumnos. "
            "Persistencia SQLite conectada con schema SQL."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    uploads_dir = Path(__file__).resolve().parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(events_router)
    app.include_router(registrations_router)
    app.include_router(admin_router)

    @app.get("/")
    def root() -> dict[str, str]:
        return {"message": "UNIMEX backend online. See /docs for API documentation."}

    return app


app = create_app()
