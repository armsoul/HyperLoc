import express from 'express';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth.js';
import { criarTenant, obterTenant, listarTenants, atualizarTenant, obterMetricasTenant } from '../services/tenantService.js';

const router = express.Router();

/**
 * POST /tenants
 * Criar novo tenant (apenas super admin)
 */
router.post('/', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { nome_fantasia, razao_social, cnpj, inscricao_estadual, endereco, telefone, email, plano } = req.body;

    if (!nome_fantasia || !razao_social || !email) {
      return res.status(400).json({ error: 'nome_fantasia, razao_social, and email are required' });
    }

    const tenant = await criarTenant({
      nome_fantasia,
      razao_social,
      cnpj,
      inscricao_estadual,
      endereco,
      telefone,
      email,
      plano,
    });

    res.status(201).json(tenant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /tenants
 * Listar todos os tenants (apenas super admin)
 */
router.get('/', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const filtros = {};
    if (req.query.status) {
      filtros.status = req.query.status;
    }

    const tenantsList = await listarTenants(filtros);
    res.json(tenantsList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /tenants/:id
 * Obter dados de um tenant específico (apenas super admin)
 */
router.get('/:id', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const tenant = await obterTenant(req.params.id);
    res.json(tenant);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /tenants/:id
 * Atualizar tenant (apenas super admin)
 */
router.put('/:id', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const tenant = await atualizarTenant(req.params.id, req.body);
    res.json(tenant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /tenants/:id/metrics
 * Obter métricas agregadas de um tenant (apenas super admin)
 */
router.get('/:id/metrics', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const metrics = await obterMetricasTenant(req.params.id);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
