"""
VULN-40: Shadow API v1 - Login sem autenticação real
"""
from app.api.v1 import bp
from flask import request, jsonify
from app.extensions import db
from app.models import User, Account


@bp.route("/auth/login", methods=["POST"])
def login():
    """VULN-40: Endpoint de login sem rate limit, sem 2FA"""
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "email e password obrigatórios"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "usuario_nao_encontrado"}), 401
    
    # Simplificado - em produção seria bcrypt
    if user.password_hash != password:  # VULN: comparação direta
        return jsonify({"error": "senha_incorreta"}), 401
    
    from app.auth.jwt_handler import create_access_token
    token = create_access_token(user.id, extra_claims={"role": user.role})
    
    return jsonify({
        "access_token": token,
        "user_id": user.id,
        "nome": user.nome,
    })
