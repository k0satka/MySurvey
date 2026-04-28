from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def healthcheck() -> HealthResponse:
    # Used by Docker healthchecks, GitHub Actions and quick manual curl checks.
    settings = get_settings()
    return HealthResponse(status="ok", environment=settings.app_env, version="mvp-auth-foundation")
