from datetime import datetime

from pydantic import Field

from app.schemas.base import AppModel


class SurveySummary(AppModel):
    # Компактная форма опроса для списка в MVP dashboard.
    survey_id: int = Field(serialization_alias="surveyID")
    title: str
    status: str
    published_at: datetime | None = Field(default=None, serialization_alias="publishedAt")
