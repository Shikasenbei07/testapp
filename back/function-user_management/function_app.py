import azure.functions as func
import os
import pyodbc
import os.path

from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta

from utils import get_connection_string, get_azure_storage_connection_string, error_response, success_response

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

CONNECTION_STRING = get_connection_string()
AZURE_STORAGE_CONNECTION_STRING = get_azure_storage_connection_string()
CONTAINER_NAME = "profile-images"


def upload_blob(file, user_id):
    try:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)

        ext = os.path.splitext(file.filename)[1]
        blob_name = f"{user_id}{ext}"

        try:
            container_client.upload_blob(name=blob_name, data=file.stream, overwrite=True)
        except Exception as e:
            raise Exception(f"BLOBアップロードに失敗しました: {str(e)}")

        try:
            with pyodbc.connect(CONNECTION_STRING) as conn:
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
        raise e


def delete_blob(blob_name):
    try:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        blob_client = container_client.get_blob_client(blob_name)

        blob_client.delete_blob()
        return True
    except Exception as e:
        return False


def get_blob_sas_url(blob_name):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)

    # アカウントキーの取得
    credential = blob_service_client.credential
    if hasattr(credential, 'account_key'):
        account_key = credential.account_key
    elif isinstance(credential, str):
        account_key = credential
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
        if not CONNECTION_STRING:
            return error_response("接続文字列が設定されていません", 500)

        with pyodbc.connect(CONNECTION_STRING) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT email, second_email, tel, password, l_name, f_name, l_name_furi, f_name_furi, birthday, profile_img FROM users WHERE id = ?",
                (user_id,)
            )
            columns = [desc[0] for desc in cursor.description]
            row = cursor.fetchone()
            if row:
                result = dict(zip(columns, row))

                resp_data = {
                    "id": user_id,
                    "email": result["email"],
                    "second_email": result["second_email"] if result["second_email"] else None,
                    "tel": result["tel"],
                    "password": result["password"],
                    "l_name": result["l_name"],
                    "f_name": result["f_name"],
                    "l_name_furi": result["l_name_furi"],
                    "f_name_furi": result["f_name_furi"],
                    "birthday": result["birthday"].isoformat() if result["birthday"] else None,
                    "img_url": get_blob_sas_url(result["profile_img"]) if result["profile_img"] else None
                }
                return success_response(resp_data)
            else:
                return error_response("ユーザーが見つかりません", 404)

    except Exception as e:
        return error_response(f"取得失敗: {str(e)}", 500)


@app.route(route="update_user", methods=["PATCH"])
def update_user(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        user_id = data.get("id")
        second_email = data.get("second_email")
        tel = data.get("tel")
        l_name = data.get("l_name")
        f_name = data.get("f_name")
        l_name_furi = data.get("l_name_furi")
        f_name_furi = data.get("f_name_furi")
        birthday = data.get("birthday")
        profile_img = req.files.get("profile_img")

        if not user_id:
            return error_response("idがありません")
        if not CONNECTION_STRING:
            return error_response("DB接続情報がありません", 500)

        update_fields = []
        update_values = []

        if second_email is not None:
            update_fields.append("second_email=?")
            update_values.append(second_email)
        if tel is not None:
            update_fields.append("tel=?")
            update_values.append(tel)
        if l_name is not None:
            update_fields.append("l_name=?")
            update_values.append(l_name)
        if f_name is not None:
            update_fields.append("f_name=?")
            update_values.append(f_name)
        if l_name_furi is not None:
            update_fields.append("l_name_furi=?")
            update_values.append(l_name_furi)
        if f_name_furi is not None:
            update_fields.append("f_name_furi=?")
            update_values.append(f_name_furi)
        if birthday is not None:
            update_fields.append("birthday=?")
            update_values.append(birthday)
        if profile_img is not None:
            blob_name = upload_blob(profile_img, user_id)
            update_fields.append("profile_img=?")
            update_values.append(blob_name)

        update_values.append(user_id)

        with pyodbc.connect(CONNECTION_STRING) as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"UPDATE users SET {', '.join(update_fields)} WHERE id=?",
                update_values
            )
            conn.commit()
            if cursor.rowcount == 0:
                return error_response("ユーザーが見つかりません", 404)

        return success_response(message="更新しました")
    except Exception as e:
        return error_response(f"更新失敗: {str(e)}", 500)