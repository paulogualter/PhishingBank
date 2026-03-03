#!/usr/bin/env python3
"""
Phishing Bank - Seed Data
Popula banco com dados fake realistas para pentest
"""
import os
import sys

# Adicionar path do app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models import User, Account, Transaction, Card

USUARIOS = [
    {"nome": "João Silva Santos", "cpf": "12345678909", "email": "joao@email.com", "saldo": 15420.50, "role": "user"},
    {"nome": "Maria Oliveira Costa", "cpf": "98765432100", "email": "maria@email.com", "saldo": 89320.00, "role": "premium"},
    {"nome": "Admin Sistema", "cpf": "00000000001", "email": "admin@phishingbank.com", "saldo": 999999.99, "role": "admin"},
    {"nome": "Pedro Henrique Lima", "cpf": "11122233344", "email": "pedro@email.com", "saldo": 5200.00, "role": "user"},
    {"nome": "Ana Carolina Souza", "cpf": "55566677788", "email": "ana@email.com", "saldo": 32100.00, "role": "premium"},
]

def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()
        
        for i, u in enumerate(USUARIOS):
            user = User(
                nome=u["nome"],
                cpf=u["cpf"],
                email=u["email"],
                password_hash="senha123" if u["role"] != "admin" else "admin123",
                pin_hash="1234",
                role=u["role"],
                kyc_status="approved",
                fraud_score=0.0,
                internal_credit_limit=10000.0,
                credit_limit=10000.0,
            )
            db.session.add(user)
            db.session.flush()
            
            acc = Account(
                user_id=user.id,
                number=f"{(i+1)*10000:08d}",
                balance=u["saldo"],
            )
            db.session.add(acc)
        
        db.session.commit()
        
        # Transações fake
        accounts = Account.query.all()
        for i in range(min(20, len(accounts))):
            acc_from = accounts[i % len(accounts)]
            acc_to = accounts[(i + 1) % len(accounts)]
            if acc_from.id != acc_to.id:
                tx = Transaction(
                    account_from_id=acc_from.id,
                    account_to_id=acc_to.id,
                    amount=100.0 * (i + 1),
                    type="pix",
                    observacao=f"Transferência teste {i}",
                    status="completed",
                )
                db.session.add(tx)
        
        db.session.commit()
        print("Seed concluído! Usuários criados:")
        for u in USUARIOS:
            pwd = "admin123" if u["role"] == "admin" else "senha123"
            print(f"  - {u['email']} / {pwd} ({u['role']})")

if __name__ == "__main__":
    seed()
