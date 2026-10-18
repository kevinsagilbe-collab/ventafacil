// Un objeto por recurso del backend. Las pantallas solo usan estas funciones,
// nunca fetch directo, así los endpoints viven en un único lugar.
import { http } from './http.js';

export const authApi = {
  login: (email, password) => http.post('/auth/login', { email, password }),
  me: () => http.get('/auth/me'),
};

export const categoriasApi = {
  listar: () => http.get('/categorias'),
};

export const productosApi = {
  listar: (filtros) => http.get('/productos', filtros),
  obtener: (id) => http.get(`/productos/${id}`),
  crear: (data) => http.post('/productos', data),
  actualizar: (id, data) => http.put(`/productos/${id}`, data),
  eliminar: (id) => http.del(`/productos/${id}`),
};

export const cajaApi = {
  turnoActual: () => http.get('/caja/turno-actual'),
  abrir: (montoBase) => http.post('/caja/abrir', { monto_base: montoBase }),
  movimientos: () => http.get('/caja/movimientos'),
  registrarMovimiento: (data) => http.post('/caja/movimientos', data),
  cerrar: (efectivoContado, observaciones) =>
    http.post('/caja/cerrar', { efectivo_contado: efectivoContado, observaciones }),
};

export const ventasApi = {
  delTurno: () => http.get('/ventas'),
  obtener: (id) => http.get(`/ventas/${id}`),
  registrar: (data) => http.post('/ventas', data),
};

export const reportesApi = {
  dashboard: () => http.get('/reportes/dashboard'),
};
