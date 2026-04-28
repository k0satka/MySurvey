from app.db.migrations import run_migrations


if __name__ == "__main__":
    # CLI entrypoint used both locally and by backend/start.sh inside Docker.
    run_migrations()
