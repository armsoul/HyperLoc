# HyperLoc - Sistema SaaS Multi-Tenant para Locação de Equipamentos

![HyperLoc](https://img.shields.io/badge/HyperLoc-v1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Descrição

**HyperLoc** é um sistema web SaaS completo para gerenciamento de locação de equipamentos com arquitetura **multi-tenant** robusta. Cada cliente (empresa) possui isolamento total de dados, garantindo segurança e privacidade.

O sistema oferece módulos integrados para:
- 📊 **Dashboard** com métricas em tempo real
- 👥 **Gestão de Clientes** (PF e PJ)
- 🔧 **Controle de Equipamentos** com categorias e tabelas de preço
- 📋 **Orçamentos** com conversão automática em pedidos
- 📦 **Pedidos/Contratos** de locação
- 🔨 **Manutenção** preventiva e corretiva
- 💰 **Financeiro** com fluxo de caixa e inadimplência
- ⚙️ **Painel Super Admin** para gerenciar tenants

---

## 🎯 Objetivo

Construir um ERP especializado em locação de equipamentos que permita:

- ✅ Controlar estoque e disponibilidade de equipamentos
- ✅ Registrar orçamentos, pedidos e contratos de locação
- ✅ Gerenciar manutenções preventivas e corretivas
- ✅ Controlar o financeiro (contas a pagar, contas a receber, fluxo de caixa)
- ✅ Cadastrar clientes, fornecedores, colaboradores e usuários
- ✅ Operar como SaaS multi-tenant com isolamento forte de dados

---

## 🏗️ Arquitetura Multi-Tenant

### Modelo de Isolamento

- **Uma base de dados** com schema compartilhado
- **Coluna `tenant_id`** em todas as tabelas de negócio
- **Filtro automático** por tenant_id em todas as queries
- **Row Level Security (RLS)** no banco de dados
- **Validação de acesso** em todas as rotas da API

### Segurança

- ✅ Nenhum dado de um tenant vaza para outro
- ✅ Todas as APIs validam tenant_id da sessão contra tenant_id do recurso
- ✅ Logs de auditoria completos (quem fez o quê e quando)
- ✅ Senhas sempre com hash seguro (bcryptjs)

---

## 👥 Papéis de Usuário

Dentro de cada empresa (tenant), existem os seguintes papéis:

| Papel | Permissões |
|-------|-----------|
| **Super Admin** | Gerencia tenants, planos e métricas agregadas |
| **Admin Empresa** | Gerencia cadastros, equipamentos, relatórios |
| **Operador Comercial** | Cria orçamentos, pedidos e consulta estoque |
| **Responsável Manutenção** | Gerencia ordens de serviço e revisões |
| **Financeiro** | Gerencia contas a pagar/receber e fluxo de caixa |

---

## 📊 Entidades Principais

### Cadastros Básicos
- **Tenant**: Empresa/cliente do SaaS
- **Usuário**: Usuários do sistema
- **Cliente**: Clientes da empresa
- **Fornecedor**: Fornecedores de equipamentos/serviços
- **Colaborador**: Colaboradores da empresa

### Equipamentos
- **CategoriaEquipamento**: Categorias de equipamentos
- **Equipamento**: Equipamentos disponíveis para locação
- **TabelaPrecoEquipamento**: Tabelas de preço por período
- **MovimentoEstoqueEquipamento**: Histórico de movimentações

### Comercial
- **OrcamentoLocacao**: Orçamentos de locação
- **OrcamentoItem**: Itens dos orçamentos
- **PedidoLocacao**: Pedidos/contratos de locação
- **PedidoItem**: Itens dos pedidos

### Manutenção
- **OrdemManutencao**: Ordens de manutenção preventiva/corretiva

### Financeiro
- **LancamentoFinanceiro**: Contas a pagar/receber
- **ContaBancaria**: Contas bancárias e caixas
- **MovimentoCaixaBanco**: Movimentações de caixa/banco

### Auditoria
- **LogAuditoria**: Log de todas as ações do sistema

---

## 🚀 Stack Tecnológico

### Backend
- **Node.js** com Express
- **Drizzle ORM** para gerenciamento de banco de dados
- **MySQL/TiDB** como banco de dados
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

### Frontend
- **React 18** com Vite
- **React Router** para roteamento
- **TailwindCSS** para estilos
- **Axios** para requisições HTTP

---

## 📁 Estrutura de Diretórios

```
hyperloc/
├── src/
│   ├── db/
│   │   ├── schema.js              # Definição de tabelas
│   │   └── connection.js          # Conexão com banco de dados
│   ├── middleware/
│   │   ├── auth.js                # Autenticação JWT
│   │   └── tenant.js              # Isolamento multi-tenant
│   ├── services/
│   │   ├── authService.js         # Lógica de autenticação
│   │   ├── tenantService.js       # Gerenciamento de tenants
│   │   ├── clienteService.js      # Gerenciamento de clientes
│   │   ├── equipamentoService.js  # Gerenciamento de equipamentos
│   │   ├── comercialService.js    # Orçamentos e pedidos
│   │   ├── manutencaoService.js   # Gerenciamento de manutenção
│   │   └── financeiroService.js   # Gerenciamento financeiro
│   ├── routes/
│   │   ├── auth.js                # Rotas de autenticação
│   │   ├── tenants.js             # Rotas de tenants (super admin)
│   │   ├── clientes.js            # Rotas de clientes
│   │   ├── equipamentos.js        # Rotas de equipamentos
│   │   ├── comercial.js           # Rotas de orçamentos e pedidos
│   │   ├── manutencao.js          # Rotas de manutenção
│   │   └── financeiro.js          # Rotas de financeiro
│   ├── components/
│   │   ├── Layout.jsx             # Layout principal
│   │   ├── Sidebar.jsx            # Barra lateral
│   │   └── ProtectedRoute.jsx     # Rota protegida
│   ├── pages/
│   │   ├── Login.jsx              # Página de login
│   │   ├── Dashboard.jsx          # Dashboard
│   │   ├── Clientes.jsx           # Gerenciamento de clientes
│   │   ├── Equipamentos.jsx       # Gerenciamento de equipamentos
│   │   ├── Orcamentos.jsx         # Gerenciamento de orçamentos
│   │   ├── Pedidos.jsx            # Gerenciamento de pedidos
│   │   ├── Manutencao.jsx         # Gerenciamento de manutenção
│   │   ├── Financeiro.jsx         # Gerenciamento financeiro
│   │   ├── SuperAdmin.jsx         # Painel Super Admin
│   │   └── NotFound.jsx           # Página 404
│   ├── utils/
│   │   └── api.js                 # Cliente HTTP
│   ├── App.jsx                    # Componente principal
│   ├── main.jsx                   # Entry point React
│   └── index.css                  # Estilos globais
├── scripts/
│   ├── migrate.js                 # Script de migração
│   └── seed.js                    # Script de seed
├── docs/
│   ├── MULTI_TENANT_ARCHITECTURE.md
│   ├── DEVELOPMENT_GUIDE.md
│   └── API_REFERENCE.md
├── server.js                      # Servidor Express
├── vite.config.js                 # Configuração Vite
├── tailwind.config.js             # Configuração TailwindCSS
├── package.json                   # Dependências
├── .env                           # Variáveis de ambiente
└── README.md                      # Este arquivo
```

---

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+ ou TiDB
- npm ou pnpm

### Passos de Instalação

1. **Clonar o repositório**
```bash
git clone https://github.com/seu-usuario/hyperloc.git
cd hyperloc
```

2. **Instalar dependências**
```bash
npm install
# ou
pnpm install
```

3. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

4. **Inicializar banco de dados**
```bash
npm run db:migrate
npm run db:seed
```

5. **Iniciar servidor de desenvolvimento**
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

Acesse em: **http://localhost:5173**

---

## 🔐 Autenticação

### Credenciais de Demo

| Papel | Email | Senha |
|-------|-------|-------|
| Super Admin | super@hyperloc.com | admin123 |
| Admin Empresa | admin@empresa.com | admin123 |
| Operador Comercial | comercial@empresa.com | comercial123 |
| Manutenção | manutencao@empresa.com | manutencao123 |
| Financeiro | financeiro@empresa.com | financeiro123 |

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "senha": "admin123"
}
```

### Resposta
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid",
    "email": "admin@empresa.com",
    "nome": "Administrador",
    "tenant_id": "uuid",
    "papel": "admin_empresa"
  }
}
```

