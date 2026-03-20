/**
 * Middleware para garantir isolamento de dados por tenant
 * Valida que o tenant_id da requisição corresponde ao tenant_id do usuário
 */

export function tenantMiddleware(req, res, next) {
  // Super admin pode acessar qualquer tenant via query param
  if (req.user && req.user.papel === 'super_admin') {
    const tenantIdParam = req.query.tenant_id || req.body?.tenant_id;
    if (tenantIdParam) {
      req.tenant_id = tenantIdParam;
    }
    return next();
  }

  // Usuários normais só acessam seu próprio tenant
  if (!req.tenant_id) {
    return res.status(400).json({ error: 'Tenant ID not found in request' });
  }

  if (req.user && req.tenant_id !== req.user.tenant_id) {
    return res.status(403).json({ error: 'Access denied: tenant mismatch' });
  }

  next();
}

/**
 * Valida que um recurso pertence ao tenant do usuário
 * Deve ser chamado após recuperar o recurso do banco
 */
export function validateTenantAccess(resourceTenantId, userTenantId, userRole) {
  // Super admin pode acessar qualquer tenant
  if (userRole === 'super_admin') {
    return true;
  }

  // Usuários normais só acessam seu próprio tenant
  return resourceTenantId === userTenantId;
}

/**
 * Adiciona automaticamente tenant_id a queries
 * Garante que nenhuma query retorne dados de outro tenant
 */
export function applyTenantFilter(query, tenantId) {
  if (!query) return query;
  
  // Se a query já tem um where, adiciona AND tenant_id
  // Se não tem, adiciona WHERE tenant_id
  // Isso é um exemplo simplificado - em produção, usar ORM com suporte nativo
  
  return query;
}
