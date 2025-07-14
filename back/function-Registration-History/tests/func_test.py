import unittest
from unittest.mock import patch, MagicMock
from function_app import main

# Assuming the function you want to test is called 'main' and is in function_app.py

class TestFunctionApp(unittest.TestCase):
    @patch('function_app.req')
    def test_main_returns_expected_response(self, mock_req):
        # Arrange
        mock_req.method = 'GET'
        mock_req.params = {'user_id': '123'}
        mock_req.get_json.return_value = {'user_id': '123'}
        
        # Act
        response = main(mock_req)
        
        # Assert
        self.assertIsNotNone(response)
        self.assertTrue(hasattr(response, 'get_body'))
        self.assertIn('user_id', response.get_body().decode())

    @patch('function_app.req')
    def test_main_handles_missing_user_id(self, mock_req):
        # Arrange
        mock_req.method = 'GET'
        mock_req.params = {}
        mock_req.get_json.return_value = {}
        
        # Act
        response = main(mock_req)
        
        # Assert
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 400)
        self.assertIn('Missing user_id', response.get_body().decode())

    @patch('function_app.req')
    def test_main_handles_post_method(self, mock_req):
        # Arrange
        mock_req.method = 'POST'
        mock_req.get_json.return_value = {'user_id': '456'}
        
        # Act
        response = main(mock_req)
        
        # Assert
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 200)
        self.assertIn('user_id', response.get_body().decode())

    @patch('function_app.req')
    def test_main_handles_invalid_method(self, mock_req):
        # Arrange
        mock_req.method = 'PUT'
        mock_req.get_json.return_value = {}
        
        # Act
        response = main(mock_req)
        
        # Assert
        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 405)

if __name__ == '__main__':
    unittest.main()