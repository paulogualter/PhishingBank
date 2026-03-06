# Phishing Bank

> "Onde o Seu Dinheiro é Nosso Dinheiro"
> Plataforma educacional de pentest, AppSec e phishing awareness

## DISCLAIMER

**Este projeto é EXCLUSIVAMENTE para fins educacionais.** O Phishing Bank é uma aplicação bancária fictícia e **intencionalmente vulnerável**, destinada ao ensino de segurança da informação em ambientes controlados.

- **NUNCA** exponha publicamente sem controle de acesso
- **NUNCA** use em produção ou com dados reais
- Use apenas em laboratórios, labs de pentest, CTFs e treinamentos autorizados

## Instalação Rápida

```bash
git clone https://github.com/paulogualter/PhishingBank.git
cd PhishingBank
docker-compose up -d
```

Acesse: **http://localhost**

> **Nota:** Para a vulnerabilidade VULN-27 (.git exposto), execute `git init` antes de subir os containers.

**Dados iniciais:** Na primeira execução, o banco é populado automaticamente com usuários e transações de teste. Para resetar: `docker-compose run --rm backend python seed_data.py --force`

## Credenciais de Teste

| Usuário | Email | Senha | Role |
|---------|-------|-------|------|
| João Silva | joao@email.com | senha123 | user |
| Maria Oliveira | maria@email.com | senha123 | premium |
| Admin | admin@phishingbank.com | admin123 | admin |

**Contas:** Ag. 0001 | Cc. 10001-1 (João), 20002-2 (Maria). Use o número da conta como chave PIX.

## Vulnerabilidades (60 total)

| ID | Categoria | Dificuldade |
|----|-----------|-------------|
| VULN-01 a 04 | Deserialization | Hard |
| VULN-05 a 08 | File Upload | Medium/Hard |
| VULN-09 a 11 | XXE | Medium |
| VULN-12 a 15 | Injection | Medium |
| VULN-16 a 18 | Autenticação | Hard |
| VULN-19 a 21 | Business Logic | Medium/Hard |
| VULN-22 a 25 | SSRF/XSS | Medium |
| VULN-26 a 28 | Crypto/Infra | Easy/Medium |
| VULN-32 a 41 | OWASP API Top 10 | Easy/Medium/Hard |
| ... | ... | ... |

## Sistema CTF

Submeta flags em: **POST /scoreboard/submit**

```json
{"flag": "PB{shadow_api_v1_no_auth_transfer}", "user": "seu_nome"}
```

## Estrutura do Projeto

```
PhishingBank/
├── backend/     # Flask + SQLAlchemy
├── frontend/    # React + Vite
├── nginx/       # Reverse proxy
├── payment-service/  # Microserviço Node.js
├── challenges/  # Flags CTF
└── docs/        # Documentação
```

## Desenvolvimento Local

Ver [RUN_LOCAL.md](RUN_LOCAL.md) para instruções de execução sem Docker.

## Para Instrutores

- [SETUP.md](docs/SETUP.md) - Instalação detalhada
