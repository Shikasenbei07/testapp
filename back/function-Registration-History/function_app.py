import azure.functions as func
import logging
import pyodbc
import json
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="Registration")
def Registration(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    user_id = "0738"  # 固定

    # local.settings.json の CONNECTION_STRING を利用
    conn_str = os.environ.get("CONNECTION_STRING")
    if not conn_str:
        logging.error("CONNECTION_STRING is not set in environment variables.")
        return func.HttpResponse("DB connection string not found.", status_code=500)

    try:
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            sql = """
            SELECT
              ep.event_id,  -- これを追加
              e.event_title,
              c.category_name,
              e.event_datetime,
              ISNULL(e.location, '') AS location,
              ISNULL(e.description, '') AS description,
              ISNULL(e.content, '') AS content
            FROM
              EVENTS_PARTICIPANTS ep
              JOIN EVENTS e ON ep.event_id = e.event_id
              JOIN CATEGORYS c ON e.event_category = c.category_id
            WHERE
              ep.id = ?
            ORDER BY
              ep.registered_at DESC
            """
            cursor.execute(sql, (user_id,))
            columns = [column[0] for column in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            logging.info(f"取得データ: {rows}")
    except Exception as e:
        logging.error(f"DB error: {e}")
        return func.HttpResponse("DB error", status_code=500)

    return func.HttpResponse(
        json.dumps(rows, ensure_ascii=False, default=str),
        mimetype="application/json",
        status_code=200
    )

@app.route(route="cancel-reservation", methods=["POST"])
def CancelReservation(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        event_id = req_body.get("event_id")
        if not event_id:
            logging.error("event_idが空です")
            return func.HttpResponse("event_idが空です", status_code=400)
        user_id = "0738"
        logging.info(f"受信 event_id: {event_id} (type: {type(event_id)}), user_id: {user_id} (type: {type(user_id)})")
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            return func.HttpResponse("DB connection string not found.", status_code=500)
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            try:
                event_id_int = int(event_id)
            except Exception as e:
                logging.error(f"event_id型変換エラー: {e}")
                return func.HttpResponse("event_id型エラー", status_code=400)
            # 削除前に該当レコードが存在するか確認
            cursor.execute(
                "SELECT COUNT(*) FROM EVENTS_PARTICIPANTS WHERE event_id = ? AND id = ?",
                (event_id_int, user_id)
            )
            count = cursor.fetchone()[0]
            logging.info(f"削除対象件数: {count}")
            if count == 0:
                return func.HttpResponse("Not found", status_code=404)
            # 削除処理
            cursor.execute(
                "DELETE FROM EVENTS_PARTICIPANTS WHERE event_id = ? AND id = ?",
                (event_id_int, user_id)
            )
            deleted = cursor.rowcount
            conn.commit()
        logging.info(f"削除件数: {deleted}")
        return func.HttpResponse("OK", status_code=200)
    except Exception as e:
        logging.error(f"Cancel error: {e}")
        return func.HttpResponse("DB error", status_code=500)