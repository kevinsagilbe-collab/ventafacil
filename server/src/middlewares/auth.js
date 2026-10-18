import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { forbidden, unauthorized } from '../utils/httpError.js';

export function signToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

/** Exige un "Authorization: Bearer <token>" válido y deja el usuario en req.user */
export function requireAuth(req, _res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized());

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, nombre: payload.nombre, rol: payload.rol };
    next();
  } catch {
    next(unauthorized('Sesión expirada, vuelve a iniciar sesión'));
  }
}

/** Usar después de requireAuth: requireRole('admin') */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.rol)) return next(forbidden());
  next();
};
