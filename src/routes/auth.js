import express from 'express';
import { autenticar, registrarUsuario, obterUsuario } from '../services/authService.js';
import { authMiddleware } from '../middleware/auth.js';
import { tenantMiddleware } from '../middleware/tenant.js';

const router = express.Router();

/**
 * POST /auth/login
 * Autenticar usuário com email e senha
 */
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const resultado = await autenticar(email, senha);
    res.json(resultado);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * POST /auth/register
 * Registrar novo usuário (apenas para super admin)
 */
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { email, senha, nome, tenantId, papel } = req.body;

    // Apenas super admin pode registrar usuários
    if (req.user.papel !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admin can register users' });
    }

    if (!email || !senha || !nome || !tenantId) {
      return res.status(400).json({ error: 'Email, password, name, and tenantId are required' });
    }

    const usuario = await registrarUsuario(email, senha, nome, tenantId, papel);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /auth/me
 * Obter dados do usuário autenticado
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const usuario = await obterUsuario(req.user.id);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
