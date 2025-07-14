import pytest
from azure.functions import HttpRequest
from back.function_showEvent import function_app

import sqlite3
import os
import tempfile
from unittest import mock

def setup_test_db():
    db_fd, db_path = tempfile.mkstemp()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE events (
        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_title VARCHAR(255),
        event_category INTEGER,
        event_datetime DATETIME,
        deadline DATETIME,
        location VARCHAR(255),
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        creator VARCHAR(4) NOT NULL,
        description VARCHAR(200),
        content VARCHAR(200),
        image VARCHAR(200),
        is_draft TINYINT NOT NULL DEFAULT 1
    )''')
    cursor.execute('''INSERT INTO events (event_title, event_category, event_datetime, deadline, location, max_participants, creator, description, content, image, is_draft)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        ("テストイベント", 1, "2025-07-20 10:00:00", "2025-07-19 23:59:59", "東京", 100, "u001", "概要", "内容", "http://image.url", 0))
    conn.commit()
    return conn, db_path

@mock.patch('back.function_showEvent.function_app.get_db_connection')
def test_event_params_from_db(mock_get_db):
    conn, db_path = setup_test_db()
    mock_get_db.return_value = conn
    req = HttpRequest(
        method='GET',
        url='/api/showEvent?event_id=1',
        body=None
    )
    result = function_app.main(req)
    body = result.get_body().decode()
    assert result.status_code == 200
    assert 'テストイベント' in body
    assert '東京' in body
    assert 'u001' in body
    conn.close()
    os.remove(db_path)

def test_show_event_success():
    req = HttpRequest(
        method='GET',
        url='/api/showEvent',
        body=None
    )
    result = function_app.main(req)
    assert result.status_code == 200
    assert 'event' in result.get_body().decode()

