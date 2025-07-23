import azure.functions as func
import json
import pyodbc
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

CONNECTION_STRING = None
if os.environ.get("IS_MAIN_PRODUCT") == "true":
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_PRODUCT")
else:
    CONNECTION_STRING = os.environ.get("CONNECTION_STRING_TEST")
# CONNECTION_STRING = "Driver={ODBC Driver 18 for SQL Server};Server=tcp:team1-productserver.database.windows.net,1433;Database=team1-productdb;Uid=team1-0x0-admin;Pwd={jm&V8P&ZEMRv};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"

@app.route(route="login", methods=["POST"])
def login(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        id = data.get("id")
        password = data.get("password")
        print("IS_MAIN_PRODUCT:", os.environ.get("IS_MAIN_PRODUCT"))
        print("CONNECTION_STRING:", CONNECTION_STRING)
        print("CONNECTION_STRING_PRODUCT:", os.environ.get("CONNECTION_STRING_PRODUCT"))

        # 必須フィールドチェック
        if not id or not password:
            return func.HttpResponse(
                json.dumps({"error": "Missing id or password"}, ensure_ascii=False),
                status_code=400,
                mimetype="application/json"
            )

        # local.settings.json の Values から接続文字列を取得
        if not CONNECTION_STRING:
            return func.HttpResponse(
                json.dumps({"error": "DB接続情報が設定されていません"}, ensure_ascii=False),
                status_code=500,
                mimetype="application/json"
            )

        try:
            with pyodbc.connect(CONNECTION_STRING) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT COUNT(*) FROM users WHERE id=? AND password=?",
                    (id, password)
                )
                result = cursor.fetchone()
                if result and result[0] == 1:
                    return func.HttpResponse(
                        json.dumps({"result": "ok", "id": id}),
                        status_code=200,
                        mimetype="application/json"
                    )
                else:
                    return func.HttpResponse(
                        json.dumps({"error": "Invalid credentials"}),
                        status_code=401,
                        mimetype="application/json"
                    )
        except pyodbc.Error as db_err:
            import traceback
            return func.HttpResponse(
                json.dumps({
                    "error": "Database error",
                    "details": str(db_err),
                    "trace": traceback.format_exc()
                }, ensure_ascii=False),
                status_code=500,
                mimetype="application/json"
            )
    except ValueError:
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON"}, ensure_ascii=False),
            status_code=400,
            mimetype="application/json"
        )
    except Exception as e:
        import traceback
        return func.HttpResponse(
            json.dumps({
                "error": str(e),
                "trace": traceback.format_exc()
            }, ensure_ascii=False),
            status_code=400,
            mimetype="application/json"
        )
