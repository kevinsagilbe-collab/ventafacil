import fs from 'node:fs';
import mysql from 'mysql2/promise';
import { env } from './env.js';

// Colombia es UTC-5 todo el año. Se usa el offset y no 'America/Bogota'
// porque MySQL solo reconoce nombres de zona si tiene cargadas sus tablas.
export const TIME_ZONE = '-05:00';

// Aiven exige SSL
const ca = env.dbCaCert ?? (env.dbCaCertPath && fs.readFileSync(env.dbCaCertPath, 'utf8'));
const ssl = ca ? { ca } : { rejectUnauthorized: false };

// El Service URI de Aiven trae "?ssl-mode=REQUIRED", que mysql2 no entiende: el SSL va en `ssl`
const uri = new URL(env.databaseUrl);
uri.searchParams.delete('ssl-mode');

export const pool = mysql.createPool({
  uri: uri.toString(),
  ssl,
  timezone: TIME_ZONE,   // cómo convierte mysql2 los DATETIME a Date de JS y viceversa
  decimalNumbers: true,  // SUM() y DECIMAL llegan como Number, no como texto
  connectionLimit: 10,
});

// CURDATE() / NOW() de las vistas y los DEFAULT CURRENT_TIMESTAMP usan la zona de la sesión
pool.on('connection', (conn) => {
  conn.query(`SET time_zone = '${TIME_ZONE}'`);
});

/** Ejecuta una consulta y devuelve las filas (o el ResultSetHeader en INSERT/UPDATE). */
export async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/** Ejecuta `fn(conn)` dentro de una transacción. `conn.query` devuelve [rows, fields]. */
export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
