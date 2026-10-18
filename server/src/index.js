import { app } from './app.js';
import { env } from './config/env.js';
import { query } from './config/db.js';

app.listen(env.port, () => {
  console.log(`API de VentaFácil en http://localhost:${env.port}/api`);
});

query('SELECT VERSION() AS version, NOW() AS ahora')
  .then(([r]) => console.log(`Conectado a MySQL ${r.version} (hora Colombia: ${r.ahora.toISOString()})`))
  .catch((err) => console.error('No se pudo conectar a MySQL:', err.message));
