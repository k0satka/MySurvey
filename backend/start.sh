#!/usr/bin/env sh
set -eu

# Containers apply pending SQL migrations before accepting HTTP traffic.
python migrate.py
uvicorn app.main:app --host 0.0.0.0 --port 8000
