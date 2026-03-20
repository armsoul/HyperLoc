import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_demo_hyperloc_2026'

// Middleware
app.use(cors())
app.use(express.json())

// ============================================================================
// DADOS EM MEMÓRIA (Demo)
// ============================================================================

const usuarios = [
  {
    id: '1',
    tenant_id: 'tenant-1',
    nome: 'Super Administrador',
    email: 'super@hyperloc.com',
    senha_hash: bcryptjs.hashSync('admin123', 10),
    papel: 'super_admin',
    ativo: true
  },
  {
    id: '2',
    tenant_id: 'tenant-1',
    nome: 'Administrador Empresa',
    email: 'admin@hyperloc.com',
    senha_hash: bcryptjs.hashSync('123456', 10),
    papel: 'admin_empresa',
    ativo: true
  },
  {
    id: '3',
    tenant_id: 'tenant-1',
    nome: 'Operador Comercial',
    email: 'operador@hyperloc.com',
    senha_hash: bcryptjs.hashSync('123456', 10),
    papel: 'operador_comercial',
    ativo: true
  },
  {
    id: '4',
    tenant_id: 'tenant-1',
    nome: 'Responsável Manutenção',
    email: 'manutencao@hyperloc.com',
    senha_hash: bcryptjs.hashSync('123456', 10),
    papel: 'manutencao',
    ativo: true
  },
  {
    id: '5',
    tenant_id: 'tenant-1',
    nome: 'Responsável Financeiro',
    email: 'financeiro@hyperloc.com',
    senha_hash: bcryptjs.hashSync('123456', 10),
    papel: 'financeiro',
    ativo: true
  }
]

const clientes = [
  {
    id: 'cli-1',
    tenant_id: 'tenant-1',
    tipo: 'PJ',
    nome_razao: 'Construtora ABC Ltda',
    cpf_cnpj: '11.222.333/0001-44',
    email: 'contato@construtora.com',
    telefone: '11-3333-4444',
    cidade: 'São Paulo',
    uf: 'SP',
    status: 'ativo'
  },
  {
    id: 'cli-2',
    tenant_id: 'tenant-1',
    tipo: 'PJ',
    nome_razao: 'Empresa de Eventos XYZ',
    cpf_cnpj: '55.666.777/0001-88',
    email: 'eventos@xyz.com',
    telefone: '11-9999-8888',
    cidade: 'São Paulo',
    uf: 'SP',
    status: 'ativo'
  }
]

const categorias = [
  {
    id: 'cat-1',
    tenant_id: 'tenant-1',
    nome: 'Escavadeiras',
    descricao: 'Máquinas escavadoras de diversos tamanhos'
  },
  {
    id: 'cat-2',
    tenant_id: 'tenant-1',
    nome: 'Pás Carregadeiras',
    descricao: 'Pás carregadeiras para movimentação de terra'
  },
  {
    id: 'cat-3',
    tenant_id: 'tenant-1',
    nome: 'Compressores',
    descricao: 'Compressores de ar para diversos usos'
  }
]

const equipamentos = [
  {
    id: 'eq-1',
    tenant_id: 'tenant-1',
    codigo_interno: 'ESC-001',
    descricao: 'Escavadeira Caterpillar 320',
    categoria_id: 'cat-1',
    numero_serie: 'SN123456',
    fabricante: 'Caterpillar',
    modelo: '320',
    ano_fabricacao: 2020,
    valor_aquisicao: 150000,
    status_estoque: 'disponivel',
    localizacao_atual: 'Galpão A'
  },
  {
    id: 'eq-2',
    tenant_id: 'tenant-1',
    codigo_interno: 'PA-001',
    descricao: 'Pá Carregadeira Volvo L60H',
    categoria_id: 'cat-2',
    numero_serie: 'SN789012',
    fabricante: 'Volvo',
    modelo: 'L60H',
    ano_fabricacao: 2019,
    valor_aquisicao: 120000,
    status_estoque: 'disponivel',
    localizacao_atual: 'Galpão B'
  },
  {
    id: 'eq-3',
    tenant_id: 'tenant-1',
    codigo_interno: 'COMP-001',
    descricao: 'Compressor de Ar Atlas Copco',
    categoria_id: 'cat-3',
    numero_serie: 'SN345678',
    fabricante: 'Atlas Copco',
    modelo: 'GA15',
    ano_fabricacao: 2021,
    valor_aquisicao: 25000,
    status_estoque: 'disponivel',
    localizacao_atual: 'Galpão C'
  }
]

