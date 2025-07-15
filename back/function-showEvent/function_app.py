import azure.functions as func
import logging
import pyodbc
import os
import json

 
# 承認レベルによって書き換える
app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

# グローバル変数でcategories情報を保持
def load_categories():
    try:
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            logging.error("CONNECTION_STRINGが環境変数に設定されていません")
            return []
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        sql = "SELECT category_id, category_name FROM CATEGORYS"
        cursor.execute(sql)
        rows = cursor.fetchall()
        conn.close()
        return [dict(zip(["category_id", "category_name"], row)) for row in rows]
    except Exception as e:
        logging.error(f"categoriesロードエラー: {e}")
        return []
 
CATEGORIES_CACHE = load_categories()
 
@app.route(route="categories", methods=["GET"])
def get_categories(req: func.HttpRequest) -> func.HttpResponse:
    # 取得済みキャッシュから返す
    return func.HttpResponse(json.dumps(CATEGORIES_CACHE, ensure_ascii=False), mimetype="application/json")
 
# 11,12行目のxxxは機能ごとに適当に命名してください
@app.route(route="showEvent", methods=["GET", "POST"])
def showEvent(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "GET":
        # GETリクエスト時の処理（event_id指定なしなら全件返す）
        event_id = req.params.get("event_id")
        if not event_id:
            # event_id未指定なら全件返す（カテゴリー名も表示）
            try:
                conn_str = os.environ.get("CONNECTION_STRING")
                if not conn_str:
                    logging.error("CONNECTION_STRINGが環境変数に設定されていません")
                    return func.HttpResponse("DB接続情報がありません", status_code=500)
                conn = pyodbc.connect(conn_str)
                cursor = conn.cursor()
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
        else:
            # event_id指定時は一致したイベントのみ返す（カテゴリー名も表示）
            try:
                event_id_int = int(event_id)
            except (ValueError, TypeError):
                return func.HttpResponse("event_idの形式が不正です", status_code=400)
            try:
                conn_str = os.environ.get("CONNECTION_STRING")
                if not conn_str:
                    logging.error("CONNECTION_STRINGが環境変数に設定されていません")
                    return func.HttpResponse("DB接続情報がありません", status_code=500)
                conn = pyodbc.connect(conn_str)
                cursor = conn.cursor()
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
                    # 日付型などは文字列化
                    for k, v in result.items():
                        if isinstance(v, (bytes, bytearray)):
                            result[k] = v.decode('utf-8', errors='ignore')
                        elif hasattr(v, 'isoformat'):
                            result[k] = v.isoformat()
                    return func.HttpResponse(json.dumps(result, default=str), mimetype="application/json")
                else:
                    return func.HttpResponse("該当するデータがありません", status_code=404)
            except Exception as e:
                logging.error(f"DBエラー: {e}")
                return func.HttpResponse(f"DB接続エラー: {e}", status_code=500)
    elif req.method == "POST":
        # POSTリクエスト時の処理
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse("リクエストボディが不正です", status_code=400)
        event_id = req_body.get("event_id")
        if not event_id:
            return func.HttpResponse("event_idが指定されていません", status_code=400)
    else:
        return func.HttpResponse("許可されていないメソッドです", status_code=405)
 
 
# 例：入力idがマッチしたときに対応する氏名を取得する関数
def get_name(event_id):
    try:
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            logging.error("CONNECTION_STRINGが環境変数に設定されていません")
            return func.HttpResponse("DB接続情報がありません", status_code=500)
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        # eventsテーブルとCATEGORYSテーブルをJOINし、カテゴリー名も取得
        sql = '''
            SELECT e.*, c.category_name
            FROM events e
            LEFT JOIN CATEGORYS c ON e.event_category = c.category_id
            WHERE e.event_id = ?
        '''
        cursor.execute(sql, (event_id,))
        row = cursor.fetchone()
        columns = [column[0] for column in cursor.description]
        conn.close()
    except Exception as e:
        logging.error(f"DBエラー: {e}")
        return func.HttpResponse(f"DB接続エラー: {e}", status_code=500)
   
    if row:
        # 結果を返す（イベント情報：全カラム）
        result = dict(zip(columns, row))
        # 日付型などは文字列化
        for k, v in result.items():
            if isinstance(v, (bytes, bytearray)):
                result[k] = v.decode('utf-8', errors='ignore')
            elif hasattr(v, 'isoformat'):
                result[k] = v.isoformat()
        return func.HttpResponse(json.dumps(result, default=str), mimetype="application/json")
    else:
        return func.HttpResponse("該当するデータがありません", status_code=404)

   
    # お気に入り登録API
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