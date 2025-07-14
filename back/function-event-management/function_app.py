
import os
import pyodbc
import io
import json
import logging
import azure.functions as func
from multipart import MultipartParser
from requests_toolbelt.multipart import decoder
import uuid
from datetime import datetime

# appはファイル先頭で一度だけ定義
app = func.FunctionApp()

@app.function_name(name="get_event")
@app.route(route="events/{event_id}", methods=["GET"])
def get_event(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.route_params.get('event_id')
    try:
        logging.info(f"get_event: event_id param = {event_id} (type: {type(event_id)})")
        if event_id is None:
            return func.HttpResponse("event_id is required", status_code=400)
        try:
            event_id_int = int(event_id)
        except Exception:
            return func.HttpResponse("event_id must be integer", status_code=400)
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM EVENTS WHERE event_id = ?", event_id_int)
        row = cursor.fetchone()
        if not row:
            logging.warning(f"get_event: event_id {event_id_int} not found in DB")
            return func.HttpResponse("Not Found", status_code=404)
        # キーワード取得
        cursor.execute("SELECT keyword_id FROM EVENTS_KEYWORDS WHERE event_id = ?", event_id_int)
        keywords = [str(r.keyword_id) for r in cursor.fetchall()]
        def get_attr(obj, key):
            if isinstance(obj, dict):
                return obj.get(key)
            return getattr(obj, key, None)
        result = {
            "event_id": get_attr(row, "event_id"),
            "event_title": get_attr(row, "event_title"),
            "event_datetime": str(get_attr(row, "event_datetime")),
            "location": get_attr(row, "location"),
            "event_category": get_attr(row, "event_category"),
            "description": get_attr(row, "description"),
            "content": get_attr(row, "content"),
            "deadline": str(get_attr(row, "deadline")),
            "image": get_attr(row, "image"),
            "max_participants": get_attr(row, "max_participants"),
            "keywords": keywords
        }
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
@app.function_name(name="update_event")
@app.route(route="events/{event_id}", methods=["PUT"])
def update_event(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.route_params.get('event_id')
    try:
        # 作成者チェック
        content_type = req.headers.get("Content-Type", "")
        data = {}
        image_path = None
        if content_type.startswith("multipart/form-data"):
            body = req.get_body()
            multipart_data = decoder.MultipartDecoder(body, content_type)
            for part in multipart_data.parts:
                content_disposition = part.headers.get(b'Content-Disposition', b'').decode()
                if 'filename=' in content_disposition:
                    filename = content_disposition.split('filename="')[1].split('"')[0]
                    ext = os.path.splitext(filename)[1]
                    user_id = "edit"
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
                    name = content_disposition.split('name="')[1].split('"')[0]
                    value = part.text
                    if name == "keywords":
                        if "keywords" not in data:
                            data["keywords"] = []
                        data["keywords"].append(value)
                    else:
                        data[name] = value
            if "image" not in data:
                data["image"] = None
        else:
            data = req.get_json()
            image_path = data.get("image")

        # DBからイベント取得して作成者チェック
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT creator FROM EVENTS WHERE event_id=?", event_id)
        row = cursor.fetchone()
        if not row:
            return func.HttpResponse(json.dumps({"error": "イベントが存在しません"}), mimetype="application/json", status_code=404)
        event_creator = row.creator if hasattr(row, "creator") else row[0]
        request_creator = str(data.get("creator", ""))
        if not request_creator or request_creator != str(event_creator):
            return func.HttpResponse(json.dumps({"error": "イベント作成者のみ編集可能です"}), mimetype="application/json", status_code=403)
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

        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    '''
                    UPDATE EVENTS SET event_title=?, event_category=?, event_datetime=?, deadline=?, location=?, max_participants=?, description=?, content=?, image=? WHERE event_id=?
                    '''
                    ,
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
                # キーワード更新（全削除→再登録）
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
        return func.HttpResponse(json.dumps({"error": str(e), "trace": tb}), mimetype="application/json", status_code=500)
@app.function_name(name="delete_event")
@app.route(route="events/{event_id}", methods=["DELETE"])
def delete_event(req: func.HttpRequest) -> func.HttpResponse:
    event_id = req.route_params.get('event_id')
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # まず存在確認と作成者チェック
                cursor.execute("SELECT creator FROM EVENTS WHERE event_id=?", event_id)
                row = cursor.fetchone()
                if not row:
                    return func.HttpResponse(json.dumps({"error": "イベントが存在しません"}), mimetype="application/json", status_code=404)
                event_creator = row.creator if hasattr(row, "creator") else row[0]
                # creatorはリクエストbodyまたはクエリから取得（ここではbody優先）
                try:
                    data = req.get_json()
                except Exception:
                    data = {}
                request_creator = str(data.get("creator", ""))
                if not request_creator or request_creator != str(event_creator):
                    return func.HttpResponse(json.dumps({"error": "イベント作成者のみ削除可能です"}), mimetype="application/json", status_code=403)
                cursor.execute("DELETE FROM EVENTS_KEYWORDS WHERE event_id=?", event_id)
                cursor.execute("DELETE FROM EVENTS_PARTICIPANTS WHERE event_id=?", event_id)
                cursor.execute("DELETE FROM EVENTS WHERE event_id=?", event_id)
                conn.commit()
        return func.HttpResponse(json.dumps({"message": "イベント削除完了", "event_id": event_id}), mimetype="application/json", status_code=200)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logging.error(tb)
        return func.HttpResponse(json.dumps({"error": str(e), "trace": tb}), mimetype="application/json", status_code=500)

# ↓この重複定義・importを削除

def get_db_connection():
    # Azure環境では環境変数から取得、ローカルはlocal.settings.jsonから取得
    conn_str = os.environ.get('CONNECTION_STRING')
    if not conn_str:
        settings_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'local.settings.json'))
        with open(settings_path, encoding='utf-8') as f:
            settings = json.load(f)
        conn_str = settings.get('Values', {}).get('CONNECTION_STRING')
    if not conn_str:
        raise Exception("DB接続文字列が設定されていません")
    return pyodbc.connect(conn_str)

