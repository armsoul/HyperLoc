# Guia de Desenvolvimento - HyperLoc

## 📋 Índice

1. [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Padrões de Código](#padrões-de-código)
4. [Adicionando Novas Funcionalidades](#adicionando-novas-funcionalidades)
5. [Testes](#testes)
6. [Deployment](#deployment)

## Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 18+
- MySQL 8.0+ ou TiDB
- npm ou pnpm
- Git

### Setup Inicial

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/hyperloc.git
cd hyperloc

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Criar banco de dados
npm run db:migrate

# 5. Seed com dados de demo
npm run db:seed

# 6. Iniciar servidor (Terminal 1)
npm run server

# 7. Iniciar frontend (Terminal 2)
npm run dev
```

### Variáveis de Ambiente

```bash
# .env
NODE_ENV=development
PORT=5000
VITE_API_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=hyperloc

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=24h

# App
APP_NAME=HyperLoc
APP_VERSION=1.0.0
```

## Estrutura do Projeto

```
hyperloc/
├── src/
│   ├── db/
│   │   ├── schema.js              # Definição de tabelas
│   │   └── connection.js          # Conexão com banco
│   ├── middleware/
│   │   ├── auth.js                # Autenticação JWT
│   │   └── tenant.js              # Isolamento multi-tenant
│   ├── services/
│   │   ├── authService.js         # Lógica de autenticação
│   │   ├── tenantService.js       # Gerenciamento de tenants
│   │   ├── clienteService.js      # Gerenciamento de clientes
│   │   ├── equipamentoService.js  # Gerenciamento de equipamentos
│   │   ├── orcamentoService.js    # Gerenciamento de orçamentos
│   │   ├── pedidoService.js       # Gerenciamento de pedidos
│   │   ├── manutencaoService.js   # Gerenciamento de manutenção
│   │   └── financeiroService.js   # Gerenciamento financeiro
│   ├── routes/
│   │   ├── auth.js                # Rotas de autenticação
│   │   ├── tenants.js             # Rotas de tenants
│   │   ├── clientes.js            # Rotas de clientes
│   │   ├── equipamentos.js        # Rotas de equipamentos
│   │   ├── orcamentos.js          # Rotas de orçamentos
│   │   ├── pedidos.js             # Rotas de pedidos
│   │   ├── manutencao.js          # Rotas de manutenção
│   │   └── financeiro.js          # Rotas de financeiro
│   ├── components/
│   │   ├── Layout.jsx             # Layout principal
│   │   ├── Sidebar.jsx            # Barra lateral
│   │   ├── ProtectedRoute.jsx     # Rota protegida
│   │   └── ...                    # Componentes reutilizáveis
│   ├── pages/
│   │   ├── Login.jsx              # Página de login
│   │   ├── Dashboard.jsx          # Dashboard
│   │   ├── Clientes.jsx           # Gerenciamento de clientes
│   │   ├── Equipamentos.jsx       # Gerenciamento de equipamentos
│   │   ├── Orcamentos.jsx         # Gerenciamento de orçamentos
│   │   ├── Pedidos.jsx            # Gerenciamento de pedidos
│   │   ├── Manutencao.jsx         # Gerenciamento de manutenção
│   │   ├── Financeiro.jsx         # Gerenciamento financeiro
│   │   └── NotFound.jsx           # Página 404
│   ├── utils/
│   │   ├── api.js                 # Cliente HTTP
│   │   ├── formatters.js          # Formatadores
│   │   └── validators.js          # Validadores
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
└── README.md                      # Documentação principal
```

## Padrões de Código

### Backend - Serviço

```javascript
// src/services/clienteService.js

import { getDatabase } from '../db/connection.js';
import { clientes } from '../db/schema.js';
import { eq, and, like } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase();

/**
 * Criar novo cliente
 * @param {string} tenantId - ID do tenant
 * @param {object} dados - Dados do cliente
 * @returns {Promise<object>} Cliente criado
 */
export async function criarCliente(tenantId, dados) {
  try {
    const novoCliente = {
      id: uuidv4(),
      tenant_id: tenantId,
      tipo: dados.tipo,
      nome_razao: dados.nome_razao,
      // ... outros campos
    };

    await db.insert(clientes).values(novoCliente);
    return novoCliente;
  } catch (error) {
    throw new Error(`Error creating client: ${error.message}`);
  }
}

/**
 * Obter cliente por ID
 * @param {string} tenantId - ID do tenant
 * @param {string} clienteId - ID do cliente
 * @returns {Promise<object>} Cliente encontrado
 */
export async function obterCliente(tenantId, clienteId) {
  try {
    const clienteList = await db
      .select()
      .from(clientes)
      .where(and(
        eq(clientes.id, clienteId),
        eq(clientes.tenant_id, tenantId)  // ← Isolamento
      ))
      .limit(1);

    if (clienteList.length === 0) {
      throw new Error('Client not found');
    }

    return clienteList[0];
  } catch (error) {
    throw new Error(`Error fetching client: ${error.message}`);
  }
}
```

### Backend - Rota

```javascript
// src/routes/clientes.js

import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import { criarCliente, obterCliente } from '../services/clienteService.js';

const router = express.Router();

// Aplicar middlewares
router.use(authMiddleware, tenantMiddleware);

/**
 * POST /clientes
 * Criar novo cliente
 */
router.post('/', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const { tipo, nome_razao, cpf_cnpj, ...dados } = req.body;

    if (!tipo || !nome_razao || !cpf_cnpj) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const cliente = await criarCliente(req.tenant_id, {
      tipo,
      nome_razao,
      cpf_cnpj,
      ...dados
    });

    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /clientes/:id
 * Obter cliente específico
 */
router.get('/:id', async (req, res) => {
  try {
    const cliente = await obterCliente(req.tenant_id, req.params.id);
    res.json(cliente);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
```

### Frontend - Página

```javascript
// src/pages/Clientes.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Clientes({ user }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/clientes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClientes(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Clientes</h1>
      {error && <div className="error">{error}</div>}
      <table>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id}>
              <td>{cliente.nome_razao}</td>
              <td>{cliente.cpf_cnpj}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Adicionando Novas Funcionalidades

### Exemplo: Adicionar Módulo de Fornecedores

#### 1. Criar Serviço

```javascript
// src/services/fornecedorService.js

export async function criarFornecedor(tenantId, dados) {
  // Implementação
}

export async function obterFornecedor(tenantId, fornecedorId) {
  // Implementação
}

export async function listarFornecedores(tenantId, filtros = {}) {
  // Implementação
}
```

#### 2. Criar Rotas

```javascript
// src/routes/fornecedores.js

import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import { criarFornecedor, obterFornecedor, listarFornecedores } from '../services/fornecedorService.js';

const router = express.Router();
router.use(authMiddleware, tenantMiddleware);

router.post('/', requireRole('admin_empresa'), async (req, res) => {
  // POST /fornecedores
});

router.get('/', async (req, res) => {
  // GET /fornecedores
});

export default router;
```

#### 3. Registrar Rotas no Server

```javascript
// server.js

import fornecedoresRoutes from './src/routes/fornecedores.js';

app.use('/fornecedores', fornecedoresRoutes);
```

#### 4. Criar Página React

```javascript
// src/pages/Fornecedores.jsx

export default function Fornecedores({ user }) {
  // Implementação
}
```

#### 5. Adicionar ao App.jsx

```javascript
// src/App.jsx

import Fornecedores from './pages/Fornecedores'

// Adicionar rota
<Route path="/fornecedores" element={<ProtectedRoute>...</ProtectedRoute>} />
```

## Testes

### Testes Manuais

```bash
# 1. Testar login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hyperloc.com","senha":"123456"}'

# 2. Listar clientes
curl -X GET http://localhost:5000/clientes \
  -H "Authorization: Bearer SEU_TOKEN_JWT"

# 3. Criar cliente
curl -X POST http://localhost:5000/clientes \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo":"PJ",
    "nome_razao":"Nova Empresa",
    "cpf_cnpj":"12.345.678/0001-90",
    "email":"contato@empresa.com"
  }'
```

### Testes de Segurança

```javascript
// Testar isolamento de tenant
// 1. Fazer login como usuário do Tenant 1
// 2. Tentar acessar cliente do Tenant 2
// 3. Deve retornar erro 404 ou 403
```

## Deployment

### Build para Produção

```bash
# Frontend
npm run build

# Resultado em: dist/

# Backend
# Copiar server.js e src/ para servidor
```

### Variáveis de Produção

```bash
# .env.production
NODE_ENV=production
PORT=5000
VITE_API_URL=https://api.hyperloc.com

# Database
DB_HOST=db.production.com
DB_PORT=3306
DB_USER=hyperloc_user
DB_PASSWORD=senha_segura_aqui
DB_NAME=hyperloc

# JWT
JWT_SECRET=chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=24h

# App
APP_NAME=HyperLoc
APP_VERSION=1.0.0
```

### Docker (Opcional)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

```bash
# Build e run
docker build -t hyperloc:1.0 .
docker run -p 5000:5000 --env-file .env.production hyperloc:1.0
```

---

**Última atualização**: 2026-03-20  
**Versão**: 1.0
