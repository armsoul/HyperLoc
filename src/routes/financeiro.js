import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import {
  criarLancamento, obterLancamento, listarLancamentos, liquidarLancamento, cancelarLancamento,
  criarContaBancaria, obterContaBancaria, listarContasBancarias,
  criarMovimentoCaixa, listarMovimentosCaixa,
  obterFluxoCaixa, obterInadimplencia
} from '../services/financeiroService.js';

const router = express.Router();

// Aplicar middlewares
router.use(authMiddleware, tenantMiddleware);

// ============================================================================
// LANÇAMENTOS FINANCEIROS
// ============================================================================

/**
 * POST /financeiro/lancamentos
 * Criar novo lançamento financeiro
 */
router.post('/lancamentos', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const { tipo, origem, historico, data_vencimento, valor_original, forma_pagamento } = req.body;

    if (!tipo || !historico || !valor_original) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const lancamento = await criarLancamento(req.tenant_id, {
      tipo, origem, historico, data_vencimento, valor_original, forma_pagamento,
      ...req.body
    });

    res.status(201).json(lancamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /financeiro/lancamentos
 * Listar lançamentos financeiros
 */
router.get('/lancamentos', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const filtros = {};
    if (req.query.tipo) filtros.tipo = req.query.tipo;
    if (req.query.status) filtros.status = req.query.status;
    if (req.query.data_vencimento_inicio && req.query.data_vencimento_fim) {
      filtros.data_vencimento_inicio = new Date(req.query.data_vencimento_inicio);
      filtros.data_vencimento_fim = new Date(req.query.data_vencimento_fim);
    }

    const lancamentos = await listarLancamentos(req.tenant_id, filtros);
    res.json(lancamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /financeiro/lancamentos/:id
 * Obter lançamento específico
 */
router.get('/lancamentos/:id', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const lancamento = await obterLancamento(req.tenant_id, req.params.id);
    res.json(lancamento);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * POST /financeiro/lancamentos/:id/liquidar
 * Liquidar lançamento
 */
router.post('/lancamentos/:id/liquidar', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const { conta_bancaria_id, data_pagamento } = req.body;

    if (!conta_bancaria_id) {
      return res.status(400).json({ error: 'conta_bancaria_id é obrigatório' });
    }

    const lancamento = await liquidarLancamento(req.tenant_id, req.params.id, conta_bancaria_id, data_pagamento);
    res.json(lancamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /financeiro/lancamentos/:id/cancelar
 * Cancelar lançamento
 */
router.post('/lancamentos/:id/cancelar', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const lancamento = await cancelarLancamento(req.tenant_id, req.params.id);
    res.json(lancamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// CONTAS BANCÁRIAS
// ============================================================================

/**
 * POST /financeiro/contas
 * Criar nova conta bancária
 */
router.post('/contas', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const { nome, tipo, banco, agencia, conta, saldo_inicial } = req.body;

    if (!nome || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const contaBancaria = await criarContaBancaria(req.tenant_id, {
      nome, tipo, banco, agencia, conta, saldo_inicial
    });

    res.status(201).json(contaBancaria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /financeiro/contas
 * Listar contas bancárias
 */
router.get('/contas', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const contas = await listarContasBancarias(req.tenant_id);
    res.json(contas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /financeiro/contas/:id
 * Obter conta bancária específica
 */
router.get('/contas/:id', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const conta = await obterContaBancaria(req.tenant_id, req.params.id);
    res.json(conta);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============================================================================
// MOVIMENTOS DE CAIXA
// ============================================================================

/**
 * GET /financeiro/contas/:id/movimentos
 * Listar movimentos de uma conta
 */
router.get('/contas/:id/movimentos', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const filtros = {};
    if (req.query.data_inicio && req.query.data_fim) {
      filtros.data_inicio = new Date(req.query.data_inicio);
      filtros.data_fim = new Date(req.query.data_fim);
    }

    const movimentos = await listarMovimentosCaixa(req.tenant_id, req.params.id, filtros);
    res.json(movimentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// FLUXO DE CAIXA
// ============================================================================

/**
 * GET /financeiro/fluxo-caixa
 * Obter fluxo de caixa para período
 */
router.get('/fluxo-caixa', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'data_inicio e data_fim são obrigatórios' });
    }

    const fluxo = await obterFluxoCaixa(
      req.tenant_id,
      new Date(data_inicio),
      new Date(data_fim)
    );

    res.json(fluxo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /financeiro/inadimplencia
 * Obter relatório de inadimplência
 */
router.get('/inadimplencia', requireRole('admin_empresa', 'financeiro'), async (req, res) => {
  try {
    const inadimplencia = await obterInadimplencia(req.tenant_id);
    res.json(inadimplencia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
