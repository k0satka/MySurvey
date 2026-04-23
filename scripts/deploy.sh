#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/survey-service}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "Repository not found in $APP_DIR"
  exit 1
fi

cd "$APP_DIR"
git fetch origin "$DEPLOY_BRANCH"
git checkout "$DEPLOY_BRANCH"
git pull --ff-only origin "$DEPLOY_BRANCH"

docker compose up -d --build
docker compose ps
