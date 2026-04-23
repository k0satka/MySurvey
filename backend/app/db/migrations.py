import hashlib
from pathlib import Path

import psycopg2

from app.core.config import get_settings

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations" / "sql"


def _ensure_migrations_table(cursor) -> None:
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename VARCHAR(255) PRIMARY KEY,
            checksum VARCHAR(64) NOT NULL,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )


def run_migrations() -> list[str]:
    settings = get_settings()
    applied_files: list[str] = []

    with psycopg2.connect(**settings.resolved_database_config) as connection:
        with connection.cursor() as cursor:
            _ensure_migrations_table(cursor)
            connection.commit()

            cursor.execute("SELECT filename, checksum FROM schema_migrations")
            applied_checksums = {row[0]: row[1] for row in cursor.fetchall()}

        for migration_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
            sql = migration_file.read_text(encoding="utf-8")
            checksum = hashlib.sha256(sql.encode("utf-8")).hexdigest()
            applied_checksum = applied_checksums.get(migration_file.name)

            if applied_checksum == checksum:
                continue

            if applied_checksum and applied_checksum != checksum:
                raise RuntimeError(f"Migration {migration_file.name} was modified after applying")

            with connection.cursor() as cursor:
                cursor.execute(sql)
                cursor.execute(
                    "INSERT INTO schema_migrations (filename, checksum) VALUES (%s, %s)",
                    (migration_file.name, checksum),
                )
            connection.commit()
            applied_files.append(migration_file.name)

    return applied_files
