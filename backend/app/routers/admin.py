from __future__ import annotations

from fastapi import APIRouter, Depends

from ..dependencies import get_admin_service, require_admin
from ..models import AdminSummary, UserPublic
from ..services import AdminService


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/summary", response_model=AdminSummary)
def admin_summary(
    admin_service: AdminService = Depends(get_admin_service),
    _current_user: UserPublic = Depends(require_admin),
) -> AdminSummary:
    return admin_service.summary()

