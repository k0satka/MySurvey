from app.schemas.base import AppModel


class HealthResponse(AppModel):
    # Небольшой ответ для проверки доступности в Docker, CI и deploy smoke-тестах.
    status: str
    environment: str
    version: str
