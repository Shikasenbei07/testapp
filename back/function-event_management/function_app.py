import os
import pyodbc
import json
import logging
import azure.functions as func
from requests_toolbelt.multipart import decoder
import uuid
from datetime import datetime

from utils import get_connection_string, get_db_connection, get_azure_storage_connection_string, error_response, success_response

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

CONNECTION_STRING = get_connection_string()
AZURE_STORAGE_CONNECTION_STRING = get_azure_storage_connection_string()
CONTAINER_NAME = "event-images"


def to_db_date(val):
    if not val or (isinstance(val, str) and val.strip() == ""):
        return None
    if isinstance(val, str) and 'T' in val:
        try:
            date_part, time_part = val.split('T')
            if len(time_part) == 5:
                time_part += ':00'
            return f"{date_part} {time_part}"
        except Exception:
            return val
    return val

def parse_multipart(req):
    content_type = req.headers.get("Content-Type", "")
    data, image_path = {}, None
    if content_type.startswith("multipart/form-data"):
        body = req.get_body()
        multipart_data = decoder.MultipartDecoder(body, content_type)
        for part in multipart_data.parts:
            cd = part.headers.get(b'Content-Disposition', b'').decode()
            if 'filename=' in cd:
                filename = cd.split('filename="')[1].split('"')[0]
                ext = os.path.splitext(filename)[1]
                user_id = str(data.get("creator", "unknown"))
                unique_id = uuid.uuid4().hex[:8]
                save_name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{user_id}_{unique_id}{ext}"
                save_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'front', 'public', 'images'))
                os.makedirs(save_dir, exist_ok=True)
                save_path = os.path.join(save_dir, save_name)
                with open(save_path, "wb") as f:
                    f.write(part.content)
                image_path = f"images/{save_name}"
                data["image"] = image_path
            else:
                name = cd.split('name="')[1].split('"')[0]
                value = part.text
                if name == "keywords":
                    data.setdefault("keywords", []).append(value)
                else:
                    data[name] = value
        if "image" not in data:
            data["image"] = None
    else:
        data = req.get_json()
        image_path = data.get("image")
    return data, image_path

def fetch_events(user_id, is_draft):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = '''
            SELECT event_id, event_title, event_category, event_datetime, deadline, location, max_participants, current_participants, description, content, image
            FROM EVENTS
            WHERE creator = ? AND is_draft = ? AND event_datetime > GETDATE()
            ORDER BY event_datetime DESC
        '''
        cursor.execute(query, (user_id, is_draft))
        columns = [column[0] for column in cursor.description]
        events = []
        for row in cursor.fetchall():
            event = dict(zip(columns, row))
            for k, v in event.items():
                if hasattr(v, 'isoformat'):
                    event[k] = v.isoformat()
            events.append(event)
        events.reverse()
        return events


@app.route(route="create_event", methods=["POST"])
def create_event(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data, _ = parse_multipart(req)
        data["category"] = data.get("category") or None
        data["max_participants"] = data.get("max_participants") or None
        is_draft = int(data.get("is_draft", 1))
        data["is_draft"] = is_draft
        required_fields = ["title", "date", "location", "category", "keywords", "summary", "detail", "deadline"]
        if is_draft:
            data.setdefault("title", "（未入力）")
            data.setdefault("creator", "0738")
            data.setdefault("is_draft", 1)
        else:
            for f in required_fields:
                if not data.get(f):
                    return error_response(f"{f}は必須です")
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                INSERT INTO EVENTS (event_title, event_category, event_datetime, deadline, location, max_participants, creator, description, content, image, is_draft)
                OUTPUT INSERTED.event_id
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                data.get("title"),
                int(data.get("category")) if data.get("category") else None,
                to_db_date(data.get("date")),
                to_db_date(data.get("deadline")),
                data.get("location"),
                int(data.get("max_participants")) if data.get("max_participants") else None,
                str(data.get("creator", "0738")),
                data.get("summary"),
                data.get("detail"),
                data.get("image"),
                is_draft
            )
            event_id = cursor.fetchone()[0]
            if data.get("keywords"):
                for kw in data["keywords"]:
                    if kw:
                        cursor.execute("INSERT INTO EVENTS_KEYWORDS (event_id, keyword_id) VALUES (?, ?)", event_id, int(kw))
            conn.commit()
        return func.HttpResponse(json.dumps({"message": "イベント登録完了", "event_id": event_id}), mimetype="application/json", status_code=200)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logging.error(tb)
        return error_response(str(e), 500, tb)

