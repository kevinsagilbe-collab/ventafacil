// Genera ventas de los últimos 6 días + hoy para que Reportes y Caja muestren datos.
// Usa los mismos servicios que la API, así las ventas pasan por las mismas validaciones.
// Requiere haber ejecutado database/01_esquema.sql y 02_datos_prueba.sql.
//
//   npm run seed:historial            → solo si aún no hay ventas
//   npm run seed:historial -- --reset → borra ventas, turnos y movimientos y vuelve a generarlos
//                                        (también repara una ejecución que se interrumpió)
import { pool, query } from '../src/config/db.js';
import * as cajaService from '../src/modules/caja/caja.service.js';
import * as ventasService from '../src/modules/ventas/ventas.service.js';

const RESET = process.argv.includes('--reset');
const MEDIOS = ['efectivo', 'efectivo', 'tarjeta', 'nequi'];
// Stock del prototipo: se restaura al final aunque el script se interrumpa
const STOCK_PROTOTIPO = {
  'BEB-001': 34, 'BEB-014': 18, 'ALI-021': 9, 'ALI-008': 5,
  'BEB-027': 22, 'ASE-004': 4, 'ALI-034': 16, 'BEB-033': 27,
};

const azar = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const elegir = (lista) => lista[azar(0, lista.length - 1)];

async function restaurarStock() {
  for (const [codigo, stock] of Object.entries(STOCK_PROTOTIPO)) {
    await query('UPDATE productos SET stock = ? WHERE codigo = ?', [stock, codigo]);
  }
}

async function borrarHistorial() {
  await query('DELETE FROM movimientos_caja');
  await query('DELETE FROM venta_items');
  await query('DELETE FROM ventas');
  await query('DELETE FROM turnos_caja');
  await query('ALTER TABLE ventas AUTO_INCREMENT = 1001');
  await restaurarStock();
  console.log('Historial anterior borrado y stock restaurado.');
}

async function main() {
  if (RESET) await borrarHistorial();

  const [{ ventas }] = await query('SELECT COUNT(*) AS ventas FROM ventas');
  if (ventas > 0) {
    console.log(`Ya hay ${ventas} ventas registradas. Usa "npm run seed:historial -- --reset" para empezar de cero.`);
    return;
  }

  const usuarios = await query(`SELECT id, email FROM usuarios WHERE email IN ('laura@ventafacil.com', 'carlos@ventafacil.com')`);
  const laura = usuarios.find((u) => u.email.startsWith('laura'))?.id;
  const carlos = usuarios.find((u) => u.email.startsWith('carlos'))?.id;
  if (!laura || !carlos) throw new Error('Faltan los usuarios de prueba: ejecuta primero 02_datos_prueba.sql');

  const productos = await query('SELECT id FROM productos WHERE activo');
  await query('UPDATE productos SET stock = 100000'); // stock temporal para generar ventas

  // Si lo interrumpes con Ctrl+C, igual deja el stock como en el prototipo
  process.once('SIGINT', async () => {
    console.log('\nInterrumpido: restaurando stock…');
    await restaurarStock().catch(() => {});
    console.log('Vuelve a ejecutarlo con -- --reset para completar el historial.');
    process.exit(130);
  });

  const ticketAlAzar = (maxCantidad) => {
    const ids = [...productos].sort(() => Math.random() - 0.5).slice(0, azar(1, 3)).map((p) => p.id);
    return ids.map((id) => ({ producto_id: id, cantidad: azar(1, maxCantidad) }));
  };

  async function venderTurno(turnoId, usuarioId, cuantas, maxCantidad, etiqueta) {
    for (let n = 1; n <= cuantas; n++) {
      await ventasService.registrar({ turnoId, usuarioId, medioPago: elegir(MEDIOS), items: ticketAlAzar(maxCantidad) });
      process.stdout.write(`\r${etiqueta}: ${n}/${cuantas} ventas`);
    }
    process.stdout.write('\n');
  }

  try {
    // Días anteriores: turno de 8:00 a. m., ventas aleatorias y cierre cuadrado
    for (let d = 6; d >= 1; d--) {
      const usuarioId = d % 2 === 0 ? laura : carlos;
      const { turno_id: turnoId } = await cajaService.abrirTurno(usuarioId, 200000);
      await query('UPDATE turnos_caja SET abierto_en = CURDATE() - INTERVAL ? DAY + INTERVAL 8 HOUR WHERE id = ?', [d, turnoId]);

      await venderTurno(turnoId, usuarioId, azar(14, 24), 3, `Día -${d}`);
      await query(
        `UPDATE ventas v JOIN turnos_caja t ON t.id = v.turno_id
            SET v.fecha = t.abierto_en + INTERVAL FLOOR(RAND() * 39600) SECOND
          WHERE v.turno_id = ?`,
        [turnoId],
      );

      const [{ total_esperado: esperado }] = await query('SELECT total_esperado FROM v_resumen_turno WHERE turno_id = ?', [turnoId]);
      await cajaService.cerrarTurno(turnoId, esperado);
      await query('UPDATE turnos_caja SET cerrado_en = abierto_en + INTERVAL 12 HOUR WHERE id = ?', [turnoId]);
    }

    // Hoy: turno abierto de Laura desde las 8:02 a. m. con base de $200.000
    const { turno_id: hoy } = await cajaService.abrirTurno(laura, 200000);
    await query(
      `UPDATE turnos_caja
          SET abierto_en = LEAST(CURDATE() + INTERVAL 482 MINUTE, NOW() - INTERVAL 1 HOUR)
        WHERE id = ?`,
      [hoy],
    );
    await venderTurno(hoy, laura, 15, 2, 'Hoy');
    await query(
      `UPDATE ventas v JOIN turnos_caja t ON t.id = v.turno_id
          SET v.fecha = t.abierto_en + INTERVAL FLOOR(RAND() * TIMESTAMPDIFF(SECOND, t.abierto_en, NOW())) SECOND
        WHERE v.turno_id = ?`,
      [hoy],
    );
    await cajaService.registrarMovimiento(hoy, { tipo: 'egreso', monto: 15000, concepto: 'Pago domicilio proveedor' });
    await cajaService.registrarMovimiento(hoy, { tipo: 'ingreso', monto: 20000, concepto: 'Sencillo adicional' });
  } finally {
    await restaurarStock();
  }

  console.table(await query('SELECT * FROM v_kpis_hoy'));
}

main()
  .catch((err) => {
    console.error('\nError generando el historial:', err.message);
    console.error('Vuelve a ejecutarlo con: npm run seed:historial -- --reset');
    process.exitCode = 1;
  })
  .finally(() => pool.end());
