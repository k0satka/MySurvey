import os
import sys
from pathlib import Path

import psycopg2
import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    os.getenv("DATABASE_URL", "postgresql://survey_user:survey_password@localhost:5432/survey_service_test"),
)

# Tests point the app at an isolated database and clean tables before each test.
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DATABASE_URL", TEST_DATABASE_URL)
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
os.environ.setdefault("DB_POOL_MIN_SIZE", "1")
os.environ.setdefault("DB_POOL_MAX_SIZE", "2")

from app.db.migrations import run_migrations
from app.db.pool import close_db_pool
from app.core.config import get_settings
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def migrated_database():
    # Apply the real SQL migrations once so tests exercise the production schema.
    run_migrations()
    yield
    close_db_pool()


@pytest.fixture(autouse=True)
def clean_database():
    # Keep tests independent while preserving the schema between test cases.
    with psycopg2.connect(**get_settings().resolved_database_config) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "TRUNCATE TABLE answers, options, questions, surveys, users RESTART IDENTITY CASCADE"
            )
        connection.commit()
    yield


@pytest.fixture
def client():
    # TestClient starts FastAPI lifespan, including the database pool lifecycle.
    close_db_pool()
    with TestClient(app) as test_client:
        yield test_client
    close_db_pool()
