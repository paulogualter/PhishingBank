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

    account = user.accounts.first() if hasattr(user, "accounts") else None
    account_data = account.to_dict() if account else None

    token = create_access_token(user.id, extra_claims={"role": user.role})
    refresh = create_refresh_token(user.id)
    return jsonify({
        "access_token": token,
        "refresh_token": refresh,
        "user_id": user.id,
        "nome": user.nome,
        "conta": account_data,
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


@bp.route("/auth/login-bank", methods=["POST"])
def login_bank():
    """Login por agência, conta e senha (formato bancário)"""
    from app.models import Account

    data = request.get_json() or {}
    agency = str(data.get("agencia", "")).replace(" ", "").strip().zfill(4) or "0001"
    conta = str(data.get("conta", "")).strip()
    password = data.get("senha", "")

    if not conta or not password:
        return jsonify({"error": "conta e senha obrigatórios"}), 400

    acc = Account.query.filter_by(agency=agency, number=conta).first()
    if not acc:
        conta_clean = conta.replace("-", "")
        for a in Account.query.filter_by(agency=agency).all():
            if a.number.replace("-", "") == conta_clean:
                acc = a
                break
    if not acc:
        return jsonify({"error": "conta_nao_encontrada"}), 401

    user = acc.user
    if user.password_hash != password:
        return jsonify({"error": "senha_incorreta"}), 401

    account_data = acc.to_dict()
    token = create_access_token(user.id, extra_claims={"role": user.role})
    refresh = create_refresh_token(user.id)
    return jsonify({
        "access_token": token,
        "refresh_token": refresh,
        "user_id": user.id,
        "nome": user.nome,
        "conta": account_data,
    })


@bp.route("/auth/abrir-conta", methods=["POST"])
def abrir_conta():
    """Abrir conta com zero reais - VULN: sem validação robusta, mass assignment"""
    from app.models import Account
    from app.extensions import db
    from sqlalchemy import func

    data = request.get_json() or {}
    nome = (data.get("nome") or "").strip()
    cpf = (data.get("cpf") or "").replace(".", "").replace("-", "").strip()
    email = (data.get("email") or "").strip().lower()
    senha = data.get("senha", "")

    if not nome or not cpf or not email or not senha:
        return jsonify({"error": "nome, cpf, email e senha obrigatórios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email_ja_cadastrado"}), 400

    if User.query.filter_by(cpf=cpf).first():
        return jsonify({"error": "cpf_ja_cadastrado"}), 400

    # Gerar número de conta único (formato XXXXX-X)
    max_id = db.session.query(func.max(Account.id)).scalar() or 0
    base = 60001 + max_id
    dig = base % 10
    number = f"{base}-{dig}"

    user = User(
        nome=nome,
        cpf=cpf,
        email=email,
        password_hash=senha,  # VULN: senha em texto plano
        pin_hash="0000",
        role="user",
        kyc_status="approved",
        fraud_score=0.0,
        internal_credit_limit=5000.0,
        credit_limit=5000.0,
    )
    db.session.add(user)
    db.session.flush()

    acc = Account(
        user_id=user.id,
        agency="0001",
        number=number,
        balance=0.0,
        account_type="corrente",
    )
    db.session.add(acc)
    db.session.commit()

    account_data = acc.to_dict()
    token = create_access_token(user.id, extra_claims={"role": user.role})
    refresh = create_refresh_token(user.id)
    return jsonify({
        "access_token": token,
        "refresh_token": refresh,
        "user_id": user.id,
        "nome": user.nome,
        "conta": account_data,
        "message": "Conta aberta com sucesso! Saldo inicial: R$ 0,00",
    })


@bp.route("/auth/resend-otp", methods=["POST"])
def resend_otp():
    """VULN-35: SMS bombing - sem rate limit"""
    # Sem rate limit por telefone ou IP
    return jsonify({"success": True, "message": "OTP reenviado"})
