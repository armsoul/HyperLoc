import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';

export function generateToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      tenant_id: usuario.tenant_id,
      papel: usuario.papel,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;
    req.tenant_id = decoded.tenant_id;
    req.user_id = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.papel)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.papel !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can access this resource' });
  }
  next();
}
