def test_register_success(client):
    resp = client.post("/api/auth/register", json={
        "full_name": "Jane Doe",
        "email": "jane@example.com",
        "password": "securepass",
        "role": "patient",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "jane@example.com"
    assert "hashed_password" not in data


def test_register_duplicate_email(client):
    payload = {"full_name": "A", "email": "a@test.com", "password": "pass1234", "role": "patient"}
    client.post("/api/auth/register", json=payload)
    resp = client.post("/api/auth/register", json=payload)
    assert resp.status_code == 409


def test_login_success(client):
    client.post("/api/auth/register", json={
        "full_name": "Bob", "email": "bob@test.com", "password": "mypassword", "role": "dispatcher"
    })
    resp = client.post("/api/auth/login", json={"email": "bob@test.com", "password": "mypassword"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "full_name": "Bob", "email": "bob2@test.com", "password": "mypassword", "role": "patient"
    })
    resp = client.post("/api/auth/login", json={"email": "bob2@test.com", "password": "wrongpass"})
    assert resp.status_code == 401


def test_me_endpoint(client):
    client.post("/api/auth/register", json={
        "full_name": "Me User", "email": "me@test.com", "password": "pass1234", "role": "patient"
    })
    token_resp = client.post("/api/auth/login", json={"email": "me@test.com", "password": "pass1234"})
    token = token_resp.json()["access_token"]

    resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@test.com"
