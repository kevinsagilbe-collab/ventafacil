import { Router } from 'express';
import { requireAuth, signToken } from '../../middlewares/auth.js';
import { badRequest, unauthorized } from '../../utils/httpError.js';
import * as authService from './auth.service.js';

const router = Router();

// POST /api/auth/login  { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) throw badRequest('Email y contraseña son obligatorios');

  const usuario = await authService.verificarCredenciales(email, password);
  if (!usuario) throw unauthorized('Email o contraseña incorrectos');

  res.json({ token: signToken(usuario), usuario });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const usuario = await authService.obtenerUsuario(req.user.id);
  if (!usuario) throw unauthorized('Usuario inactivo');
  res.json(usuario);
});

export default router;
