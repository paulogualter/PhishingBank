"""
VULN-40: Shadow API v1 - Transferência SEM verificação de autenticação
"""
from app.api.v1 import bp
from flask import request, jsonify
from app.extensions import db
from app.models import Account, Transaction


@bp.route("/transfer", methods=["POST"])
def transfer():
    """VULN-40: Transferência sem auth - qualquer um pode transferir"""
    data = request.get_json() or {}
    account_from = data.get("account_from_id")
    account_to = data.get("account_to_id")
    amount = float(data.get("amount", 0))
    
    if not all([account_from, account_to, amount > 0]):
        return jsonify({"error": "dados inválidos"}), 400
    
    acc_from = Account.query.get(account_from)
    acc_to = Account.query.get(account_to)
    
    if not acc_from or not acc_to:
        return jsonify({"error": "conta não encontrada"}), 404
    
    if acc_from.balance < amount:
        return jsonify({"error": "saldo insuficiente"}), 400
    
    acc_from.balance -= amount
    acc_to.balance += amount
    
    tx = Transaction(
        account_from_id=account_from,
        account_to_id=account_to,
        amount=amount,
        type="ted",
        status="completed"
    )
    db.session.add(tx)
    db.session.commit()
    
    return jsonify({"success": True, "transaction_id": tx.uuid})
