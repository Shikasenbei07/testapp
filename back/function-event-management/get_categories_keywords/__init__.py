import logging
import azure.functions as func
import pyodbc
import os
import json

def get_db_connection():
    conn_str = os.environ.get("CONNECTION_STRING")
    if not conn_str:
        raise Exception("DB接続文字列が設定されていません")
    return pyodbc.connect(conn_str)

def main(req: func.HttpRequest) -> func.HttpResponse:
    table = req.route_params.get('table')
    if table not in ('categories', 'keywords'):
        return func.HttpResponse("Not Found", status_code=404)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        if table == 'categories':
            cursor.execute("SELECT category_id, category_name FROM CATEGORYS")
            rows = cursor.fetchall()
            result = [
                {"category_id": row.category_id, "category_name": row.category_name}
                for row in rows
            ]
        else:
            cursor.execute("SELECT keyword_id, keyword_name FROM KEYWORDS")
            rows = cursor.fetchall()
            result = [
                {"keyword_id": row.keyword_id, "keyword_name": row.keyword_name}
                for row in rows
            ]
        return func.HttpResponse(json.dumps(result), mimetype="application/json")
    except Exception as e:
        logging.error(str(e))
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
