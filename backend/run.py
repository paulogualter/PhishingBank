#!/usr/bin/env python3
"""Entry point para Flask"""
import os
from app import create_app

app = create_app(os.getenv("FLASK_ENV", "development"))

# Auto-seed na primeira instalação (banco vazio)
with app.app_context():
    from app.models import User
    try:
        if User.query.count() == 0:
            from seed_data import seed
            seed(force=False)
    except Exception:
        pass  # Tabelas podem não existir; init_extensions cria depois

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
