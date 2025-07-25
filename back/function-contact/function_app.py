import azure.functions as func
import logging
import os
import pyodbc
import json
import hashlib

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

from utils import get_db_connection, get_azure_storage_connection_string, error_response, success_response, to_jst_isoformat


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
                SELECT
                    i.inquiry_id,
                    i.event_id,
                    e.event_title,
                    i.title,
                    i.destination,
                    i.sender,
                    i.hashed_inquiry_id,
                    (
                        SELECT COUNT(*)
                        FROM INQUIRIES ii
                        WHERE ii.inquiry_id = i.inquiry_id
                    ) as count
                FROM INQUIRIES i
                LEFT JOIN EVENTS e
                    ON i.event_id = e.event_id
                WHERE i.sender = ?
                    AND i.inquiry_no = 1
                GROUP BY i.inquiry_id, i.event_id, e.event_title, i.title, i.destination, i.sender, i.hashed_inquiry_id
                ''',
                (sender_id,)
            )
            rows = cursor.fetchall()
            result = [
                {
                    "inquiry_id": row[0],
                    "event_id": row[1],
                    "event_title": row[2],
                    "inquiry_title": row[3],
                    "destination": row[4],
                    "sender": row[5],
                    "hashed_inquiry_id": row[6],
                    "count": row[7]
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

    hashed_inquiry_id = str(body.get('hashed_inquiry_id'))
    if not hashed_inquiry_id:
        return error_response("idは必須です。", status=400)

    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                '''
                SELECT inquiry_id
                FROM INQUIRIES
                WHERE hashed_inquiry_id=?
                ''',
                (hashed_inquiry_id,)
            )
            row = cursor.fetchone()
            if not row:
                return error_response("指定された問い合わせは存在しません。", status=404)
            inquiry_id = row[0]

            cursor.execute(
                '''
                SELECT 
                    i.inquiry_id,
                    i.event_id,
                    e.event_title,
                    i.title,
                    i.content,
                    i.created_date,
                    i.destination,
                    u_dest.handle_name AS destination_name,
                    i.sender,
                    u_send.handle_name AS sender_name
                FROM INQUIRIES i
                LEFT JOIN EVENTS e
                    ON i.event_id = e.event_id
                LEFT JOIN USERS u_dest
                    ON i.destination = u_dest.id
                LEFT JOIN USERS u_send
                    ON i.sender = u_send.id
                WHERE i.inquiry_id=?
                ''',
                (inquiry_id,)
            )
            rows = cursor.fetchall()
            result = [
                {
                    "inquiry_id": row[0],
                    "event_id": row[1],
                    "event_title": row[2],
                    "inquiry_title": row[3],
                    "content": row[4],
                    "created_date": to_jst_isoformat(row[5]),
                    "destination": row[6],
                    "destination_name": row[7],
                    "sender": row[8],
                    "sender_name": row[9]
                }
                for row in rows
            ]
    except Exception as e:
        return error_response(f"取得エラー: {str(e)}", status=500)
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
    event_id = body.get('event_id') if body.get('event_id') is not None else None
    title = body.get('title') if body.get('title') is not None else None
    content = body.get('content')
    destination = body.get('destination')
    sender = body.get('sender')
    
    try:
        event_id = int(event_id) if event_id is not None else None
    except ValueError:
        return error_response("event_idは数値で指定してください。", status=400)
    
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            if inquiry_id is None:
                # 問い合わせの新規作成
                cursor.execute(
                    '''
                    EXEC sp_insert_inquiry 
                        @event_id = ?, 
                        @title = ?, 
                        @content = ?, 
                        @destination = ?, 
                        @sender = ?
                    ''',
                    (event_id, title, content, destination, sender)
                )
                
                # 複数の結果セットを処理
                while True:
                    try:
                        if cursor.description:  # 結果セットが存在するかチェック
                            result = cursor.fetchone()
                            if result:
                                inquiry_id = result[0]
                        
                        # 次の結果セットに移動
                        if not cursor.nextset():
                            break
                    except Exception as e:
                        print(f"Error processing result set: {e}")
                        break
                    
                if result:
                    inquiry_id = result[0]
                else:
                    return error_response("Failed to insert inquiry", status=500)
                print("inquiry_id: "+str(inquiry_id))
                hashed_inquiry_id = hashlib.sha256(str(inquiry_id).encode()).hexdigest()
                print("hash: "+hashed_inquiry_id)
                cursor.execute(
                    '''
                    UPDATE inquiries
                    SET hashed_inquiry_id = ?
                    WHERE inquiry_id = ?
                    ''',
                    (hashed_inquiry_id, inquiry_id)
                )
            else:
                # 既存の問い合わせに対する返信
                cursor.execute(
                    '''
                    INSERT INTO inquiries (inquiry_id, content, destination, sender)
                    VALUES (?, ?, ?, ?)
                    ''',
                    (inquiry_id, content, destination, sender)
                )
            conn.commit()
    except Exception as e:
        return error_response(f"データベースエラー: {str(e)}", status=500)
    finally:
        if 'conn' in locals():
            conn.close()
    if inquiry_id:
        return success_response({"message":"問い合わせが正常に作成されました。"}, status=201)
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
        return func.HttpResponse(
            json.dumps({"error": f"取得エラー: {str(e)}"}, ensure_ascii=False),
            status_code=500,
            headers={"Content-Type": "application/json; charset=utf-8"}
        )

    return func.HttpResponse(
        json.dumps(result, ensure_ascii=False, default=str),
        status_code=200,
        headers={"Content-Type": "application/json; charset=utf-8"}
    )


