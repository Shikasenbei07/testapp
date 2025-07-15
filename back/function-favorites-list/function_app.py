import azure.functions as func
import logging
import pyodbc
import os
import json
from datetime import datetime

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="favorites")
def favorites(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    # ユーザーIDは'0738'で固定
    user_id = "0738"

    conn_str = os.environ.get("CONNECTION_STRING")
    if not conn_str:
        logging.error("CONNECTION_STRING is not set in environment variables.")
        return func.HttpResponse("DB connection string not found.", status_code=500)

    try:
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            # お気に入りイベント一覧を取得
            cursor.execute("""
                SELECT f.event_id, e.event_title, e.event_datetime, e.location, e.description, e.content
                FROM favorites f
                JOIN EVENTS e ON f.event_id = e.event_id
                WHERE f.id = ?
            """, (user_id,))
            rows = cursor.fetchall()
            columns = [column[0] for column in cursor.description]
            favorites_list = []
            for row in rows:
                item = dict(zip(columns, row))
                # datetime型を文字列に変換
                for k, v in item.items():
                    if isinstance(v, datetime):
                        item[k] = v.isoformat()
                favorites_list.append(item)

        return func.HttpResponse(
            json.dumps(favorites_list, ensure_ascii=False),
            mimetype="application/json",
            status_code=200
        )
    except Exception as e:
        logging.error(f"DB error: {e}")
        return func.HttpResponse("DB error", status_code=500)

@app.route(route="xxx")
def xxx(req: func.HttpRequest) -> func.HttpResponse:
    # HTTPリクエストを受け取った際の処理
    logging.info('Python HTTP trigger function processed a request.')

    # 例: クエリパラメータやリクエストボディから値を取得
    value = req.params.get('value')
    if not value:
        try:
            req_body = req.get_json()
        except ValueError:
            req_body = {}
        value = req_body.get('value')

    if value:
        return func.HttpResponse(f"受け取った値: {value}")
    else:
        return func.HttpResponse(
            "値が指定されていません。クエリまたはボディで 'value' を指定してください。",
            status_code=200
        )

@app.route(route="favorites/{event_id}", methods=["DELETE"])
def remove_favorite(req: func.HttpRequest) -> func.HttpResponse:
    import os
    import pyodbc
    import logging

    user_id = "0738"
    event_id = req.route_params.get("event_id")
    conn_str = os.environ.get("CONNECTION_STRING")
    if not conn_str:
        logging.error("CONNECTION_STRING is not set in environment variables.")
        return func.HttpResponse("DB connection string not found.", status_code=500)
    try:
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM favorites WHERE event_id = ? AND id = ?",
                (event_id, user_id)
            )
            conn.commit()
        return func.HttpResponse("OK", status_code=200)
    except Exception as e:
        logging.error(f"DB error: {e}")
        return func.HttpResponse("DB error", status_code=500)

@app.route(route="reservation-detail")
def reservation_detail(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request for reservation detail.')

    event_id = req.params.get('event_id')
    event_title = req.params.get('event_title', '')
    event_datetime = req.params.get('event_datetime', '')
    location = req.params.get('location', '')
    description = req.params.get('description', '')
    content = req.params.get('content', '')

    # ここで受け取ったパラメータを元に処理を行う
    # 例えば、予約詳細を表示するためのデータを取得するなど

    return func.HttpResponse(
        f"予約詳細: {event_id}, {event_title}, {event_datetime}, {location}, {description}, {content}",
        status_code=200
    )