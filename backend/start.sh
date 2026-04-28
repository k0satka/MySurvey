#!/usr/bin/env sh
set -eu

# Контейнер применяет ожидающие SQL-миграции перед приёмом HTTP-трафика.
python migrate.py
uvicorn app.main:app --host 0.0.0.0 --port 8000
