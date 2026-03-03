"""
VULN-33: API key em query string - vaza em logs
"""
from flask import Blueprint, request, jsonify, current_app

bp = Blueprint("partner", __name__)


@bp.route("/balance", methods=["GET"])
def balance():
    """VULN-33: Aceita api_key na query string - logada pelo nginx"""
    api_key = request.args.get("api_key")
    if not api_key or api_key != current_app.config.get("INTERNAL_API_KEY"):
        return jsonify({"error": "invalid api key"}), 401
    
    return jsonify({"balance": 1000000.00, "currency": "BRL"})
