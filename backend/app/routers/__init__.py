from .admin import router as admin_router
from .auth import router as auth_router
from .events import router as events_router
from .health import router as health_router
from .registrations import router as registrations_router

__all__ = [
    "admin_router",
    "auth_router",
    "events_router",
    "health_router",
    "registrations_router",
]