@app.route(route="get_self_created_events")
def get_self_created_events(req: func.HttpRequest) -> func.HttpResponse:
    user_id = req.params.get('user_id')
    if not user_id:
        try:
            user_id = req.get_json().get('user_id')
        except Exception:
            return error_response("user_id is required")
    try:
        events = fetch_events(user_id, 0)
        return func.HttpResponse(json.dumps(events, ensure_ascii=False), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return error_response("DB error", 500)

@app.route(route="get_draft")
def get_draft(req: func.HttpRequest) -> func.HttpResponse:
    user_id = req.params.get('user_id')
    if not user_id:
        try:
            user_id = req.get_json().get('user_id')
        except Exception:
            return error_response("user_id is required")
    try:
        events = fetch_events(user_id, 1)
        return func.HttpResponse(json.dumps(events, ensure_ascii=False), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return error_response("DB error", 500)

@app.route(route="update_event", methods=["PUT"])
def update_event(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.route_params.get('event_id')
    try:
        data, _ = parse_multipart(req)
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT creator FROM EVENTS WHERE event_id=?", event_id)
            row = cursor.fetchone()
            if not row:
                return error_response("イベントが存在しません", 404)
            event_creator = row.creator if hasattr(row, "creator") else row[0]
            request_creator = str(data.get("creator", ""))
            if not request_creator or request_creator != str(event_creator):
                return error_response("イベント作成者のみ編集可能です", 403)
            cursor.execute(
                '''
                UPDATE EVENTS SET event_title=?, event_category=?, event_datetime=?, deadline=?, location=?, max_participants=?, description=?, content=?, image=? WHERE event_id=?
                ''',
                data.get("title"),
                int(data.get("category")) if data.get("category") else None,
                to_db_date(data.get("date")),
                to_db_date(data.get("deadline")),
                data.get("location"),
                int(data.get("max_participants")) if data.get("max_participants") else None,
                data.get("summary"),
                data.get("detail"),
                data.get("image"),
                event_id
            )
            cursor.execute("DELETE FROM EVENTS_KEYWORDS WHERE event_id=?", event_id)
            if data.get("keywords"):
                for kw in data["keywords"]:
                    cursor.execute("INSERT INTO EVENTS_KEYWORDS (event_id, keyword_id) VALUES (?, ?)", event_id, int(kw))
            conn.commit()
        return func.HttpResponse(json.dumps({"message": "イベント更新完了", "event_id": event_id}), mimetype="application/json", status_code=200)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logging.error(tb)
        return error_response(str(e), 500, tb)

@app.route(route="delete_event", methods=["DELETE"])
def delete_event(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.route_params.get('event_id')
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT creator FROM EVENTS WHERE event_id=?", event_id)
            row = cursor.fetchone()
            if not row:
                return error_response("イベントが存在しません", 404)
            event_creator = row.creator if hasattr(row, "creator") else row[0]
            try:
                data = req.get_json()
            except Exception:
                data = {}
            request_creator = str(data.get("creator", ""))
            if not request_creator or request_creator != str(event_creator):
                return error_response("イベント作成者のみ削除可能です", 403)
            cursor.execute("DELETE FROM EVENTS_KEYWORDS WHERE event_id=?", event_id)
            cursor.execute("DELETE FROM EVENTS_PARTICIPANTS WHERE event_id=?", event_id)
            cursor.execute("DELETE FROM EVENTS WHERE event_id=?", event_id)
            conn.commit()
        return func.HttpResponse(json.dumps({"message": "イベント削除完了", "event_id": event_id}), mimetype="application/json", status_code=200)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logging.error(tb)
        return error_response(str(e), 500, tb)


@app.route(route="get_categories", methods=["GET"])
def get_categories(req: func.HttpRequest) -> func.HttpResponse:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT category_id, category_name FROM CATEGORIES"
            )
            rows = cursor.fetchall()
            result = [{"category_id": row.category_id, "category_name": row.category_name} for row in rows]
            return success_response(data=result)
    except ConnectionError as ce:
        return error_response(str(ce), 500)
    except pyodbc.ProgrammingError as pe:
        logging.error("SQL文エラー: %s", str(pe))
        return error_response("SQL実行エラーが発生しました。", 500)
    except Exception as e:
        logging.exception("想定外のエラー")
        return error_response(f"不明なエラーが発生しました: {str(e)}", 500)


@app.route(route="get_keywords", methods=["GET"])
def get_keywords(req: func.HttpRequest) -> func.HttpResponse:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT keyword_id, keyword_name FROM KEYWORDS"
            )
            rows = cursor.fetchall()
            result = [{"keyword_id": row.keyword_id, "keyword_name": row.keyword_name} for row in rows]
        return success_response(data=result)
    except ConnectionError as ce:
        return error_response(str(ce), 500)
    except pyodbc.ProgrammingError as pe:
        logging.error("SQL文エラー: %s", str(pe))
        return error_response("SQL実行エラーが発生しました。", 500)
    except Exception as e:
        logging.exception("想定外のエラー")
        return error_response(f"不明なエラーが発生しました: {str(e)}", 500)


@app.route(route="search_events", methods=["GET"])
def search_events(req: func.HttpRequest) -> func.HttpResponse:
    try:
        keyword = req.params.get("keyword", "%")
        category = req.params.get("category", "%")
        date = req.params.get("date")
        with get_db_connection() as conn:
            cursor = conn.cursor()
            try:
                sql = '''
                    SELECT e.*, c.category_name 
                    FROM events e 
                    LEFT JOIN CATEGORIES c 
                    ON e.event_category = c.category_id 
                    WHERE CAST(c.category_id AS VARCHAR) LIKE ? AND e.event_title LIKE ?
                    '''
                if date:
                    sql += " AND CONVERT(DATE, e.event_datetime) = ?"
                    cursor.execute(
                        sql,
                        (category, f"%{keyword}%", date)
                    )
                else:
                    sql += " AND e.event_datetime > GETDATE()"
                    cursor.execute(
                        sql,
                        (category, f"%{keyword}%")
                    )
                columns = [column[0] for column in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                cursor.close()
                conn.close()
                return success_response(data=results)
            except pyodbc.ProgrammingError as pe:
                logging.error("SQL文エラー: %s", str(pe))
                return error_response("SQL実行エラーが発生しました。", 500)
    except Exception as e:
        logging.error(f"DBエラー: {e}")
        return error_response(f"DB接続エラー: {e}", 500)


@app.route(route="get_event_detail", methods=["GET"])
def get_event_detail(req: func.HttpRequest) -> func.HttpResponse:
    try:
        event_id = req.params.get("event_id")
        if not event_id:
            return error_response("event_idは必須です")
        try:
            event_id = int(event_id)
        except ValueError:
            return error_response("event_idは整数で指定してください")
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                '''
                SELECT event_id, event_title, event_category, event_datetime, deadline, location, max_participants, current_participants, creator, description, content, image, is_draft 
                FROM EVENTS 
                WHERE event_id=?
                ''',
                (event_id,)
            )
            row = cursor.fetchone()
            if row:
                keys = ["event_id", "event_title", "event_category", "event_datetime", "deadline", "location", "max_participants", "current_participants", "creator", "description", "content", "image", "is_draft"]
                event = dict(zip(keys, row))
                return success_response(data=event)
            else:
                return error_response("イベントが見つかりません", 404)
    except Exception as e:
        return error_response(str(e), 400)


@app.route(route="get_participants", methods=["GET"])
def get_participants(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.params.get('event_id')
    if not event_id:
        return error_response("event_id is required", 400)

    conn = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''
            SELECT u.id, u.l_name, u.f_name, u.email
            FROM EVENTS_PARTICIPANTS ep
            JOIN USERS u ON ep.id = u.id
            WHERE ep.event_id = ? AND ep.cancelled_at IS NULL
            ''',
            (event_id,)
        )
        columns = [column[0] for column in cursor.description]
        participants = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return success_response(data=participants)

    except Exception as e:
        return error_response(f"Failed to retrieve participants: {str(e)}", 500)

    finally:
        if conn:
            conn.close()