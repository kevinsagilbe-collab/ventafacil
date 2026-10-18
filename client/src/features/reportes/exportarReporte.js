// Botón "Exportar reporte": descarga un CSV (se abre en Excel) con los datos del dashboard
export function exportarReporte({ kpis, ventasSemana, topProductos, stockCritico }) {
  const filas = [
    ['Indicadores de hoy'],
    ['Ventas del día', kpis.ventas_dia],
    ['Transacciones', kpis.transacciones],
    ['Ganancia neta', kpis.ganancia_dia],
    ['Productos en stock mínimo', kpis.productos_stock_minimo],
    [],
    ['Ventas de la semana'],
    ['Fecha', 'Día', 'Total'],
    ...ventasSemana.map((d) => [String(d.dia).slice(0, 10), d.dia_corto, d.total]),
    [],
    ['Top 5 productos'],
    ['Producto', 'Categoría', 'Unidades'],
    ...topProductos.map((p) => [p.nombre, p.categoria, p.unidades]),
    [],
    ['Stock crítico'],
    ['Código', 'Producto', 'Stock', 'Mínimo', 'Estado'],
    ...stockCritico.map((p) => [p.codigo, p.nombre, p.stock, p.stock_minimo, p.estado]),
  ];

  const celda = (v) => (/[";\n]/.test(String(v ?? '')) ? `"${String(v).replaceAll('"', '""')}"` : (v ?? ''));
  // ";" como separador y BOM para que Excel en español lo abra con tildes y columnas correctas
  const csv = '﻿' + filas.map((f) => f.map(celda).join(';')).join('\r\n');

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-ventafacil-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
