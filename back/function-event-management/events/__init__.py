import logging
import azure.functions as func
import pyodbc
import os
import json
import io
from multipart import MultipartParser

def get_db_connection():
    import json
    settings_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'local.settings.json'))
    with open(settings_path, encoding='utf-8') as f:
        settings = json.load(f)
    conn_str = settings.get('Values', {}).get('CONNECTION_STRING')
    if not conn_str:
        raise Exception("DB接続文字列が設定されていません")
    return pyodbc.connect(conn_str)

def main(req: func.HttpRequest) -> func.HttpResponse:
    # ここは削除（data未定義エラー防止）
    if req.method != "POST":
        return func.HttpResponse("Method Not Allowed", status_code=405)
    try:
        content_type = req.headers.get("Content-Type", "")
        if content_type.startswith("multipart/form-data"):
            from requests_toolbelt.multipart import decoder
            body = req.get_body()
            multipart_data = decoder.MultipartDecoder(body, content_type)
            data = {}
            image_path = None
            for part in multipart_data.parts:
                content_disposition = part.headers.get(b'Content-Disposition', b'').decode()
                if 'filename=' in content_disposition:
                    # ファイルパート
                    filename = content_disposition.split('filename="')[1].split('"')[0]
                    from datetime import datetime
                    import uuid
                    ext = os.path.splitext(filename)[1]
                    # ユーザーIDを取得（なければ"unknown"）
                    user_id = str(data.get("creator", "unknown"))
                    unique_id = uuid.uuid4().hex[:8]
                    save_name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{user_id}_{unique_id}{ext}"
                    save_dir = os.path.join(os.path.dirname(__file__), "images")
                    os.makedirs(save_dir, exist_ok=True)
                    save_path = os.path.join(save_dir, save_name)
                    with open(save_path, "wb") as f:
                        f.write(part.content)
                    image_path = f"images/{save_name}"
                    data["image"] = image_path
                else:
                    # 通常のフォームデータ
                    name = content_disposition.split('name="')[1].split('"')[0]
                    value = part.text
                    # keywordsは複数値対応
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

        # 空文字や未入力の数値・外部キーはNoneに変換
        if not data.get("category"):
            data["category"] = None
        if not data.get("max_participants"):
            data["max_participants"] = None

        # 必須項目チェック（下書き保存は緩め）
        is_draft = int(data.get("is_draft", 1))
        data["is_draft"] = is_draft  # 型を保証
        required_fields = ["title", "date", "location", "category", "keywords", "summary", "detail", "deadline"]
        # 下書き保存時はNOT NULLカラムだけダミー値を補完
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

        # --- ここから下は既存のDB処理 ---
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # EVENTSテーブルにINSERT
                def to_db_date(val):
                    # 空文字やNone、長さ0はNone（NULL）として返す
                    if not val or (isinstance(val, str) and val.strip() == ""):
                        return None
                    # 文字列でT区切りならSQL Server用に変換
                    if isinstance(val, str) and 'T' in val:
                        try:
                            date_part, time_part = val.split('T')
                            # 秒がなければ00を補う
                            if len(time_part) == 5:
                                time_part += ':00'
                            return f"{date_part} {time_part}"
                        except Exception:
                            return val
                    return val
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
                    str(data.get("creator", "0738")),  # usersテーブルに存在するVARCHAR(4)型IDをセット
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
                # キーワード連携
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
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # EVENTSテーブルにINSERT
                def to_db_date(val):
                    # 空文字やNone、長さ0はNone（NULL）として返す
                    if not val or (isinstance(val, str) and val.strip() == ""):
                        return None
                    # 文字列でT区切りならSQL Server用に変換
                    if isinstance(val, str) and 'T' in val:
                        try:
                            date_part, time_part = val.split('T')
                            # 秒がなければ00を補う
                            if len(time_part) == 5:
                                time_part += ':00'
                            return f"{date_part} {time_part}"
                        except Exception:
                            return val
                    return val
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
                    str(data.get("creator", "0738")),  # usersテーブルに存在するVARCHAR(4)型IDをセット
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
                # キーワード連携
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
