"""
API v3 - Auth
VULN-17: OAuth sem state
VULN-18: 2FA bypass via response
VULN-39: User enumeration
"""
from app.api.v3 import bp
from flask import request, jsonify
from app.models import User
from app.auth.jwt_handler import create_access_token, create_refresh_token, decode_token


@bp.route("/auth/login", methods=["POST"])
def login():
    """VULN-39: Response diferencia usuario_nao_encontrado de senha_incorreta"""
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get("email")).first()
    
    if not user:
        return jsonify({"error": "usuario_nao_encontrado"}), 401  # VULN-39: Enumeration
    
    if user.password_hash != data.get("password", ""):
        return jsonify({"error": "senha_incorreta"}), 401  # VULN-39: Enumeration
    
    token = create_access_token(user.id, extra_claims={"role": user.role})
    refresh = create_refresh_token(user.id)
    return jsonify({
        "access_token": token,
        "refresh_token": refresh,
        "user_id": user.id,
        "nome": user.nome,
    })


@bp.route("/auth/2fa/verify", methods=["POST"])
def verify_2fa():
    """
    VULN-18: 2FA bypass - frontend redireciona baseado em success
    sem verificação server-side adequada do estado de sessão
    """
    data = request.get_json() or {}
    # Simulação: qualquer código "123456" passa
    if data.get("code") == "123456":
        return jsonify({"success": True})
    # VULN-18: Retorna success: false mas frontend pode ser manipulado
    return jsonify({"success": False, "error": "código inválido"})


@bp.route("/auth/resend-otp", methods=["POST"])
def resend_otp():
    """VULN-35: SMS bombing - sem rate limit"""
    # Sem rate limit por telefone ou IP
    return jsonify({"success": True, "message": "OTP reenviado"})
