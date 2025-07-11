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
app = func.FunctionApp()

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
