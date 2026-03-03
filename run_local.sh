#!/bin/bash
# Phishing Bank - Execução local (sem Docker)
# Usa SQLite e Redis fake

cd "$(dirname "$0")"

export SQLALCHEMY_DATABASE_URI="sqlite:///$(pwd)/backend/phishingbank.db"
export FLASK_ENV=development
export FLASK_APP=app

echo "=== Phishing Bank - Modo Local ==="
echo ""

# Seed se não existir banco
if [ ! -f backend/phishingbank.db ]; then
    echo "Criando banco e populando..."
    cd backend && python seed_data.py && cd ..
    echo ""
fi

echo "Iniciando backend em http://localhost:5000"
echo "Iniciando frontend em http://localhost:3000"
echo ""
echo "Credenciais: joao@email.com / senha123"
echo ""

# Rodar backend em background
cd backend
source venv/bin/activate 2>/dev/null || true
python run.py &
BACKEND_PID=$!
cd ..

# Rodar frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Pressione Ctrl+C para parar"
wait $BACKEND_PID $FRONTEND_PID
