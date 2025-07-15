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

# お気に入り登録
@app.route(route="favorite", methods=["POST"])
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