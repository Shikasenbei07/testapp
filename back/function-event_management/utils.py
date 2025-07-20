import os
import azure.functions as func
import json
import pyodbc
import logging
from datetime import date, datetime

def get_connection_string():
    if os.environ.get("IS_MAIN_PRODUCT") == "true":
        return os.environ.get("CONNECTION_STRING_PRODUCT")
    else:
        return os.environ.get("CONNECTION_STRING_TEST")
    
def get_db_connection():
    CONNECTION_STRING = get_connection_string()
    if not CONNECTION_STRING:
        raise ValueError("DB接続情報が設定されていません")
    try:
        return pyodbc.connect(CONNECTION_STRING, autocommit=True)
    except pyodbc.InterfaceError as e:
        logging.error("DB接続失敗 (InterfaceError): %s", str(e))
        raise ConnectionError("データベースへの接続に失敗しました。")
    except pyodbc.Error as e:
        logging.error("DB接続失敗 (pyodbc.Error): %s", str(e))
        raise ConnectionError("データベース接続中にエラーが発生しました。")
    
def get_azure_storage_connection_string():
    if os.environ.get("IS_MAIN_PRODUCT") == "true":
        return os.environ.get("AZURE_STORAGE_CONNECTION_STRING_PRODUCT")
    else:
        return os.environ.get("AZURE_STORAGE_CONNECTION_STRING_TEST")

def error_response(message, status=400):
    return func.HttpResponse(
        body=json.dumps({"error": message}, ensure_ascii=False),
        status_code=status,
        mimetype="application/json"
    )

def success_response(data=None, message=None, status=200):
    body = data if data is not None else {}
    if message:
        body["message"] = message
    return func.HttpResponse(
        body=json.dumps(body, ensure_ascii=False, default=json_serial),
        status_code=status,
        mimetype="application/json"
    )

def json_serial(obj):
    # 日付型の場合には、文字列に変換します
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    # 上記以外はサポート対象外.
    raise TypeError ("Type %s not serializable" % type(obj))