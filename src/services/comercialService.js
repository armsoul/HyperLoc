import { getDatabase } from '../db/connection.js';
import {
  orcamentos_locacao, orcamentos_itens,
  pedidos_locacao, pedidos_itens
} from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase();

// ============================================================================
// ORÇAMENTOS
// ============================================================================

export async function criarOrcamento(tenantId, dados) {
  try {
    const novoOrcamento = {
      id: uuidv4(),
      tenant_id: tenantId,
      numero: dados.numero,
      cliente_id: dados.cliente_id,
      data_emissao: new Date(),
      validade: dados.validade,
      status: 'aberto',
      observacoes: dados.observacoes,
      total_bruto: 0,
      desconto: dados.desconto || 0,
      total_liquido: 0,
    };

    await db.insert(orcamentos_locacao).values(novoOrcamento);
    return novoOrcamento;
  } catch (error) {
    throw new Error(`Error creating quote: ${error.message}`);
  }
}

export async function obterOrcamento(tenantId, orcamentoId) {
  try {
    const orcamentoList = await db
      .select()
      .from(orcamentos_locacao)
      .where(and(
        eq(orcamentos_locacao.id, orcamentoId),
        eq(orcamentos_locacao.tenant_id, tenantId)
      ))
      .limit(1);

    if (orcamentoList.length === 0) {
      throw new Error('Quote not found');
    }

    return orcamentoList[0];
  } catch (error) {
    throw new Error(`Error fetching quote: ${error.message}`);
  }
}

export async function listarOrcamentos(tenantId, filtros = {}) {
  try {
    let query = db
      .select()
      .from(orcamentos_locacao)
      .where(eq(orcamentos_locacao.tenant_id, tenantId));

    if (filtros.status) {
      query = query.where(eq(orcamentos_locacao.status, filtros.status));
    }

    if (filtros.cliente_id) {
      query = query.where(eq(orcamentos_locacao.cliente_id, filtros.cliente_id));
    }

    const orcamentosList = await query;
    return orcamentosList;
  } catch (error) {
    throw new Error(`Error listing quotes: ${error.message}`);
  }
}

export async function atualizarOrcamento(tenantId, orcamentoId, dados) {
  try {
    await obterOrcamento(tenantId, orcamentoId);

    const atualizacoes = { ...dados };
    delete atualizacoes.id;
    delete atualizacoes.tenant_id;
    atualizacoes.data_atualizacao = new Date();

    await db
      .update(orcamentos_locacao)
      .set(atualizacoes)
      .where(and(
        eq(orcamentos_locacao.id, orcamentoId),
        eq(orcamentos_locacao.tenant_id, tenantId)
      ));

    return await obterOrcamento(tenantId, orcamentoId);
  } catch (error) {
    throw new Error(`Error updating quote: ${error.message}`);
  }
}

export async function adicionarItemOrcamento(tenantId, orcamentoId, dados) {
  try {
    await obterOrcamento(tenantId, orcamentoId);

    const novoItem = {
      id: uuidv4(),
      tenant_id: tenantId,
      orcamento_id: orcamentoId,
      equipamento_id: dados.equipamento_id,
      quantidade: dados.quantidade,
      periodo: dados.periodo,
      valor_unitario: dados.valor_unitario,
      valor_total: dados.quantidade * dados.valor_unitario,
    };

    await db.insert(orcamentos_itens).values(novoItem);

    // Atualizar totais do orçamento
    await atualizarTotaisOrcamento(tenantId, orcamentoId);

    return novoItem;
  } catch (error) {
    throw new Error(`Error adding quote item: ${error.message}`);
  }
}

export async function listarItensOrcamento(tenantId, orcamentoId) {
  try {
    const itensList = await db
      .select()
      .from(orcamentos_itens)
      .where(and(
        eq(orcamentos_itens.tenant_id, tenantId),
        eq(orcamentos_itens.orcamento_id, orcamentoId)
      ));

    return itensList;
  } catch (error) {
    throw new Error(`Error listing quote items: ${error.message}`);
  }
}

export async function atualizarTotaisOrcamento(tenantId, orcamentoId) {
  try {
    const orcamento = await obterOrcamento(tenantId, orcamentoId);
    const itens = await listarItensOrcamento(tenantId, orcamentoId);

    const totalBruto = itens.reduce((sum, item) => sum + parseFloat(item.valor_total), 0);
    const desconto = parseFloat(orcamento.desconto) || 0;
    const totalLiquido = totalBruto - desconto;

    await db
      .update(orcamentos_locacao)
      .set({
        total_bruto: totalBruto,
        total_liquido: totalLiquido,
        data_atualizacao: new Date()
      })
      .where(and(
        eq(orcamentos_locacao.id, orcamentoId),
        eq(orcamentos_locacao.tenant_id, tenantId)
      ));
  } catch (error) {
    throw new Error(`Error updating quote totals: ${error.message}`);
  }
}

// ============================================================================
// PEDIDOS
// ============================================================================

