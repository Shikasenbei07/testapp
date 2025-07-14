import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from function_app import app  # または必要な関数名

import unittest
from unittest.mock import patch, MagicMock
import jwt  # PyJWTのimport名はjwt

# テストクラス・テスト関数は必要に応じて修正
class TestFunctionApp(unittest.TestCase):
    def test_dummy(self):
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()