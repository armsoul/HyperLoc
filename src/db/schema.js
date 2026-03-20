import { mysqlTable, varchar, int, text, datetime, decimal, enum as mysqlEnum, boolean, json } from 'drizzle-orm/mysql-core';

// ============================================================================
// TABELAS MULTI-TENANT - TENANT
// ============================================================================

export const tenants = mysqlTable('tenants', {
  id: varchar('id', { length: 36 }).primaryKey(),
  nome_fantasia: varchar('nome_fantasia', { length: 255 }).notNull(),
  razao_social: varchar('razao_social', { length: 255 }).notNull(),
  cnpj: varchar('cnpj', { length: 18 }).unique(),
  inscricao_estadual: varchar('inscricao_estadual', { length: 20 }),
  endereco: varchar('endereco', { length: 255 }),
  telefone: varchar('telefone', { length: 20 }),
  email: varchar('email', { length: 255 }).notNull(),
  plano: mysqlEnum('plano', ['starter', 'professional', 'enterprise']).default('starter'),
  status: mysqlEnum('status', ['ativo', 'inativo', 'suspenso']).default('ativo'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

// ============================================================================
// TABELAS MULTI-TENANT - USUÁRIOS
// ============================================================================

export const usuarios = mysqlTable('usuarios', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  senha_hash: varchar('senha_hash', { length: 255 }).notNull(),
  papel: mysqlEnum('papel', ['super_admin', 'admin_empresa', 'operador_comercial', 'manutencao', 'financeiro']).notNull(),
  ativo: boolean('ativo').default(true),
  ultimo_login: datetime('ultimo_login'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

// ============================================================================
// TABELAS MULTI-TENANT - CADASTROS BÁSICOS
// ============================================================================

export const clientes = mysqlTable('clientes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  tipo: mysqlEnum('tipo', ['PJ', 'PF']).notNull(),
  nome_razao: varchar('nome_razao', { length: 255 }).notNull(),
  cpf_cnpj: varchar('cpf_cnpj', { length: 18 }).notNull(),
  ie_rg: varchar('ie_rg', { length: 20 }),
  telefone: varchar('telefone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  endereco: varchar('endereco', { length: 255 }),
  cidade: varchar('cidade', { length: 100 }),
  uf: varchar('uf', { length: 2 }),
  cep: varchar('cep', { length: 10 }),
  observacoes: text('observacoes'),
  limite_credito: decimal('limite_credito', { precision: 12, scale: 2 }).default('0'),
  status: mysqlEnum('status', ['ativo', 'inativo']).default('ativo'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

export const fornecedores = mysqlTable('fornecedores', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  nome_razao: varchar('nome_razao', { length: 255 }).notNull(),
  cnpj_cpf: varchar('cnpj_cpf', { length: 18 }).notNull(),
  telefone: varchar('telefone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  endereco: varchar('endereco', { length: 255 }),
  cidade: varchar('cidade', { length: 100 }),
  uf: varchar('uf', { length: 2 }),
  cep: varchar('cep', { length: 10 }),
  tipo_fornecedor: mysqlEnum('tipo_fornecedor', ['equipamento', 'servico', 'outros']).notNull(),
  status: mysqlEnum('status', ['ativo', 'inativo']).default('ativo'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

export const colaboradores = mysqlTable('colaboradores', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  cpf: varchar('cpf', { length: 14 }).unique(),
  telefone: varchar('telefone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  cargo: varchar('cargo', { length: 100 }),
  ativo: boolean('ativo').default(true),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

// ============================================================================
// TABELAS MULTI-TENANT - EQUIPAMENTOS
// ============================================================================

export const categorias_equipamento = mysqlTable('categorias_equipamento', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

export const equipamentos = mysqlTable('equipamentos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  codigo_interno: varchar('codigo_interno', { length: 50 }).notNull(),
  descricao: varchar('descricao', { length: 255 }).notNull(),
  categoria_id: varchar('categoria_id', { length: 36 }).notNull(),
  numero_serie: varchar('numero_serie', { length: 100 }),
  fabricante: varchar('fabricante', { length: 100 }),
  modelo: varchar('modelo', { length: 100 }),
  ano_fabricacao: int('ano_fabricacao'),
  valor_aquisicao: decimal('valor_aquisicao', { precision: 12, scale: 2 }),
  data_aquisicao: datetime('data_aquisicao'),
  status_estoque: mysqlEnum('status_estoque', ['disponivel', 'locado', 'manutencao', 'reservado', 'inativo']).default('disponivel'),
  localizacao_atual: varchar('localizacao_atual', { length: 255 }),
  observacoes: text('observacoes'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

export const tabela_preco_equipamento = mysqlTable('tabela_preco_equipamento', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  equipamento_id: varchar('equipamento_id', { length: 36 }).notNull(),
  tipo_periodo: mysqlEnum('tipo_periodo', ['dia', 'semana', 'mes']).notNull(),
  valor_diaria: decimal('valor_diaria', { precision: 12, scale: 2 }),
  valor_mensal: decimal('valor_mensal', { precision: 12, scale: 2 }),
  desconto_maximo_permitido: decimal('desconto_maximo_permitido', { precision: 5, scale: 2 }).default('0'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

// ============================================================================
// TABELAS MULTI-TENANT - ORÇAMENTOS
// ============================================================================

export const orcamentos_locacao = mysqlTable('orcamentos_locacao', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  numero: varchar('numero', { length: 50 }).notNull(),
  cliente_id: varchar('cliente_id', { length: 36 }).notNull(),
  data_emissao: datetime('data_emissao').defaultNow(),
  validade: datetime('validade'),
  status: mysqlEnum('status', ['aberto', 'aprovado', 'rejeitado', 'cancelado']).default('aberto'),
  observacoes: text('observacoes'),
  total_bruto: decimal('total_bruto', { precision: 12, scale: 2 }).default('0'),
  desconto: decimal('desconto', { precision: 12, scale: 2 }).default('0'),
  total_liquido: decimal('total_liquido', { precision: 12, scale: 2 }).default('0'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

export const orcamentos_itens = mysqlTable('orcamentos_itens', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  orcamento_id: varchar('orcamento_id', { length: 36 }).notNull(),
  equipamento_id: varchar('equipamento_id', { length: 36 }).notNull(),
  quantidade: int('quantidade').notNull(),
  periodo: int('periodo').notNull(), // em dias
  valor_unitario: decimal('valor_unitario', { precision: 12, scale: 2 }).notNull(),
  valor_total: decimal('valor_total', { precision: 12, scale: 2 }).notNull(),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

// ============================================================================
// TABELAS MULTI-TENANT - PEDIDOS E CONTRATOS
// ============================================================================

export const pedidos_locacao = mysqlTable('pedidos_locacao', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  numero: varchar('numero', { length: 50 }).notNull(),
  origem_orcamento_id: varchar('origem_orcamento_id', { length: 36 }),
  cliente_id: varchar('cliente_id', { length: 36 }).notNull(),
  data_emissao: datetime('data_emissao').defaultNow(),
  data_inicio_locacao: datetime('data_inicio_locacao'),
  data_fim_prevista: datetime('data_fim_prevista'),
  status: mysqlEnum('status', ['aberto', 'em_andamento', 'encerrado', 'cancelado']).default('aberto'),
  observacoes: text('observacoes'),
  valor_total_previsto: decimal('valor_total_previsto', { precision: 12, scale: 2 }).default('0'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

export const pedidos_itens = mysqlTable('pedidos_itens', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  pedido_id: varchar('pedido_id', { length: 36 }).notNull(),
  equipamento_id: varchar('equipamento_id', { length: 36 }).notNull(),
  quantidade: int('quantidade').notNull(),
  periodo: int('periodo').notNull(), // em dias
  valor_unitario: decimal('valor_unitario', { precision: 12, scale: 2 }).notNull(),
  valor_total: decimal('valor_total', { precision: 12, scale: 2 }).notNull(),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

// ============================================================================
// TABELAS MULTI-TENANT - ESTOQUE
// ============================================================================

export const movimento_estoque_equipamento = mysqlTable('movimento_estoque_equipamento', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  equipamento_id: varchar('equipamento_id', { length: 36 }).notNull(),
  tipo: mysqlEnum('tipo', ['saida_locacao', 'devolucao', 'manutencao_saida', 'manutencao_retorno', 'ajuste']).notNull(),
  data_movimento: datetime('data_movimento').defaultNow(),
  referencia_tipo: mysqlEnum('referencia_tipo', ['pedido', 'manutencao', 'ajuste']),
  referencia_id: varchar('referencia_id', { length: 36 }),
  observacoes: text('observacoes'),
  data_criacao: datetime('data_criacao').defaultNow(),
});

// ============================================================================
// TABELAS MULTI-TENANT - MANUTENÇÃO
// ============================================================================

export const ordens_manutencao = mysqlTable('ordens_manutencao', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  numero: varchar('numero', { length: 50 }).notNull(),
  equipamento_id: varchar('equipamento_id', { length: 36 }).notNull(),
  tipo: mysqlEnum('tipo', ['preventiva', 'corretiva']).notNull(),
  data_abertura: datetime('data_abertura').defaultNow(),
  data_previsao: datetime('data_previsao'),
  data_conclusao: datetime('data_conclusao'),
  status: mysqlEnum('status', ['aberta', 'em_execucao', 'concluida', 'cancelada']).default('aberta'),
  responsavel_id: varchar('responsavel_id', { length: 36 }),
  custo_estimado: decimal('custo_estimado', { precision: 12, scale: 2 }),
  custo_real: decimal('custo_real', { precision: 12, scale: 2 }),
  observacoes: text('observacoes'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

// ============================================================================
// TABELAS MULTI-TENANT - FINANCEIRO
// ============================================================================

export const lancamentos_financeiro = mysqlTable('lancamentos_financeiro', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  tipo: mysqlEnum('tipo', ['pagar', 'receber']).notNull(),
  origem: mysqlEnum('origem', ['pedido_locacao', 'manutencao', 'manual']).notNull(),
  origem_id: varchar('origem_id', { length: 36 }),
  centro_custo: varchar('centro_custo', { length: 100 }),
  historico: varchar('historico', { length: 255 }).notNull(),
  data_emissao: datetime('data_emissao').defaultNow(),
  data_vencimento: datetime('data_vencimento'),
  data_pagamento_recebimento: datetime('data_pagamento_recebimento'),
  valor_original: decimal('valor_original', { precision: 12, scale: 2 }).notNull(),
  valor_juros: decimal('valor_juros', { precision: 12, scale: 2 }).default('0'),
  valor_multa: decimal('valor_multa', { precision: 12, scale: 2 }).default('0'),
  valor_desconto: decimal('valor_desconto', { precision: 12, scale: 2 }).default('0'),
  valor_liquido: decimal('valor_liquido', { precision: 12, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['aberto', 'liquidado', 'cancelado']).default('aberto'),
  forma_pagamento: varchar('forma_pagamento', { length: 50 }),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

export const contas_bancarias = mysqlTable('contas_bancarias', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  nome: varchar('nome', { length: 255 }).notNull(),
  banco: varchar('banco', { length: 100 }),
  agencia: varchar('agencia', { length: 20 }),
  conta: varchar('conta', { length: 30 }),
  tipo: mysqlEnum('tipo', ['conta_corrente', 'caixa']).notNull(),
  saldo_inicial: decimal('saldo_inicial', { precision: 12, scale: 2 }).default('0'),
  saldo_atual: decimal('saldo_atual', { precision: 12, scale: 2 }).default('0'),
  data_criacao: datetime('data_criacao').defaultNow(),
  data_atualizacao: datetime('data_atualizacao').defaultNow(),
});

export const movimentos_caixa_banco = mysqlTable('movimentos_caixa_banco', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  conta_id: varchar('conta_id', { length: 36 }).notNull(),
  data_movimento: datetime('data_movimento').defaultNow(),
  tipo: mysqlEnum('tipo', ['entrada', 'saida']).notNull(),
  origem: mysqlEnum('origem', ['lancamento_financeiro', 'ajuste']).notNull(),
  origem_id: varchar('origem_id', { length: 36 }),
  historico: varchar('historico', { length: 255 }).notNull(),
  valor: decimal('valor', { precision: 12, scale: 2 }).notNull(),
  data_criacao: datetime('data_criacao').defaultNow(),
});

// ============================================================================
// TABELAS MULTI-TENANT - AUDITORIA
// ============================================================================

export const logs_auditoria = mysqlTable('logs_auditoria', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenant_id: varchar('tenant_id', { length: 36 }).notNull(),
  usuario_id: varchar('usuario_id', { length: 36 }).notNull(),
  entidade: varchar('entidade', { length: 100 }).notNull(),
  entidade_id: varchar('entidade_id', { length: 36 }).notNull(),
  acao: mysqlEnum('acao', ['create', 'update', 'delete', 'login', 'logout']).notNull(),
  data_hora: datetime('data_hora').defaultNow(),
  detalhes: json('detalhes'),
  data_criacao: datetime('data_criacao').defaultNow(),
});
