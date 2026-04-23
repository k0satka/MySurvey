from pydantic import EmailStr, Field, field_validator

from app.schemas.base import AppModel


class RegisterRequest(AppModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return value.lower()


class LoginRequest(AppModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return value.lower()


class UserPublic(AppModel):
    user_id: int = Field(serialization_alias="userID")
    name: str
    is_admin: bool = Field(serialization_alias="isAdmin")


class AuthenticatedUser(AppModel):
    user_id: int
    name: str
    email: EmailStr
    is_admin: bool


class RegisterResponse(AppModel):
    user_id: int = Field(serialization_alias="userID")
    message: str


class LoginResponse(AppModel):
    token: str
    user: UserPublic
