"""
API v3 - Accounts
VULN-32: BOLA/IDOR em transações
VULN-62: HTTP Parameter Pollution (HPP) em balance
"""
from app.api.v3 import bp
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Account, Transaction


@bp.route("/accounts", methods=["GET"])
@jwt_required()
def list_accounts():
    user_id = get_jwt_identity()
    accounts = Account.query.filter_by(user_id=user_id).all()
    return jsonify({"accounts": [a.to_dict() for a in accounts]})


@bp.route("/transactions", methods=["GET"])
@jwt_required()
def list_transactions():
    """Lista transações do usuário"""
    user_id = get_jwt_identity()
    accounts = Account.query.filter_by(user_id=user_id).all()
    account_ids = [a.id for a in accounts]
    
    transactions = Transaction.query.filter(
        (Transaction.account_from_id.in_(account_ids)) |
        (Transaction.account_to_id.in_(account_ids))
    ).order_by(Transaction.created_at.desc()).limit(50).all()
    
    return jsonify({"transactions": [t.to_dict() for t in transactions]})


@bp.route("/accounts/balance", methods=["GET"])
@jwt_required()
def get_account_balance():
    """
    VULN-62: HPP - Validação usa primeiro account_id, query usa último.
    ?account_id=1&account_id=2 -> valida que user tem conta 1, retorna saldo da conta 2.
    """
    user_id = get_jwt_identity()
    user_accounts = Account.query.filter_by(user_id=user_id).all()
    user_account_ids = [a.id for a in user_accounts]

    # VULN-62: Usa PRIMEIRO valor para validação de ownership
    account_id_param = request.args.get("account_id")
    if not account_id_param:
        return jsonify({"error": "account_id obrigatório"}), 400

    try:
        account_id_check = int(account_id_param)
    except (ValueError, TypeError):
        return jsonify({"error": "account_id inválido"}), 400

    if account_id_check not in user_account_ids:
        return jsonify({"error": "conta não pertence ao usuário"}), 403

    # VULN-62: Usa ÚLTIMO valor para a query real (HPP bypass)
    account_ids = request.args.getlist("account_id")
    account_id_real = int(account_ids[-1]) if account_ids else account_id_check

    acc = Account.query.get(account_id_real)
    if not acc:
        return jsonify({"error": "conta não encontrada"}), 404

    return jsonify({
        "account_id": acc.id,
        "agency": acc.agency,
        "number": acc.number,
        "balance": acc.balance,
    })


@bp.route("/transactions/<tx_uuid>", methods=["GET"])
@jwt_required()
def get_transaction(tx_uuid):
    """
    VULN-20/32: IDOR - Não verifica se transaction pertence ao user
    UUID v1 previsível
    """
    tx = Transaction.query.filter_by(uuid=str(tx_uuid)).first()
    if not tx:
        return jsonify({"error": "não encontrado"}), 404
    
    # VULN-32: NÃO verifica ownership - retorna qualquer transação
    return jsonify(tx.to_dict())