@app.function_name(name="get_categories_keywords")
@app.route(route="get_categories_keywords/{table}", methods=["GET"])
def get_categories_keywords(req: func.HttpRequest) -> func.HttpResponse:
    table = req.route_params.get('table')
    if table not in ('categories', 'keywords'):
        return func.HttpResponse("Not Found", status_code=404)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if table == 'categories':
            cursor.execute("SELECT category_id, category_name FROM CATEGORYS")
            rows = cursor.fetchall()
            result = [
                {"category_id": row.category_id, "category_name": row.category_name}
                for row in rows
            ]
        else:
            cursor.execute("SELECT keyword_id, keyword_name FROM KEYWORDS")
            rows = cursor.fetchall()
            result = [
                {"keyword_id": row.keyword_id, "keyword_name": row.keyword_name}
                for row in rows
            ]
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)

@app.function_name(name="create_event")
@app.route(route="events", methods=["POST"])
def create_event(req: func.HttpRequest) -> func.HttpResponse:
    if req.method != "POST":
        return func.HttpResponse("Method Not Allowed", status_code=405)
    try:
        content_type = req.headers.get("Content-Type", "")
        data = {}
        image_path = None
        if content_type.startswith("multipart/form-data"):
            body = req.get_body()
            multipart_data = decoder.MultipartDecoder(body, content_type)
            for part in multipart_data.parts:
                content_disposition = part.headers.get(b'Content-Disposition', b'').decode()
                if 'filename=' in content_disposition:
                    filename = content_disposition.split('filename="')[1].split('"')[0]
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
                    name = content_disposition.split('name="')[1].split('"')[0]
                    value = part.text
                    if name == "keywords":
                        if "keywords" not in data:
                            data["keywords"] = []
                        data["keywords"].append(value)
                    else:
                        data[name] = value
            if "image" not in data:
                data["image"] = None
        else:
            data = req.get_json()
            image_path = data.get("image")

        if not data.get("category"):
            data["category"] = None
        if not data.get("max_participants"):
            data["max_participants"] = None

        is_draft = int(data.get("is_draft", 1))
        data["is_draft"] = is_draft
        required_fields = ["title", "date", "location", "category", "keywords", "summary", "detail", "deadline"]
        if is_draft:
            if not data.get("title"):
                data["title"] = "（未入力）"
            if not data.get("creator"):
                data["creator"] = "0738"
            if "is_draft" not in data:
                data["is_draft"] = 1
        else:
            for f in required_fields:
                if not data.get(f):
                    return func.HttpResponse(json.dumps({"error": f"{f}は必須です"}), mimetype="application/json", status_code=400)

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
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
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
                if event_id is not None:
                    event_id = int(event_id)
                else:
                    raise Exception("イベントIDの取得に失敗しました")
                if data.get("keywords"):
                    for kw in data["keywords"]:
                        if kw:  # 空文字除外
                            cursor.execute(
                                "INSERT INTO EVENTS_KEYWORDS (event_id, keyword_id) VALUES (?, ?)",
                                event_id, int(kw)
                            )
                conn.commit()
        return func.HttpResponse(json.dumps({"message": "イベント登録完了", "event_id": event_id}), mimetype="application/json", status_code=200)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logging.error(tb)
        return func.HttpResponse(json.dumps({"error": str(e), "trace": tb}), mimetype="application/json", status_code=500)

