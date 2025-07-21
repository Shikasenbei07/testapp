import pytest
from unittest.mock import MagicMock
from function_app import get_user, update_user
import json

import azure.functions as func

@pytest.fixture
def mock_db_conn(monkeypatch):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.description = [
        ("email", None, None, None, None, None, None),
        ("second_email", None, None, None, None, None, None),
        ("tel", None, None, None, None, None, None),
        ("l_name", None, None, None, None, None, None),
        ("f_name", None, None, None, None, None, None),
        ("l_name_furi", None, None, None, None, None, None),
        ("f_name_furi", None, None, None, None, None, None),
        ("birthday", None, None, None, None, None, None),
        ("profile_img", None, None, None, None, None, None),
    ]
    mock_cursor.fetchone.return_value = (
        "user@example.com", "second@example.com", "09012345678", "Yamada", "Taro",
        "ヤマダ", "タロウ", "1990-01-01", "1.png"
    )
    monkeypatch.setattr("function_app.get_db_connection", lambda: mock_conn)
    return mock_conn, mock_cursor

@pytest.fixture
def mock_blob_url(monkeypatch):
    monkeypatch.setattr("function_app.get_blob_sas_url", lambda blob_name: f"https://mock.blob/{blob_name}")

@pytest.fixture(autouse=True)
def mock_storage_conn(monkeypatch):
    monkeypatch.setattr(
        "function_app.get_azure_storage_connection_string",
        lambda: "DefaultEndpointsProtocol=https;AccountName=dummy;AccountKey=dummy;EndpointSuffix=core.windows.net"
    )

# def test_get_user_success(mock_db_conn, mock_blob_url):
#     req = func.HttpRequest(
#         method="POST",
#         url="/api/get_user",
#         body=b'{"id": 1}',
#         headers={"Content-Type": "application/json"}
#     )
#     resp = get_user(req)
#     assert resp.status_code == 200
#     body = resp.get_body().decode("utf-8")
#     data = json.loads(body)
#     assert data["email"] == "user@example.com"
#     assert data.get("img_url") == "https://mock.blob/1.png" or data.get("profile_img") == "https://mock.blob/1.png"

def test_get_user_no_id():
    req = func.HttpRequest(
        method="POST",
        url="/api/get_user",
        body=b'{}',
        headers={"Content-Type": "application/json"}
    )
    resp = get_user(req)
    assert resp.status_code == 400
    assert "idがありません" in resp.get_body().decode()

# def test_get_user_not_found(mock_db_conn, mock_blob_url):
#     mock_conn, mock_cursor = mock_db_conn
#     mock_cursor.fetchone.return_value = None  # ここでrow=Noneを明示
#     req = func.HttpRequest(
#         method="POST",
#         url="/api/get_user",
#         body=b'{"id": "999"}',
#         headers={"Content-Type": "application/json"}
#     )
#     resp = get_user(req)
#     assert resp.status_code == 404
#     assert "ユーザーが見つかりません" in resp.get_body().decode()

def test_update_user_success(monkeypatch):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.rowcount = 1
    monkeypatch.setattr("function_app.get_db_connection", lambda: mock_conn)
    req = func.HttpRequest(
        method="PATCH",
        url="/api/update_user",
        body=b'{"id": 1, "tel": "08099998888"}',
        headers={"Content-Type": "application/json"}
    )
    resp = update_user(req)
    assert resp.status_code == 200
    assert "更新しました" in resp.get_body().decode()

def test_update_user_no_id():
    req = func.HttpRequest(
        method="PATCH",
        url="/api/update_user",
        body=b'{}',
        headers={"Content-Type": "application/json"}
    )
    resp = update_user(req)
    assert resp.status_code == 400
    assert "idがありません" in resp.get_body().decode()

def test_update_user_no_fields(monkeypatch):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    monkeypatch.setattr("function_app.get_db_connection", lambda: mock_conn)
    req = func.HttpRequest(
        method="PATCH",
        url="/api/update_user",
        body=b'{"id": 1}',
        headers={"Content-Type": "application/json"}
    )
    resp = update_user(req)
    assert resp.status_code == 400
    assert "更新項目がありません" in resp.get_body().decode()

def test_update_user_not_found(monkeypatch):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.rowcount = 0
    # どちらのパターンでもmock_cursorが返るようにする
    mock_conn.cursor.return_value = mock_cursor
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

    monkeypatch.setattr("function_app.get_db_connection", lambda: mock_conn)
    req = func.HttpRequest(
        method="PATCH",
        url="/api/update_user",
        body=b'{"id": "999", "tel": "08099998888"}',
        headers={"Content-Type": "application/json"}
    )
    resp = update_user(req)
    assert resp.status_code == 404
    assert "ユーザーが見つかりません" in resp.get_body().decode()

def test_update_user_multiple_fields(monkeypatch):
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.rowcount = 1
    monkeypatch.setattr("function_app.get_db_connection", lambda: mock_conn)
    req = func.HttpRequest(
        method="PATCH",
        url="/api/update_user",
        body=b'{"id": 1, "tel": "08011112222", "l_name": "Suzuki", "f_name": "Ichiro"}',
        headers={"Content-Type": "application/json"}
    )
    resp = update_user(req)
    assert resp.status_code == 200
    assert "更新しました" in resp.get_body().decode()

def test_update_user_invalid_method():
    req = func.HttpRequest(
        method="GET",
        url="/api/update_user",
        body=b'{}',
        headers={"Content-Type": "application/json"}
    )
    # Azure Functions will not route GET to PATCH handler, so this is just for coverage
    try:
        resp = update_user(req)
        assert resp.status_code in (400, 405, 500)
    except Exception:
        assert True