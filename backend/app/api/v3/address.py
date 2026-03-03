"""
VULN-37: SSRF via webhook em validação de endereço
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required


def register_address_routes(bp):
    @bp.route("/address/validate", methods=["POST"])
    @jwt_required()
    def validate_address():
        """VULN-37: Aceita callback_url e faz request sem validar - SSRF"""
        data = request.get_json() or {}
        callback_url = data.get("callback_url")
        if not callback_url:
            return jsonify({"error": "callback_url obrigatório"}), 400
        try:
            from app.services.address_validator import validate_address_callback
            validate_address_callback(callback_url)
            return jsonify({"status": "validated"})
        except Exception as e:
            return jsonify({"error": str(e)}), 400
