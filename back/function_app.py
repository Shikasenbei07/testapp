import logging
import azure.functions as func
import pyodbc
import os
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="login_trigger", methods=["GET", "POST", "OPTIONS"])
def login_trigger(req: func.HttpRequest) -> func.HttpResponse:
    if req.method == "OPTIONS":
        return func.HttpResponse(
            "",
            status_code=204,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        )

    logging.info('Python HTTP trigger function processed a request.')

    # リクエストボディから 'username' と 'password' を取得
    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            json.dumps({"error": "リクエストボディが不正です"}, ensure_ascii=False),
            mimetype="application/json",
            status_code=400,
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        )

    username = req_body.get('username')
    password = req_body.get('password')

    # パラメータチェック
    if not username or not password:
        return func.HttpResponse(
            json.dumps({"error": "パラメータ 'username' と 'password' が必要です"}, ensure_ascii=False),
            mimetype="application/json",
            status_code=400,
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        )

    try:
        # 環境変数から接続文字列を取得
        with pyodbc.connect(os.environ['CONNECTION_STRING']) as connection:
            with connection.cursor() as cursor:
                # パスワードはハッシュ化されている前提（平文の場合は適宜修正）
                cursor.execute(
                    'SELECT l_name FROM users WHERE id = ? AND password = ?',
                    (username, password)
                )
                row = cursor.fetchone()

                if not row:
                    return func.HttpResponse(
                        json.dumps({"error": "ユーザー名またはパスワードが正しくありません"}, ensure_ascii=False),
                        mimetype="application/json",
                        status_code=401
                    )

                # 認証成功
                response = func.HttpResponse(
                    json.dumps({"message": f"ようこそ{row[0]}さん"}, ensure_ascii=False),
                    mimetype="application/json",
                    status_code=200,
                    headers={
                        "Access-Control-Allow-Origin": "http://localhost:3000"
                    }
                )
                return response

    except pyodbc.Error as e:
        logging.error(f"Database error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"データベースエラー: {str(e)}"}, ensure_ascii=False),
            mimetype="application/json",
            status_code=500,
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        )
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"予期せぬエラーが発生しました: {str(e)}"}, ensure_ascii=False),
            mimetype="application/json",
            status_code=500,
            headers={"Access-Control-Allow-Origin": "http://localhost:3000"}
        )

def main(req: func.HttpRequest) -> func.HttpResponse:
    return login_trigger(req)