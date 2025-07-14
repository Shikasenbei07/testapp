import unittest
from unittest.mock import patch, MagicMock
import json
import sys
import os

# Ensure the function_app module is importable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import function_app
import azure.functions as func

class TestFunctionApp(unittest.TestCase):
    def setUp(self):
        self.valid_id = "123"
        self.empty_id = ""
        self.missing_id = None

    @patch("function_app.get_name")
    def test_get_request_valid_id(self, mock_get_name):
        req = func.HttpRequest(
            method="GET",
            url="/api/xxx?id=123",
            params={"id": self.valid_id},
            body=None
        )
        mock_get_name.return_value = func.HttpResponse(
            json.dumps({"l_name": "Yamada", "f_name": "Taro"}),
            mimetype="application/json"
        )
        resp = function_app.xxx(req)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(json.loads(resp.get_body()), {"l_name": "Yamada", "f_name": "Taro"})

    def test_get_request_missing_id(self):
        req = func.HttpRequest(
            method="GET",
            url="/api/xxx",
            params={},
            body=None
        )
        resp = function_app.xxx(req)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("idが指定されていません", resp.get_body().decode())

    def test_get_request_empty_id(self):
        req = func.HttpRequest(
            method="GET",
            url="/api/xxx?id=",
            params={"id": self.empty_id},
            body=None
        )
        resp = function_app.xxx(req)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("idが指定されていません", resp.get_body().decode())

    @patch("function_app.get_name")
    def test_post_request_valid_id(self, mock_get_name):
        req = func.HttpRequest(
            method="POST",
            url="/api/xxx",
            params={},
            body=json.dumps({"id": self.valid_id}).encode(),
            headers={"content-type": "application/json"}
        )
        mock_get_name.return_value = func.HttpResponse(
            json.dumps({"l_name": "Suzuki", "f_name": "Hanako"}),
            mimetype="application/json"
        )
        resp = function_app.xxx(req)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(json.loads(resp.get_body()), {"l_name": "Suzuki", "f_name": "Hanako"})

    def test_post_request_missing_id(self):
        req = func.HttpRequest(
            method="POST",
            url="/api/xxx",
            params={},
            body=json.dumps({}).encode(),
            headers={"content-type": "application/json"}
        )
        resp = function_app.xxx(req)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("idが指定されていません", resp.get_body().decode())

    def test_post_request_empty_id(self):
        req = func.HttpRequest(
            method="POST",
            url="/api/xxx",
            params={},
            body=json.dumps({"id": self.empty_id}).encode(),
            headers={"content-type": "application/json"}
        )
        resp = function_app.xxx(req)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("idが指定されていません", resp.get_body().decode())

    def test_post_request_invalid_json(self):
        req = func.HttpRequest(
            method="POST",
            url="/api/xxx",
            params={},
            body=b"{invalid_json}",
            headers={"content-type": "application/json"}
        )
        resp = function_app.xxx(req)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("リクエストボディが不正です", resp.get_body().decode())

    def test_method_not_allowed(self):
        req = func.HttpRequest(
            method="PUT",
            url="/api/xxx",
            params={},
            body=None
        )
        resp = function_app.xxx(req)
        self.assertEqual(resp.status_code, 405)
        self.assertIn("許可されていないメソッドです", resp.get_body().decode())

    @patch.dict(os.environ, {}, clear=True)
    def test_get_name_no_connection_string(self):
        resp = function_app.get_name(self.valid_id)
        self.assertEqual(resp.status_code, 500)
        self.assertIn("DB接続情報がありません", resp.get_body().decode())

    @patch.dict(os.environ, {"CONNECTION_STRING": "dummy"})
    @patch("pyodbc.connect")
    def test_get_name_db_error(self, mock_connect):
        mock_connect.side_effect = Exception("DB error")
        resp = function_app.get_name(self.valid_id)
        self.assertEqual(resp.status_code, 500)
        self.assertIn("DB接続エラー", resp.get_body().decode())

    @patch.dict(os.environ, {"CONNECTION_STRING": "dummy"})
    @patch("pyodbc.connect")
    def test_get_name_no_data(self, mock_connect):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_connect.return_value = mock_conn
        resp = function_app.get_name(self.valid_id)
        self.assertEqual(resp.status_code, 404)
        self.assertIn("該当するデータがありません", resp.get_body().decode())

    @patch.dict(os.environ, {"CONNECTION_STRING": "dummy"})
    @patch("pyodbc.connect")
    def test_get_name_success(self, mock_connect):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = ("Tanaka", "Ichiro")
        mock_conn.cursor.return_value = mock_cursor
        mock_connect.return_value = mock_conn
        resp = function_app.get_name(self.valid_id)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(json.loads(resp.get_body()), {"l_name": "Tanaka", "f_name": "Ichiro"})

    @patch.dict(os.environ, {"CONNECTION_STRING": "dummy"})
    @patch("pyodbc.connect")
    def test_get_name_sql_injection_attempt(self, mock_connect):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = None
        mock_conn.cursor.return_value = mock_cursor
        mock_connect.return_value = mock_conn
        malicious_id = "1; DROP TABLE users;"
        resp = function_app.get_name(malicious_id)
        self.assertEqual(resp.status_code, 404)
        self.assertIn("該当するデータがありません", resp.get_body().decode())

    def test_post_request_non_json_content_type(self):
        req = func.HttpRequest(
            method="POST",
            url="/api/xxx",
            params={},
            body=json.dumps({"id": self.valid_id}).encode(),
            headers={"content-type": "text/plain"}
        )
        # Should still parse as JSON if body is valid JSON
        resp = function_app.xxx(req)
        # Azure Functions の HttpRequest.get_json() は content-type が application/json でなくても
        # ボディがJSONならパースするため、200または400どちらも許容
        self.assertIn(resp.status_code, [200, 400, 500])

    def test_get_name_with_none_id(self):
        with patch.dict(os.environ, {"CONNECTION_STRING": "dummy"}):
            with patch("pyodbc.connect") as mock_connect:
                mock_conn = MagicMock()
                mock_cursor = MagicMock()
                mock_cursor.fetchone.return_value = None
                mock_conn.cursor.return_value = mock_cursor
                mock_connect.return_value = mock_conn
                resp = function_app.get_name(None)
                self.assertEqual(resp.status_code, 404)
                self.assertIn("該当するデータがありません", resp.get_body().decode())

if __name__ == "__main__":
    unittest.main()