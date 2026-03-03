"""
VULN-23: Blind SSRF via webhook
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required
import requests


def register_webhook_routes(bp):
    @bp.route("/settings/webhook", methods=["PUT"])
    @jwt_required()
    def set_webhook():
        """VULN-23: Aceita URL sem validar - gopher://, etc. POST assíncrono"""
        data = request.get_json() or {}
        url = data.get("url")
        if not url:
            return jsonify({"error": "url obrigatório"}), 400
        # Em produção seria Celery - aqui síncrono para teste
        try:
            requests.post(url, json={"event": "test"}, timeout=3)
        except Exception:
            pass
        return jsonify({"success": True})
