#!/usr/bin/env python3
"""
Roda backend local com SQLite - para desenvolvimento
"""
import os
import sys

os.environ.setdefault("SQLALCHEMY_DATABASE_URI", "sqlite:///phishingbank.db")
os.environ.setdefault("FLASK_ENV", "development")

# Seed se banco vazio
db_path = os.path.join(os.path.dirname(__file__), "phishingbank.db")
if not os.path.exists(db_path):
    print("Executando seed...")
    from seed_data import seed
    seed()
    print("")

from app import create_app
app = create_app()

if __name__ == "__main__":
    print("Phishing Bank - http://localhost:5001")
    print("Credenciais: joao@email.com / senha123")
    app.run(host="0.0.0.0", port=5001, debug=True)
