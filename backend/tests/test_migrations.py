import os

import psycopg2

from app.core.config import get_settings


# Тесты миграций защищают workflow SQL-схемы.

def test_required_tables_exist():
    assert os.environ["DATABASE_URL"]

    with psycopg2.connect(**get_settings().resolved_database_config) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                """
            )
            tables = {row[0] for row in cursor.fetchall()}

    assert {"schema_migrations", "users", "surveys", "questions", "options", "answers"} <= tables
