import { getDatabase } from '../db/connection.js';
import { clientes } from '../db/schema.js';
import { eq, and, like } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase();

export async function criarCliente(tenantId, dados) {
  try {
    const novoCliente = {
      id: uuidv4(),
      tenant_id: tenantId,
      tipo: dados.tipo, // PJ ou PF
      nome_razao: dados.nome_razao,
      cpf_cnpj: dados.cpf_cnpj,
      ie_rg: dados.ie_rg,
      telefone: dados.telefone,
      email: dados.email,
      endereco: dados.endereco,
      cidade: dados.cidade,
      uf: dados.uf,
      cep: dados.cep,
      observacoes: dados.observacoes,
      limite_credito: dados.limite_credito || 0,
      status: 'ativo',
    };

    await db.insert(clientes).values(novoCliente);
    return novoCliente;
  } catch (error) {
    throw new Error(`Error creating client: ${error.message}`);
  }
}

export async function obterCliente(tenantId, clienteId) {
  try {
    const clienteList = await db
      .select()
      .from(clientes)
      .where(and(
        eq(clientes.id, clienteId),
        eq(clientes.tenant_id, tenantId)
      ))
      .limit(1);

    if (clienteList.length === 0) {
      throw new Error('Client not found');
    }

    return clienteList[0];
  } catch (error) {
    throw new Error(`Error fetching client: ${error.message}`);
  }
}

export async function listarClientes(tenantId, filtros = {}) {
  try {
    let query = db
      .select()
      .from(clientes)
      .where(eq(clientes.tenant_id, tenantId));

    if (filtros.nome_razao) {
      query = query.where(like(clientes.nome_razao, `%${filtros.nome_razao}%`));
    }

    if (filtros.status) {
      query = query.where(eq(clientes.status, filtros.status));
    }

    if (filtros.tipo) {
      query = query.where(eq(clientes.tipo, filtros.tipo));
    }

    const clientesList = await query;
    return clientesList;
  } catch (error) {
    throw new Error(`Error listing clients: ${error.message}`);
  }
}

export async function atualizarCliente(tenantId, clienteId, dados) {
  try {
    // Validar que o cliente pertence ao tenant
    await obterCliente(tenantId, clienteId);

    const atualizacoes = { ...dados };
    delete atualizacoes.id;
    delete atualizacoes.tenant_id;
    atualizacoes.data_atualizacao = new Date();

    await db
      .update(clientes)
      .set(atualizacoes)
      .where(and(
        eq(clientes.id, clienteId),
        eq(clientes.tenant_id, tenantId)
      ));

    return await obterCliente(tenantId, clienteId);
  } catch (error) {
    throw new Error(`Error updating client: ${error.message}`);
  }
}

export async function deletarCliente(tenantId, clienteId) {
  try {
    // Validar que o cliente pertence ao tenant
    await obterCliente(tenantId, clienteId);

    await db
      .delete(clientes)
      .where(and(
        eq(clientes.id, clienteId),
        eq(clientes.tenant_id, tenantId)
      ));

    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting client: ${error.message}`);
  }
}
