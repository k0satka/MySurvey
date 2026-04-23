from app.schemas.base import AppModel


class HealthResponse(AppModel):
    status: str
    environment: str
    version: str
