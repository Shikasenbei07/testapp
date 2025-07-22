import azure.functions as func
import logging
import os
import pyodbc
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

from utils import get_db_connection, get_azure_storage_connection_string, error_response, success_response


@app.route(route="get_inquiries", methods=["POST"])
def get_inquiries(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except Exception:
        return error_response("リクエストボディが不正です。", status=400)

    sender_id = str(body.get('id'))
    if not sender_id:
        return error_response("idは必須です。", status=400)

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                '''
                SELECT i.event_id, e.event_title, COUNT(*) as count
                FROM INQUIRIES i
                LEFT JOIN EVENTS e ON i.event_id = e.event_id
                WHERE i.sender_id = ? AND i.reply_to_inquiry_id IS NULL
                GROUP BY i.event_id, e.event_title
                ''',
                (sender_id,)
            )
            rows = cursor.fetchall() # [[イベントID, イベントタイトル, 問い合わせ件数]]
            result = [
                {
                    "event_id": row[0],
                    "event_title": row[1],
                    "count": row[2]
                }
                for row in rows
            ]
    except Exception as e:
        return error_response(f"取得エラー: {str(e)}", status=500)
    finally:
        if 'conn' in locals():
            conn.close()

    return success_response(result, status=200)


@app.route(route="get_inquiry_details", methods=["POST"])
def get_inquiry_details(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except Exception:
        return error_response("リクエストボディが不正です。", status=400)

    inquiry_id = body.get('inquiry_id')
    if not inquiry_id:
        return error_response("inquiry_idは必須です。", status=400)

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                '''
                SELECT i.inquiry_id, i.event_id, e.event_title, i.subject, i.message, i.created_at, i.sender_id, i.recipient_id, i.reply_to_inquiry_id
                FROM INQUIRIES i
                LEFT JOIN EVENTS e ON i.event_id = e.event_id
                WHERE i.inquiry_id = ?
                ''',
                (inquiry_id,)
            )
            row = cursor.fetchone()
            if not row:
                return error_response({"error": "指定された問い合わせは存在しません。"}, status=404)
            columns = [column[0] for column in cursor.description]
            result = dict(zip(columns, row))
    except Exception as e:
        return error_response({"error": f"取得エラー: {str(e)}"}, status=500)
    finally:
        if 'conn' in locals():
            conn.close()

    return success_response(result, status=200)


@app.route(route="create_inquiry", methods=["POST"])
def create_inquiry(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    try:
        body = req.get_json()
    except Exception:
        return error_response("リクエストボディが不正です。", status=400)
    inquiry_id = body.get('inquiry_id') if body.get('inquiry_id') is not None else None
    event_id = body.get('event_id')
    title = body.get('title')
    content = body.get('content')
    destination = body.get('destination')
    sender = body.get('sender')
    
    try:
        event_id = int(event_id) if event_id is not None else None
    except ValueError:
        return error_response("event_idは数値で指定してください。", status=400)
    if not event_id or not title or not content:
        return error_response("event_id, title, contentは必須です。", status=400)
    
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            if inquiry_id is not None:
                # 問い合わせの新規作成
                cursor.execute(
                    '''
                    INSERT INTO inquiries (event_id, title, content, destination, sender)
                    VALUES (?, ?, ?, ?, ?);
                    ''',
                    (event_id, title, content, destination, sender)
                )
            else :
                # 既存の問い合わせに対する返信
                cursor.execute(
                    '''
                    INSERT INTO inquiries (inquiry_id, event_id, title, content, destination, sender)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ''',
                    (inquiry_id, event_id, title, content, destination, sender)
                )
            conn.commit()
    except Exception as e:
        return error_response(f"データベースエラー: {str(e)}", status=500)
    finally:
        if 'conn' in locals():
            conn.close()
    if cursor.rowcount > 0:
        return success_response({"message": "問い合わせが正常に作成されました。"}, status=201)
    else:
        return error_response("問い合わせの作成に失敗しました。", status=500)


@app.route(route="receive_inquiries", methods=["POST"])
def receive_inquiries(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json()
    except Exception:
        return error_response({"error": "リクエストボディが不正です。"}, status_code=400)

    sender_id = body.get('id')
    if not sender_id:
        return error_response({"error": "idは必須です。"}, status_code=400)

    try:
        with get_db_connection as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT inquiry_id, event_id, subject, message, created_at, sender_id, recipient_id, reply_to_inquiry_id FROM INQUIRIES WHERE sender_id = ?",
                (sender_id,)
            )
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            result = [dict(zip(columns, row)) for row in rows]
    except Exception as e:
        return func.HttpResponse(json.dumps({"error": f"取得エラー: {str(e)}"}), status_code=500, headers=headers)

    return func.HttpResponse(
        json.dumps(result, ensure_ascii=False, default=str),
        status_code=200,
    )


