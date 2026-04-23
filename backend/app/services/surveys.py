from app.db.pool import get_db_connection
from app.repositories.surveys import list_surveys_by_user_id
from app.schemas.surveys import SurveySummary


def list_user_surveys(user_id: int) -> list[SurveySummary]:
    with get_db_connection() as connection:
        surveys = list_surveys_by_user_id(connection, user_id)

    return [
        SurveySummary(
            survey_id=survey["survey_id"],
            title=survey["title"],
            status=survey["status"],
            published_at=survey["published_at"],
        )
        for survey in surveys
    ]
