import { Router } from 'express';
import { query } from '../../config/db.js';

const router = Router();

// GET /api/categorias
router.get('/', async (_req, res) => {
  res.json(await query('SELECT id, nombre FROM categorias ORDER BY id'));
});

export default router;
