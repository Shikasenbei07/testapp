import azure.functions as func
import logging
import pyodbc
import os
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

# カテゴリー一覧取得
@app.route(route="categories", methods=["GET"])
def get_categories(req: func.HttpRequest) -> func.HttpResponse:
    try:
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            logging.error("CONNECTION_STRINGが環境変数に設定されていません")
            return func.HttpResponse("DB接続情報がありません", status_code=500)
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        sql = "SELECT category_id, category_name FROM CATEGORYS"
        cursor.execute(sql)
        rows = cursor.fetchall()
        conn.close()
        result = [dict(zip(["category_id", "category_name"], row)) for row in rows]
        return func.HttpResponse(json.dumps(result, ensure_ascii=False), mimetype="application/json")
    except Exception as e:
        logging.error(f"categoriesロードエラー: {e}")
        return func.HttpResponse(f"DB接続エラー: {e}", status_code=500)

# イベント一覧・詳細取得
@app.route(route="showevent", methods=["GET"])
def showevent(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.params.get("event_id")
    try:
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            logging.error("CONNECTION_STRINGが環境変数に設定されていません")
            return func.HttpResponse("DB接続情報がありません", status_code=500)
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        if event_id:
            try:
                event_id_int = int(event_id)
            except (ValueError, TypeError):
                return func.HttpResponse("event_idの形式が不正です", status_code=400)
            sql = '''
                SELECT e.*, c.category_name
                FROM events e
                LEFT JOIN CATEGORYS c ON e.event_category = c.category_id
                WHERE e.event_id = ?
            '''
            cursor.execute(sql, (event_id_int,))
            row = cursor.fetchone()
            columns = [column[0] for column in cursor.description]
            conn.close()
            if row:
                result = dict(zip(columns, row))
                for k, v in result.items():
                    if isinstance(v, (bytes, bytearray)):
                        result[k] = v.decode('utf-8', errors='ignore')
                    elif hasattr(v, 'isoformat'):
                        result[k] = v.isoformat()
                return func.HttpResponse(json.dumps(result, default=str), mimetype="application/json")
            else:
                return func.HttpResponse("該当するデータがありません", status_code=404)
        else:
            sql = '''
                SELECT e.*, c.category_name
                FROM events e
                LEFT JOIN CATEGORYS c ON e.event_category = c.category_id
            '''
            cursor.execute(sql)
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            conn.close()
            result = [dict(zip(columns, row)) for row in rows]
            return func.HttpResponse(json.dumps(result, default=str), mimetype="application/json")
    except Exception as e:
        logging.error(f"DBエラー: {e}")
        return func.HttpResponse(f"DB接続エラー: {e}", status_code=500)

# お気に入り取得（POST）
@app.route(route="get_favorites", methods=["POST"])
def get_favorites(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        id = req_body.get("id")
        if not id:
            # 空配列などJSONで返す
            return func.HttpResponse(json.dumps([]), mimetype="application/json")
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            logging.error("CONNECTION_STRINGが環境変数に設定されていません")
            return func.HttpResponse("DB接続情報がありません", status_code=500)
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        sql = "SELECT event_id FROM favorites WHERE id = ?"
        cursor.execute(sql, (id,))
        rows = cursor.fetchall()
        conn.close()
        result = [row[0] for row in rows]
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    except Exception as e:
        # 例外時もJSONで返す
        logging.error(f"お気に入り登録DBエラー: {e}")
        return func.HttpResponse(json.dumps([]), mimetype="application/json")

# お気に入り登録（POST）
@app.route(route="favorites", methods=["POST"])
def add_favorite(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse("リクエストボディが不正です", status_code=400)
    event_id = req_body.get("event_id")
    user_id = req_body.get("id")
    if not event_id or not user_id:
        return func.HttpResponse("event_idまたはidが指定されていません", status_code=400)
    try:
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            logging.error("CONNECTION_STRINGが環境変数に設定されていません")
            return func.HttpResponse("DB接続情報がありません", status_code=500)
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        sql = "INSERT INTO favorites (event_id, id) VALUES (?, ?)"
        cursor.execute(sql, (event_id, user_id))
        conn.commit()
        conn.close()
        return func.HttpResponse("お気に入り登録完了", status_code=200)
    except Exception as e:
        logging.error(f"お気に入り登録DBエラー: {e}")
        return func.HttpResponse(f"DB接続エラー: {e}", status_code=500)

# 参加履歴確認（GET）
@app.route(route="check_history", methods=["GET"])
def check_history(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.params.get("event_id")
    user_id = req.params.get("id")
    if not event_id or not user_id:
        return func.HttpResponse("event_idまたはidが指定されていません", status_code=400)
    try:
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            logging.error("CONNECTION_STRINGが環境変数に設定されていません")
            return func.HttpResponse("DB接続情報がありません", status_code=500)
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        sql = "SELECT COUNT(*) FROM EVENTS_PARTICIPANTS WHERE event_id = ? AND id = ?"
        cursor.execute(sql, (event_id, user_id))
        count = cursor.fetchone()[0]
        conn.close()
        result = {"is_participated": count > 0}
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    except Exception as e:
        logging.error(f"参加履歴取得DBエラー: {e}")
        return func.HttpResponse(f"DB接続エラー: {e}", status_code=500)

@app.route(route="cancel-reservation", methods=["POST"])
def CancelReservation(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        event_id = req_body.get("event_id")
        user_id = req_body.get("id")  # ←修正
        if not event_id or not user_id:
            logging.error("event_idまたはidが空です")
            return func.HttpResponse("event_idまたはidが空です", status_code=400)
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

@app.route(route="participated_events", methods=["GET"])
def participated_events(req: func.HttpRequest) -> func.HttpResponse:
    user_id = req.params.get("id")
    if not user_id:
        return func.HttpResponse("idが指定されていません", status_code=400)
    try:
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            return func.HttpResponse("DB接続情報がありません", status_code=500)
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        sql = "SELECT event_id FROM EVENTS_PARTICIPANTS WHERE id = ?"
        cursor.execute(sql, (user_id,))
        rows = cursor.fetchall()
        conn.close()
        result = [row[0] for row in rows]
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    except Exception as e:
        return func.HttpResponse(f"DB接続エラー: {e}", status_code=500)

