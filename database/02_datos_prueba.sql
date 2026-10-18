-- =====================================================================
--  VentaFácil · Datos de prueba (los mismos del prototipo)
--  Ejecutar DESPUÉS de 01_esquema.sql, completo con "Execute SQL Script" (Alt+X)
--
--  El historial de ventas de la semana (para que Reportes muestre datos)
--  se genera después desde la raíz del proyecto con:
--      npm run seed:historial
-- =====================================================================
SET time_zone = '-05:00';

-- Usuarios  (contraseña de ambos: demo123 · hash bcrypt)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
  ('Laura Martínez', 'laura@ventafacil.com',  '$2b$10$10jlm20Oymrdj7XRNo9KW.i.SVlZyK11SUdEZg2ZPoe9hdKxsh3q6', 'admin'),
  ('Carlos Rojas',   'carlos@ventafacil.com', '$2b$10$10jlm20Oymrdj7XRNo9KW.i.SVlZyK11SUdEZg2ZPoe9hdKxsh3q6', 'cajero');

INSERT INTO categorias (nombre) VALUES ('Bebidas'), ('Alimentos'), ('Aseo'), ('Otros');

-- Productos de la pantalla Inventario
-- (fotos de Unsplash, las mismas del prototipo de Figma Make)
INSERT INTO productos (codigo, nombre, categoria_id, precio_costo, precio_venta, stock, stock_minimo, imagen_url) VALUES
  ('BEB-001', 'Agua mineral 600ml',  1, 1200,  2500, 34, 5, 'https://images.unsplash.com/photo-1656269457984-bd54c519129a?auto=format&fit=crop&w=600&q=80'),
  ('BEB-014', 'Jugo de naranja',     1, 2600,  4500, 18, 5, 'https://images.unsplash.com/photo-1598830853058-3474f6a66003?auto=format&fit=crop&w=600&q=80'),
  ('ALI-021', 'Bowl natural',        2, 6800, 12500,  9, 5, 'https://images.unsplash.com/photo-1665088127661-83aeff6104c4?auto=format&fit=crop&w=600&q=80'),
  ('ALI-008', 'Papas clásicas',      2, 2100,  4000,  5, 5, 'https://images.unsplash.com/photo-1702097034630-88a759b9923f?auto=format&fit=crop&w=600&q=80'),
  ('BEB-027', 'Té frío artesanal',   1, 2800,  5200, 22, 5, 'https://images.unsplash.com/photo-1656269438626-9e900263bc64?auto=format&fit=crop&w=600&q=80'),
  ('ASE-004', 'Limpiador multiusos', 3, 5200,  8900,  4, 5, 'https://images.unsplash.com/photo-1656269457984-bd54c519129a?auto=format&fit=crop&w=600&q=80'),
  ('ALI-034', 'Snack de vegetales',  2, 3200,  5900, 16, 5, 'https://images.unsplash.com/photo-1702097034630-88a759b9923f?auto=format&fit=crop&w=600&q=80'),
  ('BEB-033', 'Soda saborizada',     1, 1900,  3800, 27, 5, 'https://images.unsplash.com/photo-1598830853058-3474f6a66003?auto=format&fit=crop&w=600&q=80');

-- Verificación rápida
SELECT codigo, nombre, stock, estado FROM v_inventario;
