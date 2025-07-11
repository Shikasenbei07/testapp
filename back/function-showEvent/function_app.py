import azure.functions as func
import logging
import pyodbc
import os
import json

# 承認レベルによって書き換える
app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

# 11,12行目のxxxは機能ごとに適当に命名してください
@app.route(route="showEvent", methods=["GET", "POST"])
def showEvent(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "GET":
        # GETリクエスト時の処理
        event_id = req.params.get("event_id")
        if not event_id:
            return func.HttpResponse("event_idが指定されていません", status_code=400)
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

    # event_idが数値型の場合はintに変換
    try:
        event_id_int = int(event_id)
    except (ValueError, TypeError):
        return func.HttpResponse("event_idの形式が不正です", status_code=400)
    return get_name(event_id_int)


# 例：入力idがマッチしたときに対応する氏名を取得する関数
def get_name(event_id):
    try:
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            logging.error("CONNECTION_STRINGが環境変数に設定されていません")
            return func.HttpResponse("DB接続情報がありません", status_code=500)
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        # eventsテーブルからイベント情報を取得
        sql = "SELECT event_id, event_title, event_datetime FROM events WHERE event_id = ?"
        cursor.execute(sql, (event_id,))
        row = cursor.fetchone()
        conn.close()
    except Exception as e:
        logging.error(f"DBエラー: {e}")
        return func.HttpResponse(f"DB接続エラー: {e}", status_code=500)
    
    if row:
        # 結果を返す（イベント情報）
        result = {
            "event_id": row[0],
            "event_title": row[1],
            "event_datetime": str(row[2])
        }
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    else:
        return func.HttpResponse("該当するデータがありません", status_code=404)