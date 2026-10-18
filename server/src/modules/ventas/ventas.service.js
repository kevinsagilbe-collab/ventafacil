import { query, withTransaction } from '../../config/db.js';
import { badRequest } from '../../utils/httpError.js';

/**
 * Registra una venta (botón "Completar venta") en una sola transacción:
 * valida el turno y el stock, guarda venta + ítems y descuenta el inventario.
 * items: [{ producto_id, cantidad }]
 */
export async function registrar({ turnoId, usuarioId, medioPago, items, montoRecibido = null }) {
  const ventaId = await withTransaction(async (conn) => {
    const [[turno]] = await conn.query(
      `SELECT id FROM turnos_caja WHERE id = ? AND estado = 'abierto' FOR UPDATE`,
      [turnoId],
    );
    if (!turno) throw badRequest(`El turno ${turnoId} no está abierto`);
    if (!items?.length) throw badRequest('El ticket está vacío');

    // Si un producto llega repetido en el ticket, se suman sus cantidades
    const cantidades = new Map();
    for (const { producto_id, cantidad } of items) {
      cantidades.set(producto_id, (cantidades.get(producto_id) ?? 0) + cantidad);
    }

    // FOR UPDATE bloquea las filas mientras se vende (orden por id para evitar deadlocks)
    const [productos] = await conn.query(
      `SELECT id, nombre, precio_costo, precio_venta, iva_porcentaje, stock
         FROM productos
        WHERE id IN (?) AND activo
        ORDER BY id
          FOR UPDATE`,
      [[...cantidades.keys()]],
    );
    const porId = new Map(productos.map((p) => [p.id, p]));

    let subtotal = 0;
    let iva = 0;
    for (const [productoId, cantidad] of cantidades) {
      const p = porId.get(productoId);
      if (!p) throw badRequest(`Producto ${productoId} no existe`);
      if (p.stock < cantidad) throw badRequest(`Stock insuficiente de "${p.nombre}": quedan ${p.stock} und.`);
      subtotal += cantidad * p.precio_venta;
      iva += (cantidad * p.precio_venta * p.iva_porcentaje) / 100;
    }
    iva = Math.round(iva);
    const total = subtotal + iva;

    let recibido = null;
    let cambio = null;
    if (medioPago === 'efectivo') {
      recibido = montoRecibido ?? total;
      if (recibido < total) throw badRequest(`Monto recibido (${recibido}) menor al total (${total})`);
      cambio = recibido - total;
    }

    const [{ insertId }] = await conn.query(
      `INSERT INTO ventas (turno_id, usuario_id, subtotal, iva, total, medio_pago, monto_recibido, cambio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [turnoId, usuarioId, subtotal, iva, total, medioPago, recibido, cambio],
    );

    const filas = [...cantidades].map(([productoId, cantidad]) => {
      const p = porId.get(productoId);
      return [insertId, productoId, cantidad, p.precio_venta, p.precio_costo];
    });
    await conn.query(
      'INSERT INTO venta_items (venta_id, producto_id, cantidad, precio_unitario, costo_unitario) VALUES ?',
      [filas],
    );

    for (const [productoId, cantidad] of cantidades) {
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, productoId]);
    }

    return insertId; // número de orden
  });

  return obtener(ventaId);
}

export async function obtener(id) {
  const [venta] = await query(
    `SELECT v.*, u.nombre AS cajero
       FROM ventas v
       JOIN usuarios u ON u.id = v.usuario_id
      WHERE v.id = ?`,
    [id],
  );
  if (!venta) return null;

  venta.items = await query(
    `SELECT i.producto_id, p.nombre, i.cantidad, i.precio_unitario, i.subtotal
       FROM venta_items i
       JOIN productos p ON p.id = i.producto_id
      WHERE i.venta_id = ?
      ORDER BY i.id`,
    [id],
  );
  return venta;
}

export function listarPorTurno(turnoId) {
  return query(
    `SELECT id, fecha, total, medio_pago, estado
       FROM ventas
      WHERE turno_id = ?
      ORDER BY fecha DESC`,
    [turnoId],
  );
}
