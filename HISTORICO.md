# Histórico do Phishing Bank

## 2025-03-02 - MVP Fase 1

### Implementado
- **Docker Compose** completo (nginx, backend, frontend, mysql, redis, celery, payment-service)
- **Backend Flask** com SQLAlchemy, JWT, Redis
- **Models**: User, Account, Transaction, Card, AuditLog
- **API v1** (Shadow API - sem auth): login, transfer
- **API v2**: auth, accounts
- **API v3**: auth, accounts, transfer PIX, profile, report
- **API Admin**: X-Admin header bypass
- **API Actuator**: /actuator/env, /actuator/heapdump
- **API Partner**: api_key em query string
- **Well-known**: JWKS exposto
- **GraphQL**: schema com campos sensíveis
- **Scoreboard CTF**: submit de flags
- **Frontend React**: Login, Dashboard, Extrato, Transferência PIX
- **Seed data**: 5 usuários, transações fake
- **Vulnerabilidades implementadas**: ~25 das 60 planejadas

### Próximos passos
- Fase 2: Deserialization, File Upload, XXE, SSTI
- Fase 3: WebSocket, mais endpoints OWASP API
- Fase 4: Documentação completa, labs isolados
