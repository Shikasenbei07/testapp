import azure.functions as func
import logging
import os
import pyodbc
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

AZURE_STORAGE_CONNECTION_STRING = os.environ["AZURE_STORAGE_CONNECTION_STRING"]
CONTAINER_NAME = "profile-images"

def upload_to_blob_storage(file, user_id):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(CONTAINER_NAME)
    ext = os.path.splitext(file.filename)[1]
    blob_name = f"{user_id}{ext}"
    # ファイルをアップロード
    container_client.upload_blob(name=blob_name, data=file.stream, overwrite=True)
    # 公開URLを生成
    url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}"
    return url

def get_blob_sas_url(user_id, ext):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    blob_name = f"{user_id}{ext}"
    sas_token = generate_blob_sas(
        account_name=blob_service_client.account_name,
        container_name=CONTAINER_NAME,
        blob_name=blob_name,
        account_key=blob_service_client.credential.account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=1)
    )
    url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}?{sas_token}"
    return url

@app.route(route="upload_profile_img", methods=["POST"])
def upload_profile_img(req: func.HttpRequest) -> func.HttpResponse:
    try:
        user_id = req.form.get("id")
        file = req.files.get("profile_img")
        if not user_id or not file:
            return func.HttpResponse("idまたは画像ファイルがありません", status_code=400)
        url = upload_to_blob_storage(file, user_id)

        return func.HttpResponse(
            body=f'{{"url": "{url}"}}',
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(f"アップロード失敗: {str(e)}", status_code=500)

def get_profile_img_path(user_id):
    conn_str = os.environ.get("CONNECTION_STRING")
    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT profile_img FROM users WHERE id=?", (user_id,))
        result = cursor.fetchone()
        if result:
            return result[0]  # 画像パスやURL
        else:
            return None

@app.route(route="update_user", methods=["POST"])
def update_user(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        user_id = data.get("id")
        l_name = data.get("l_name")
        profile_img = data.get("profile_img")

        if not user_id:
            return func.HttpResponse(
                body='{"error": "idがありません"}',
                status_code=400,
                mimetype="application/json"
            )
        if not l_name:
            return func.HttpResponse(
                body='{"error": "l_nameがありません"}',
                status_code=400,
                mimetype="application/json"
            )

        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            return func.HttpResponse(
                body='{"error": "DB接続情報がありません"}',
                status_code=500,
                mimetype="application/json"
            )

        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET l_name=?, profile_img=? WHERE id=?",
                (l_name, profile_img, user_id)
            )
            conn.commit()
            if cursor.rowcount == 0:
                return func.HttpResponse(
                    body='{"error": "ユーザーが見つかりません"}',
                    status_code=404,
                    mimetype="application/json"
                )
        return func.HttpResponse(
            body='{"message": "更新しました"}',
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            body=f'{{"error": "更新失敗: {str(e)}"}}',
            status_code=500,
            mimetype="application/json"
        )

@app.route(route="mypage", methods=["POST"])
def mypage(req: func.HttpRequest) -> func.HttpResponse:
    import json
    try:
        data = req.get_json()
        user_id = data.get("id")
        if not user_id:
            return func.HttpResponse(
                body=json.dumps({"error": "idがありません"}),
                status_code=400,
                mimetype="application/json"
            )
        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            return func.HttpResponse(
                body=json.dumps({"error": "DB接続情報がありません"}),
                status_code=500,
                mimetype="application/json"
            )
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT l_name, profile_img FROM users WHERE id=?",
                (user_id,)
            )
            result = cursor.fetchone()
            if result:
                l_name, profile_img = result
                # profile_imgがファイル名や拡張子の場合
                if profile_img:
                    ext = os.path.splitext(profile_img)[1]
                    img_url = get_blob_sas_url(user_id, ext)
                else:
                    img_url = None
                return func.HttpResponse(
                    body=json.dumps({"l_name": l_name, "profile_img": img_url}),
                    status_code=200,
                    mimetype="application/json"
                )
            else:
                return func.HttpResponse(
                    body=json.dumps({"error": "ユーザーが見つかりません"}),
                    status_code=404,
                    mimetype="application/json"
                )
    except Exception as e:
        return func.HttpResponse(
            body=json.dumps({"error": f"取得失敗: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )