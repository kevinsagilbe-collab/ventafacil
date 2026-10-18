import fs from 'node:fs';

const errores = [];

for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
  if (!process.env[key]) errores.push(`Falta la variable ${key}`);
}

const databaseUrl = process.env.DATABASE_URL ?? '';
if (databaseUrl.startsWith('jdbc:')) {
  errores.push(
    'DATABASE_URL es una URL JDBC (la de DBeaver). Usa el "Service URI" de Aiven: '
    + 'mysql://usuario:contraseña@host:puerto/defaultdb',
  );
} else if (databaseUrl && !/^mysql:\/\/[^@/]+@[^/]+/.test(databaseUrl)) {
  errores.push('DATABASE_URL debe tener el formato mysql://usuario:contraseña@host:puerto/defaultdb');
}

// Certificado CA de Aiven: como texto en DB_CA_CERT (Vercel) o como archivo en DB_CA_CERT_PATH (local)
const dbCaCert = process.env.DB_CA_CERT?.replace(/\\n/g, '\n') || null;
const dbCaCertPath = dbCaCert ? null : process.env.DB_CA_CERT_PATH || null;
if (dbCaCert && !dbCaCert.includes('BEGIN CERTIFICATE')) {
  errores.push('DB_CA_CERT debe contener el certificado completo, desde -----BEGIN CERTIFICATE-----');
}
if (dbCaCertPath && !fs.existsSync(dbCaCertPath)) {
  errores.push(
    `No existe el certificado ${dbCaCertPath}. Descárgalo desde Aiven (Overview → CA certificate) `
    + 'o deja DB_CA_CERT_PATH vacío',
  );
}

if (errores.length) {
  console.error(`\nConfiguración inválida en server/.env:\n  - ${errores.join('\n  - ')}\n`);
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl,
  dbCaCert,
  dbCaCertPath,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
