import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import {
  criarOrcamento, obterOrcamento, listarOrcamentos, atualizarOrcamento,
  adicionarItemOrcamento, listarItensOrcamento, converterOrcamentoEmPedido,
  criarPedido, obterPedido, listarPedidos, atualizarPedido,
  adicionarItemPedido, listarItensPedido
} from '../services/comercialService.js';

const router = express.Router();

// Aplicar middlewares
router.use(authMiddleware, tenantMiddleware);

// ============================================================================
// ORÇAMENTOS
// ============================================================================

/**
 * POST /comercial/orcamentos
 * Criar novo orçamento
 */
router.post('/orcamentos', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const { numero, cliente_id, validade, observacoes, desconto } = req.body;

    if (!numero || !cliente_id) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const orcamento = await criarOrcamento(req.tenant_id, {
      numero, cliente_id, validade, observacoes, desconto
    });

    res.status(201).json(orcamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /comercial/orcamentos
 * Listar orçamentos
 */
router.get('/orcamentos', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.status) filtros.status = req.query.status;
    if (req.query.cliente_id) filtros.cliente_id = req.query.cliente_id;

    const orcamentos = await listarOrcamentos(req.tenant_id, filtros);
    res.json(orcamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /comercial/orcamentos/:id
 * Obter orçamento específico
 */
router.get('/orcamentos/:id', async (req, res) => {
  try {
    const orcamento = await obterOrcamento(req.tenant_id, req.params.id);
    res.json(orcamento);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /comercial/orcamentos/:id
 * Atualizar orçamento
 */
router.put('/orcamentos/:id', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const orcamento = await atualizarOrcamento(req.tenant_id, req.params.id, req.body);
    res.json(orcamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /comercial/orcamentos/:id/itens
 * Adicionar item ao orçamento
 */
router.post('/orcamentos/:id/itens', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const { equipamento_id, quantidade, periodo, valor_unitario } = req.body;

    if (!equipamento_id || !quantidade || !periodo || !valor_unitario) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const item = await adicionarItemOrcamento(req.tenant_id, req.params.id, {
      equipamento_id, quantidade, periodo, valor_unitario
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /comercial/orcamentos/:id/itens
 * Listar itens do orçamento
 */
router.get('/orcamentos/:id/itens', async (req, res) => {
  try {
    const itens = await listarItensOrcamento(req.tenant_id, req.params.id);
    res.json(itens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /comercial/orcamentos/:id/converter
 * Converter orçamento em pedido
 */
router.post('/orcamentos/:id/converter', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const { numero_pedido } = req.body;

    if (!numero_pedido) {
      return res.status(400).json({ error: 'numero_pedido é obrigatório' });
    }

    const pedido = await converterOrcamentoEmPedido(req.tenant_id, req.params.id, numero_pedido);
    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// PEDIDOS
// ============================================================================

/**
 * POST /comercial/pedidos
 * Criar novo pedido
 */
router.post('/pedidos', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const { numero, cliente_id, data_inicio_locacao, data_fim_prevista, observacoes } = req.body;

    if (!numero || !cliente_id) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const pedido = await criarPedido(req.tenant_id, {
      numero, cliente_id, data_inicio_locacao, data_fim_prevista, observacoes
    });

    res.status(201).json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /comercial/pedidos
 * Listar pedidos
 */
router.get('/pedidos', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.status) filtros.status = req.query.status;
    if (req.query.cliente_id) filtros.cliente_id = req.query.cliente_id;

    const pedidos = await listarPedidos(req.tenant_id, filtros);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /comercial/pedidos/:id
 * Obter pedido específico
 */
router.get('/pedidos/:id', async (req, res) => {
  try {
    const pedido = await obterPedido(req.tenant_id, req.params.id);
    res.json(pedido);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /comercial/pedidos/:id
 * Atualizar pedido
 */
router.put('/pedidos/:id', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const pedido = await atualizarPedido(req.tenant_id, req.params.id, req.body);
    res.json(pedido);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /comercial/pedidos/:id/itens
 * Adicionar item ao pedido
 */
router.post('/pedidos/:id/itens', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const { equipamento_id, quantidade, periodo, valor_unitario } = req.body;

    if (!equipamento_id || !quantidade || !periodo || !valor_unitario) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const item = await adicionarItemPedido(req.tenant_id, req.params.id, {
      equipamento_id, quantidade, periodo, valor_unitario
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /comercial/pedidos/:id/itens
 * Listar itens do pedido
 */
router.get('/pedidos/:id/itens', async (req, res) => {
  try {
    const itens = await listarItensPedido(req.tenant_id, req.params.id);
    res.json(itens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
