"""
API v3 - Transfer/PIX
VULN-19: Race condition em PIX
VULN-25: Stored XSS no observacao
"""
from app.api.v3 import bp
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Account, Transaction
import time


@bp.route("/pix/transfer", methods=["POST"])
@jwt_required()
def pix_transfer():
    """
    VULN-19: Race condition - check e debit em operações separadas
    VULN-25: observacao sem sanitização - Stored XSS
    """
    data = request.get_json() or {}
    user_id = get_jwt_identity()
    
    account = Account.query.filter_by(user_id=user_id).first()
    if not account:
        return jsonify({"error": "conta não encontrada"}), 404
    
    amount = float(data.get("amount", 0))
    pix_key = data.get("pix_key", "")
    observacao = data.get("observacao", "")  # VULN-25: Sem sanitização
    
    if amount <= 0:
        return jsonify({"error": "valor inválido"}), 400
    
    # Encontrar conta destino por PIX key (simplificado - por account number)
    acc_to = Account.query.filter_by(number=pix_key).first()
    if not acc_to:
        return jsonify({"error": "chave PIX não encontrada"}), 404
    
    # VULN-19: Check e Use em operações separadas - RACE CONDITION
    if account.balance >= amount:
        time.sleep(0.01)  # Janela proposital para race
        account.balance -= amount
        acc_to.balance += amount
        
        tx = Transaction(
            account_from_id=account.id,
            account_to_id=acc_to.id,
            amount=amount,
            type="pix",
            pix_key=pix_key,
            observacao=observacao,  # VULN-25: Armazenado sem sanitizar
            status="completed"
        )
        db.session.add(tx)
        db.session.commit()
        
        return jsonify({"success": True, "transaction_id": tx.uuid})
    
    return jsonify({"error": "saldo insuficiente"}), 400
