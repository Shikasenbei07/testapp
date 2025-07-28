import azure.functions as func
import os
import pyodbc
import os.path
import logging
import cgi
import io

from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta

from utils import get_db_connection, get_azure_storage_connection_string, error_response, success_response

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

AZURE_STORAGE_CONNECTION_STRING = get_azure_storage_connection_string()
CONTAINER_NAME = "profile-images"

# 許可する更新フィールド
ALLOWED_UPDATE_FIELDS = {
    "second_email", "tel", "l_name", "f_name", "l_name_furi", "f_name_furi", "birthday", "profile_img", "handle_name"
}


def sanitize_filename(filename):
    # ファイル名から拡張子のみ取得し、ユーザーID+拡張子に限定
    ext = os.path.splitext(filename)[1]
    # 禁止文字が拡張子に含まれていないかチェック
    if (
        not ext
        or len(ext) > 10
        or any(c in ext for c in ['/', '\\', ':', '*', '?', '"', '<', '>', '|'])
        or any(c in os.path.splitext(filename)[0] for c in ['/', '\\', ':', '*', '?', '"', '<', '>', '|'])
    ):
        raise Exception("不正なファイル拡張子です")
    return ext


def upload_blob(file_bytes, filename, user_id):
    try:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)

        ext = sanitize_filename(filename)
        blob_name = f"{user_id}{ext}"

        try:
            container_client.upload_blob(name=blob_name, data=file_bytes, overwrite=True)
        except Exception as e:
            raise Exception(f"BLOBアップロードに失敗しました: {str(e)}")

        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "UPDATE users SET profile_img = ? WHERE id = ?",
                    (blob_name, user_id)
                )
                conn.commit()
        except Exception as e:
            raise Exception(f"DB更新に失敗しました: {str(e)}")

        return blob_name

    except Exception as e:
        logging.error(str(e))
        raise


def delete_blob(blob_name):
    try:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        blob_client = container_client.get_blob_client(blob_name)

        blob_client.delete_blob()
        return True
    except Exception as e:
        logging.warning(f"Blob削除失敗: {str(e)}")
        return False


def get_blob_sas_url(blob_name):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)

    # アカウントキーの取得
    credential = getattr(blob_service_client, "credential", None)
    if hasattr(credential, 'account_key'):
        account_key = credential.account_key
    elif isinstance(credential, str):
        account_key = credential
    elif hasattr(blob_service_client, "account_key"):
        account_key = blob_service_client.account_key
    else:
        raise Exception("アカウントキー取得失敗")

    # SASトークン生成
    sas_token = generate_blob_sas(
        account_name=blob_service_client.account_name,
        container_name=CONTAINER_NAME,
        blob_name=blob_name,
        account_key=account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=1)
    )

    return f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}?{sas_token}"


@app.route(route="get_user", methods=["POST"])
def get_user(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        user_id = data.get("id")
        if not user_id:
            return error_response("idがありません")

        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                '''
                SELECT email, second_email, tel, l_name, f_name, l_name_furi, f_name_furi, birthday, profile_img, handle_name
                FROM users
                WHERE id = ?
                ''',
                (user_id,)
            )
            row = cursor.fetchone()
            if row is None:
                return func.HttpResponse("ユーザーが見つかりません", status_code=404)
            columns = [desc[0] for desc in cursor.description]
            if len(columns) != len(row):
                logging.error(f"get_user error: columns/row length mismatch: {columns} / {row}")
                return func.HttpResponse("データ不整合", status_code=500)
            result = dict(zip(columns, row))

            resp_data = {
                "id": user_id,
                "email": result["email"],
                "second_email": result["second_email"] if result["second_email"] else None,
                "tel": result["tel"],
                "l_name": result["l_name"],
                "f_name": result["f_name"],
                "l_name_furi": result["l_name_furi"],
                "f_name_furi": result["f_name_furi"],
                "birthday": result["birthday"].isoformat() if result["birthday"] else None,
                # 修正: profile_imgの値を直接返す（img_urlではなくprofile_imgキーで返す）
                "profile_img": get_blob_sas_url(result["profile_img"]) if result["profile_img"] else None,
                "handle_name": result["handle_name"] if result["handle_name"] else None
            }
            return success_response(resp_data)
    except Exception as e:
        logging.error(f"get_user error: {e}")
        return func.HttpResponse(str(e), status_code=500)


def parse_multipart_form(req: func.HttpRequest):
    """
    Content-Typeに応じてmultipart/form-dataまたはapplication/jsonをパースする。
    multipartの場合はファイル名・バイナリも返す。
    """
    content_type = req.headers.get("Content-Type", "")
    if content_type.startswith("multipart/form-data"):
        # cgi.FieldStorageを使ってmultipartをパース
        environ = {
            "REQUEST_METHOD": "POST",
            "CONTENT_TYPE": content_type,
        }
        fp = io.BytesIO(req.get_body())
        form = cgi.FieldStorage(fp=fp, environ=environ, keep_blank_values=True)
        data = {}
        file_bytes = None
        filename = None

        for key in form.keys():
            field_item = form[key]
            if field_item.filename:
                # ファイルの場合
                filename = field_item.filename
                file_bytes = field_item.file.read()
            else:
                data[key] = field_item.value

        return data, file_bytes, filename

    try:
        # application/json
        return req.get_json(), None, None
    except Exception:
        return {}, None, None


@app.route(route="update_user", methods=["PATCH"])
def update_user(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # multipart/form-dataとapplication/jsonの両方に対応
        content_type = req.headers.get("Content-Type", "")
        if content_type.startswith("multipart/form-data"):
            # multipartの場合はファイルアップロード対応
            data, file_bytes, filename = parse_multipart_form(req)
        else:
            # JSONの場合
            data, file_bytes, filename = req.get_json(), None, None

        user_id = data.get("id")
        if not user_id:
            return error_response("idがありません")

        update_fields = []
        update_values = []

        for field in ALLOWED_UPDATE_FIELDS:
            if field == "profile_img":
                # ファイルアップロードがある場合のみ
                if file_bytes and filename:
                    blob_name = upload_blob(file_bytes, filename, user_id)
                    update_fields.append("profile_img=?")
                    update_values.append(blob_name)
            else:
                value = data.get(field)
                if value is not None:
                    update_fields.append(f"{field}=?")
                    update_values.append(value)

        if not update_fields:
            return error_response("更新項目がありません", 400)

        update_values.append(user_id)

        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = f"UPDATE users SET {', '.join(update_fields)} WHERE id=?"
            params = update_values
            cursor.execute(sql, params)
            if cursor.rowcount == 0:
                return error_response("ユーザーが見つかりません", 404)

        return success_response(message="更新しました")
    except Exception as e:
        logging.error(f"update_user error: {e}")
        return error_response(str(e), 500)