from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.auth import AuthenticatedUser
from app.schemas.surveys import SurveySummary
from app.services.surveys import list_user_surveys

router = APIRouter()


@router.get("", response_model=list[SurveySummary])
def get_surveys(current_user: AuthenticatedUser = Depends(get_current_user)) -> list[SurveySummary]:
    # Пользователь видит только свои опросы; get_current_user берётся из Bearer token.
    return list_user_surveys(current_user.user_id)
