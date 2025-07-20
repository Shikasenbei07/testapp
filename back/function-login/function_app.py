import azure.functions as func
import pyodbc

from utils import get_connection_string, error_response, success_response

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

CONNECTION_STRING = get_connection_string()

@app.route(route="login", methods=["POST"])
def login(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        id = data.get("id")
        password = data.get("password")
        if not id or not password:
            return error_response("IDとパスワードの両方を入力してください", status=400)
        if not CONNECTION_STRING:
            return error_response("接続文字列が設定されていません", status=500)
        try:
            with pyodbc.connect(CONNECTION_STRING) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT COUNT(*) FROM users WHERE id=? AND password=?",
                    (id, password)
                )
                result = cursor.fetchone()
                if result and result[0] == 1:
                    resp_data = {"id": id}
                    return success_response(data=resp_data, message="Login successful")
                else:
                    return error_response("IDまたはパスワードが異なります", status=401)
        except pyodbc.Error as db_err:
            return error_response("Database error: " + str(db_err), status=500)
    except ValueError:
        return error_response("Invalid JSON format", status=400)
    except Exception as e:
        return error_response("An unexpected error occurred: " + str(e), status=400)
