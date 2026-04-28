from psycopg2.extras import RealDictCursor


def list_surveys_by_user_id(connection, user_id: int) -> list[dict]:
    # Dashboard сейчас нужны только краткие данные; детальные запросы появятся отдельно позже.
    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            SELECT survey_id, title, status, published_at
            FROM surveys
            WHERE user_id = %s
            ORDER BY created_at DESC, survey_id DESC
            """,
            (user_id,),
        )
        return list(cursor.fetchall())
