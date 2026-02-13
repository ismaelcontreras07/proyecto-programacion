from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
            "Persistencia temporal en memoria, listo para conectar DB."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

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
