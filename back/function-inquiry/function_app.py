
import azure.functions as func
import logging
import os
import pyodbc

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

# /api/eventinfo: イベント情報取得API
@app.route(route="eventinfo", methods=["GET"])
def eventinfo(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.params.get('event_id')
    if not event_id:
        return func.HttpResponse("event_idは必須です。", status_code=400)
    try:
        event_id = int(event_id)
    except ValueError:
        return func.HttpResponse("event_idは数値で指定してください。", status_code=400)
    try:
        conn = pyodbc.connect(os.environ.get("CONNECTION_STRING"))
        with conn.cursor() as cursor:
            cursor.execute("SELECT event_title, creator FROM EVENTS WHERE event_id=?", (event_id,))
            result = cursor.fetchone()
            if not result:
                return func.HttpResponse("イベントが見つかりません。", status_code=404)
            event_title = result[0]
            creator_id = result[1]
            cursor.execute("SELECT l_name, f_name FROM USERS WHERE id=?", (creator_id,))
            result = cursor.fetchone()
            if not result:
                creator_name = "不明"
            else:
                creator_name = f"{result[0]} {result[1]}"
    except Exception as e:
        return func.HttpResponse(f"DBエラー: {str(e)}", status_code=500)
    finally:
        if 'conn' in locals():
            conn.close()
    # CORS対応
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000"
    }
    import json
    return func.HttpResponse(
        json.dumps({"event_title": event_title, "creator_name": creator_name}),
        status_code=200,
        headers=headers
    )

@app.route(route="inquiry", methods=["GET"])
def inquiry(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    # GETリクエストのクエリパラメータから取得
    id = req.params.get('id')
    event_id = req.params.get('event_id')
    subject = req.params.get('subject')
    message = req.params.get('message')
    import json
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3000"
    }
    try:
        event_id = int(event_id) if event_id is not None else None
    except ValueError:
        return func.HttpResponse(json.dumps({"error": "event_idは数値で指定してください。"}), status_code=400, headers=headers)

    if not id or not event_id or not subject or not message:
        return func.HttpResponse(json.dumps({"error": "id, event_id, subject, messageは必須です。"}), status_code=400, headers=headers)

    try:
        conn = pyodbc.connect(os.environ.get("CONNECTION_STRING"))
        with conn.cursor() as cursor:
            cursor.execute("SELECT event_title, creator FROM EVENTS WHERE event_id=?", (event_id,))
            result = cursor.fetchone()
            if not result:
                return func.HttpResponse(json.dumps({"error": "イベントが見つかりません。"}), status_code=404, headers=headers)
            event_title = result[0]
            creator_id = result[1]
            cursor.execute("SELECT l_name, f_name FROM USERS WHERE id=?", (creator_id,))
            result = cursor.fetchone()
            if not result:
                creator_name = "不明"
            else:
                creator_name = f"{result[0]} {result[1]}"
    except Exception as e:
        return func.HttpResponse(json.dumps({"error": f"DBエラー: {str(e)}"}), status_code=500, headers=headers)
    finally:
        if 'conn' in locals():
            conn.close()

    try:
        conn = pyodbc.connect(os.environ.get("CONNECTION_STRING"))
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO INQUIRIES (event_id, id, subject, message, created_at) VALUES (?, ?, ?, ?, GETDATE())",
                (event_id, id, subject, message)
            )
            conn.commit()
    except Exception as e:
        return func.HttpResponse(json.dumps({"error": f"問い合わせ保存エラー: {str(e)}"}), status_code=500, headers=headers)
    finally:
        if 'conn' in locals():
            conn.close()

    return func.HttpResponse(
        json.dumps({
            "message": "お問い合わせを受け付けました。",
            "event_title": event_title,
            "creator_name": creator_name
        }),
        status_code=200,
        headers=headers
    )