### Usar Token
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 API Endpoints Principais

### Autenticação
- `POST /auth/login` - Fazer login
- `POST /auth/register` - Registrar novo usuário
- `GET /auth/me` - Obter dados do usuário autenticado

### Clientes
- `GET /clientes` - Listar clientes
- `POST /clientes` - Criar novo cliente
- `GET /clientes/:id` - Obter cliente específico
- `PUT /clientes/:id` - Atualizar cliente

### Equipamentos
- `GET /equipamentos` - Listar equipamentos
- `POST /equipamentos` - Criar novo equipamento
- `GET /equipamentos/categorias` - Listar categorias
- `POST /equipamentos/categorias` - Criar categoria
- `POST /equipamentos/:id/precos` - Criar tabela de preço

### Orçamentos
- `GET /comercial/orcamentos` - Listar orçamentos
- `POST /comercial/orcamentos` - Criar orçamento
- `POST /comercial/orcamentos/:id/itens` - Adicionar item
- `POST /comercial/orcamentos/:id/converter` - Converter em pedido

### Pedidos
- `GET /comercial/pedidos` - Listar pedidos
- `POST /comercial/pedidos` - Criar pedido
- `POST /comercial/pedidos/:id/itens` - Adicionar item

### Manutenção
- `GET /manutencao` - Listar ordens
- `POST /manutencao` - Criar ordem
- `POST /manutencao/:id/iniciar` - Iniciar manutenção
- `POST /manutencao/:id/concluir` - Concluir manutenção

