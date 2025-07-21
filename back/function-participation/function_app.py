import azure.functions as func
import json
import pyodbc
import os
import logging

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

if os.environ.get("IS_MAIN_PRODUCT") == "true":
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_PRODUCT")
else:
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_TEST")


# イベント参加登録API
@app.route(route="participate", methods=["GET", "POST"])
def participate(req: func.HttpRequest) -> func.HttpResponse:
    try:
        if req.method == "POST":
            try:
                data = req.get_json()
            except Exception:
                return func.HttpResponse(
                    json.dumps({"error": "リクエストボディが不正です"}),
                    status_code=400,
                    mimetype="application/json"
                )
            event_id = data.get("event_id")
            id = data.get("id")
        else:
            event_id = req.params.get("event_id")
            id = req.params.get("id")

        if not event_id or not id:
            return func.HttpResponse(
                json.dumps({"error": "event_idとidは必須です"}),
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

        if not CONNECTION_STRING:
            return func.HttpResponse(
                json.dumps({"error": "DB接続情報(CONNECTION_STRING)が設定されていません"}),
                status_code=500,
                mimetype="application/json"
            )

        with pyodbc.connect(CONNECTION_STRING) as conn:
            cursor = conn.cursor()
            # すでに参加済みかチェック
            cursor.execute(
                "SELECT COUNT(*) FROM EVENTS_PARTICIPANTS WHERE event_id=? AND id=?",
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
                "INSERT INTO EVENTS_PARTICIPANTS (event_id, id) VALUES (?, ?)",
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


@app.route(route="get_mylist")
def get_mylist(req: func.HttpRequest) -> func.HttpResponse:
    data = req.get_json()
    user_id = data.get("id")
    conn_str = CONNECTION_STRING
    if not conn_str:
        return func.HttpResponse("DB connection string not found.", status_code=500)
    try:
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            sql = """
            SELECT
                ep.event_id,
                e.event_title,
                e.event_datetime,
                e.location,
                e.creator,
                e.image
            FROM
                EVENTS_PARTICIPANTS ep
                LEFT JOIN EVENTS e ON ep.event_id = e.event_id
            WHERE
                ep.id = ?
            ORDER BY
                e.event_datetime DESC
            """
            cursor.execute(sql, (user_id,))
            columns = [column[0] for column in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            logging.info(f"取得予約履歴: {rows}")
    except Exception as e:
        return func.HttpResponse("DB error", status_code=500)

    return func.HttpResponse(
        json.dumps(rows, ensure_ascii=False, default=str),
        mimetype="application/json",
        status_code=200
    )


@app.route(route="reservation-history")
def reservation_history(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # POST/GET両対応
        if req.method == "POST":
            try:
                data = req.get_json()
            except Exception:
                return func.HttpResponse(
                    json.dumps({"error": "リクエストボディが不正です"}),
                    status_code=400,
                    mimetype="application/json"
                )
            user_id = data.get("id")
        else:
            user_id = req.params.get("id")

        if not user_id:
            return func.HttpResponse(
                json.dumps({"error": "id（ユーザーID）は必須です"}),
                status_code=400,
                mimetype="application/json"
            )

        conn_str = CONNECTION_STRING
        if not conn_str:
            logging.error("CONNECTION_STRING is not set in environment variables.")
            return func.HttpResponse("DB connection string not found.", status_code=500)
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            sql = """
            SELECT
                ep.event_id,
                e.event_title,
                e.event_datetime,
                e.location,
                e.creator,
                e.image
            FROM
                EVENTS_PARTICIPANTS ep
                LEFT JOIN EVENTS e ON ep.event_id = e.event_id
            WHERE
                ep.id = ?
            ORDER BY
                e.event_datetime DESC
            """
            cursor.execute(sql, (user_id,))
            columns = [column[0] for column in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            logging.info(f"取得予約履歴: {rows}")
    except Exception as e:
        logging.error(f"DB error: {e}")
        return func.HttpResponse(
            json.dumps({"error": "DB error", "detail": str(e)}),
            status_code=500,
            mimetype="application/json"
        )

    return func.HttpResponse(
        json.dumps(rows, ensure_ascii=False, default=str),
        mimetype="application/json",
        status_code=200
    )


@app.route(route="cancel-participation")
def cancel_participation(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        event_id = data.get("event_id")
        id = data.get("id")
        if not event_id or not id:
            return func.HttpResponse("event_id and id required", status_code=400)

        conn_str = CONNECTION_STRING
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            # レコード削除
            cursor.execute("""
                DELETE FROM EVENTS_PARTICIPANTS
                WHERE event_id = ? AND id = ?
            """, (event_id, id))
            conn.commit()
            if cursor.rowcount == 0:
                return func.HttpResponse("キャンセル対象がありません", status_code=400)
        return func.HttpResponse("OK", status_code=200)
    except Exception as e:
        logging.error(f"Cancel participation error: {e}")
        return func.HttpResponse("DB error", status_code=500)