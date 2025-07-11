import azure.functions as func
import json
import pyodbc
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

# イベント詳細取得API
@app.route(route="event/detail", methods=["GET"])
def event_detail(req: func.HttpRequest) -> func.HttpResponse:
    try:
        event_id = req.params.get("event_id")
        if not event_id:
            return func.HttpResponse(
                json.dumps({"error": "event_idは必須です"}),
                status_code=400,
                mimetype="application/json"
            )
        try:
            event_id = int(event_id)
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "event_idは整数で指定してください"}),
                status_code=400,
                mimetype="application/json"
            )
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            return func.HttpResponse(
                json.dumps({"error": "DB接続情報(CONNECTION_STRING)が設定されていません"}),
                status_code=500,
                mimetype="application/json"
            )
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT event_id, event_title, event_category, event_datetime, deadline, location, max_participants, current_participants, creator, description, content, image, is_draft FROM EVENTS WHERE event_id=?",
                (event_id,)
            )
            row = cursor.fetchone()
            if row:
                keys = ["event_id", "event_title", "event_category", "event_datetime", "deadline", "location", "max_participants", "current_participants", "creator", "description", "content", "image", "is_draft"]
                event = dict(zip(keys, row))
                return func.HttpResponse(
                    json.dumps(event, default=str),
                    status_code=200,
                    mimetype="application/json"
                )
            else:
                return func.HttpResponse(
                    json.dumps({"error": "イベントが見つかりません"}),
                    status_code=404,
                    mimetype="application/json"
                )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=400,
            mimetype="application/json"
        )

# イベント参加登録API
@app.route(route="event/participate", methods=["GET"])
def participate(req: func.HttpRequest) -> func.HttpResponse:
    try:
        event_id = req.params.get("event_id")
        id = req.params.get("id")
        if not event_id or not id:
            return func.HttpResponse(
                json.dumps({"error": "event_idとidは必須です"}),
                status_code=400,
                mimetype="application/json"
            )

        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            return func.HttpResponse(
                json.dumps({"error": "DB接続情報(CONNECTION_STRING)が設定されていません"}),
                status_code=500,
                mimetype="application/json"
            )

        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            # すでに参加済みかチェック
            cursor.execute(
                "SELECT COUNT(*) FROM EVENTS_PARTICIPANTS WHERE event_id=? AND id=? AND registration_status=1",
                (event_id, id)
            )
            if cursor.fetchone()[0] > 0:
                return func.HttpResponse(
                    json.dumps({"error": "すでに参加登録済みです"}),
                    status_code=409,
                    mimetype="application/json"
                )
            # 定員チェック
            cursor.execute(
                "SELECT max_participants, current_participants FROM EVENTS WHERE event_id=?",
                (event_id,)
            )
            row = cursor.fetchone()
            if not row:
                return func.HttpResponse(
                    json.dumps({"error": "イベントが見つかりません"}),
                    status_code=404,
                    mimetype="application/json"
                )
            max_participants, current_participants = row
            if current_participants >= max_participants:
                return func.HttpResponse(
                    json.dumps({"error": "上限に達しているため、参加登録できません"}),
                    status_code=409,
                    mimetype="application/json"
                )
            # 参加登録
            cursor.execute(
                "INSERT INTO EVENTS_PARTICIPANTS (event_id, id, registration_status) VALUES (?, ?, 1)",
                (event_id, id)
            )
            # current_participantsをインクリメント
            cursor.execute(
                "UPDATE EVENTS SET current_participants = current_participants + 1 WHERE event_id=?",
                (event_id,)
            )
            conn.commit()
        return func.HttpResponse(
            json.dumps({"result": "ok"}),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=400,
            mimetype="application/json"
        )