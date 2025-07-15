import unittest
from unittest.mock import patch, MagicMock
import function_app

class TestFunctionApp(unittest.TestCase):

    @patch("function_app.get_conn")
    def test_root(self, mock_get_conn):
        # ルート関数がある場合の例
        result = function_app.root()
        self.assertEqual(result["message"], "ok")

    @patch("function_app.get_conn")
    def test_update_user_profile_missing_fields(self, mock_get_conn):
        # name, emailが足りない場合
        data = {"user_id": 1}
        with self.assertRaises(Exception):
            function_app.update_user_profile(data)

if __name__ == "__main__":
    unittest.main()