from __future__ import annotations

import csv
from datetime import datetime
from io import StringIO

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

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


def _csv_response(filename_prefix: str, headers: list[str], rows: list[list[str]]) -> StreamingResponse:
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)
    writer.writerows(rows)

    timestamp = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    filename = f"{filename_prefix}-{timestamp}.csv"
    payload = "\ufeff" + buffer.getvalue()
    buffer.close()

    response = StreamingResponse(iter([payload]), media_type="text/csv; charset=utf-8")
    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


@router.get("/reports/events.csv")
def events_report_csv(
    admin_service: AdminService = Depends(get_admin_service),
    _current_user: UserPublic = Depends(require_admin),
) -> StreamingResponse:
    headers, rows = admin_service.events_report()
    return _csv_response("events-report", headers, rows)


@router.get("/reports/registrations.csv")
def registrations_report_csv(
    admin_service: AdminService = Depends(get_admin_service),
    _current_user: UserPublic = Depends(require_admin),
) -> StreamingResponse:
    headers, rows = admin_service.registrations_report()
    return _csv_response("registrations-report", headers, rows)
