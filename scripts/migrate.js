import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'hyperloc',
};

const SQL_SCHEMA = `
-- ============================================================================
-- TABELAS MULTI-TENANT
-- ============================================================================

-- Tabela de Tenants (Empresas)
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(36) PRIMARY KEY,
  nome_fantasia VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  inscricao_estadual VARCHAR(20),
  endereco VARCHAR(255),
  telefone VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  plano ENUM('starter', 'professional', 'enterprise') DEFAULT 'starter',
  status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  papel ENUM('super_admin', 'admin_empresa', 'operador_comercial', 'manutencao', 'financeiro') NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_login DATETIME,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY uk_email_tenant (email, tenant_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_papel (papel),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  tipo ENUM('PJ', 'PF') NOT NULL,
  nome_razao VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL,
  ie_rg VARCHAR(20),
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  observacoes TEXT,
  limite_credito DECIMAL(12, 2) DEFAULT 0,
  status ENUM('ativo', 'inativo') DEFAULT 'ativo',
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY uk_cpf_cnpj_tenant (cpf_cnpj, tenant_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_nome_razao (nome_razao),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  nome_razao VARCHAR(255) NOT NULL,
  cnpj_cpf VARCHAR(18) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  tipo_fornecedor ENUM('equipamento', 'servico', 'outros') NOT NULL,
  status ENUM('ativo', 'inativo') DEFAULT 'ativo',
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY uk_cnpj_cpf_tenant (cnpj_cpf, tenant_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_nome_razao (nome_razao),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  cargo VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Categorias de Equipamento
CREATE TABLE IF NOT EXISTS categorias_equipamento (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY uk_nome_tenant (nome, tenant_id),
  INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  codigo_interno VARCHAR(50) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  categoria_id VARCHAR(36) NOT NULL,
  numero_serie VARCHAR(100),
  fabricante VARCHAR(100),
  modelo VARCHAR(100),
  ano_fabricacao INT,
  valor_aquisicao DECIMAL(12, 2),
  data_aquisicao DATETIME,
  status_estoque ENUM('disponivel', 'locado', 'manutencao', 'reservado', 'inativo') DEFAULT 'disponivel',
  localizacao_atual VARCHAR(255),
  observacoes TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias_equipamento(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_codigo_tenant (codigo_interno, tenant_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_categoria_id (categoria_id),
  INDEX idx_status_estoque (status_estoque)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Tabela de Preço de Equipamento
CREATE TABLE IF NOT EXISTS tabela_preco_equipamento (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  equipamento_id VARCHAR(36) NOT NULL,
  tipo_periodo ENUM('dia', 'semana', 'mes') NOT NULL,
  valor_diaria DECIMAL(12, 2),
  valor_mensal DECIMAL(12, 2),
  desconto_maximo_permitido DECIMAL(5, 2) DEFAULT 0,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE CASCADE,
  UNIQUE KEY uk_equipamento_periodo_tenant (equipamento_id, tipo_periodo, tenant_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_equipamento_id (equipamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Orçamentos de Locação
CREATE TABLE IF NOT EXISTS orcamentos_locacao (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  numero VARCHAR(50) NOT NULL,
  cliente_id VARCHAR(36) NOT NULL,
  data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
  validade DATETIME,
  status ENUM('aberto', 'aprovado', 'rejeitado', 'cancelado') DEFAULT 'aberto',
  observacoes TEXT,
  total_bruto DECIMAL(12, 2) DEFAULT 0,
  desconto DECIMAL(12, 2) DEFAULT 0,
  total_liquido DECIMAL(12, 2) DEFAULT 0,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_numero_tenant (numero, tenant_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Itens de Orçamento
CREATE TABLE IF NOT EXISTS orcamentos_itens (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  orcamento_id VARCHAR(36) NOT NULL,
  equipamento_id VARCHAR(36) NOT NULL,
  quantidade INT NOT NULL,
  periodo INT NOT NULL,
  valor_unitario DECIMAL(12, 2) NOT NULL,
  valor_total DECIMAL(12, 2) NOT NULL,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (orcamento_id) REFERENCES orcamentos_locacao(id) ON DELETE CASCADE,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE RESTRICT,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_orcamento_id (orcamento_id),
  INDEX idx_equipamento_id (equipamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Pedidos de Locação
CREATE TABLE IF NOT EXISTS pedidos_locacao (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  numero VARCHAR(50) NOT NULL,
  origem_orcamento_id VARCHAR(36),
  cliente_id VARCHAR(36) NOT NULL,
  data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_inicio_locacao DATETIME,
  data_fim_prevista DATETIME,
  status ENUM('aberto', 'em_andamento', 'encerrado', 'cancelado') DEFAULT 'aberto',
  observacoes TEXT,
  valor_total_previsto DECIMAL(12, 2) DEFAULT 0,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (origem_orcamento_id) REFERENCES orcamentos_locacao(id) ON DELETE SET NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_numero_tenant (numero, tenant_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Itens de Pedido
CREATE TABLE IF NOT EXISTS pedidos_itens (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  pedido_id VARCHAR(36) NOT NULL,
  equipamento_id VARCHAR(36) NOT NULL,
  quantidade INT NOT NULL,
  periodo INT NOT NULL,
  valor_unitario DECIMAL(12, 2) NOT NULL,
  valor_total DECIMAL(12, 2) NOT NULL,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (pedido_id) REFERENCES pedidos_locacao(id) ON DELETE CASCADE,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE RESTRICT,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_pedido_id (pedido_id),
  INDEX idx_equipamento_id (equipamento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Movimentação de Estoque
CREATE TABLE IF NOT EXISTS movimento_estoque_equipamento (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  equipamento_id VARCHAR(36) NOT NULL,
  tipo ENUM('saida_locacao', 'devolucao', 'manutencao_saida', 'manutencao_retorno', 'ajuste') NOT NULL,
  data_movimento DATETIME DEFAULT CURRENT_TIMESTAMP,
  referencia_tipo ENUM('pedido', 'manutencao', 'ajuste'),
  referencia_id VARCHAR(36),
  observacoes TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE RESTRICT,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_equipamento_id (equipamento_id),
  INDEX idx_tipo (tipo),
  INDEX idx_data_movimento (data_movimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Ordens de Manutenção
CREATE TABLE IF NOT EXISTS ordens_manutencao (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  numero VARCHAR(50) NOT NULL,
  equipamento_id VARCHAR(36) NOT NULL,
  tipo ENUM('preventiva', 'corretiva') NOT NULL,
  data_abertura DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_previsao DATETIME,
  data_conclusao DATETIME,
  status ENUM('aberta', 'em_execucao', 'concluida', 'cancelada') DEFAULT 'aberta',
  responsavel_id VARCHAR(36),
  custo_estimado DECIMAL(12, 2),
  custo_real DECIMAL(12, 2),
  observacoes TEXT,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE RESTRICT,
  FOREIGN KEY (responsavel_id) REFERENCES colaboradores(id) ON DELETE SET NULL,
  UNIQUE KEY uk_numero_tenant (numero, tenant_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_equipamento_id (equipamento_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Lançamentos Financeiros
CREATE TABLE IF NOT EXISTS lancamentos_financeiro (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  tipo ENUM('pagar', 'receber') NOT NULL,
  origem ENUM('pedido_locacao', 'manutencao', 'manual') NOT NULL,
  origem_id VARCHAR(36),
  centro_custo VARCHAR(100),
  historico VARCHAR(255) NOT NULL,
  data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_vencimento DATETIME,
  data_pagamento_recebimento DATETIME,
  valor_original DECIMAL(12, 2) NOT NULL,
  valor_juros DECIMAL(12, 2) DEFAULT 0,
  valor_multa DECIMAL(12, 2) DEFAULT 0,
  valor_desconto DECIMAL(12, 2) DEFAULT 0,
  valor_liquido DECIMAL(12, 2) NOT NULL,
  status ENUM('aberto', 'liquidado', 'cancelado') DEFAULT 'aberto',
  forma_pagamento VARCHAR(50),
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_tipo (tipo),
  INDEX idx_status (status),
  INDEX idx_data_vencimento (data_vencimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Contas Bancárias
CREATE TABLE IF NOT EXISTS contas_bancarias (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  tipo ENUM('conta_corrente', 'caixa') NOT NULL,
  saldo_inicial DECIMAL(12, 2) DEFAULT 0,
  saldo_atual DECIMAL(12, 2) DEFAULT 0,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Movimentação de Caixa/Banco
CREATE TABLE IF NOT EXISTS movimentos_caixa_banco (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  conta_id VARCHAR(36) NOT NULL,
  data_movimento DATETIME DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('entrada', 'saida') NOT NULL,
  origem ENUM('lancamento_financeiro', 'ajuste') NOT NULL,
  origem_id VARCHAR(36),
  historico VARCHAR(255) NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (conta_id) REFERENCES contas_bancarias(id) ON DELETE RESTRICT,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_conta_id (conta_id),
  INDEX idx_tipo (tipo),
  INDEX idx_data_movimento (data_movimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  usuario_id VARCHAR(36) NOT NULL,
  entidade VARCHAR(100) NOT NULL,
  entidade_id VARCHAR(36) NOT NULL,
  acao ENUM('create', 'update', 'delete', 'login', 'logout') NOT NULL,
  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  detalhes JSON,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_entidade (entidade),
  INDEX idx_data_hora (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function runMigration() {
  let connection;
  try {
    console.log('🚀 Iniciando migração do banco de dados...');

    // Conectar ao MySQL sem especificar banco de dados
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    // Criar banco de dados se não existir
    console.log(`📦 Criando banco de dados '${dbConfig.database}' se não existir...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);

    // Selecionar banco de dados
    await connection.execute(`USE \`${dbConfig.database}\``);

    // Executar schema
    console.log('📋 Criando tabelas...');
    const statements = SQL_SCHEMA.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('✅ Migração concluída com sucesso!');
    console.log('📊 Banco de dados pronto para uso');

  } catch (error) {
    console.error('❌ Erro durante migração:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
