const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** 12500 → "$ 12.500" */
export const formatCOP = (valor) => cop.format(valor ?? 0);

const TZ = 'America/Bogota';
const hora = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit', timeZone: TZ });
const fechaLarga = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ });

/** "8:02 a. m." */
export const formatHora = (fecha) => (fecha ? hora.format(new Date(fecha)) : '');

/** "Miércoles, 21 de mayo" */
export const formatFechaLarga = (fecha = new Date()) => {
  const texto = fechaLarga.format(new Date(fecha));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/** "Laura Martínez" → "LM" */
export const iniciales = (nombre = '') =>
  nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

export const primerNombre = (nombre = '') => nombre.split(' ')[0];

export const ROLES = { admin: 'Administrador(a)', cajero: 'Cajero(a)' };

export const MEDIOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'nequi', label: 'Nequi' },
];
