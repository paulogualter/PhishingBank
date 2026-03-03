"""API v2 Auth"""
from app.api.v2 import bp
from flask import request, jsonify
from app.models import User
from app.auth.jwt_handler import create_access_token


@bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()
    if not user or user.password_hash != data.get("password", ""):
        return jsonify({"error": "credenciais inválidas"}), 401
    token = create_access_token(user.id, extra_claims={"role": user.role})
    return jsonify({"access_token": token, "user": user.to_dict()})
