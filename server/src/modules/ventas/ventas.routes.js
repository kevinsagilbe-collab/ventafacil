import { Router } from 'express';
import { badRequest, notFound } from '../../utils/httpError.js';
import * as cajaService from '../caja/caja.service.js';
import * as ventasService from './ventas.service.js';

const router = Router();
const MEDIOS_PAGO = ['efectivo', 'tarjeta', 'nequi'];

// GET /api/ventas  → ventas del turno abierto del usuario
router.get('/', async (req, res) => {
  const turno = await cajaService.turnoAbierto(req.user.id);
  res.json(turno ? await ventasService.listarPorTurno(turno.turno_id) : []);
});

// GET /api/ventas/:id  → ticket con sus ítems
router.get('/:id', async (req, res) => {
  const venta = await ventasService.obtener(Number(req.params.id));
  if (!venta) throw notFound('Venta no encontrada');
  res.json(venta);
});

// POST /api/ventas  { medio_pago, items: [{ producto_id, cantidad }], monto_recibido? }
router.post('/', async (req, res) => {
  const { medio_pago: medioPago, items, monto_recibido: montoRecibido } = req.body ?? {};

  if (!MEDIOS_PAGO.includes(medioPago)) throw badRequest('Medio de pago inválido');
  if (!Array.isArray(items) || items.length === 0) throw badRequest('El ticket está vacío');

  const itemsLimpios = items.map(({ producto_id, cantidad }) => {
    if (!Number.isInteger(producto_id) || !Number.isInteger(cantidad) || cantidad <= 0) {
      throw badRequest('Ítems del ticket inválidos');
    }
    return { producto_id, cantidad };
  });

  const turno = await cajaService.turnoAbierto(req.user.id);
  if (!turno) throw badRequest('Abre la caja antes de vender');

  const venta = await ventasService.registrar({
    turnoId: turno.turno_id,
    usuarioId: req.user.id,
    medioPago,
    items: itemsLimpios,
    montoRecibido: medioPago === 'efectivo' && montoRecibido ? Number(montoRecibido) : null,
  });
  res.status(201).json(venta);
});

export default router;
