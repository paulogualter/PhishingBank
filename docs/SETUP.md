# Phishing Bank - Setup

## Pré-requisitos

- Docker e Docker Compose
- Git (para vulnerabilidade VULN-27)

## Instalação com Docker

```bash
git clone <repo>
cd phishing-bank
git init  # Para VULN-27 (.git exposto)
docker-compose up -d
```

Aguarde os containers subirem. MySQL pode levar ~30s para inicializar.

## Seed do Banco

```bash
docker-compose exec backend python seed_data.py
```

## Desenvolvimento Local (sem Docker)

### Terminal 1 - Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
SQLALCHEMY_DATABASE_URI=sqlite:///phishingbank.db python run_local.py
```

Backend em **http://localhost:5001**

### Terminal 2 - Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend em **http://localhost:3000**

O Vite faz proxy de `/api` para o backend na porta 5001.
