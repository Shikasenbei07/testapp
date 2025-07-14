from fastapi.testclient import TestClient
from function_app import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_get_user_profile_success():
    response = client.get("/user/profile?user_id=1")
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert data["user_id"] == 1

def test_get_user_profile_missing_param():
    response = client.get("/user/profile")
    assert response.status_code == 422

def test_get_user_profile_not_found():
    response = client.get("/user/profile?user_id=99999")
    assert response.status_code == 404

def test_update_user_profile_success():
    payload = {"user_id": 1, "name": "Test User", "email": "test@example.com"}
    response = client.put("/user/profile", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test User"
    assert data["email"] == "test@example.com"

def test_update_user_profile_invalid_email():
    payload = {"user_id": 1, "name": "Test User", "email": "invalid-email"}
    response = client.put("/user/profile", json=payload)
    assert response.status_code == 422

def test_update_user_profile_missing_fields():
    payload = {"user_id": 1}
    response = client.put("/user/profile", json=payload)
    assert response.status_code == 422

def test_update_user_profile_not_found():
    payload = {"user_id": 99999, "name": "No User", "email": "nouser@example.com"}
    response = client.put("/user/profile", json=payload)
    assert response.status_code == 404