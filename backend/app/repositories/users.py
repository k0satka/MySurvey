from psycopg2.extras import RealDictCursor


def get_user_by_email(connection, email: str) -> dict | None:
    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            SELECT user_id, name, email, password_hash, is_admin, created_at
            FROM users
            WHERE email = %s
            """,
            (email,),
        )
        return cursor.fetchone()


def get_user_by_id(connection, user_id: int) -> dict | None:
    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            SELECT user_id, name, email, password_hash, is_admin, created_at
            FROM users
            WHERE user_id = %s
            """,
            (user_id,),
        )
        return cursor.fetchone()


def create_user(connection, *, name: str, email: str, password_hash: str) -> dict:
    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(
            """
            INSERT INTO users (name, email, password_hash)
            VALUES (%s, %s, %s)
            RETURNING user_id, name, email, is_admin, created_at
            """,
            (name, email, password_hash),
        )
        return cursor.fetchone()
