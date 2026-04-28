from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.surveys import router as surveys_router

api_router = APIRouter()
# Группы маршрутов остаются маленькими и сфокусированными; main.py подключает этот router под /api.
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(surveys_router, prefix="/surveys", tags=["surveys"])
