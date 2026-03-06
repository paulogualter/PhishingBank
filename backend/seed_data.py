#!/usr/bin/env python3
"""
Phishing Bank - Seed Data
Popula banco com dados fake realistas para pentest.
Execução: python seed_data.py [--force]
  --force: recria tabelas e repopula (apaga dados existentes)
  sem --force: só popula se banco estiver vazio (idempotente)
"""
import os
import sys
import random
from datetime import datetime, timedelta, timezone

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

# Transações realistas para seed
TRANSACOES_TEMPLATE = [
    # PIX
    {"type": "pix", "obs": "PIX - Pagamento mercado", "amount_range": (45.90, 320.00)},
    {"type": "pix", "obs": "PIX - Restaurante", "amount_range": (85.00, 250.00)},
    {"type": "pix", "obs": "PIX - Uber", "amount_range": (18.50, 65.00)},
    {"type": "pix", "obs": "PIX - Farmácia", "amount_range": (32.00, 180.00)},
    {"type": "pix", "obs": "PIX - Conta de luz", "amount_range": (120.00, 450.00)},
    {"type": "pix", "obs": "PIX - Internet", "amount_range": (89.90, 150.00)},
    {"type": "pix", "obs": "PIX - Freelancer", "amount_range": (500.00, 2500.00)},
    {"type": "pix", "obs": "PIX - Reembolso", "amount_range": (50.00, 200.00)},
    {"type": "pix", "obs": "PIX - Dividir conta", "amount_range": (35.00, 120.00)},
    {"type": "pix", "obs": "PIX - Presente", "amount_range": (100.00, 500.00)},
    # TED
    {"type": "ted", "obs": "TED - Pagamento fornecedor", "amount_range": (1500.00, 8000.00)},
    {"type": "ted", "obs": "TED - Investimento", "amount_range": (1000.00, 5000.00)},
    {"type": "ted", "obs": "TED - Empréstimo pessoal", "amount_range": (2000.00, 10000.00)},
    {"type": "ted", "obs": "TED - Salário recebido", "amount_range": (3500.00, 15000.00)},
    {"type": "ted", "obs": "TED - Aluguel", "amount_range": (1200.00, 3500.00)},
    # DOC
    {"type": "doc", "obs": "DOC - Pagamento fatura cartão", "amount_range": (800.00, 4000.00)},
    {"type": "doc", "obs": "DOC - Seguro auto", "amount_range": (400.00, 1200.00)},
    {"type": "doc", "obs": "DOC - Plano de saúde", "amount_range": (350.00, 900.00)},
    # Boleto
    {"type": "boleto", "obs": "Boleto - IPTU", "amount_range": (200.00, 800.00)},
    {"type": "boleto", "obs": "Boleto - IPVA", "amount_range": (150.00, 600.00)},
    {"type": "boleto", "obs": "Boleto - Faculdade", "amount_range": (800.00, 2500.00)},
    # Débito
    {"type": "debit", "obs": "Débito - Supermercado", "amount_range": (120.00, 450.00)},
    {"type": "debit", "obs": "Débito - Posto combustível", "amount_range": (150.00, 350.00)},
    {"type": "debit", "obs": "Débito - Farmácia", "amount_range": (45.00, 220.00)},
]


def _random_amount(rng):
    lo, hi = rng
    return round(random.uniform(lo, hi), 2)


def _random_date(days_back=90):
    """Data aleatória nos últimos N dias"""
    delta = random.randint(0, days_back)
    return datetime.now(timezone.utc) - timedelta(days=delta)


def _create_transactions(accounts):
    """Cria transações realistas entre as contas"""
    transactions = []
    n = len(accounts)

    for _ in range(60):  # ~60 transações
        acc_from = random.choice(accounts)
        acc_to = random.choice(accounts)
        if acc_from.id == acc_to.id:
            continue

        tpl = random.choice(TRANSACOES_TEMPLATE)
        amount = _random_amount(tpl["amount_range"])
        tx = Transaction(
            account_from_id=acc_from.id,
            account_to_id=acc_to.id,
            amount=amount,
            type=tpl["type"],
            observacao=tpl["obs"],
            status="completed",
            pix_key=acc_to.number if tpl["type"] == "pix" else None,
            created_at=_random_date(),
        )
        transactions.append(tx)

    return transactions


def seed(force=False):
    app = create_app()
    with app.app_context():
        # Idempotente: só popula se vazio (a menos que --force)
        if not force:
            try:
                if User.query.count() > 0:
                    print("Banco já populado. Use --force para recriar dados.")
                    return
            except Exception:
                pass  # Tabelas podem não existir ainda

        if force:
            db.drop_all()

        db.create_all()

        # Agência padrão 0001, contas no formato brasileiro XXXXX-X
        AGENCIAS = ["0001", "0001", "0001", "0002", "0002"]
        CONTAS = ["10001-1", "20002-2", "30003-3", "40004-4", "50005-5"]

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
                agency=AGENCIAS[i],
                number=CONTAS[i],
                balance=u["saldo"],
                account_type="corrente",
            )
            db.session.add(acc)

        db.session.commit()

        # Transações realistas
        accounts = Account.query.all()
        for tx in _create_transactions(accounts):
            db.session.add(tx)

        db.session.commit()

        print("Seed concluído! Usuários criados:")
        for u in USUARIOS:
            pwd = "admin123" if u["role"] == "admin" else "senha123"
            print(f"  - {u['email']} / {pwd} ({u['role']})")
        print(f"  Transações: {Transaction.query.count()}")


if __name__ == "__main__":
    force = "--force" in sys.argv or "-f" in sys.argv
    seed(force=force)
