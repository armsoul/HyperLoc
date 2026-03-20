import { getDatabase } from '../db/connection.js';
import { lancamentos_financeiro, contas_bancarias, movimentos_caixa_banco } from '../db/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase();

// ============================================================================
// LANÇAMENTOS FINANCEIROS
// ============================================================================

export async function criarLancamento(tenantId, dados) {
  try {
    const novoLancamento = {
      id: uuidv4(),
      tenant_id: tenantId,
      tipo: dados.tipo, // pagar ou receber
      origem: dados.origem, // pedido_locacao, manutencao, manual
      origem_id: dados.origem_id,
      centro_custo: dados.centro_custo,
      historico: dados.historico,
      data_emissao: new Date(),
      data_vencimento: dados.data_vencimento,
      valor_original: dados.valor_original,
      valor_juros: dados.valor_juros || 0,
      valor_multa: dados.valor_multa || 0,
      valor_desconto: dados.valor_desconto || 0,
      valor_liquido: dados.valor_original - (dados.valor_desconto || 0) + (dados.valor_juros || 0) + (dados.valor_multa || 0),
      status: 'aberto',
      forma_pagamento: dados.forma_pagamento,
    };

    await db.insert(lancamentos_financeiro).values(novoLancamento);
    return novoLancamento;
  } catch (error) {
    throw new Error(`Error creating financial entry: ${error.message}`);
  }
}

export async function obterLancamento(tenantId, lancamentoId) {
  try {
    const lancamentoList = await db
      .select()
      .from(lancamentos_financeiro)
      .where(and(
        eq(lancamentos_financeiro.id, lancamentoId),
        eq(lancamentos_financeiro.tenant_id, tenantId)
      ))
      .limit(1);

    if (lancamentoList.length === 0) {
      throw new Error('Financial entry not found');
    }

    return lancamentoList[0];
  } catch (error) {
    throw new Error(`Error fetching financial entry: ${error.message}`);
  }
}

export async function listarLancamentos(tenantId, filtros = {}) {
  try {
    let query = db
      .select()
      .from(lancamentos_financeiro)
      .where(eq(lancamentos_financeiro.tenant_id, tenantId));

    if (filtros.tipo) {
      query = query.where(eq(lancamentos_financeiro.tipo, filtros.tipo));
    }

    if (filtros.status) {
      query = query.where(eq(lancamentos_financeiro.status, filtros.status));
    }

    if (filtros.data_vencimento_inicio && filtros.data_vencimento_fim) {
      query = query.where(and(
        gte(lancamentos_financeiro.data_vencimento, filtros.data_vencimento_inicio),
        lte(lancamentos_financeiro.data_vencimento, filtros.data_vencimento_fim)
      ));
    }

    const lancamentosList = await query;
    return lancamentosList;
  } catch (error) {
    throw new Error(`Error listing financial entries: ${error.message}`);
  }
}

export async function liquidarLancamento(tenantId, lancamentoId, contaBancariaId, dataPagamento) {
  try {
    const lancamento = await obterLancamento(tenantId, lancamentoId);

    if (lancamento.status !== 'aberto') {
      throw new Error('Only open entries can be paid');
    }

    // Atualizar lançamento
    await db
      .update(lancamentos_financeiro)
      .set({
        status: 'liquidado',
        data_pagamento_recebimento: dataPagamento || new Date(),
        data_atualizacao: new Date()
      })
      .where(and(
        eq(lancamentos_financeiro.id, lancamentoId),
        eq(lancamentos_financeiro.tenant_id, tenantId)
      ));

    // Criar movimento de caixa
    const tipo = lancamento.tipo === 'receber' ? 'entrada' : 'saida';
    await criarMovimentoCaixa(tenantId, {
      conta_id: contaBancariaId,
      tipo,
      origem: 'lancamento_financeiro',
      origem_id: lancamentoId,
      historico: lancamento.historico,
      valor: lancamento.valor_liquido
    });

    return await obterLancamento(tenantId, lancamentoId);
  } catch (error) {
    throw new Error(`Error paying financial entry: ${error.message}`);
  }
}

export async function cancelarLancamento(tenantId, lancamentoId) {
  try {
    const lancamento = await obterLancamento(tenantId, lancamentoId);

    if (lancamento.status === 'liquidado') {
      throw new Error('Cannot cancel paid entries');
    }

    await db
      .update(lancamentos_financeiro)
      .set({
        status: 'cancelado',
        data_atualizacao: new Date()
      })
      .where(and(
        eq(lancamentos_financeiro.id, lancamentoId),
        eq(lancamentos_financeiro.tenant_id, tenantId)
      ));

    return await obterLancamento(tenantId, lancamentoId);
  } catch (error) {
    throw new Error(`Error canceling financial entry: ${error.message}`);
  }
}

// ============================================================================
// CONTAS BANCÁRIAS
// ============================================================================

export async function criarContaBancaria(tenantId, dados) {
  try {
    const novaConta = {
      id: uuidv4(),
      tenant_id: tenantId,
      nome: dados.nome,
      banco: dados.banco,
      agencia: dados.agencia,
      conta: dados.conta,
      tipo: dados.tipo, // conta_corrente ou caixa
      saldo_inicial: dados.saldo_inicial || 0,
      saldo_atual: dados.saldo_inicial || 0,
    };

    await db.insert(contas_bancarias).values(novaConta);
    return novaConta;
  } catch (error) {
    throw new Error(`Error creating bank account: ${error.message}`);
  }
}

