# Checklist de Segurança - HyperLoc

## 🔐 Segurança da Aplicação

### Autenticação

- [x] Senhas com hash bcryptjs (10 rounds)
- [x] JWT com expiração configurável
- [x] Validação de token em todas as rotas protegidas
- [x] Refresh token implementado
- [ ] 2FA para super admin
- [ ] Recuperação de senha segura
- [ ] Logout limpa sessão

### Autorização

- [x] Controle de acesso por role (RBAC)
- [x] Validação de tenant_id em todas as queries
- [x] Middleware de isolamento multi-tenant
- [x] Proteção de rotas por papel
- [ ] Auditoria de acesso negado
- [ ] Limite de tentativas de login

### Validação de Dados

- [x] Validação de entrada em todas as rotas
- [x] Sanitização de strings
- [x] Validação de tipos de dados
- [x] Validação de CPF/CNPJ
- [ ] Rate limiting por IP
- [ ] Proteção contra CSRF
- [ ] Proteção contra XSS

### Banco de Dados

- [x] Prepared statements (Drizzle ORM)
- [x] Row Level Security (RLS) planejado
- [x] Índices em tenant_id
- [x] Foreign keys com integridade referencial
- [ ] Criptografia de dados sensíveis
- [ ] Backup automático
- [ ] Replicação para HA

---

## 🛡️ Segurança de Infraestrutura

### Servidor

- [ ] HTTPS/TLS obrigatório
- [ ] HSTS configurado
- [ ] Firewall ativo
- [ ] SSH com chave (sem senha)
- [ ] Fail2ban para proteção contra brute force
- [ ] Atualizações de segurança automáticas
- [ ] Monitoramento de intrusão

### Rede

- [ ] VPC isolada
- [ ] Security groups restritivos
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection
- [ ] Rate limiting
- [ ] CORS restritivo
- [ ] CSP (Content Security Policy)

### Dados

- [ ] Criptografia em trânsito (TLS)
- [ ] Criptografia em repouso
- [ ] Backup criptografado
- [ ] Retenção de logs
- [ ] Destruição segura de dados

---

## 📋 Testes de Segurança

### Testes de Autenticação

```bash
# 1. Testar login com credenciais inválidas
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "senha": "senha_errada"
  }'
# Esperado: 401 Unauthorized

# 2. Testar acesso sem token
curl -X GET http://localhost:5000/clientes
# Esperado: 401 Unauthorized

# 3. Testar token expirado
# Modificar JWT_EXPIRES_IN para 1s, fazer login, esperar 2s, fazer requisição
# Esperado: 401 Unauthorized

# 4. Testar token inválido
curl -X GET http://localhost:5000/clientes \
  -H "Authorization: Bearer token_invalido"
# Esperado: 401 Unauthorized
```

### Testes de Autorização

```bash
# 1. Testar acesso de operador_comercial a financeiro
# Login como operador_comercial
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "comercial@empresa.com",
    "senha": "comercial123"
  }'

# Tentar acessar financeiro
curl -X GET http://localhost:5000/financeiro/lancamentos \
  -H "Authorization: Bearer {token}"
# Esperado: 403 Forbidden

# 2. Testar isolamento de tenant
# Tenant 1 tenta acessar dados do Tenant 2
# Esperado: 404 Not Found ou 403 Forbidden
```

### Testes de Validação de Dados

```bash
# 1. Testar SQL Injection
curl -X POST http://localhost:5000/clientes \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "PJ",
    "nome_razao": "'; DROP TABLE clientes; --",
    "cpf_cnpj": "12.345.678/0001-90",
    "email": "teste@teste.com"
  }'
# Esperado: Erro de validação (string escapada)

# 2. Testar XSS
curl -X POST http://localhost:5000/clientes \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "PJ",
    "nome_razao": "<script>alert(\"XSS\")</script>",
    "cpf_cnpj": "12.345.678/0001-90",
    "email": "teste@teste.com"
  }'
# Esperado: String sanitizada

# 3. Testar CPF/CNPJ inválido
curl -X POST http://localhost:5000/clientes \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "PJ",
    "nome_razao": "Empresa",
    "cpf_cnpj": "00.000.000/0000-00",
    "email": "teste@teste.com"
  }'
# Esperado: 400 Bad Request
```