const orcamentos = []
const pedidos = []
const lancamentos = []

// ============================================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================================================

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' })
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    req.tenant_id = decoded.tenant_id
    next()
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' })
  }
}

// ============================================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================================

app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body
  
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' })
  }
  
  const usuario = usuarios.find(u => u.email === email)
  
  if (!usuario) {
    return res.status(401).json({ erro: 'Usuário não encontrado' })
  }
  
  const senhaValida = bcryptjs.compareSync(senha, usuario.senha_hash)
  
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Senha incorreta' })
  }
  
  const token = jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tenant_id: usuario.tenant_id,
      papel: usuario.papel
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
  
  res.json({
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tenant_id: usuario.tenant_id,
      papel: usuario.papel
    }
  })
})

app.get('/auth/me', authMiddleware, (req, res) => {
  const usuario = usuarios.find(u => u.id === req.user.id)
  
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' })
  }
  
  res.json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tenant_id: usuario.tenant_id,
    papel: usuario.papel
  })
})

// ============================================================================
// ROTAS DE CLIENTES
// ============================================================================

app.get('/clientes', authMiddleware, (req, res) => {
  const clientesTenant = clientes.filter(c => c.tenant_id === req.tenant_id)
  res.json(clientesTenant)
})

app.post('/clientes', authMiddleware, (req, res) => {
  const { tipo, nome_razao, cpf_cnpj, email, telefone, cidade, uf } = req.body
  
  if (!tipo || !nome_razao || !cpf_cnpj) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' })
  }
  
  const novoCliente = {
    id: 'cli-' + Date.now(),
    tenant_id: req.tenant_id,
    tipo,
    nome_razao,
    cpf_cnpj,
    email,
    telefone,
    cidade,
    uf,
    status: 'ativo'
  }
  
  clientes.push(novoCliente)
  res.status(201).json(novoCliente)
})

app.get('/clientes/:id', authMiddleware, (req, res) => {
  const cliente = clientes.find(c => c.id === req.params.id && c.tenant_id === req.tenant_id)
  
  if (!cliente) {
    return res.status(404).json({ erro: 'Cliente não encontrado' })
  }
  
  res.json(cliente)
})

app.put('/clientes/:id', authMiddleware, (req, res) => {
  const cliente = clientes.find(c => c.id === req.params.id && c.tenant_id === req.tenant_id)
  
  if (!cliente) {
    return res.status(404).json({ erro: 'Cliente não encontrado' })
  }
  
  Object.assign(cliente, req.body)
  res.json(cliente)
})

// ============================================================================
// ROTAS DE EQUIPAMENTOS
// ============================================================================

app.get('/equipamentos', authMiddleware, (req, res) => {
  const equipsTenant = equipamentos.filter(e => e.tenant_id === req.tenant_id)
  res.json(equipsTenant)
})

app.post('/equipamentos', authMiddleware, (req, res) => {
  const { codigo_interno, descricao, categoria_id, numero_serie, fabricante, modelo, ano_fabricacao, valor_aquisicao } = req.body
  
  const novoEquip = {
    id: 'eq-' + Date.now(),
    tenant_id: req.tenant_id,
    codigo_interno,
    descricao,
    categoria_id,
    numero_serie,
    fabricante,
    modelo,
    ano_fabricacao,
    valor_aquisicao,
    status_estoque: 'disponivel',
    localizacao_atual: 'Galpão'
  }
  
  equipamentos.push(novoEquip)
  res.status(201).json(novoEquip)
})

app.get('/equipamentos/categorias', authMiddleware, (req, res) => {
  const catsTenant = categorias.filter(c => c.tenant_id === req.tenant_id)
  res.json(catsTenant)
})

// ============================================================================
// ROTAS DE ORÇAMENTOS
// ============================================================================

app.get('/comercial/orcamentos', authMiddleware, (req, res) => {
  const orcsTenant = orcamentos.filter(o => o.tenant_id === req.tenant_id)
  res.json(orcsTenant)
})

