from app.core.exceptions import api_http_exception
from app.core.security import create_access_token, hash_password, verify_password
from app.db.pool import get_db_connection
from app.repositories.users import create_user, get_user_by_email
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserPublic


def register_user(payload: RegisterRequest) -> RegisterResponse:
    # Сервисный слой отвечает за бизнес-правила: уникальный email, хеширование пароля, форму ответа.
    with get_db_connection() as connection:
        existing_user = get_user_by_email(connection, payload.email)
        if existing_user is not None:
            raise api_http_exception(409, "Conflict", "Пользователь с таким email уже существует")

        user = create_user(
            connection,
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
        )

    return RegisterResponse(user_id=user["user_id"], message="Пользователь успешно зарегистрирован")


def login_user(payload: LoginRequest) -> LoginResponse:
    # Login сравнивает введённый пароль с сохранённым хешем и выдаёт JWT с ограниченным сроком.
    with get_db_connection() as connection:
        user = get_user_by_email(connection, payload.email)

    if user is None or not verify_password(payload.password, user["password_hash"]):
        raise api_http_exception(401, "Unauthorized", "Неверный email или пароль")

    token = create_access_token(str(user["user_id"]))
    return LoginResponse(
        token=token,
        user=UserPublic(user_id=user["user_id"], name=user["name"], is_admin=user["is_admin"]),
    )
