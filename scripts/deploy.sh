#!/usr/bin/env bash
set -euo pipefail

# Этот скрипт запускается на VPS из GitHub Actions, но его можно выполнить и вручную по SSH.
APP_DIR="${APP_DIR:-/opt/survey-service}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "Repository not found in $APP_DIR"
  exit 1
fi

cd "$APP_DIR"
git config core.filemode false
# Держим серверный checkout только fast-forward, чтобы деплой не мог незаметно переписать историю.
git fetch origin "$DEPLOY_BRANCH"
git checkout "$DEPLOY_BRANCH"
git pull --ff-only origin "$DEPLOY_BRANCH"

docker compose up -d --build
docker compose ps
