import { query, withTransaction } from '../../config/db.js';
import { badRequest } from '../../utils/httpError.js';

/** Resumen (v_resumen_turno) del turno abierto del usuario, o null */
export async function turnoAbierto(usuarioId) {
  const [turno] = await query(
    `SELECT * FROM v_resumen_turno WHERE usuario_id = ? AND estado = 'abierto'`,
    [usuarioId],
  );
  return turno ?? null;
}

/** El índice uq_turno_abierto_por_usuario impide abrir dos turnos a la vez */
export async function abrirTurno(usuarioId, montoBase) {
  await query('INSERT INTO turnos_caja (usuario_id, monto_base) VALUES (?, ?)', [usuarioId, montoBase]);
  return turnoAbierto(usuarioId);
}

export function listarMovimientos(turnoId) {
  return query(
    `SELECT id, tipo, monto, concepto, creado_en
       FROM movimientos_caja
      WHERE turno_id = ?
      ORDER BY creado_en DESC, id DESC`,
    [turnoId],
  );
}

export async function registrarMovimiento(turnoId, { tipo, monto, concepto }) {
  const { insertId } = await query(
    'INSERT INTO movimientos_caja (turno_id, tipo, monto, concepto) VALUES (?, ?, ?, ?)',
    [turnoId, tipo, monto, concepto],
  );
  const [movimiento] = await query(
    'SELECT id, tipo, monto, concepto, creado_en FROM movimientos_caja WHERE id = ?',
    [insertId],
  );
  return movimiento;
}

/**
 * Cierra el turno y guarda el arqueo (botón "Cerrar Caja y Generar Arqueo").
 * Bloquea la fila del turno para que no entren ventas mientras se calcula.
 */
export function cerrarTurno(turnoId, efectivoContado, observaciones = null) {
  return withTransaction(async (conn) => {
    const [[turno]] = await conn.query(
      `SELECT id FROM turnos_caja WHERE id = ? AND estado = 'abierto' FOR UPDATE`,
      [turnoId],
    );
    if (!turno) throw badRequest(`El turno ${turnoId} no existe o ya está cerrado`);

    const [[{ total_esperado: esperado }]] = await conn.query(
      'SELECT total_esperado FROM v_resumen_turno WHERE turno_id = ?',
      [turnoId],
    );
    const diferencia = efectivoContado - esperado;

    await conn.query(
      `UPDATE turnos_caja
          SET estado = 'cerrado', cerrado_en = NOW(), efectivo_contado = ?,
              total_esperado = ?, diferencia = ?, observaciones = COALESCE(?, observaciones)
        WHERE id = ?`,
      [efectivoContado, esperado, diferencia, observaciones || null, turnoId],
    );

    return { total_esperado: esperado, efectivo_contado: efectivoContado, diferencia };
  });
}
