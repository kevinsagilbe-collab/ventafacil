import { query } from '../../config/db.js';

// v_inventario ya trae categoría, margen y estado; se completa con iva y categoria_id
const SELECT_INVENTARIO = `
  SELECT v.*, p.categoria_id, p.iva_porcentaje
    FROM v_inventario v
    JOIN productos p ON p.id = v.id`;

export async function listar({ q, categoriaId, soloCriticos } = {}) {
  const where = [];
  const params = [];

  // La collation de MySQL ya ignora mayúsculas y tildes en LIKE
  if (q) {
    where.push('(v.nombre LIKE ? OR v.codigo LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (categoriaId) {
    where.push('p.categoria_id = ?');
    params.push(categoriaId);
  }
  if (soloCriticos) where.push(`v.estado <> 'En stock'`);

  return query(
    `${SELECT_INVENTARIO}
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY v.nombre`,
    params,
  );
}

export async function obtener(id) {
  const [producto] = await query(`${SELECT_INVENTARIO} WHERE v.id = ?`, [id]);
  return producto ?? null;
}

export async function crear(data) {
  const { insertId } = await query(
    `INSERT INTO productos
       (codigo, nombre, categoria_id, precio_costo, precio_venta,
        iva_porcentaje, stock, stock_minimo, imagen_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.codigo, data.nombre, data.categoria_id, data.precio_costo, data.precio_venta,
      data.iva_porcentaje, data.stock, data.stock_minimo, data.imagen_url,
    ],
  );
  return obtener(insertId);
}

export async function actualizar(id, data) {
  const { affectedRows } = await query(
    `UPDATE productos
        SET codigo = ?, nombre = ?, categoria_id = ?, precio_costo = ?, precio_venta = ?,
            iva_porcentaje = ?, stock = ?, stock_minimo = ?, imagen_url = ?
      WHERE id = ? AND activo`,
    [
      data.codigo, data.nombre, data.categoria_id, data.precio_costo, data.precio_venta,
      data.iva_porcentaje, data.stock, data.stock_minimo, data.imagen_url, id,
    ],
  );
  return affectedRows ? obtener(id) : null;
}

/** Borrado lógico: el producto sigue existiendo para el historial de ventas */
export async function desactivar(id) {
  const { affectedRows } = await query(
    'UPDATE productos SET activo = FALSE WHERE id = ? AND activo',
    [id],
  );
  return affectedRows > 0;
}
