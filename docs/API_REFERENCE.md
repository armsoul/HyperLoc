# Referência de API - HyperLoc

## Base URL

```
http://localhost:5000
```

## Autenticação

Todas as requisições (exceto `/auth/login` e `/auth/register`) requerem um token JWT no header:

```
Authorization: Bearer {token}
```

---

## 🔐 Autenticação

### POST /auth/login
Login de usuário

**Request:**
```json
{
  "email": "usuario@empresa.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "usuario@empresa.com",
    "papel": "admin_empresa",
    "tenant_id": "uuid"
  }
}
```

---

## 👥 Clientes

### GET /clientes
Listar clientes do tenant

**Query Parameters:**
- `tipo`: PF ou PJ (opcional)
- `status`: ativo, inativo (opcional)

**Response:**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "tipo": "PJ",
    "nome_razao": "Empresa XYZ",
    "cpf_cnpj": "12.345.678/0001-90",
    "email": "contato@empresa.com",
    "telefone": "(11) 3000-0000",
    "status": "ativo"
  }
]
```

### POST /clientes
Criar novo cliente

**Request:**
```json
{
  "tipo": "PJ",
  "nome_razao": "Empresa XYZ",
  "cpf_cnpj": "12.345.678/0001-90",
  "email": "contato@empresa.com",
  "telefone": "(11) 3000-0000"
}
```

### GET /clientes/:id
Obter cliente específico

### PUT /clientes/:id
Atualizar cliente

---

## 🔧 Equipamentos

### GET /equipamentos
Listar equipamentos

**Query Parameters:**
- `categoria_id`: uuid (opcional)
- `status_estoque`: disponivel, locado, manutencao, reservado, inativo (opcional)
- `descricao`: string (opcional)

### POST /equipamentos
Criar novo equipamento

**Request:**
```json
{
  "codigo_interno": "EQ-001",
  "descricao": "Escavadeira CAT 320",
  "categoria_id": "uuid",
  "numero_serie": "ABC123456",
  "fabricante": "Caterpillar",
  "modelo": "320",
  "ano_fabricacao": 2022,
  "valor_aquisicao": 150000.00,
  "localizacao_atual": "Galpão A"
}
```

### GET /equipamentos/categorias
Listar categorias de equipamentos

### POST /equipamentos/categorias
Criar nova categoria

**Request:**
```json
{
  "nome": "Escavadeiras",
  "descricao": "Máquinas escavadoras de terra"
}
```

### POST /equipamentos/:id/precos
Criar tabela de preço

**Request:**
```json
{
  "tipo_periodo": "diaria",
  "valor_diaria": 500.00,
  "valor_mensal": 10000.00,
  "desconto_maximo_permitido": 10
}
```

---

## 📋 Orçamentos

### GET /comercial/orcamentos
Listar orçamentos

**Query Parameters:**
- `status`: aberto, aprovado, rejeitado, cancelado (opcional)
- `cliente_id`: uuid (opcional)

### POST /comercial/orcamentos
Criar novo orçamento

**Request:**
```json
{
  "numero": "ORC-001",
  "cliente_id": "uuid",
  "validade": "2026-04-20T23:59:59Z",
  "desconto": 0,
  "observacoes": "Observações do orçamento"
}
```

### POST /comercial/orcamentos/:id/itens
Adicionar item ao orçamento

**Request:**
```json
{
  "equipamento_id": "uuid",
  "quantidade": 2,
  "periodo": "diaria",
  "valor_unitario": 500.00
}
```

### GET /comercial/orcamentos/:id/itens
Listar itens do orçamento

### POST /comercial/orcamentos/:id/converter
Converter orçamento em pedido

**Request:**
```json
{
  "numero_pedido": "PED-001"
}
```

---

## 📦 Pedidos

### GET /comercial/pedidos
Listar pedidos

**Query Parameters:**
- `status`: aberto, em_andamento, encerrado, cancelado (opcional)
- `cliente_id`: uuid (opcional)

### POST /comercial/pedidos
Criar novo pedido

**Request:**
```json
{
  "numero": "PED-001",
  "cliente_id": "uuid",
  "data_inicio_locacao": "2026-03-25T08:00:00Z",
  "data_fim_prevista": "2026-04-25T17:00:00Z",
  "observacoes": "Observações do pedido"
}
```

### POST /comercial/pedidos/:id/itens
Adicionar item ao pedido

**Request:**
```json
{
  "equipamento_id": "uuid",
  "quantidade": 1,
  "periodo": "diaria",
  "valor_unitario": 500.00
}
```

### GET /comercial/pedidos/:id/itens
Listar itens do pedido

---

## 🔨 Manutenção

### GET /manutencao
Listar ordens de manutenção

**Query Parameters:**
- `status`: aberta, em_execucao, concluida, cancelada (opcional)
- `equipamento_id`: uuid (opcional)
- `tipo`: preventiva, corretiva (opcional)

### POST /manutencao
Criar nova ordem de manutenção

**Request:**
```json
{
  "numero": "MAN-001",
  "equipamento_id": "uuid",
  "tipo": "preventiva",
  "data_previsao": "2026-04-01T08:00:00Z",
  "custo_estimado": 5000.00,
  "observacoes": "Manutenção preventiva"
}
```

### POST /manutencao/:id/iniciar
Iniciar manutenção

### POST /manutencao/:id/concluir
Concluir manutenção

**Request:**
```json
{
  "custo_real": 4800.00
}
```

### POST /manutencao/:id/cancelar
Cancelar manutenção

### GET /manutencao/equipamento/:equipamento_id/historico
Obter histórico de manutenção de um equipamento

---

## 💰 Financeiro

### GET /financeiro/lancamentos
Listar lançamentos financeiros

**Query Parameters:**
- `tipo`: receber, pagar (opcional)
- `status`: aberto, liquidado, cancelado (opcional)
- `data_vencimento_inicio`: date (opcional)
- `data_vencimento_fim`: date (opcional)

### POST /financeiro/lancamentos
Criar novo lançamento

**Request:**
```json
{
  "tipo": "receber",
  "historico": "Aluguel de equipamento",
  "data_vencimento": "2026-04-20",
  "valor_original": 5000.00,
  "forma_pagamento": "transferencia",
  "valor_juros": 0,
  "valor_multa": 0,
  "valor_desconto": 0
}
```

### POST /financeiro/lancamentos/:id/liquidar
Liquidar lançamento

**Request:**
```json
{
  "conta_bancaria_id": "uuid",
  "data_pagamento": "2026-03-20"
}
```

### POST /financeiro/lancamentos/:id/cancelar
Cancelar lançamento

### GET /financeiro/contas
Listar contas bancárias

### POST /financeiro/contas
Criar nova conta bancária

**Request:**
```json
{
  "nome": "Conta Corrente Principal",
  "tipo": "conta_corrente",
  "banco": "Banco do Brasil",
  "agencia": "0001",
  "conta": "123456-7",
  "saldo_inicial": 10000.00
}
```

### GET /financeiro/contas/:id/movimentos
Listar movimentos de uma conta

**Query Parameters:**
- `data_inicio`: date (opcional)
- `data_fim`: date (opcional)

### GET /financeiro/fluxo-caixa
Obter fluxo de caixa

**Query Parameters:**
- `data_inicio`: date (obrigatório)
- `data_fim`: date (obrigatório)

**Response:**
```json
{
  "periodo": {
    "inicio": "2026-03-20",
    "fim": "2026-04-20"
  },
  "entradas_previstas": 50000.00,
  "saidas_previstas": 30000.00,
  "saldo_projetado": 35000.00,
  "saldo_atual": 15000.00,
  "total_lancamentos": 10,
  "lancamentos_abertos": 5,
  "lancamentos_liquidados": 5
}
```

### GET /financeiro/inadimplencia
Obter relatório de inadimplência

**Response:**
```json
{
  "total_titulos_atrasados": 3,
  "valor_total_atrasado": 15000.00,
  "titulos": [...]
}
```

---

## 🏢 Tenants (Super Admin)

### GET /tenants
Listar todos os tenants (Super Admin only)

### POST /tenants
Criar novo tenant (Super Admin only)

**Request:**
```json
{
  "nome_empresa": "Empresa XYZ",
  "cnpj": "12.345.678/0001-90",
  "email_admin": "admin@empresa.com",
  "plano": "profissional"
}
```

---

## Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou expirado |
| 403 | Forbidden - Acesso negado |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro do servidor |

---

## Papéis de Usuário (Roles)

| Papel | Descrição | Acesso |
|-------|-----------|--------|
| super_admin | Administrador do sistema | Todos os tenants |
| admin_empresa | Administrador da empresa | Todos os módulos do tenant |
| operador_comercial | Operador comercial | Clientes, Equipamentos, Orçamentos, Pedidos |
| manutencao | Técnico de manutenção | Manutenção |
| financeiro | Operador financeiro | Financeiro |

---

## Exemplo de Fluxo Completo

### 1. Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "senha": "123456"
  }'
```

### 2. Criar Cliente
```bash
curl -X POST http://localhost:5000/clientes \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "PJ",
    "nome_razao": "Empresa ABC",
    "cpf_cnpj": "12.345.678/0001-90",
    "email": "contato@empresa.com"
  }'
```

### 3. Listar Equipamentos
```bash
curl -X GET http://localhost:5000/equipamentos \
  -H "Authorization: Bearer {token}"
```

### 4. Criar Orçamento
```bash
curl -X POST http://localhost:5000/comercial/orcamentos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "ORC-001",
    "cliente_id": "{cliente_id}",
    "desconto": 0
  }'
```

---

**Última atualização**: 2026-03-20  
**Versão da API**: 1.0
