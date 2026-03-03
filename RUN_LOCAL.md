# Phishing Bank - Execução Local

## Início rápido

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
SQLALCHEMY_DATABASE_URI=sqlite:///phishingbank.db python run_local.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001

## Credenciais

| Email | Senha |
|-------|-------|
| joao@email.com | senha123 |
| admin@phishingbank.com | admin123 |

## Contas de teste (após seed)

| Usuário | Agência | Conta | PIX (número conta) |
|---------|---------|-------|---------------------|
| João | 0001 | 10001-1 | 10001-1 |
| Maria | 0001 | 20002-2 | 20002-2 |
| Admin | 0001 | 30003-3 | 30003-3 |

## Endpoints para pentest

- `POST /api/v3/auth/login` - Login
- `POST /api/v1/auth/login` - Shadow API (sem auth)
- `POST /api/v1/transfer` - Transferência sem auth
- `GET /actuator/env` - Variáveis de ambiente
- `GET /api/v3/receipts/generate?name={{7*7}}` - SSTI
- `POST /api/v3/import/url` - SSRF (body: `{"url":"..."}`)
- `POST /api/v3/address/validate` - SSRF webhook
- `PUT /api/v3/settings/webhook` - Blind SSRF
- `POST /api/v3/import/ofx` - XXE (XML no body)
- `POST /api/v3/pix/validate-key` - ReDoS (body: `{"key":"..."}`)
- `GET /api/v3/redirect?next=URL` - Open Redirect
- `GET /api/v3/accounts/balance?account_id=1&account_id=2` - HPP (consultar saldo de outra conta)