### Financeiro
- `GET /financeiro/lancamentos` - Listar lançamentos
- `POST /financeiro/lancamentos` - Criar lançamento
- `GET /financeiro/contas` - Listar contas
- `POST /financeiro/contas` - Criar conta
- `GET /financeiro/fluxo-caixa` - Fluxo de caixa
- `GET /financeiro/inadimplencia` - Relatório de inadimplência

### Super Admin
- `GET /tenants` - Listar tenants
- `POST /tenants` - Criar tenant

Veja [API_REFERENCE.md](./docs/API_REFERENCE.md) para documentação completa.

---

## 🧪 Testes

### Teste Manual com cURL

```bash
# 1. Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "senha": "admin123"
  }'

# 2. Listar clientes
curl -X GET http://localhost:5000/clientes \
  -H "Authorization: Bearer {token}"

# 3. Criar cliente
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

---

## 📚 Documentação Adicional

- [Arquitetura Multi-Tenant](./docs/MULTI_TENANT_ARCHITECTURE.md)
- [Guia de Desenvolvimento](./docs/DEVELOPMENT_GUIDE.md)
- [Referência de API](./docs/API_REFERENCE.md)

---

## 🔒 Segurança

### Implementado

- ✅ Hash de senhas com bcryptjs
- ✅ JWT com expiração configurável
- ✅ Validação de tenant_id em todas as rotas
- ✅ Middleware de autenticação
- ✅ Controle de acesso por role
- ✅ Isolamento multi-tenant em nível de banco de dados

### Recomendações para Produção

- Usar HTTPS/TLS
- Implementar rate limiting
- Adicionar CORS restritivo
- Usar variáveis de ambiente secretas
- Implementar RLS no banco de dados
- Adicionar 2FA para super admin
- Fazer backup regular do banco de dados
- Implementar logs de auditoria

---

## 📝 Funcionalidades

### ✅ Implementado (V1)

- **Autenticação**: Login, JWT, roles
- **Cadastros Básicos**: Clientes (CRUD)
- **Equipamentos**: CRUD, categorias, tabelas de preço
- **Comercial**: Orçamentos, pedidos, conversão
- **Manutenção**: Ordens preventiva/corretiva
- **Financeiro**: Lançamentos, contas, fluxo de caixa
- **Multi-tenant**: Isolamento de dados, validação de acesso
- **Super Admin**: Gerenciamento de tenants

### 🔄 Planejado (V2+)

- Integração com gateways de pagamento
- Emissão de NF-e
- Anexos de documentos
- Aplicativo mobile nativo
- Relatórios avançados em PDF
- Integração com sistemas externos
- Notificações por email/SMS
- Analytics avançado

---

## 🤝 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com o time de desenvolvimento.

---

## 📄 Licença

Propriedade privada. Todos os direitos reservados.

---

## 📞 Suporte

Para suporte e dúvidas, entre em contato através de support@hyperloc.com

---

**Desenvolvido com ❤️ por HyperLoc Team**  
**Última atualização**: 2026-03-20  
**Versão**: 1.0.0
