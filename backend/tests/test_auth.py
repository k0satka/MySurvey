"""Тесты контракта Auth API для регистрации, входа и ошибок."""

def test_register_user_success(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Иван Иванов", "email": "ivan@example.com", "password": "strongpass123"},
    )

    assert response.status_code == 201
    assert response.json() == {
        "userID": 1,
        "message": "Пользователь успешно зарегистрирован",
    }


def test_register_duplicate_email_returns_conflict(client):
    payload = {"name": "Иван Иванов", "email": "ivan@example.com", "password": "strongpass123"}

    assert client.post("/api/auth/register", json=payload).status_code == 201

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 409
    assert response.json()["error"] == "Conflict"


def test_login_success_returns_token_and_user(client):
    register_payload = {"name": "Иван Иванов", "email": "ivan@example.com", "password": "strongpass123"}
    client.post("/api/auth/register", json=register_payload)

    response = client.post(
        "/api/auth/login",
        json={"email": "ivan@example.com", "password": "strongpass123"},
    )

    body = response.json()
    assert response.status_code == 200
    assert isinstance(body["token"], str) and body["token"]
    assert body["user"] == {"userID": 1, "name": "Иван Иванов", "isAdmin": False}


def test_login_with_wrong_password_returns_unauthorized(client):
    client.post(
        "/api/auth/register",
        json={"name": "Иван Иванов", "email": "ivan@example.com", "password": "strongpass123"},
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "ivan@example.com", "password": "wrongpass123"},
    )

    assert response.status_code == 401
    assert response.json()["error"] == "Unauthorized"
