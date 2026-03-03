"""
VULN-36: Admin endpoints - verificação de auth fraca
Usa X-Admin header em vez de JWT role
"""
from flask import Blueprint, request, jsonify

bp = Blueprint("admin", __name__)


@bp.route("/users", methods=["GET"])
def list_users():
    """VULN-36: Verifica X-Admin header (bypassável)"""
    if request.headers.get("X-Admin") == "true":
        from app.models import User
        users = User.query.limit(100).all()
        return jsonify({"users": [u.to_dict() for u in users]})
    return jsonify({"error": "unauthorized"}), 403


@bp.route("/stats", methods=["GET"])
def stats():
    """VULN-36: Stats admin"""
    if request.headers.get("X-Admin") == "true":
        from app.models import User, Transaction
        return jsonify({
            "total_users": User.query.count(),
            "total_transactions": Transaction.query.count(),
        })
    return jsonify({"error": "unauthorized"}), 403
