import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Express middleware that validates the JWT access token.
 * It expects the token either in the "Authorization: Bearer <token>" header
 * or in the "access_token" cookie.
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    let token = null;

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      globalRole: decoded.globalRole
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Middleware factory to enforce a minimum global role.
 * This is used for system-wide admin capabilities.
 */
export function requireGlobalRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (req.user.globalRole !== requiredRole) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    return next();
  };
}

