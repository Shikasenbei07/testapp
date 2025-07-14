import pytest
from azure.functions import HttpRequest
from back.function_showEvent import function_app

def test_show_event_success():
    req = HttpRequest(
        method='GET',
        url='/api/showEvent',
        body=None
    )
    result = function_app.main(req)
    assert result.status_code == 200
    assert 'event' in result.get_body().decode()

