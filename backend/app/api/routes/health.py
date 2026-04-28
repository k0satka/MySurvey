from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def healthcheck() -> HealthResponse:
    # Используется Docker healthcheck, GitHub Actions и быстрыми ручными curl-проверками.
    settings = get_settings()
    return HealthResponse(status="ok", environment=settings.app_env, version="mvp-auth-foundation")
