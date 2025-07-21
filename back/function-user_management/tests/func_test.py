import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from unittest.mock import patch, MagicMock
import json

import function_app  # これでダメな場合は↓に変更
# from function_user_management import function_app

@pytest.fixture
def mock_db(monkeypatch):
    mock_cursor = MagicMock()
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_conn.__enter__.return_value = mock_conn  # ← 追加
    mock_conn.__exit__.return_value = None        # ← 追加
    monkeypatch.setattr(function_app, "get_db_connection", lambda: mock_conn)
    monkeypatch.setattr(function_app, "CONNECTION_STRING", "dummy")
    return mock_cursor

def make_req(json_body):
    class DummyReq:
        def get_json(self):
            return json_body
    return DummyReq()

def test_get_user_success(mock_db, monkeypatch):
    mock_db.fetchone.return_value = ("山田", "yamada.png")
    monkeypatch.setattr(function_app, "CONNECTION_STRING", "dummy")
    # get_blob_sas_urlをモック
    monkeypatch.setattr(function_app, "get_blob_sas_url", lambda user_id, ext: "dummy_url")
    req = make_req({"id": "user1"})
    resp = function_app.get_user(req)
    assert resp.status_code == 200
    body = json.loads(resp.get_body())
    assert body["l_name"] == "山田"
    assert "profile_img" in body

def test_get_user_not_found(mock_db, monkeypatch):
    mock_db.fetchone.return_value = None
    monkeypatch.setattr(function_app, "CONNECTION_STRING", "dummy")
    monkeypatch.setattr(function_app, "get_blob_sas_url", lambda user_id, ext: "dummy_url")
    req = make_req({"id": "user1"})
    resp = function_app.get_user(req)
    assert resp.status_code == 404
    body = json.loads(resp.get_body())
    assert "ユーザーが見つかりません" in body["error"]

def test_get_user_no_id(monkeypatch):
    monkeypatch.setattr(function_app, "CONNECTION_STRING", "dummy")
    req = make_req({})
    resp = function_app.get_user(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "idがありません" in body["error"]

def test_update_user_success(monkeypatch):
    mock_cursor = MagicMock()
    mock_cursor.rowcount = 1
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    monkeypatch.setattr(function_app, "pyodbc", MagicMock())
    monkeypatch.setattr(function_app, "CONNECTION_STRING", "dummy")
    monkeypatch.setattr(function_app, "get_db_connection", lambda: mock_conn)
    req = make_req({"id": "user1", "l_name": "山田", "profile_img": "yamada.png"})
    resp = function_app.update_user(req)
    assert resp.status_code == 200
    body = json.loads(resp.get_body())
    assert "更新しました" in body["message"]

def test_update_user_not_found(monkeypatch):
    mock_cursor = MagicMock()
    mock_cursor.rowcount = 0
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_conn.__enter__.return_value = mock_conn  # with対応
    mock_conn.__exit__.return_value = None
    monkeypatch.setattr(function_app, "pyodbc", MagicMock())
    monkeypatch.setattr(function_app, "CONNECTION_STRING", "dummy")
    monkeypatch.setattr(function_app, "get_db_connection", lambda: mock_conn)
    req = make_req({"id": "user1", "l_name": "山田", "profile_img": "yamada.png"})
    resp = function_app.update_user(req)
    assert resp.status_code == 404
    body = json.loads(resp.get_body())
    assert "ユーザーが見つかりません" in body["error"]

def test_update_user_no_id(monkeypatch):
    monkeypatch.setattr(function_app, "CONNECTION_STRING", "dummy")
    req = make_req({"l_name": "山田", "profile_img": "yamada.png"})
    resp = function_app.update_user(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "idがありません" in body["error"]

def test_update_user_no_l_name(monkeypatch):
    monkeypatch.setattr(function_app, "CONNECTION_STRING", "dummy")
    req = make_req({"id": "user1", "profile_img": "yamada.png"})
    resp = function_app.update_user(req)
    assert resp.status_code == 400
    body = json.loads(resp.get_body())
    assert "l_nameがありません" in body["error"]