import { Router } from 'express';
import { query } from '../../config/db.js';

const router = Router();

// Mismos cálculos que v_kpis_hoy pero para ayer: base de las variaciones (+12.5 %) de las tarjetas
const KPIS_AYER = `
  SELECT CAST(COALESCE(SUM(v.total), 0) AS SIGNED) AS ventas_dia,
         COUNT(*)                                  AS transacciones,
         CAST(COALESCE(SUM(g.ganancia), 0) AS SIGNED) AS ganancia_dia
    FROM ventas v
    LEFT JOIN (
      SELECT venta_id, SUM(cantidad * (precio_unitario - costo_unitario)) AS ganancia
        FROM venta_items GROUP BY venta_id
    ) g ON g.venta_id = v.id
   WHERE v.estado = 'completada'
     AND v.fecha >= CURDATE() - INTERVAL 1 DAY AND v.fecha < CURDATE()`;

// GET /api/reportes/dashboard  → todo lo que necesita la pantalla Reportes
router.get('/dashboard', async (_req, res) => {
  const [[kpis], [kpisAyer], ventasSemana, topProductos, stockCritico] = await Promise.all([
    query('SELECT * FROM v_kpis_hoy'),
    query(KPIS_AYER),
    query('SELECT * FROM v_ventas_semana'),
    query('SELECT * FROM v_top_productos'),
    query('SELECT id, codigo, nombre, categoria, stock, stock_minimo, estado FROM v_stock_critico'),
  ]);

  res.json({ kpis, kpisAyer, ventasSemana, topProductos, stockCritico });
});

export default router;
