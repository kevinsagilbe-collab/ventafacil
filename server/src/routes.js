import { Router } from 'express';
import { requireAuth, requireRole } from './middlewares/auth.js';
import authRoutes from './modules/auth/auth.routes.js';
import cajaRoutes from './modules/caja/caja.routes.js';
import categoriasRoutes from './modules/categorias/categorias.routes.js';
import productosRoutes from './modules/productos/productos.routes.js';
import reportesRoutes from './modules/reportes/reportes.routes.js';
import ventasRoutes from './modules/ventas/ventas.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

router.use('/auth', authRoutes);

// Todo lo de abajo requiere sesión
router.use(requireAuth);
router.use('/categorias', categoriasRoutes);
router.use('/productos', productosRoutes);
router.use('/caja', cajaRoutes);
router.use('/ventas', ventasRoutes);
router.use('/reportes', requireRole('admin'), reportesRoutes);

export default router;
