import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'hyperloc',
};

async function seed() {
  let connection;
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    connection = await mysql.createConnection(dbConfig);

    // IDs fixos para referência
    const superAdminId = uuidv4();
    const tenant1Id = uuidv4();
    const tenant2Id = uuidv4();
    const admin1Id = uuidv4();
    const admin2Id = uuidv4();
    const operador1Id = uuidv4();
    const manutencao1Id = uuidv4();
    const financeiro1Id = uuidv4();

    // Criar Super Admin
    console.log('👤 Criando Super Admin...');
    const superAdminSenha = await bcryptjs.hash('admin123', 10);
    
    // Criar Tenant 1
    console.log('🏢 Criando Tenant 1 (Empresa Demo)...');
    await connection.execute(
      `INSERT INTO tenants (id, nome_fantasia, razao_social, cnpj, email, plano, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tenant1Id, 'Empresa Demo', 'Empresa Demo Ltda', '12.345.678/0001-90', 'empresa1@hyperloc.com', 'professional', 'ativo']
    );

    // Criar Tenant 2
    console.log('🏢 Criando Tenant 2 (Empresa Teste)...');
    await connection.execute(
      `INSERT INTO tenants (id, nome_fantasia, razao_social, cnpj, email, plano, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tenant2Id, 'Empresa Teste', 'Empresa Teste Ltda', '98.765.432/0001-12', 'empresa2@hyperloc.com', 'starter', 'ativo']
    );

    // Criar usuários
    console.log('👥 Criando usuários...');

    // Super Admin (sem tenant específico, mas vamos usar tenant1 para referência)
    await connection.execute(
      `INSERT INTO usuarios (id, tenant_id, nome, email, senha_hash, papel, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [superAdminId, tenant1Id, 'Super Administrador', 'super@hyperloc.com', superAdminSenha, 'super_admin', true]
    );

    // Admin Tenant 1
    const admin1Senha = await bcryptjs.hash('123456', 10);
    await connection.execute(
      `INSERT INTO usuarios (id, tenant_id, nome, email, senha_hash, papel, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [admin1Id, tenant1Id, 'Administrador Empresa 1', 'admin@hyperloc.com', admin1Senha, 'admin_empresa', true]
    );

    // Operador Comercial Tenant 1
    const operador1Senha = await bcryptjs.hash('123456', 10);
    await connection.execute(
      `INSERT INTO usuarios (id, tenant_id, nome, email, senha_hash, papel, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [operador1Id, tenant1Id, 'Operador Comercial', 'operador@hyperloc.com', operador1Senha, 'operador_comercial', true]
    );

    // Manutenção Tenant 1
    const manutencao1Senha = await bcryptjs.hash('123456', 10);
    await connection.execute(
      `INSERT INTO usuarios (id, tenant_id, nome, email, senha_hash, papel, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [manutencao1Id, tenant1Id, 'Responsável Manutenção', 'manutencao@hyperloc.com', manutencao1Senha, 'manutencao', true]
    );

    // Financeiro Tenant 1
    const financeiro1Senha = await bcryptjs.hash('123456', 10);
    await connection.execute(
      `INSERT INTO usuarios (id, tenant_id, nome, email, senha_hash, papel, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [financeiro1Id, tenant1Id, 'Responsável Financeiro', 'financeiro@hyperloc.com', financeiro1Senha, 'financeiro', true]
    );

    // Admin Tenant 2
    const admin2Senha = await bcryptjs.hash('123456', 10);
    await connection.execute(
      `INSERT INTO usuarios (id, tenant_id, nome, email, senha_hash, papel, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [admin2Id, tenant2Id, 'Administrador Empresa 2', 'admin2@hyperloc.com', admin2Senha, 'admin_empresa', true]
    );

    // Criar clientes para Tenant 1
    console.log('👥 Criando clientes...');
    const cliente1Id = uuidv4();
    const cliente2Id = uuidv4();

    await connection.execute(
      `INSERT INTO clientes (id, tenant_id, tipo, nome_razao, cpf_cnpj, email, telefone, cidade, uf, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cliente1Id, tenant1Id, 'PJ', 'Construtora ABC Ltda', '11.222.333/0001-44', 'contato@construtora.com', '11-3333-4444', 'São Paulo', 'SP', 'ativo']
    );

    await connection.execute(
      `INSERT INTO clientes (id, tenant_id, tipo, nome_razao, cpf_cnpj, email, telefone, cidade, uf, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cliente2Id, tenant1Id, 'PJ', 'Empresa de Eventos XYZ', '55.666.777/0001-88', 'eventos@xyz.com', '11-9999-8888', 'São Paulo', 'SP', 'ativo']
    );

    // Criar categorias de equipamento
    console.log('🏷️  Criando categorias de equipamento...');
    const catEscavadeira = uuidv4();
    const catPá = uuidv4();
    const catCompressor = uuidv4();

    await connection.execute(
      `INSERT INTO categorias_equipamento (id, tenant_id, nome, descricao) 
       VALUES (?, ?, ?, ?)`,
      [catEscavadeira, tenant1Id, 'Escavadeiras', 'Máquinas escavadoras de diversos tamanhos']
    );

    await connection.execute(
      `INSERT INTO categorias_equipamento (id, tenant_id, nome, descricao) 
       VALUES (?, ?, ?, ?)`,
      [catPá, tenant1Id, 'Pás Carregadeiras', 'Pás carregadeiras para movimentação de terra']
    );

    await connection.execute(
      `INSERT INTO categorias_equipamento (id, tenant_id, nome, descricao) 
       VALUES (?, ?, ?, ?)`,
      [catCompressor, tenant1Id, 'Compressores', 'Compressores de ar para diversos usos']
    );

    // Criar equipamentos
    console.log('🔧 Criando equipamentos...');
    const eq1Id = uuidv4();
    const eq2Id = uuidv4();
    const eq3Id = uuidv4();

    await connection.execute(
      `INSERT INTO equipamentos (id, tenant_id, codigo_interno, descricao, categoria_id, numero_serie, fabricante, modelo, ano_fabricacao, valor_aquisicao, status_estoque) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eq1Id, tenant1Id, 'ESC-001', 'Escavadeira Caterpillar 320', catEscavadeira, 'SN123456', 'Caterpillar', '320', 2020, 150000, 'disponivel']
    );

    await connection.execute(
      `INSERT INTO equipamentos (id, tenant_id, codigo_interno, descricao, categoria_id, numero_serie, fabricante, modelo, ano_fabricacao, valor_aquisicao, status_estoque) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eq2Id, tenant1Id, 'PA-001', 'Pá Carregadeira Volvo L60H', catPá, 'SN789012', 'Volvo', 'L60H', 2019, 120000, 'disponivel']
    );

    await connection.execute(
      `INSERT INTO equipamentos (id, tenant_id, codigo_interno, descricao, categoria_id, numero_serie, fabricante, modelo, ano_fabricacao, valor_aquisicao, status_estoque) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eq3Id, tenant1Id, 'COMP-001', 'Compressor de Ar Atlas Copco', catCompressor, 'SN345678', 'Atlas Copco', 'GA15', 2021, 25000, 'disponivel']
    );

    // Criar tabelas de preço
    console.log('💰 Criando tabelas de preço...');
    
    await connection.execute(
      `INSERT INTO tabela_preco_equipamento (id, tenant_id, equipamento_id, tipo_periodo, valor_diaria, valor_mensal, desconto_maximo_permitido) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), tenant1Id, eq1Id, 'dia', 500, 12000, 10]
    );

    await connection.execute(
      `INSERT INTO tabela_preco_equipamento (id, tenant_id, equipamento_id, tipo_periodo, valor_diaria, valor_mensal, desconto_maximo_permitido) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), tenant1Id, eq2Id, 'dia', 400, 9000, 10]
    );

    await connection.execute(
      `INSERT INTO tabela_preco_equipamento (id, tenant_id, equipamento_id, tipo_periodo, valor_diaria, valor_mensal, desconto_maximo_permitido) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), tenant1Id, eq3Id, 'dia', 150, 3000, 15]
    );

    // Criar colaboradores
    console.log('👷 Criando colaboradores...');
    
    await connection.execute(
      `INSERT INTO colaboradores (id, tenant_id, nome, cpf, telefone, email, cargo, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), tenant1Id, 'João da Silva', '123.456.789-00', '11-99999-1111', 'joao@empresa.com', 'Técnico de Manutenção', true]
    );

    await connection.execute(
      `INSERT INTO colaboradores (id, tenant_id, nome, cpf, telefone, email, cargo, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), tenant1Id, 'Maria Santos', '987.654.321-11', '11-99999-2222', 'maria@empresa.com', 'Operadora', true]
    );

    // Criar contas bancárias
    console.log('🏦 Criando contas bancárias...');
    
    await connection.execute(
      `INSERT INTO contas_bancarias (id, tenant_id, nome, banco, agencia, conta, tipo, saldo_inicial, saldo_atual) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), tenant1Id, 'Conta Corrente Principal', 'Banco do Brasil', '1234', '567890-1', 'conta_corrente', 50000, 50000]
    );

    await connection.execute(
      `INSERT INTO contas_bancarias (id, tenant_id, nome, banco, agencia, conta, tipo, saldo_inicial, saldo_atual) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), tenant1Id, 'Caixa Geral', null, null, null, 'caixa', 10000, 10000]
    );

    console.log('✅ Seed concluído com sucesso!');
    console.log('\n📋 Dados de acesso para teste:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:');
    console.log('  Email: super@hyperloc.com');
    console.log('  Senha: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Empresa 1:');
    console.log('  Email: admin@hyperloc.com');
    console.log('  Senha: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Operador Comercial:');
    console.log('  Email: operador@hyperloc.com');
    console.log('  Senha: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erro durante seed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
