"""
VULN-22: SSRF em importação de extrato via URL
"""
from flask import request, jsonify
from flask_jwt_extended import jwt_required


def register_import_url_routes(bp):
    @bp.route("/import/url", methods=["POST"])
    @jwt_required()
    def import_from_url():
        """VULN-22: requests.get(url) sem validar - SSRF para metadata AWS"""
        data = request.get_json() or {}
        url = data.get("url")
        if not url:
            return jsonify({"error": "url obrigatório"}), 400
        try:
            import requests
            r = requests.get(url, timeout=5)
            return jsonify({"status": r.status_code, "length": len(r.content)})
        except Exception as e:
            return jsonify({"error": str(e)}), 400
