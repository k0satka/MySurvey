from fastapi import APIRouter, status

from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse
from app.services.auth import login_user, register_user

router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest) -> RegisterResponse:
    # The route only handles HTTP concerns; user creation rules live in services/auth.py.
    return register_user(payload)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest) -> LoginResponse:
    # Login returns a JWT and public user data for AuthProvider on the frontend.
    return login_user(payload)
