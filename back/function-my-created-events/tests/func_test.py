
import requests

BASE_URL = "http://localhost:7071/api"

def test_my_created_events():
    user_id = "0001"  # テスト用ユーザーID
    response = requests.get(f"{BASE_URL}/my_created_events", params={"user_id": user_id})
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    for event in events:
        assert "event_datetime" in event

def test_my_draft_events():
    user_id = "0001"
    response = requests.get(f"{BASE_URL}/my_draft_events", params={"user_id": user_id})
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    for event in events:
        assert "event_datetime" in event
