import azure.functions as func
import os
import pyodbc
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta
import json
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.responses import JSONResponse

# Azure Functions 用
app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)
# FastAPI 用 (テストやローカル実行)
app_fastapi = FastAPI()

AZURE_STORAGE_CONNECTION_STRING = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER_NAME = "profile-images"

def upload_to_blob_storage(file, user_id):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(CONTAINER_NAME)
    ext = os.path.splitext(file.filename)[1]
    blob_name = f"{user_id}{ext}"
    container_client.upload_blob(name=blob_name, data=file.stream, overwrite=True)
    url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}"
    return url

def get_blob_sas_url(user_id, ext):
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    blob_name = f"{user_id}{ext}"
    # credentialがAccountKey型でない場合のバグ修正
    account_key = None
    if hasattr(blob_service_client.credential, 'account_key'):
        account_key = blob_service_client.credential.account_key
    elif isinstance(blob_service_client.credential, str):
        account_key = blob_service_client.credential
    else:
        raise Exception("Blob Storageのアカウントキーが取得できません")
    sas_token = generate_blob_sas(
        account_name=blob_service_client.account_name,
        container_name=CONTAINER_NAME,
        blob_name=blob_name,
        account_key=account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=1)
    )
    url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}?{sas_token}"
    return url

def get_conn():
    conn_str = os.environ.get("CONNECTION_STRING")
    if not conn_str:
        raise Exception("DB接続情報がありません")
    return pyodbc.connect(conn_str)

# FastAPIエンドポイント（テスト用）
@app_fastapi.get("/")
def root():
    return {"message": "ok"}

@app_fastapi.get("/user/profile")
def get_user_profile(user_id: int = Query(...)):
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email FROM users WHERE id=?", (user_id,))
            row = cursor.fetchone()
            if row:
                return {"user_id": row[0], "name": row[1], "email": row[2]}
            else:
                raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app_fastapi.put("/user/profile")
def update_user_profile(
    data: dict = Body(...)
):
    user_id = data.get("user_id")
    name = data.get("name")
    email = data.get("email")
    if not user_id or not name or not email:
        raise HTTPException(status_code=422, detail="Missing fields")
    if "@" not in email:
        raise HTTPException(status_code=422, detail="Invalid email")
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET name=?, email=? WHERE id=?",
                (name, email, user_id)
            )
            conn.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="User not found")
        return {"user_id": user_id, "name": name, "email": email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Azure Functionsエンドポイント
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