app.post('/comercial/orcamentos', authMiddleware, (req, res) => {
  const { numero, cliente_id, desconto, observacoes } = req.body
  
  const novoOrc = {
    id: 'orc-' + Date.now(),
    tenant_id: req.tenant_id,
    numero,
    cliente_id,
    desconto: desconto || 0,
    observacoes,
    status: 'aberto',
    itens: [],
    valor_total: 0,
    data_criacao: new Date().toISOString()
  }
  
  orcamentos.push(novoOrc)
  res.status(201).json(novoOrc)
})

// ============================================================================
// ROTAS DE PEDIDOS
// ============================================================================

app.get('/comercial/pedidos', authMiddleware, (req, res) => {
  const pedidosTenant = pedidos.filter(p => p.tenant_id === req.tenant_id)
  res.json(pedidosTenant)
})

app.post('/comercial/pedidos', authMiddleware, (req, res) => {
  const { numero, cliente_id, data_inicio_locacao, data_fim_prevista, observacoes } = req.body
  
  const novoPedido = {
    id: 'ped-' + Date.now(),
    tenant_id: req.tenant_id,
    numero,
    cliente_id,
    data_inicio_locacao,
    data_fim_prevista,
    observacoes,
    status: 'aberto',
    itens: [],
    valor_total: 0,
    data_criacao: new Date().toISOString()
  }
  
  pedidos.push(novoPedido)
  res.status(201).json(novoPedido)
})

// ============================================================================
// ROTAS DE FINANCEIRO
// ============================================================================

app.get('/financeiro/lancamentos', authMiddleware, (req, res) => {
  const lancsTenant = lancamentos.filter(l => l.tenant_id === req.tenant_id)
  res.json(lancsTenant)
})

app.post('/financeiro/lancamentos', authMiddleware, (req, res) => {
  const { tipo, historico, data_vencimento, valor_original, forma_pagamento } = req.body
  
  const novoLanc = {
    id: 'lanc-' + Date.now(),
    tenant_id: req.tenant_id,
    tipo,
    historico,
    data_vencimento,
    valor_original,
    forma_pagamento,
    status: 'aberto',
    data_criacao: new Date().toISOString()
  }
  
  lancamentos.push(novoLanc)
  res.status(201).json(novoLanc)
})

// ============================================================================
// ROTA DE DASHBOARD
// ============================================================================

app.get('/dashboard', authMiddleware, (req, res) => {
  const equipsTenant = equipamentos.filter(e => e.tenant_id === req.tenant_id)
  const clientesTenant = clientes.filter(c => c.tenant_id === req.tenant_id)
  const orcsTenant = orcamentos.filter(o => o.tenant_id === req.tenant_id)
  const pedidosTenant = pedidos.filter(p => p.tenant_id === req.tenant_id)
  
  res.json({
    resumo: {
      total_equipamentos: equipsTenant.length,
      equipamentos_disponiveis: equipsTenant.filter(e => e.status_estoque === 'disponivel').length,
      total_clientes: clientesTenant.length,
      total_orcamentos: orcsTenant.length,
      total_pedidos: pedidosTenant.length,
      orcamentos_abertos: orcsTenant.filter(o => o.status === 'aberto').length,
      pedidos_abertos: pedidosTenant.filter(p => p.status === 'aberto').length
    },
    equipamentos: equipsTenant.slice(0, 5),
    clientes: clientesTenant.slice(0, 5),
    orcamentos_recentes: orcsTenant.slice(0, 5),
    pedidos_recentes: pedidosTenant.slice(0, 5)
  })
})

// ============================================================================
// ROTA DE HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HyperLoc API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║               🚀 HyperLoc API - Versão Demo               ║
║                                                            ║
║  ✅ Servidor iniciado na porta ${PORT}                       ║
║  📍 URL: http://localhost:${PORT}                          ║
║  🔐 Autenticação: JWT                                      ║
║  💾 Dados: Em memória (Demo)                               ║
║                                                            ║
║  Credenciais de teste:                                    ║
║  Email: admin@hyperloc.com                                ║
║  Senha: 123456                                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `)
})
