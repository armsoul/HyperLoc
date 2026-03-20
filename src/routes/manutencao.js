import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import {
  criarOrdemManutencao, obterOrdemManutencao, listarOrdensManutencao,
  atualizarOrdemManutencao, iniciarManutencao, concluirManutencao,
  cancelarManutencao, obterHistoricoManutencao
} from '../services/manutencaoService.js';

const router = express.Router();

// Aplicar middlewares
router.use(authMiddleware, tenantMiddleware);

/**
 * POST /manutencao
 * Criar nova ordem de manutenção
 */
router.post('/', requireRole('admin_empresa', 'manutencao'), async (req, res) => {
  try {
    const { numero, equipamento_id, tipo, data_previsao, responsavel_id, custo_estimado, observacoes } = req.body;

    if (!numero || !equipamento_id || !tipo) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    const ordem = await criarOrdemManutencao(req.tenant_id, {
      numero, equipamento_id, tipo, data_previsao, responsavel_id, custo_estimado, observacoes
    });

    res.status(201).json(ordem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /manutencao
 * Listar ordens de manutenção
 */
router.get('/', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.status) filtros.status = req.query.status;
    if (req.query.equipamento_id) filtros.equipamento_id = req.query.equipamento_id;
    if (req.query.tipo) filtros.tipo = req.query.tipo;

    const ordens = await listarOrdensManutencao(req.tenant_id, filtros);
    res.json(ordens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /manutencao/:id
 * Obter ordem de manutenção específica
 */
router.get('/:id', async (req, res) => {
  try {
    const ordem = await obterOrdemManutencao(req.tenant_id, req.params.id);
    res.json(ordem);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /manutencao/:id
 * Atualizar ordem de manutenção
 */
router.put('/:id', requireRole('admin_empresa', 'manutencao'), async (req, res) => {
  try {
    const ordem = await atualizarOrdemManutencao(req.tenant_id, req.params.id, req.body);
    res.json(ordem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /manutencao/:id/iniciar
 * Iniciar manutenção
 */
router.post('/:id/iniciar', requireRole('admin_empresa', 'manutencao'), async (req, res) => {
  try {
    const ordem = await iniciarManutencao(req.tenant_id, req.params.id);
    res.json(ordem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /manutencao/:id/concluir
 * Concluir manutenção
 */
router.post('/:id/concluir', requireRole('admin_empresa', 'manutencao'), async (req, res) => {
  try {
    const { custo_real } = req.body;

    if (!custo_real) {
      return res.status(400).json({ error: 'custo_real é obrigatório' });
    }

    const ordem = await concluirManutencao(req.tenant_id, req.params.id, custo_real);
    res.json(ordem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /manutencao/:id/cancelar
 * Cancelar manutenção
 */
router.post('/:id/cancelar', requireRole('admin_empresa', 'manutencao'), async (req, res) => {
  try {
    const ordem = await cancelarManutencao(req.tenant_id, req.params.id);
    res.json(ordem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /manutencao/equipamento/:equipamento_id/historico
 * Obter histórico de manutenção de um equipamento
 */
router.get('/equipamento/:equipamento_id/historico', async (req, res) => {
  try {
    const historico = await obterHistoricoManutencao(req.tenant_id, req.params.equipamento_id);
    res.json(historico);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
