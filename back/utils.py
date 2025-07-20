import azure.functions as func
import json

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
        body=json.dumps(body, ensure_ascii=False),
        status_code=status,
        mimetype="application/json"
    )