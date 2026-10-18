import { Router } from 'express';
import { requireRole } from '../../middlewares/auth.js';
import { badRequest, notFound } from '../../utils/httpError.js';
import * as productosService from './productos.service.js';

const router = Router();

// GET /api/productos?q=agua&categoriaId=1&criticos=true
router.get('/', async (req, res) => {
  const productos = await productosService.listar({
    q: req.query.q?.trim(),
    categoriaId: Number(req.query.categoriaId) || null,
    soloCriticos: req.query.criticos === 'true',
  });
  res.json(productos);
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  const producto = await productosService.obtener(Number(req.params.id));
  if (!producto) throw notFound('Producto no encontrado');
  res.json(producto);
});

// Escritura: solo administradores
router.post('/', requireRole('admin'), async (req, res) => {
  const producto = await productosService.crear(validarProducto(req.body));
  res.status(201).json(producto);
});

router.put('/:id', requireRole('admin'), async (req, res) => {
  const producto = await productosService.actualizar(Number(req.params.id), validarProducto(req.body));
  if (!producto) throw notFound('Producto no encontrado');
  res.json(producto);
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const ok = await productosService.desactivar(Number(req.params.id));
  if (!ok) throw notFound('Producto no encontrado');
  res.status(204).end();
});

function validarProducto(body = {}) {
  const codigo = String(body.codigo ?? '').trim();
  const nombre = String(body.nombre ?? '').trim();
  if (!codigo) throw badRequest('El código es obligatorio');
  if (!nombre) throw badRequest('El nombre es obligatorio');

  const entero = (campo, valor, defecto) => {
    const n = valor === undefined || valor === '' ? defecto : Number(valor);
    if (!Number.isInteger(n) || n < 0) throw badRequest(`"${campo}" debe ser un entero mayor o igual a 0`);
    return n;
  };

  const iva = body.iva_porcentaje === undefined || body.iva_porcentaje === '' ? 19 : Number(body.iva_porcentaje);
  if (Number.isNaN(iva) || iva < 0 || iva > 99) throw badRequest('IVA inválido');

  return {
    codigo,
    nombre,
    categoria_id: entero('categoria_id', body.categoria_id),
    precio_costo: entero('precio_costo', body.precio_costo),
    precio_venta: entero('precio_venta', body.precio_venta),
    iva_porcentaje: iva,
    stock: entero('stock', body.stock, 0),
    stock_minimo: entero('stock_minimo', body.stock_minimo, 5),
    imagen_url: body.imagen_url?.trim() || null,
  };
}

export default router;
