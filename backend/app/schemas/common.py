from app.schemas.base import AppModel


class HealthResponse(AppModel):
    # Small response used for uptime checks in Docker, CI and deployment smoke tests.
    status: str
    environment: str
    version: str
