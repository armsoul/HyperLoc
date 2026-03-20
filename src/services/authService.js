import bcryptjs from 'bcryptjs';
import { getDatabase } from '../db/connection.js';
import { usuarios } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '../middleware/auth.js';

const db = getDatabase();

export async function registrarUsuario(email, senha, nome, tenantId, papel = 'admin_empresa') {
  try {
    // Verificar se usuário já existe
    const usuarioExistente = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    if (usuarioExistente.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash da senha
    const senhaHash = await bcryptjs.hash(senha, 10);

    // Criar novo usuário
    const novoUsuario = {
      id: uuidv4(),
      tenant_id: tenantId,
      nome,
      email,
      senha_hash: senhaHash,
      papel,
      ativo: true,
    };

    await db.insert(usuarios).values(novoUsuario);

    return {
      id: novoUsuario.id,
      email: novoUsuario.email,
      nome: novoUsuario.nome,
      tenant_id: novoUsuario.tenant_id,
      papel: novoUsuario.papel,
    };
  } catch (error) {
    throw new Error(`Error registering user: ${error.message}`);
  }
}

export async function autenticar(email, senha) {
  try {
    // Buscar usuário
    const usuarioList = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    if (usuarioList.length === 0) {
      throw new Error('Invalid email or password');
    }

    const usuario = usuarioList[0];

    // Verificar se está ativo
    if (!usuario.ativo) {
      throw new Error('User account is inactive');
    }

    // Comparar senha
    const senhaValida = await bcryptjs.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new Error('Invalid email or password');
    }

    // Atualizar último login
    await db
      .update(usuarios)
      .set({ ultimo_login: new Date() })
      .where(eq(usuarios.id, usuario.id));

    // Gerar token
    const token = generateToken(usuario);

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tenant_id: usuario.tenant_id,
        papel: usuario.papel,
      },
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

export async function obterUsuario(usuarioId) {
  try {
    const usuarioList = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, usuarioId))
      .limit(1);

    if (usuarioList.length === 0) {
      throw new Error('User not found');
    }

    const usuario = usuarioList[0];
    delete usuario.senha_hash;

    return usuario;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
}

export async function listarUsuariosPorTenant(tenantId) {
  try {
    const usuariosList = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.tenant_id, tenantId));

    return usuariosList.map(u => {
      delete u.senha_hash;
      return u;
    });
  } catch (error) {
    throw new Error(`Error listing users: ${error.message}`);
  }
}

export async function atualizarUsuario(usuarioId, dados) {
  try {
    const atualizacoes = { ...dados };
    delete atualizacoes.id;
    delete atualizacoes.tenant_id;
    delete atualizacoes.senha_hash;

    if (dados.senha) {
      atualizacoes.senha_hash = await bcryptjs.hash(dados.senha, 10);
      delete atualizacoes.senha;
    }

    atualizacoes.data_atualizacao = new Date();

    await db
      .update(usuarios)
      .set(atualizacoes)
      .where(eq(usuarios.id, usuarioId));

    return await obterUsuario(usuarioId);
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
}

export async function desativarUsuario(usuarioId) {
  try {
    await db
      .update(usuarios)
      .set({ ativo: false, data_atualizacao: new Date() })
      .where(eq(usuarios.id, usuarioId));

    return await obterUsuario(usuarioId);
  } catch (error) {
    throw new Error(`Error deactivating user: ${error.message}`);
  }
}
