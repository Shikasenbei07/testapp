

    # ...既存のコード...
import azure.functions as func
import logging
import os
import pyodbc
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

# DB接続用関数
def get_db_connection():
    conn_str = os.environ.get('CONNECTION_STRING')
    if not conn_str:
        raise Exception('CONNECTION_STRING is not set in environment variables')
    return pyodbc.connect(conn_str)

# 作成済みイベント一覧（下書き除く）
@app.route(route="my_created_events")
def my_created_events(req: func.HttpRequest) -> func.HttpResponse:
    user_id = req.params.get('user_id')
    if not user_id:
        try:
            req_body = req.get_json()
            user_id = req_body.get('user_id')
        except Exception:
            return func.HttpResponse("user_id is required", status_code=400)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = '''
            SELECT event_id, event_title, event_category, event_datetime, deadline, location, max_participants, current_participants, description, content, image
            FROM EVENTS
            WHERE creator = ? AND is_draft = 0 AND event_datetime > GETDATE()
            ORDER BY event_datetime DESC
        '''
        cursor.execute(query, (user_id,))
        columns = [column[0] for column in cursor.description]
        events = []
        for row in cursor.fetchall():
            event = dict(zip(columns, row))
            for k, v in event.items():
                if hasattr(v, 'isoformat'):
                    event[k] = v.isoformat()
            events.append(event)
        return func.HttpResponse(json.dumps(events, ensure_ascii=False), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse("DB error", status_code=500)

# 下書きイベント一覧
@app.route(route="my_draft_events")
def my_draft_events(req: func.HttpRequest) -> func.HttpResponse:
    user_id = req.params.get('user_id')
    if not user_id:
        try:
            req_body = req.get_json()
            user_id = req_body.get('user_id')
        except Exception:
            return func.HttpResponse("user_id is required", status_code=400)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = '''
            SELECT event_id, event_title, event_category, event_datetime, deadline, location, max_participants, current_participants, description, content, image
            FROM EVENTS
            WHERE creator = ? AND is_draft = 1 AND event_datetime > GETDATE()
            ORDER BY event_datetime DESC
        '''
        cursor.execute(query, (user_id,))
        columns = [column[0] for column in cursor.description]
        events = []
        for row in cursor.fetchall():
            event = dict(zip(columns, row))
            for k, v in event.items():
                if hasattr(v, 'isoformat'):
                    event[k] = v.isoformat()
            events.append(event)
        return func.HttpResponse(json.dumps(events, ensure_ascii=False), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse("DB error", status_code=500)
