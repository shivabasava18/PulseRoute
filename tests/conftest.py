import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from main import app

# Use SQLite in-memory for tests (no Postgres needed)
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def dispatcher_token(client):
    """Register a dispatcher and return the auth token."""
    client.post("/api/auth/register", json={
        "full_name": "Test Dispatcher",
        "email": "dispatcher@test.com",
        "password": "testpass123",
        "role": "dispatcher",
    })
    resp = client.post("/api/auth/login", json={
        "email": "dispatcher@test.com",
        "password": "testpass123",
    })
    return resp.json()["access_token"]


@pytest.fixture
def admin_token(client):
    """Register an admin and return the auth token."""
    client.post("/api/auth/register", json={
        "full_name": "Test Admin",
        "email": "admin@test.com",
        "password": "testpass123",
        "role": "admin",
    })
    resp = client.post("/api/auth/login", json={
        "email": "admin@test.com",
        "password": "testpass123",
    })
    return resp.json()["access_token"]
