import azure.functions as func
import json
import pyodbc
import os
import logging

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

from utils import get_connection_string, get_db_connection, error_response, success_response


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

        with get_db_connection() as conn:
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
    # 修正: POST/GET両対応
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
            user_id = data.get("id")
        else:
            user_id = req.params.get("id")
        with get_db_connection() as conn:
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

        with get_db_connection() as conn:
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


@app.route(route="cancel-participation", methods=["DELETE"])
def cancel_participation(req: func.HttpRequest) -> func.HttpResponse:
    try:
        try:
            data = req.get_json()
        except Exception:
            return error_response("リクエストボディが不正です", status=400)
        event_id = data.get("event_id")
        user_id = data.get("id")
        if not event_id or not user_id:
            return error_response("event_idとidは必須です", status=400)
        try:
            event_id = int(event_id)
        except ValueError:
            return error_response("event_idは整数で指定してください", status=400)

        with get_db_connection() as conn:
            cursor = conn.cursor()
            # レコード削除
            cursor.execute(
                """
                DELETE FROM EVENTS_PARTICIPANTS
                WHERE event_id = ? AND id = ?
                """,
                (event_id, user_id)
            )
            if cursor.rowcount == 0:
                return error_response("参加登録が見つかりません", status=404)
            # current_participantsをデクリメント
            cursor.execute(
                """
                UPDATE EVENTS
                SET current_participants = CASE WHEN current_participants > 0 THEN current_participants - 1 ELSE 0 END
                WHERE event_id = ?
                """,
                (event_id,)
            )
            conn.commit()
        return success_response("OK", status=200)
    except Exception as e:
        logging.error(f"Cancel participation error: {e}")
        return error_response("DB error", status=500)