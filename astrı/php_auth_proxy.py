import os
import requests
from flask import Blueprint, request, Response, jsonify

auth_blueprint = Blueprint("auth_proxy", __name__)

PHP_AUTH_URL = os.environ.get("PHP_AUTH_URL", "http://localhost/php_auth")

def proxy_request(path):
    try:
        method = request.method
        url = f"{PHP_AUTH_URL}/{path}"
        headers = {key: value for key, value in request.headers if key.lower() != "host"}
        data = request.get_data()
        cookies = request.cookies

        resp = requests.request(
            method,
            url,
            headers=headers,
            data=data,
            cookies=cookies,
            allow_redirects=False,
            timeout=5,
        )

        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(name, value) for (name, value) in resp.raw.headers.items() if name.lower() not in excluded_headers]

        response = Response(resp.content, resp.status_code, headers)
        return response
    except requests.RequestException as e:
        return jsonify({"error": "Failed to connect to PHP auth backend", "details": str(e)}), 502

@auth_blueprint.route("/login", methods=["POST"])
def login():
    return proxy_request("login.php")

@auth_blueprint.route("/register", methods=["POST"])
def register():
    return proxy_request("register.php")

@auth_blueprint.route("/logout", methods=["POST"])
def logout():
    return proxy_request("logout.php")

@auth_blueprint.route("/status", methods=["GET"])
def status():
    return proxy_request("session.php")