export async function obterContaBancaria(tenantId, contaId) {
  try {
    const contaList = await db
      .select()
      .from(contas_bancarias)
      .where(and(
        eq(contas_bancarias.id, contaId),
        eq(contas_bancarias.tenant_id, tenantId)
      ))
      .limit(1);

    if (contaList.length === 0) {
      throw new Error('Bank account not found');
    }

    return contaList[0];
  } catch (error) {
    throw new Error(`Error fetching bank account: ${error.message}`);
  }
}

export async function listarContasBancarias(tenantId) {
  try {
    const contasList = await db
      .select()
      .from(contas_bancarias)
      .where(eq(contas_bancarias.tenant_id, tenantId));

    return contasList;
  } catch (error) {
    throw new Error(`Error listing bank accounts: ${error.message}`);
  }
}

// ============================================================================
// MOVIMENTOS DE CAIXA
// ============================================================================

export async function criarMovimentoCaixa(tenantId, dados) {
  try {
    const novoMovimento = {
      id: uuidv4(),
      tenant_id: tenantId,
      conta_id: dados.conta_id,
      data_movimento: new Date(),
      tipo: dados.tipo, // entrada ou saida
      origem: dados.origem, // lancamento_financeiro ou ajuste
      origem_id: dados.origem_id,
      historico: dados.historico,
      valor: dados.valor,
    };

    await db.insert(movimentos_caixa_banco).values(novoMovimento);

    // Atualizar saldo da conta
    const conta = await obterContaBancaria(tenantId, dados.conta_id);
    const novoSaldo = dados.tipo === 'entrada'
      ? parseFloat(conta.saldo_atual) + parseFloat(dados.valor)
      : parseFloat(conta.saldo_atual) - parseFloat(dados.valor);

    await db
      .update(contas_bancarias)
      .set({
        saldo_atual: novoSaldo,
        data_atualizacao: new Date()
      })
      .where(and(
        eq(contas_bancarias.id, dados.conta_id),
        eq(contas_bancarias.tenant_id, tenantId)
      ));

    return novoMovimento;
  } catch (error) {
    throw new Error(`Error creating cash movement: ${error.message}`);
  }
}

export async function listarMovimentosCaixa(tenantId, contaId, filtros = {}) {
  try {
    let query = db
      .select()
      .from(movimentos_caixa_banco)
      .where(and(
        eq(movimentos_caixa_banco.tenant_id, tenantId),
        eq(movimentos_caixa_banco.conta_id, contaId)
      ));

    if (filtros.data_inicio && filtros.data_fim) {
      query = query.where(and(
        gte(movimentos_caixa_banco.data_movimento, filtros.data_inicio),
        lte(movimentos_caixa_banco.data_movimento, filtros.data_fim)
      ));
    }

    const movimentosList = await query;
    return movimentosList;
  } catch (error) {
    throw new Error(`Error listing cash movements: ${error.message}`);
  }
}

// ============================================================================
// FLUXO DE CAIXA
// ============================================================================

export async function obterFluxoCaixa(tenantId, dataInicio, dataFim) {
  try {
    const lancamentos = await db
      .select()
      .from(lancamentos_financeiro)
      .where(and(
        eq(lancamentos_financeiro.tenant_id, tenantId),
        gte(lancamentos_financeiro.data_vencimento, dataInicio),
        lte(lancamentos_financeiro.data_vencimento, dataFim)
      ));

    const entradas = lancamentos
      .filter(l => l.tipo === 'receber')
      .reduce((sum, l) => sum + parseFloat(l.valor_liquido), 0);

    const saidas = lancamentos
      .filter(l => l.tipo === 'pagar')
      .reduce((sum, l) => sum + parseFloat(l.valor_liquido), 0);

    const contas = await listarContasBancarias(tenantId);
    const saldoTotal = contas.reduce((sum, c) => sum + parseFloat(c.saldo_atual), 0);

    return {
      periodo: { inicio: dataInicio, fim: dataFim },
      entradas_previstas: entradas,
      saidas_previstas: saidas,
      saldo_projetado: saldoTotal + entradas - saidas,
      saldo_atual: saldoTotal,
      total_lancamentos: lancamentos.length,
      lancamentos_abertos: lancamentos.filter(l => l.status === 'aberto').length,
      lancamentos_liquidados: lancamentos.filter(l => l.status === 'liquidado').length,
    };
  } catch (error) {
    throw new Error(`Error calculating cash flow: ${error.message}`);
  }
}

export async function obterInadimplencia(tenantId) {
  try {
    const hoje = new Date();
    const inadimplentes = await db
      .select()
      .from(lancamentos_financeiro)
      .where(and(
        eq(lancamentos_financeiro.tenant_id, tenantId),
        eq(lancamentos_financeiro.tipo, 'receber'),
        eq(lancamentos_financeiro.status, 'aberto'),
        lte(lancamentos_financeiro.data_vencimento, hoje)
      ));

    const totalInadimplencia = inadimplentes.reduce((sum, l) => sum + parseFloat(l.valor_liquido), 0);

    return {
      total_titulos_atrasados: inadimplentes.length,
      valor_total_atrasado: totalInadimplencia,
      titulos: inadimplentes
    };
  } catch (error) {
    throw new Error(`Error calculating default: ${error.message}`);
  }
}
