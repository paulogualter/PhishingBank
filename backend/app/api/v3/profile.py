"""
API v3 - Profile
VULN-21: Mass assignment via PATCH
VULN-34: BOPLA - campos sensíveis no response
"""
from app.api.v3 import bp
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User


@bp.route("/user/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """VULN-34: Retorna objeto User completo com campos sensíveis"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "não encontrado"}), 404
    return jsonify(user.to_dict())


@bp.route("/user/profile", methods=["PATCH"])
@jwt_required()
def update_profile():
    """
    VULN-21: Mass assignment - aceita role, kyc_status, credit_limit
    sem allowlist de campos permitidos
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "não encontrado"}), 404
    
    data = request.get_json() or {}
    
    # VULN-21: update sem allowlist - aceita qualquer campo
    for key, val in data.items():
        if hasattr(user, key):
            setattr(user, key, val)
    
    db.session.commit()
    return jsonify(user.to_dict())
