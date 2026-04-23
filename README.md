# Online Survey Service MVP

Учебный монорепозиторий для MVP сервиса опросов в стиле Google Forms. На текущем этапе проект уже умеет:

- регистрировать пользователя;
- выполнять вход по JWT;
- открывать защищённый `dashboard`;
- брать список опросов из реального FastAPI API и PostgreSQL;
- разворачиваться на VPS через Docker Compose и GitHub Actions.

## Архитектура

- `frontend/` — React + Vite SPA, работающая через относительный `/api`.
- `backend/` — FastAPI + `psycopg2` + SQL-миграции без ORM.
- `postgres` — PostgreSQL 16 в Docker Compose.
- `Nginx` во frontend-контейнере раздаёт SPA и проксирует `/api` на backend.
- GitHub Actions проверяет frontend, backend, e2e smoke и затем запускает автодеплой по SSH.

## Структура проекта

```text
.
├── backend/
│   ├── app/
│   ├── migrations/sql/
│   └── tests/
├── frontend/
│   ├── e2e/
│   └── src/
├── scripts/
├── .github/workflows/
├── AGENTS.md
├── PLANS.md
└── docker-compose.yml
```

## API MVP

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/surveys`
- `GET /api/health`

Внутри БД и Python-кода используется `snake_case`, а JSON наружу сериализуется в стиле текущего контракта (`userID`, `isAdmin`, `publishedAt`).

## Локальный запуск

### Вариант 1. Быстрый запуск через Docker Compose

1. Скопируйте `.env.example` в `.env`.
2. При необходимости измените секреты и пароли.
3. Запустите:

```bash
docker compose up -d --build
```

После запуска:

- frontend: `http://localhost`
- backend health: `http://localhost/api/health`
- postgres: `localhost:5432`

### Вариант 2. Раздельный запуск для разработки

Backend:

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
export APP_ENV=development
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=survey_service
export POSTGRES_USER=survey_user
export POSTGRES_PASSWORD=survey_password
export JWT_SECRET_KEY=change-this-secret
python migrate.py
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Для Windows PowerShell используйте `npm.cmd`, если политика выполнения блокирует `npm`.

## Тесты и проверки

Frontend:

```bash
cd frontend
npm install
npm run lint
npm run build
```

Backend:

```bash
cd backend
pip install -r requirements.txt
pytest tests -q
```

Playwright smoke:

```bash
cd frontend
npm install
npx playwright install --with-deps chromium
npm run test:e2e
```

## Переменные окружения

Основные значения лежат в `.env.example`:

- `APP_ENV`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`
- `DB_POOL_MIN_SIZE`
- `DB_POOL_MAX_SIZE`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

Важно: `.env.example` — это шаблон, а не рабочий файл окружения. Его не нужно "заполнять и коммитить".
Для локального запуска нужно создать отдельный `.env` на его основе и уже туда подставить свои значения.
Секреты, приватные ключи и реальные production-пароли в `.env.example` не храним.

Для локального раздельного запуска backend обычно нужно `POSTGRES_HOST=localhost`, а для Docker Compose — `POSTGRES_HOST=postgres`.

## Как развернуть на VPS

Ниже сценарий под Ubuntu/Debian с root-доступом и публичным IP.

1. Подключитесь к серверу по SSH.
2. Установите Docker и базовый firewall:

```bash
chmod +x scripts/install-vps.sh
./scripts/install-vps.sh
```

3. Создайте рабочую папку, например `/opt/survey-service`.
4. Клонируйте туда ваш GitHub-репозиторий.
5. Создайте файл `.env` рядом с `docker-compose.yml`.
6. Выполните первый деплой:

```bash
chmod +x scripts/deploy.sh
APP_DIR=/opt/survey-service DEPLOY_BRANCH=main ./scripts/deploy.sh
```

После этого сервис будет доступен по `http://<VPS_IP>`.

## GitHub: как подключить проект и автодеплой

В этом окружении проект уже подключён к GitHub-репозиторию `k0satka/MySurvey`, а рабочий VPS сейчас публикует сервис по адресу `http://89.127.203.44`.
Ниже остаётся только зафиксировать общий сценарий, чтобы следующий участник команды мог быстро повторить настройку.

### 1. Создайте пустой репозиторий на GitHub

Например `your-org/online-survey-service`.

### 2. Подключите локальный репозиторий

```bash
git remote add origin git@github.com:YOUR_ORG/YOUR_REPO.git
git branch -M main
git add .
git commit -m "feat: bootstrap survey service mvp foundation"
git push -u origin main
```

### 3. Добавьте GitHub Secrets

В `Settings -> Secrets and variables -> Actions`:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_APP_DIR`
- `PROD_ENV_FILE`

`PROD_ENV_FILE` — это полный содержимый продового `.env`, например:

```dotenv
APP_ENV=production
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
JWT_SECRET_KEY=super-secret-production-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
DB_POOL_MIN_SIZE=1
DB_POOL_MAX_SIZE=10
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=survey_service
POSTGRES_USER=survey_user
POSTGRES_PASSWORD=strong-db-password
```

Замечание: имена secret-переменных должны совпадать с `.github/workflows/ci-cd.yml` один в один, иначе deploy job не сможет подключиться к VPS или собрать `.env`.

### 4. Подготовьте сервер к автодеплою

- сервер должен уметь читать ваш репозиторий;
- репозиторий должен быть уже склонирован в `VPS_APP_DIR`;
- пользователь `VPS_USER` должен иметь право запускать `docker compose`.

В текущем MVP production `.env` хранится только на VPS и в GitHub Secret `PROD_ENV_FILE`. Это осознанно: репозиторий остаётся безопасным для публичного доступа.

После этого каждый push в `main` будет:

1. прогонять frontend checks;
2. прогонять backend tests;
3. запускать Playwright smoke;
4. деплоить приложение на VPS через SSH.

## MCP для разработки

Команды, которые стоит добавить в конфиг Codex/редактора:

```bash
npx @playwright/mcp@latest
npx -y @upstash/context7-mcp
```

Если захотите, можно дополнительно подключить инспекцию БД и HTTP-клиент MCP, но для текущего MVP этого уже достаточно.

## Документы команды

- [AGENTS.md](AGENTS.md) — правила для разработчиков и AI-ассистентов.
- [PLANS.md](PLANS.md) — дорожная карта следующих этапов.

## Ближайшие следующие шаги

- CRUD опросов и конструктор вопросов.
- Публичная ссылка на прохождение формы.
- Сохранение ответов респондентов.
- Базовая статистика результатов.
- Домен, HTTPS и Nginx на уровне VPS.