### Testes de Isolamento Multi-Tenant

```bash
# 1. Obter ID de cliente do Tenant 1
# Login como admin@empresa.com (Tenant 1)
# GET /clientes -> obter cliente_id

# 2. Tentar acessar como Tenant 2
# Login como admin2@empresa.com (Tenant 2)
# GET /clientes/{cliente_id_do_tenant1}
# Esperado: 404 Not Found

# 3. Verificar que dados não vazam em listagens
# GET /clientes (Tenant 2)
# Esperado: Apenas clientes do Tenant 2
```

---

## 🔍 Verificação de Código

### Dependências

```bash
# Verificar vulnerabilidades
npm audit

# Atualizar dependências seguras
npm audit fix

# Verificar dependências desatualizadas
npm outdated
```

### Linting

```bash
# Verificar padrões de código
npm run lint

# Verificar segurança com ESLint
npm run lint:security
```

---

## 📊 Monitoramento de Segurança

### Logs de Auditoria

Implementar logs para:
- [ ] Login/logout
- [ ] Acesso negado
- [ ] Alteração de dados sensíveis
- [ ] Acesso a dados de outros tenants
- [ ] Tentativas de SQL injection
- [ ] Erros de autenticação

### Alertas

Configurar alertas para:
- [ ] Múltiplas tentativas de login falhadas
- [ ] Acesso de IP suspeito
- [ ] Alteração de dados críticos
- [ ] Tentativas de acesso não autorizado
- [ ] Erros de banco de dados

---

## 🚀 Deployment Seguro

### Pré-Deployment

- [ ] Executar testes de segurança
- [ ] Verificar dependências
- [ ] Revisar código
- [ ] Testar isolamento multi-tenant
- [ ] Verificar variáveis de ambiente

### Configuração de Produção

- [ ] NODE_ENV=production
- [ ] JWT_SECRET com 32+ caracteres
- [ ] Senhas de banco de dados fortes
- [ ] CORS restritivo
- [ ] HTTPS obrigatório
- [ ] Rate limiting ativo
- [ ] Logs centralizados
- [ ] Monitoramento ativo

### Pós-Deployment

- [ ] Verificar health check
- [ ] Testar login
- [ ] Testar isolamento de tenant
- [ ] Verificar logs
- [ ] Monitorar performance
- [ ] Testar backup/restore

---

## 📝 Políticas de Segurança

### Senhas

- Mínimo 8 caracteres
- Deve conter: maiúscula, minúscula, número, símbolo
- Expiração: 90 dias
- Histórico: não reutilizar últimas 5 senhas
- Bloqueio após 5 tentativas falhas

### Sessão

- Timeout: 24 horas
- Refresh token: 7 dias
- Logout limpa sessão
- Um dispositivo por vez (opcional)

### Dados Sensíveis

- Nunca logar senhas
- Criptografar CPF/CNPJ (opcional)
- Mascarar números de conta
- Limpar dados após exclusão

---

## 🔄 Processo de Resposta a Incidentes

1. **Detecção**: Monitoramento identifica anomalia
2. **Análise**: Investigar causa raiz
3. **Contenção**: Isolar tenant afetado se necessário
4. **Erradicação**: Corrigir vulnerabilidade
5. **Recuperação**: Restaurar de backup
6. **Aprendizado**: Documentar e prevenir recorrência

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✅ Checklist Final

- [ ] Todos os testes de segurança passaram
- [ ] Dependências atualizadas
- [ ] Código revisado
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/TLS ativo
- [ ] Backups funcionando
- [ ] Monitoramento ativo
- [ ] Logs centralizados
- [ ] Equipe treinada
- [ ] Plano de resposta a incidentes

---

**Última atualização**: 2026-03-20  
**Versão**: 1.0
