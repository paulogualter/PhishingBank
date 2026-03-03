"""
API v3 - Accounts
VULN-32: BOLA/IDOR em transações
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
