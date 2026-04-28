from psycopg2.extras import RealDictCursor


def list_surveys_by_user_id(connection, user_id: int) -> list[dict]:
    # Dashboard currently needs only summary data; details will get separate queries later.
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
