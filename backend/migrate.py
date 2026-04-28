from app.db.migrations import run_migrations


if __name__ == "__main__":
    # CLI-точка входа для локального запуска и для backend/start.sh внутри Docker.
    run_migrations()
