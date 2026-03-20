import { getDatabase } from '../db/connection.js';
import { equipamentos, categorias_equipamento, tabela_preco_equipamento } from '../db/schema.js';
import { eq, and, like } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const db = getDatabase();

// ============================================================================
// CATEGORIAS
// ============================================================================

export async function criarCategoria(tenantId, dados) {
  try {
    const novaCategoria = {
      id: uuidv4(),
      tenant_id: tenantId,
      nome: dados.nome,
      descricao: dados.descricao,
    };

    await db.insert(categorias_equipamento).values(novaCategoria);
    return novaCategoria;
  } catch (error) {
    throw new Error(`Error creating category: ${error.message}`);
  }
}

export async function obterCategoria(tenantId, categoriaId) {
  try {
    const categoriaList = await db
      .select()
      .from(categorias_equipamento)
      .where(and(
        eq(categorias_equipamento.id, categoriaId),
        eq(categorias_equipamento.tenant_id, tenantId)
      ))
      .limit(1);

    if (categoriaList.length === 0) {
      throw new Error('Category not found');
    }

    return categoriaList[0];
  } catch (error) {
    throw new Error(`Error fetching category: ${error.message}`);
  }
}

export async function listarCategorias(tenantId) {
  try {
    const categoriasList = await db
      .select()
      .from(categorias_equipamento)
      .where(eq(categorias_equipamento.tenant_id, tenantId));

    return categoriasList;
  } catch (error) {
    throw new Error(`Error listing categories: ${error.message}`);
  }
}

// ============================================================================
// EQUIPAMENTOS
// ============================================================================

export async function criarEquipamento(tenantId, dados) {
  try {
    // Validar que categoria pertence ao tenant
    await obterCategoria(tenantId, dados.categoria_id);

    const novoEquipamento = {
      id: uuidv4(),
      tenant_id: tenantId,
      codigo_interno: dados.codigo_interno,
      descricao: dados.descricao,
      categoria_id: dados.categoria_id,
      numero_serie: dados.numero_serie,
      fabricante: dados.fabricante,
      modelo: dados.modelo,
      ano_fabricacao: dados.ano_fabricacao,
      valor_aquisicao: dados.valor_aquisicao,
      data_aquisicao: dados.data_aquisicao,
      status_estoque: 'disponivel',
      localizacao_atual: dados.localizacao_atual,
      observacoes: dados.observacoes,
    };

    await db.insert(equipamentos).values(novoEquipamento);
    return novoEquipamento;
  } catch (error) {
    throw new Error(`Error creating equipment: ${error.message}`);
  }
}

export async function obterEquipamento(tenantId, equipamentoId) {
  try {
    const equipamentoList = await db
      .select()
      .from(equipamentos)
      .where(and(
        eq(equipamentos.id, equipamentoId),
        eq(equipamentos.tenant_id, tenantId)
      ))
      .limit(1);

    if (equipamentoList.length === 0) {
      throw new Error('Equipment not found');
    }

    return equipamentoList[0];
  } catch (error) {
    throw new Error(`Error fetching equipment: ${error.message}`);
  }
}

export async function listarEquipamentos(tenantId, filtros = {}) {
  try {
    let query = db
      .select()
      .from(equipamentos)
      .where(eq(equipamentos.tenant_id, tenantId));

    if (filtros.categoria_id) {
      query = query.where(eq(equipamentos.categoria_id, filtros.categoria_id));
    }

    if (filtros.status_estoque) {
      query = query.where(eq(equipamentos.status_estoque, filtros.status_estoque));
    }

    if (filtros.descricao) {
      query = query.where(like(equipamentos.descricao, `%${filtros.descricao}%`));
    }

    const equipamentosList = await query;
    return equipamentosList;
  } catch (error) {
    throw new Error(`Error listing equipment: ${error.message}`);
  }
}

