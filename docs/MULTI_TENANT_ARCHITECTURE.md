# Arquitetura Multi-Tenant do HyperLoc

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Modelo de Isolamento](#modelo-de-isolamento)
3. [Estratégia de Segurança](#estratégia-de-segurança)
4. [Fluxo de Autenticação](#fluxo-de-autenticação)
5. [Validação de Acesso](#validação-de-acesso)
6. [Boas Práticas](#boas-práticas)

## Visão Geral

O HyperLoc implementa um modelo **multi-tenant com isolamento forte de dados**, onde:

- **Uma única aplicação** serve múltiplos clientes (tenants)
- **Um banco de dados compartilhado** com isolamento por `tenant_id`
- **Cada tenant vê apenas seus próprios dados**
- **Super Admin pode gerenciar todos os tenants** mas não vê dados de negócio

### Benefícios

✅ **Escalabilidade**: Um único servidor serve múltiplos clientes  
✅ **Custo reduzido**: Infraestrutura compartilhada  
✅ **Manutenção simplificada**: Uma única versão da aplicação  
✅ **Segurança**: Isolamento completo de dados  

## Modelo de Isolamento

### Estrutura de Dados

```
┌─────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Tenant 1 (Empresa A)                             │  │
│  │ ├─ Usuários (tenant_id = 1)                      │  │
│  │ ├─ Clientes (tenant_id = 1)                      │  │
│  │ ├─ Equipamentos (tenant_id = 1)                  │  │
│  │ ├─ Pedidos (tenant_id = 1)                       │  │
│  │ └─ Financeiro (tenant_id = 1)                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Tenant 2 (Empresa B)                             │  │
│  │ ├─ Usuários (tenant_id = 2)                      │  │
│  │ ├─ Clientes (tenant_id = 2)                      │  │
│  │ ├─ Equipamentos (tenant_id = 2)                  │  │
│  │ ├─ Pedidos (tenant_id = 2)                       │  │
│  │ └─ Financeiro (tenant_id = 2)                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Coluna tenant_id

**Todas as tabelas de negócio possuem a coluna `tenant_id`:**

```sql
CREATE TABLE clientes (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,  -- ← Isolamento
  nome_razao VARCHAR(255) NOT NULL,
  ...
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  INDEX idx_tenant_id (tenant_id)
);
```

## Estratégia de Segurança

### 1. Validação em Múltiplas Camadas

```
┌─────────────────┐
│  Frontend       │
│  (Token JWT)    │
└────────┬────────┘
         │
┌────────▼────────────────────────────────┐
│  API Gateway / Middleware                │
│  ├─ Validar JWT                         │
│  ├─ Extrair tenant_id do token          │
│  └─ Validar tenant_id da requisição     │
└────────┬────────────────────────────────┘
         │
┌────────▼────────────────────────────────┐
│  Serviço de Negócio                      │
│  ├─ Validar tenant_id do recurso        │
│  ├─ Validar acesso por role             │
│  └─ Aplicar filtro tenant_id na query   │
└────────┬────────────────────────────────┘
         │
┌────────▼────────────────────────────────┐
│  Banco de Dados                          │
│  ├─ Índice em tenant_id                 │
│  ├─ Foreign Key constraints              │
│  └─ Row Level Security (opcional)       │
└────────────────────────────────────────┘
```

### 2. JWT com tenant_id

```javascript
// Token JWT contém tenant_id
{
  "id": "user-uuid",
  "email": "admin@empresa.com",
  "tenant_id": "tenant-uuid",  // ← Identificador do tenant
  "papel": "admin_empresa",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### 3. Validação de Acesso

```javascript
// Middleware de validação
export function validateTenantAccess(resourceTenantId, userTenantId, userRole) {
  // Super admin pode acessar qualquer tenant
  if (userRole === 'super_admin') {
    return true;
  }

  // Usuários normais só acessam seu próprio tenant
  return resourceTenantId === userTenantId;
}
```

## Fluxo de Autenticação

### 1. Login

```
┌──────────────────────────────────────────────────────┐
│ 1. Usuário entra email e senha                       │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ 2. API valida credenciais no banco                   │
│    SELECT * FROM usuarios WHERE email = ?            │
│    AND tenant_id = ?  (se aplicável)                 │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ 3. Comparar senha (bcryptjs)                         │
│    bcrypt.compare(senha_fornecida, senha_hash)       │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ 4. Gerar JWT com tenant_id                           │
│    jwt.sign({                                        │
│      id: usuario.id,                                 │
│      tenant_id: usuario.tenant_id,                   │
│      papel: usuario.papel                            │
│    }, JWT_SECRET)                                    │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ 5. Retornar token e dados do usuário                 │
└──────────────────────────────────────────────────────┘
```

### 2. Requisição Autenticada

```
┌──────────────────────────────────────────────────────┐
│ 1. Frontend envia requisição com token               │
│    Authorization: Bearer eyJhbGc...                  │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ 2. Middleware valida token                           │
│    jwt.verify(token, JWT_SECRET)                     │
│    Extrai: user.id, user.tenant_id, user.papel      │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ 3. Middleware aplica tenant_id à requisição          │
│    req.tenant_id = decoded.tenant_id                 │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ 4. Serviço executa query com filtro tenant_id        │
│    SELECT * FROM clientes                            │
│    WHERE tenant_id = ? AND id = ?                    │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ 5. Validar que recurso pertence ao tenant            │
│    if (resource.tenant_id !== req.tenant_id) {       │
│      throw new Error('Access denied')                │
│    }                                                 │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│ 6. Retornar dados ao usuário                         │
└──────────────────────────────────────────────────────┘
```

## Validação de Acesso

### Padrão de Validação

```javascript
// Exemplo: Obter cliente
export async function obterCliente(tenantId, clienteId) {
  // 1. Buscar cliente
  const cliente = await db.select().from(clientes)
    .where(and(
      eq(clientes.id, clienteId),
      eq(clientes.tenant_id, tenantId)  // ← Filtro automático
    ));

  if (!cliente) {
    throw new Error('Cliente não encontrado');
  }

  // 2. Validar tenant_id (redundante, mas importante)
  if (cliente.tenant_id !== tenantId) {
    throw new Error('Acesso negado: tenant_id não corresponde');
  }

  return cliente;
}
```

### Controle de Acesso por Role

```javascript
// Middleware para validar role
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!allowedRoles.includes(req.user.papel)) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    next();
  };
}

// Uso em rotas
router.post('/clientes', 
  authMiddleware,
  requireRole('admin_empresa', 'operador_comercial'),
  criarClienteHandler
);
```

## Boas Práticas

### ✅ Fazer

1. **Sempre filtrar por tenant_id**
   ```javascript
   // ✅ Correto
   const clientes = await db.select()
     .from(clientes)
     .where(eq(clientes.tenant_id, req.tenant_id));
   ```

2. **Validar tenant_id em múltiplas camadas**
   ```javascript
   // ✅ Validar no middleware
   if (req.user.tenant_id !== req.tenant_id) {
     throw new Error('Tenant mismatch');
   }

   // ✅ Validar no serviço
   if (resource.tenant_id !== tenantId) {
     throw new Error('Access denied');
   }
   ```

3. **Usar índices em tenant_id**
   ```sql
   -- ✅ Sempre criar índice
   CREATE INDEX idx_tenant_id ON clientes(tenant_id);
   ```

4. **Registrar logs de auditoria**
   ```javascript
   // ✅ Registrar quem fez o quê
   await logAuditoria({
     tenant_id: req.tenant_id,
     usuario_id: req.user.id,
     entidade: 'clientes',
     entidade_id: cliente.id,
     acao: 'create',
     detalhes: cliente
   });
   ```

### ❌ Não Fazer

1. **Confiar apenas no frontend**
   ```javascript
   // ❌ Errado - Frontend pode ser manipulado
   if (req.body.tenant_id === req.user.tenant_id) {
     // ...
   }
   ```

2. **Fazer queries sem filtro tenant_id**
   ```javascript
   // ❌ Errado - Retorna dados de todos os tenants
   const clientes = await db.select().from(clientes);
   ```

3. **Usar string de tenant_id em queries**
   ```javascript
   // ❌ Errado - Vulnerável a SQL injection
   const query = `SELECT * FROM clientes WHERE tenant_id = '${tenantId}'`;
   ```

4. **Armazenar tenant_id em localStorage sem validação**
   ```javascript
   // ❌ Errado - Pode ser manipulado
   const tenantId = localStorage.getItem('tenant_id');
   ```

## Segurança de Senhas

### Hash com bcryptjs

```javascript
// Registrar usuário
const senhaHash = await bcryptjs.hash(senha, 10);
await db.insert(usuarios).values({
  ...usuario,
  senha_hash: senhaHash
});

// Autenticar
const senhaValida = await bcryptjs.compare(senha, usuario.senha_hash);
```

## Logs de Auditoria

### Rastreamento Completo

```javascript
// Registrar todas as ações
await db.insert(logs_auditoria).values({
  id: uuidv4(),
  tenant_id: req.tenant_id,
  usuario_id: req.user.id,
  entidade: 'clientes',
  entidade_id: cliente.id,
  acao: 'create',  // create, update, delete, login, logout
  data_hora: new Date(),
  detalhes: {
    nome_razao: cliente.nome_razao,
    cpf_cnpj: cliente.cpf_cnpj,
    // ...
  }
});
```

## Testes de Segurança

### Cenários de Teste

1. **Isolamento de Dados**
   ```javascript
   // Usuário do Tenant 1 não pode acessar dados do Tenant 2
   const cliente = await obterCliente(tenant2Id, cliente2Id);
   // Deve retornar erro: "Access denied"
   ```

2. **Validação de Role**
   ```javascript
   // Operador comercial não pode deletar cliente
   // Deve retornar erro: "Insufficient permissions"
   ```

3. **Token Expirado**
   ```javascript
   // Token expirado deve ser rejeitado
   // Deve retornar erro: "Invalid or expired token"
   ```

4. **Super Admin Access**
   ```javascript
   // Super admin pode acessar qualquer tenant
   const cliente = await obterClienteComTenant(tenant2Id, cliente2Id);
   // Deve retornar o cliente
   ```

## Escalabilidade Futura

### Row Level Security (RLS) no PostgreSQL

Para maior segurança, considere implementar RLS:

```sql
-- Criar política de RLS
CREATE POLICY tenant_isolation ON clientes
  USING (tenant_id = current_setting('app.current_tenant_id'));

-- Setar tenant_id na sessão
SET app.current_tenant_id = 'tenant-uuid';
```

### Sharding

Para escala muito grande, considere:

- **Sharding por tenant_id**: Cada tenant em um banco separado
- **Sharding por região**: Diferentes regiões em diferentes bancos
- **Cache distribuído**: Redis para cache de dados

---

**Última atualização**: 2026-03-20  
**Versão**: 1.0
