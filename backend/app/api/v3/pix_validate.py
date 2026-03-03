"""
VULN-57: ReDoS em validação de chave PIX
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required


def register_pix_validate_routes(bp):
    @bp.route("/pix/validate-key", methods=["POST"])
    @jwt_required()
    def validate_pix_key():
        """VULN-57: Regex catastrófica - ReDoS em input longo"""
        data = request.get_json() or {}
        key = data.get("key", "")
        try:
            from app.utils.regex_validator import validate_cpf_unsafe
            valid = validate_cpf_unsafe(key)
            return jsonify({"valid": valid})
        except Exception as e:
            return jsonify({"error": str(e)}), 400
