import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';
import { criarCliente, obterCliente, listarClientes, atualizarCliente, deletarCliente } from '../services/clienteService.js';

const router = express.Router();

// Aplicar middlewares de autenticação e tenant
router.use(authMiddleware, tenantMiddleware);

/**
 * POST /clientes
 * Criar novo cliente
 */
router.post('/', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const { tipo, nome_razao, cpf_cnpj, ie_rg, telefone, email, endereco, cidade, uf, cep, observacoes, limite_credito } = req.body;

    if (!tipo || !nome_razao || !cpf_cnpj) {
      return res.status(400).json({ error: 'tipo, nome_razao, and cpf_cnpj are required' });
    }

    const cliente = await criarCliente(req.tenant_id, {
      tipo,
      nome_razao,
      cpf_cnpj,
      ie_rg,
      telefone,
      email,
      endereco,
      cidade,
      uf,
      cep,
      observacoes,
      limite_credito,
    });

    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /clientes
 * Listar clientes do tenant
 */
router.get('/', async (req, res) => {
  try {
    const filtros = {};
    if (req.query.nome_razao) {
      filtros.nome_razao = req.query.nome_razao;
    }
    if (req.query.status) {
      filtros.status = req.query.status;
    }
    if (req.query.tipo) {
      filtros.tipo = req.query.tipo;
    }

    const clientesList = await listarClientes(req.tenant_id, filtros);
    res.json(clientesList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /clientes/:id
 * Obter cliente específico
 */
router.get('/:id', async (req, res) => {
  try {
    const cliente = await obterCliente(req.tenant_id, req.params.id);
    res.json(cliente);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /clientes/:id
 * Atualizar cliente
 */
router.put('/:id', requireRole('admin_empresa', 'operador_comercial'), async (req, res) => {
  try {
    const cliente = await atualizarCliente(req.tenant_id, req.params.id, req.body);
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /clientes/:id
 * Deletar cliente
 */
router.delete('/:id', requireRole('admin_empresa'), async (req, res) => {
  try {
    await deletarCliente(req.tenant_id, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
