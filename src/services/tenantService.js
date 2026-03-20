import { getDatabase } from '../db/connection.js';
import { tenants } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase();

export async function criarTenant(dados) {
  try {
    const novoTenant = {
      id: uuidv4(),
      nome_fantasia: dados.nome_fantasia,
      razao_social: dados.razao_social,
      cnpj: dados.cnpj,
      inscricao_estadual: dados.inscricao_estadual,
      endereco: dados.endereco,
      telefone: dados.telefone,
      email: dados.email,
      plano: dados.plano || 'starter',
      status: 'ativo',
    };

    await db.insert(tenants).values(novoTenant);

    return novoTenant;
  } catch (error) {
    throw new Error(`Error creating tenant: ${error.message}`);
  }
}

export async function obterTenant(tenantId) {
  try {
    const tenantList = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (tenantList.length === 0) {
      throw new Error('Tenant not found');
    }

    return tenantList[0];
  } catch (error) {
    throw new Error(`Error fetching tenant: ${error.message}`);
  }
}

export async function listarTenants(filtros = {}) {
  try {
    let query = db.select().from(tenants);

    if (filtros.status) {
      query = query.where(eq(tenants.status, filtros.status));
    }

    const tenantsList = await query;
    return tenantsList;
  } catch (error) {
    throw new Error(`Error listing tenants: ${error.message}`);
  }
}

export async function atualizarTenant(tenantId, dados) {
  try {
    const atualizacoes = { ...dados };
    delete atualizacoes.id;
    atualizacoes.data_atualizacao = new Date();

    await db
      .update(tenants)
      .set(atualizacoes)
      .where(eq(tenants.id, tenantId));

    return await obterTenant(tenantId);
  } catch (error) {
    throw new Error(`Error updating tenant: ${error.message}`);
  }
}

export async function obterMetricasTenant(tenantId) {
  try {
    // Placeholder para métricas agregadas
    // Em produção, isso faria queries mais complexas
    return {
      tenant_id: tenantId,
      total_usuarios: 0,
      total_clientes: 0,
      total_equipamentos: 0,
      ultimo_acesso: null,
    };
  } catch (error) {
    throw new Error(`Error fetching tenant metrics: ${error.message}`);
  }
}
