from fastapi import APIRouter, status

from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.services.auth import login_user, register_user

router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest) -> RegisterResponse:
    # Route отвечает только за HTTP-слой; правила создания пользователя живут в services/auth.py.
    return register_user(payload)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    # Login возвращает JWT и публичные данные пользователя для AuthProvider на frontend.
    return login_user(payload)