export async function atualizarEquipamento(tenantId, equipamentoId, dados) {
  try {
    // Validar que equipamento pertence ao tenant
    await obterEquipamento(tenantId, equipamentoId);

    const atualizacoes = { ...dados };
    delete atualizacoes.id;
    delete atualizacoes.tenant_id;
    atualizacoes.data_atualizacao = new Date();

    await db
      .update(equipamentos)
      .set(atualizacoes)
      .where(and(
        eq(equipamentos.id, equipamentoId),
        eq(equipamentos.tenant_id, tenantId)
      ));

    return await obterEquipamento(tenantId, equipamentoId);
  } catch (error) {
    throw new Error(`Error updating equipment: ${error.message}`);
  }
}

export async function atualizarStatusEquipamento(tenantId, equipamentoId, novoStatus) {
  try {
    await obterEquipamento(tenantId, equipamentoId);

    await db
      .update(equipamentos)
      .set({ 
        status_estoque: novoStatus,
        data_atualizacao: new Date()
      })
      .where(and(
        eq(equipamentos.id, equipamentoId),
        eq(equipamentos.tenant_id, tenantId)
      ));

    return await obterEquipamento(tenantId, equipamentoId);
  } catch (error) {
    throw new Error(`Error updating equipment status: ${error.message}`);
  }
}

// ============================================================================
// TABELAS DE PREÇO
// ============================================================================

export async function criarTabelaPreco(tenantId, dados) {
  try {
    // Validar que equipamento pertence ao tenant
    await obterEquipamento(tenantId, dados.equipamento_id);

    const novaTabela = {
      id: uuidv4(),
      tenant_id: tenantId,
      equipamento_id: dados.equipamento_id,
      tipo_periodo: dados.tipo_periodo,
      valor_diaria: dados.valor_diaria,
      valor_mensal: dados.valor_mensal,
      desconto_maximo_permitido: dados.desconto_maximo_permitido || 0,
    };

    await db.insert(tabela_preco_equipamento).values(novaTabela);
    return novaTabela;
  } catch (error) {
    throw new Error(`Error creating price table: ${error.message}`);
  }
}

export async function obterTabelaPreco(tenantId, tabelaId) {
  try {
    const tabelaList = await db
      .select()
      .from(tabela_preco_equipamento)
      .where(and(
        eq(tabela_preco_equipamento.id, tabelaId),
        eq(tabela_preco_equipamento.tenant_id, tenantId)
      ))
      .limit(1);

    if (tabelaList.length === 0) {
      throw new Error('Price table not found');
    }

    return tabelaList[0];
  } catch (error) {
    throw new Error(`Error fetching price table: ${error.message}`);
  }
}

export async function listarTabelasPreco(tenantId, equipamentoId) {
  try {
    const tabelasList = await db
      .select()
      .from(tabela_preco_equipamento)
      .where(and(
        eq(tabela_preco_equipamento.tenant_id, tenantId),
        eq(tabela_preco_equipamento.equipamento_id, equipamentoId)
      ));

    return tabelasList;
  } catch (error) {
    throw new Error(`Error listing price tables: ${error.message}`);
  }
}

export async function atualizarTabelaPreco(tenantId, tabelaId, dados) {
  try {
    await obterTabelaPreco(tenantId, tabelaId);

    const atualizacoes = { ...dados };
    delete atualizacoes.id;
    delete atualizacoes.tenant_id;
    delete atualizacoes.equipamento_id;
    atualizacoes.data_atualizacao = new Date();

    await db
      .update(tabela_preco_equipamento)
      .set(atualizacoes)
      .where(and(
        eq(tabela_preco_equipamento.id, tabelaId),
        eq(tabela_preco_equipamento.tenant_id, tenantId)
      ));

    return await obterTabelaPreco(tenantId, tabelaId);
  } catch (error) {
    throw new Error(`Error updating price table: ${error.message}`);
  }
}

export async function deletarTabelaPreco(tenantId, tabelaId) {
  try {
    await obterTabelaPreco(tenantId, tabelaId);

    await db
      .delete(tabela_preco_equipamento)
      .where(and(
        eq(tabela_preco_equipamento.id, tabelaId),
        eq(tabela_preco_equipamento.tenant_id, tenantId)
      ));

    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting price table: ${error.message}`);
  }
}
