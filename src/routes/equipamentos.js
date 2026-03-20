import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import {
  criarEquipamento, obterEquipamento, listarEquipamentos, atualizarEquipamento,
  criarCategoria, obterCategoria, listarCategorias,
  criarTabelaPreco, obterTabelaPreco, listarTabelasPreco, atualizarTabelaPreco, deletarTabelaPreco
} from '../services/equipamentoService.js';

const router = express.Router();

// Aplicar middlewares
router.use(authMiddleware, tenantMiddleware);

// ============================================================================
// CATEGORIAS
// ============================================================================

/**
 * POST /equipamentos/categorias
 * Criar nova categoria
 */
router.post('/categorias', requireRole('admin_empresa'), async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const categoria = await criarCategoria(req.tenant_id, { nome, descricao });
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /equipamentos/categorias
 * Listar categorias
 */
router.get('/categorias', async (req, res) => {
  try {
    const categorias = await listarCategorias(req.tenant_id);
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /equipamentos/categorias/:id
 * Obter categoria específica
 */
router.get('/categorias/:id', async (req, res) => {
  try {
    const categoria = await obterCategoria(req.tenant_id, req.params.id);
    res.json(categoria);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============================================================================
// EQUIPAMENTOS
// ============================================================================

/**
 * POST /equipamentos
 * Criar novo equipamento
 */
router.post('/', requireRole('admin_empresa'), async (req, res) => {
  try {
    const {
      codigo_interno, descricao, categoria_id, numero_serie,
      fabricante, modelo, ano_fabricacao, valor_aquisicao,
      data_aquisicao, localizacao_atual, observacoes
    } = req.body;

    if (!codigo_interno || !descricao || !categoria_id) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const equipamento = await criarEquipamento(req.tenant_id, {
      codigo_interno, descricao, categoria_id, numero_serie,
      fabricante, modelo, ano_fabricacao, valor_aquisicao,
      data_aquisicao, localizacao_atual, observacoes
    });

    res.status(201).json(equipamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /equipamentos
 * Listar equipamentos
 */
router.get('/', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.categoria_id) filtros.categoria_id = req.query.categoria_id;
    if (req.query.status_estoque) filtros.status_estoque = req.query.status_estoque;
    if (req.query.descricao) filtros.descricao = req.query.descricao;

    const equipamentos = await listarEquipamentos(req.tenant_id, filtros);
    res.json(equipamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /equipamentos/:id
 * Obter equipamento específico
 */
router.get('/:id', async (req, res) => {
  try {
    const equipamento = await obterEquipamento(req.tenant_id, req.params.id);
    res.json(equipamento);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /equipamentos/:id
 * Atualizar equipamento
 */
router.put('/:id', requireRole('admin_empresa'), async (req, res) => {
  try {
    const equipamento = await atualizarEquipamento(req.tenant_id, req.params.id, req.body);
    res.json(equipamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================================================
// TABELAS DE PREÇO
// ============================================================================

/**
 * POST /equipamentos/:id/precos
 * Criar tabela de preço
 */
router.post('/:id/precos', requireRole('admin_empresa'), async (req, res) => {
  try {
    const { tipo_periodo, valor_diaria, valor_mensal, desconto_maximo_permitido } = req.body;

    if (!tipo_periodo) {
      return res.status(400).json({ error: 'tipo_periodo é obrigatório' });
    }

    const tabela = await criarTabelaPreco(req.tenant_id, {
      equipamento_id: req.params.id,
      tipo_periodo,
      valor_diaria,
      valor_mensal,
      desconto_maximo_permitido
    });

    res.status(201).json(tabela);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /equipamentos/:id/precos
 * Listar tabelas de preço de um equipamento
 */
router.get('/:id/precos', async (req, res) => {
  try {
    const tabelas = await listarTabelasPreco(req.tenant_id, req.params.id);
    res.json(tabelas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /equipamentos/precos/:id
 * Atualizar tabela de preço
 */
router.put('/precos/:id', requireRole('admin_empresa'), async (req, res) => {
  try {
    const tabela = await atualizarTabelaPreco(req.tenant_id, req.params.id, req.body);
    res.json(tabela);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /equipamentos/precos/:id
 * Deletar tabela de preço
 */
router.delete('/precos/:id', requireRole('admin_empresa'), async (req, res) => {
  try {
    await deletarTabelaPreco(req.tenant_id, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
