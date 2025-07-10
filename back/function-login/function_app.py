import logging
import azure.functions as func
import pyodbc
import os
import json


app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)


# ログイン機能を持つHTTPトリガーFunction
@app.route(route="login", methods=["POST", "GET"]) # 後でGET消す
def login(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Login function triggered.')

    # GETリクエストの場合は405を返す
    if req.method == "GET":
        return func.HttpResponse(
            json.dumps({"error": "GETメソッドは許可されていません"}),
            mimetype="application/json",
            status_code=405,
            headers={
                "Access-Control-Allow-Origin": "https://0x0-eventapp-hthba0e7hshdg3g2.japaneast-01.azurewebsites.net"
            }
        )

    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            json.dumps({"error": "リクエストボディが不正です"}),
            mimetype="application/json",
            status_code=400
        )

    username = req_body.get("username")
    password = req_body.get("password")

    if not username or not password:
        return func.HttpResponse(
            json.dumps({"error": "usernameとpasswordは必須です"}),
            mimetype="application/json",
            status_code=400
        )

    try:
        with pyodbc.connect(os.environ['CONNECTION_STRING']) as connection:
            with connection.cursor() as cursor:
                # パラメータ化クエリでSQLインジェクション防止
                cursor.execute('SELECT COUNT(*) FROM users WHERE id = ? AND password = ?', (username, password))
                row = cursor.fetchone()
                if row and row[0] == 1:
                    # ログイン成功時はJSONで成功を返す
                    return func.HttpResponse(
                        json.dumps({"result": "ログイン成功"}),
                        mimetype="application/json",
                        status_code=200,
                        headers={
                            "Access-Control-Allow-Origin": "https://0x0-eventapp-hthba0e7hshdg3g2.japaneast-01.azurewebsites.net"
                        }
                    )
                else:
                    return func.HttpResponse(
                        json.dumps({"error": "ユーザー名またはパスワードが間違っています"}),
                        mimetype="application/json",
                        status_code=401,
                        headers={
                            "Access-Control-Allow-Origin": "https://0x0-eventapp-hthba0e7hshdg3g2.japaneast-01.azurewebsites.net"
                        }
                    )
    except pyodbc.Error as e:
        logging.error(f"Database error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "データベースエラーが発生しました"}),
            mimetype="application/json",
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": "https://0x0-eventapp-hthba0e7hshdg3g2.japaneast-01.azurewebsites.net"
            }
        )
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "予期せぬエラーが発生しました"}),
            mimetype="application/json",
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": "https://0x0-eventapp-hthba0e7hshdg3g2.japaneast-01.azurewebsites.net"
            }
        )