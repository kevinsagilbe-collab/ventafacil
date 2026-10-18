import bcrypt from 'bcryptjs';
import { query } from '../../config/db.js';

export async function verificarCredenciales(email, password) {
  const [usuario] = await query(
    `SELECT id, nombre, email, rol, password_hash
       FROM usuarios
      WHERE email = ? AND activo`,
    [email],
  );
  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) return null;

  const { password_hash: _, ...datos } = usuario;
  return datos;
}

export async function obtenerUsuario(id) {
  const [usuario] = await query(
    'SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND activo',
    [id],
  );
  return usuario ?? null;
}

/** Para crear usuarios nuevos desde la API o scripts */
export const hashPassword = (password) => bcrypt.hash(password, 10);
