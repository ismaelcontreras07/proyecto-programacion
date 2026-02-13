from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter


router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/data")
def get_legacy_data() -> dict[str, str]:
    # Backward-compatible endpoint used by the current frontend home page.
    return {"data": "Backend listo para auth, eventos y registros"}

