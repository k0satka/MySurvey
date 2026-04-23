def _register_and_login(client):
    client.post(
        "/api/auth/register",
        json={"name": "Иван Иванов", "email": "ivan@example.com", "password": "strongpass123"},
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "ivan@example.com", "password": "strongpass123"},
    )
    return response.json()["token"]


def test_surveys_requires_auth(client):
    response = client.get("/api/surveys")

    assert response.status_code == 401
    assert response.json()["error"] == "Unauthorized"


def test_surveys_returns_empty_list_for_new_user(client):
    token = _register_and_login(client)

    response = client.get("/api/surveys", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json() == []