export async function criarPedido(tenantId, dados) {
  try {
    const novoPedido = {
      id: uuidv4(),
      tenant_id: tenantId,
      numero: dados.numero,
      origem_orcamento_id: dados.origem_orcamento_id,
      cliente_id: dados.cliente_id,
      data_emissao: new Date(),
      data_inicio_locacao: dados.data_inicio_locacao,
      data_fim_prevista: dados.data_fim_prevista,
      status: 'aberto',
      observacoes: dados.observacoes,
      valor_total_previsto: 0,
    };

    await db.insert(pedidos_locacao).values(novoPedido);
    return novoPedido;
  } catch (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }
}

export async function obterPedido(tenantId, pedidoId) {
  try {
    const pedidoList = await db
      .select()
      .from(pedidos_locacao)
      .where(and(
        eq(pedidos_locacao.id, pedidoId),
        eq(pedidos_locacao.tenant_id, tenantId)
      ))
      .limit(1);

    if (pedidoList.length === 0) {
      throw new Error('Order not found');
    }

    return pedidoList[0];
  } catch (error) {
    throw new Error(`Error fetching order: ${error.message}`);
  }
}

export async function listarPedidos(tenantId, filtros = {}) {
  try {
    let query = db
      .select()
      .from(pedidos_locacao)
      .where(eq(pedidos_locacao.tenant_id, tenantId));

    if (filtros.status) {
      query = query.where(eq(pedidos_locacao.status, filtros.status));
    }

    if (filtros.cliente_id) {
      query = query.where(eq(pedidos_locacao.cliente_id, filtros.cliente_id));
    }

    const pedidosList = await query;
    return pedidosList;
  } catch (error) {
    throw new Error(`Error listing orders: ${error.message}`);
  }
}

export async function atualizarPedido(tenantId, pedidoId, dados) {
  try {
    await obterPedido(tenantId, pedidoId);

    const atualizacoes = { ...dados };
    delete atualizacoes.id;
    delete atualizacoes.tenant_id;
    atualizacoes.data_atualizacao = new Date();

    await db
      .update(pedidos_locacao)
      .set(atualizacoes)
      .where(and(
        eq(pedidos_locacao.id, pedidoId),
        eq(pedidos_locacao.tenant_id, tenantId)
      ));

    return await obterPedido(tenantId, pedidoId);
  } catch (error) {
    throw new Error(`Error updating order: ${error.message}`);
  }
}

export async function adicionarItemPedido(tenantId, pedidoId, dados) {
  try {
    await obterPedido(tenantId, pedidoId);

    const novoItem = {
      id: uuidv4(),
      tenant_id: tenantId,
      pedido_id: pedidoId,
      equipamento_id: dados.equipamento_id,
      quantidade: dados.quantidade,
      periodo: dados.periodo,
      valor_unitario: dados.valor_unitario,
      valor_total: dados.quantidade * dados.valor_unitario,
    };

    await db.insert(pedidos_itens).values(novoItem);

    // Atualizar totais do pedido
    await atualizarTotaisPedido(tenantId, pedidoId);

    return novoItem;
  } catch (error) {
    throw new Error(`Error adding order item: ${error.message}`);
  }
}

export async function listarItensPedido(tenantId, pedidoId) {
  try {
    const itensList = await db
      .select()
      .from(pedidos_itens)
      .where(and(
        eq(pedidos_itens.tenant_id, tenantId),
        eq(pedidos_itens.pedido_id, pedidoId)
      ));

    return itensList;
  } catch (error) {
    throw new Error(`Error listing order items: ${error.message}`);
  }
}

export async function atualizarTotaisPedido(tenantId, pedidoId) {
  try {
    const itens = await listarItensPedido(tenantId, pedidoId);

    const valorTotalPrevisto = itens.reduce((sum, item) => sum + parseFloat(item.valor_total), 0);

    await db
      .update(pedidos_locacao)
      .set({
        valor_total_previsto: valorTotalPrevisto,
        data_atualizacao: new Date()
      })
      .where(and(
        eq(pedidos_locacao.id, pedidoId),
        eq(pedidos_locacao.tenant_id, tenantId)
      ));
  } catch (error) {
    throw new Error(`Error updating order totals: ${error.message}`);
  }
}

export async function converterOrcamentoEmPedido(tenantId, orcamentoId, numeroPedido) {
  try {
    const orcamento = await obterOrcamento(tenantId, orcamentoId);
    const itensOrcamento = await listarItensOrcamento(tenantId, orcamentoId);

    // Criar pedido
    const pedido = await criarPedido(tenantId, {
      numero: numeroPedido,
      origem_orcamento_id: orcamentoId,
      cliente_id: orcamento.cliente_id,
      observacoes: orcamento.observacoes,
    });

    // Copiar itens
    for (const item of itensOrcamento) {
      await adicionarItemPedido(tenantId, pedido.id, {
        equipamento_id: item.equipamento_id,
        quantidade: item.quantidade,
        periodo: item.periodo,
        valor_unitario: item.valor_unitario,
      });
    }

    // Atualizar status do orçamento
    await atualizarOrcamento(tenantId, orcamentoId, { status: 'aprovado' });

    return pedido;
  } catch (error) {
    throw new Error(`Error converting quote to order: ${error.message}`);
  }
}
