import { Router } from 'express';
import { badRequest } from '../../utils/httpError.js';
import * as cajaService from './caja.service.js';

const router = Router();

// GET /api/caja/turno-actual  → resumen del turno abierto o null
router.get('/turno-actual', async (req, res) => {
  res.json(await cajaService.turnoAbierto(req.user.id));
});

// POST /api/caja/abrir  { monto_base }
router.post('/abrir', async (req, res) => {
  const montoBase = Number(req.body?.monto_base);
  if (!Number.isInteger(montoBase) || montoBase < 0) throw badRequest('Monto base inválido');
  res.status(201).json(await cajaService.abrirTurno(req.user.id, montoBase));
});

// GET /api/caja/movimientos
router.get('/movimientos', async (req, res) => {
  const turno = await requireTurno(req.user.id);
  res.json(await cajaService.listarMovimientos(turno.turno_id));
});

// POST /api/caja/movimientos  { tipo: 'ingreso'|'egreso', monto, concepto }
router.post('/movimientos', async (req, res) => {
  const { tipo, concepto } = req.body ?? {};
  const monto = Number(req.body?.monto);
  if (!['ingreso', 'egreso'].includes(tipo)) throw badRequest('Tipo de movimiento inválido');
  if (!Number.isInteger(monto) || monto <= 0) throw badRequest('El monto debe ser mayor a 0');
  if (!concepto?.trim()) throw badRequest('El concepto es obligatorio');

  const turno = await requireTurno(req.user.id);
  const movimiento = await cajaService.registrarMovimiento(turno.turno_id, {
    tipo, monto, concepto: concepto.trim(),
  });
  res.status(201).json(movimiento);
});

// POST /api/caja/cerrar  { efectivo_contado, observaciones? }  → arqueo
router.post('/cerrar', async (req, res) => {
  const efectivo = Number(req.body?.efectivo_contado);
  if (!Number.isInteger(efectivo) || efectivo < 0) throw badRequest('Efectivo contado inválido');

  const turno = await requireTurno(req.user.id);
  const arqueo = await cajaService.cerrarTurno(turno.turno_id, efectivo, req.body?.observaciones?.trim());
  res.json(arqueo);
});

async function requireTurno(usuarioId) {
  const turno = await cajaService.turnoAbierto(usuarioId);
  if (!turno) throw badRequest('No tienes un turno de caja abierto');
  return turno;
}

export default router;
