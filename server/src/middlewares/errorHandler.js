import { HttpError } from '../utils/httpError.js';

// Errores de MySQL más comunes en este proyecto
const MYSQL_ERRORS = {
  ER_DUP_ENTRY: 409,                  // código de producto repetido, turno ya abierto…
  ER_NO_REFERENCED_ROW_2: 400,        // FK a un registro que no existe (categoría, usuario…)
  ER_ROW_IS_REFERENCED_2: 409,        // borrar algo que otros registros usan
  ER_CHECK_CONSTRAINT_VIOLATED: 400,  // CHECK (stock >= 0, medio de pago…)
};

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.code && MYSQL_ERRORS[err.code]) {
    return res.status(MYSQL_ERRORS[err.code]).json({ error: mysqlMessage(err) });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

function mysqlMessage(err) {
  const msg = err.sqlMessage ?? '';
  switch (err.code) {
    case 'ER_DUP_ENTRY':
      if (msg.includes('uq_turno_abierto_por_usuario')) return 'Ya tienes un turno de caja abierto';
      if (msg.includes('codigo')) return 'Ya existe un producto con ese código';
      return 'El registro ya existe';
    case 'ER_NO_REFERENCED_ROW_2':
      return msg.includes('categoria') ? 'La categoría no existe' : 'Referencia inválida';
    case 'ER_ROW_IS_REFERENCED_2':
      return 'No se puede eliminar: el registro está en uso';
    default:
      return 'Datos inválidos';
  }
}
