"""
API v3 - Report
VULN-03: Pickle RCE via Redis cache
VULN-59: IDOR via Content-Type
"""
from app.api.v3 import bp
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import current_app
import pickle
import os


@bp.route("/report/load", methods=["GET"])
@jwt_required()
def load_report():
    """
    VULN-03: pickle.loads() sem validação - RCE
    VULN-32: report_id acessível via IDOR
    """
    report_id = request.args.get("report_id", "default")
    
    # Recuperar do Redis - dados serializados com pickle
    cache_key = f"report:{report_id}"
    redis_client = current_app.extensions.get("redis")
    cached = redis_client.get(cache_key) if redis_client else None
    
    if cached:
        # VULN-03: pickle.loads sem validação - RCE proposital
        try:
            report_data = pickle.loads(cached)
            return jsonify(report_data if isinstance(report_data, dict) else {"data": str(report_data)})
        except Exception:
            pass
    
    return jsonify({"report_id": report_id, "data": "Relatório vazio"})


@bp.route("/report/export", methods=["GET"])
@jwt_required()
def export_report():
    """
    VULN-59: IDOR via Content-Type - XML tem validação mais fraca
    """
    report_id = request.args.get("report_id")
    if not report_id:
        return jsonify({"error": "report_id obrigatório"}), 400
    
    accept = request.headers.get("Accept", "application/json")
    
    if "application/xml" in accept or "text/xml" in accept:
        # VULN-59: Path XML com validação de autorização mais fraca
        return f'<?xml version="1.0"?><report id="{report_id}"><extra_data>admin_only_field</extra_data></report>', 200, {
            "Content-Type": "application/xml"
        }
    
    return jsonify({"report_id": report_id})
