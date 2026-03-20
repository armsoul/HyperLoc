import { getDatabase } from '../db/connection.js';
import { ordens_manutencao } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase();

export async function criarOrdemManutencao(tenantId, dados) {
  try {
    const novaOrdem = {
      id: uuidv4(),
      tenant_id: tenantId,
      numero: dados.numero,
      equipamento_id: dados.equipamento_id,
      tipo: dados.tipo, // preventiva ou corretiva
      data_abertura: new Date(),
      data_previsao: dados.data_previsao,
      status: 'aberta',
      responsavel_id: dados.responsavel_id,
      custo_estimado: dados.custo_estimado,
      observacoes: dados.observacoes,
    };

    await db.insert(ordens_manutencao).values(novaOrdem);
    return novaOrdem;
  } catch (error) {
    throw new Error(`Error creating maintenance order: ${error.message}`);
  }
}

export async function obterOrdemManutencao(tenantId, ordemId) {
  try {
    const ordemList = await db
      .select()
      .from(ordens_manutencao)
      .where(and(
        eq(ordens_manutencao.id, ordemId),
        eq(ordens_manutencao.tenant_id, tenantId)
      ))
      .limit(1);

    if (ordemList.length === 0) {
      throw new Error('Maintenance order not found');
    }

    return ordemList[0];
  } catch (error) {
    throw new Error(`Error fetching maintenance order: ${error.message}`);
  }
}

export async function listarOrdensManutencao(tenantId, filtros = {}) {
  try {
    let query = db
      .select()
      .from(ordens_manutencao)
      .where(eq(ordens_manutencao.tenant_id, tenantId));

    if (filtros.status) {
      query = query.where(eq(ordens_manutencao.status, filtros.status));
    }

    if (filtros.equipamento_id) {
      query = query.where(eq(ordens_manutencao.equipamento_id, filtros.equipamento_id));
    }

    if (filtros.tipo) {
      query = query.where(eq(ordens_manutencao.tipo, filtros.tipo));
    }

    const ordensList = await query;
    return ordensList;
  } catch (error) {
    throw new Error(`Error listing maintenance orders: ${error.message}`);
  }
}

export async function atualizarOrdemManutencao(tenantId, ordemId, dados) {
  try {
    await obterOrdemManutencao(tenantId, ordemId);

    const atualizacoes = { ...dados };
    delete atualizacoes.id;
    delete atualizacoes.tenant_id;
    atualizacoes.data_atualizacao = new Date();

    await db
      .update(ordens_manutencao)
      .set(atualizacoes)
      .where(and(
        eq(ordens_manutencao.id, ordemId),
        eq(ordens_manutencao.tenant_id, tenantId)
      ));

    return await obterOrdemManutencao(tenantId, ordemId);
  } catch (error) {
    throw new Error(`Error updating maintenance order: ${error.message}`);
  }
}

export async function iniciarManutencao(tenantId, ordemId) {
  try {
    const ordem = await obterOrdemManutencao(tenantId, ordemId);

    if (ordem.status !== 'aberta') {
      throw new Error('Only open orders can be started');
    }

    return await atualizarOrdemManutencao(tenantId, ordemId, {
      status: 'em_execucao'
    });
  } catch (error) {
    throw new Error(`Error starting maintenance: ${error.message}`);
  }
}

export async function concluirManutencao(tenantId, ordemId, custo_real) {
  try {
    const ordem = await obterOrdemManutencao(tenantId, ordemId);

    if (!['aberta', 'em_execucao'].includes(ordem.status)) {
      throw new Error('Order cannot be completed in current status');
    }

    return await atualizarOrdemManutencao(tenantId, ordemId, {
      status: 'concluida',
      data_conclusao: new Date(),
      custo_real: custo_real
    });
  } catch (error) {
    throw new Error(`Error completing maintenance: ${error.message}`);
  }
}

export async function cancelarManutencao(tenantId, ordemId) {
  try {
    const ordem = await obterOrdemManutencao(tenantId, ordemId);

    if (ordem.status === 'concluida') {
      throw new Error('Cannot cancel completed orders');
    }

    return await atualizarOrdemManutencao(tenantId, ordemId, {
      status: 'cancelada'
    });
  } catch (error) {
    throw new Error(`Error canceling maintenance: ${error.message}`);
  }
}

export async function obterHistoricoManutencao(tenantId, equipamentoId) {
  try {
    const historico = await db
      .select()
      .from(ordens_manutencao)
      .where(and(
        eq(ordens_manutencao.tenant_id, tenantId),
        eq(ordens_manutencao.equipamento_id, equipamentoId)
      ));

    return historico;
  } catch (error) {
    throw new Error(`Error fetching maintenance history: ${error.message}`);
  }
}
