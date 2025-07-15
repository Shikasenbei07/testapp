import pytest
from unittest.mock import patch, MagicMock
import json
import function_app

def make_req(json_body):
    req = MagicMock()
    req.get_json.return_value = json_body
    return req

@patch("function_app.os.environ", {"CONNECTION_STRING": "dummy"})
@patch("function_app.pyodbc.connect")
def test_get_favorites_api(mock_connect):
    # お気に入り取得APIのテスト（user_id=0738）
    mock_cursor = MagicMock()
    # favoritesテーブルのevent_idを返す
    mock_cursor.fetchall.return_value = [(1,), (2,), (3,)]
    mock_conn = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_connect.return_value = mock_conn

    # 仮のHttpRequest
    req = MagicMock()
    req.params = {"user_id": "0738"}

    # API関数（例: get_favorites）
    resp = function_app.get_favorites(req)
    assert resp.status_code == 200
    body = json.loads(resp.get_body())
    assert body == [1, 2, 3]
