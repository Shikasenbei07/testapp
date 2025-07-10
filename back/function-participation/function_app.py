import azure.functions as func
import json
import pyodbc
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="participation")
def participation(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # URLクエリからidを取得
        user_id = req.params.get("id")
        if not user_id:
            try:
                req_body = req.get_json()
            except ValueError:
                req_body = None
            if req_body:
                user_id = req_body.get("id")

        conn_str = os.environ.get("CONNECTION_STRING")
        if not conn_str:
            return func.HttpResponse(
                json.dumps({"error": "DB接続情報が設定されていません"}),
                status_code=500,
                mimetype="application/json"
            )

        if not user_id:
            return func.HttpResponse(
                json.dumps({"error": "idが指定されていません"}),
                status_code=400,
                mimetype="application/json"
            )

        try:
            with pyodbc.connect(conn_str) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT l_name FROM users WHERE id=?",
                    (user_id,)
                )
                result = cursor.fetchone()
                if result:
                    return func.HttpResponse(
                        json.dumps({"l_name": result[0]}),
                        status_code=200,
                        mimetype="application/json"
                    )
                else:
                    return func.HttpResponse(
                        json.dumps({"error": "該当するユーザーが見つかりません"}),
                        status_code=404,
                        mimetype="application/json"
                    )
        except Exception as e:
            return func.HttpResponse(
                json.dumps({"error": str(e)}),
                status_code=400,
                mimetype="application/json"
            )
    except Exception as e:
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=400,
            mimetype="application/json"
        )