-- =====================================================================
--  VentaFácil · Esquema de base de datos (MySQL 8 / Aiven)
--  Ejecutar en la base "defaultdb" de tu servicio Aiven.
--  Ojo: el bloque DROP borra todo si vuelves a ejecutar el script.
--
--  En DBeaver: SIN seleccionar texto, ejecútalo con "Execute SQL Script" (Alt+X).
--  Si seleccionas todo y usas Ctrl+Enter, DBeaver lo envía como UNA sola
--  sentencia y MySQL falla en la segunda (error 1064 cerca de "DROP VIEW").
--
--  La lógica de negocio (registrar venta, abrir y cerrar turno) vive en
--  el backend, dentro de transacciones: server/src/modules/ventas y caja.
-- =====================================================================

-- Hora de Colombia (UTC-5 fijo, sin horario de verano). El backend la fija
-- en cada conexión, aquí es solo para esta sesión de DBeaver.
SET time_zone = '-05:00';

DROP VIEW IF EXISTS v_stock_critico, v_top_productos, v_ventas_semana,
                    v_kpis_hoy, v_resumen_turno, v_inventario;
DROP TABLE IF EXISTS venta_items, ventas, movimientos_caja, turnos_caja,
                     productos, categorias, usuarios;

-- =====================================================================
--  1. TABLAS
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1.1 USUARIOS (Laura Martínez · Administradora)
--     password_hash: bcrypt, lo genera el backend (bcryptjs)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  password_hash  VARCHAR(100) NOT NULL,
  rol            VARCHAR(20)  NOT NULL DEFAULT 'cajero',
  activo         BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_usuarios_rol CHECK (rol IN ('admin', 'cajero'))
);

-- ---------------------------------------------------------------------
-- 1.2 CATEGORÍAS (filtros: Bebidas, Alimentos, Aseo, Otros)
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(50) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------------
-- 1.3 PRODUCTOS (pantalla Inventario + tarjetas del Punto de venta)
-- ---------------------------------------------------------------------
CREATE TABLE productos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  codigo          VARCHAR(30)  NOT NULL UNIQUE,          -- BEB-001, código de barras
  nombre          VARCHAR(120) NOT NULL,
  categoria_id    INT          NOT NULL,
  precio_costo    INT          NOT NULL,                 -- pesos COP
  precio_venta    INT          NOT NULL,
  iva_porcentaje  DECIMAL(4,2) NOT NULL DEFAULT 19,      -- 0 si es exento
  stock           INT          NOT NULL DEFAULT 0,
  stock_minimo    INT          NOT NULL DEFAULT 5,       -- alerta "Stock crítico"
  imagen_url      TEXT,
  activo          BOOLEAN      NOT NULL DEFAULT TRUE,    -- borrado lógico
  creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  CONSTRAINT chk_productos_costo  CHECK (precio_costo >= 0),
  CONSTRAINT chk_productos_venta  CHECK (precio_venta >= 0),
  CONSTRAINT chk_productos_stock  CHECK (stock >= 0),
  INDEX idx_productos_nombre (nombre)                    -- la collation ya ignora mayúsculas
);

-- ---------------------------------------------------------------------
-- 1.4 TURNOS DE CAJA ("Caja abierta · Turno de Laura · desde 8:02 a. m.")
-- ---------------------------------------------------------------------
CREATE TABLE turnos_caja (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id        INT         NOT NULL,
  abierto_en        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  monto_base        INT         NOT NULL,                -- Monto inicial
  cerrado_en        DATETIME,
  efectivo_contado  INT,                                 -- Efectivo físico contado
  total_esperado    INT,                                 -- se guarda al cerrar
  diferencia        INT,                                 -- contado - esperado
  observaciones     TEXT,
  estado            VARCHAR(10) NOT NULL DEFAULT 'abierto',
  -- Un usuario solo puede tener un turno abierto a la vez: esta columna vale
  -- usuario_id mientras el turno está abierto y NULL al cerrarlo (UNIQUE ignora los NULL)
  usuario_turno_abierto INT GENERATED ALWAYS AS (IF(estado = 'abierto', usuario_id, NULL)) STORED,
  CONSTRAINT fk_turnos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT chk_turnos_monto  CHECK (monto_base >= 0),
  CONSTRAINT chk_turnos_estado CHECK (estado IN ('abierto', 'cerrado')),
  UNIQUE INDEX uq_turno_abierto_por_usuario (usuario_turno_abierto)
);

-- ---------------------------------------------------------------------
-- 1.5 MOVIMIENTOS DE CAJA (botón "Registrar Egreso / Ingreso")
-- ---------------------------------------------------------------------
CREATE TABLE movimientos_caja (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  turno_id   INT          NOT NULL,
  tipo       VARCHAR(10)  NOT NULL,
  monto      INT          NOT NULL,
  concepto   VARCHAR(200) NOT NULL,
  creado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_movimientos_turno FOREIGN KEY (turno_id) REFERENCES turnos_caja(id),
  CONSTRAINT chk_movimientos_tipo  CHECK (tipo IN ('ingreso', 'egreso')),
  CONSTRAINT chk_movimientos_monto CHECK (monto > 0)
);

-- ---------------------------------------------------------------------
-- 1.6 VENTAS (Ticket de venta · Orden #1048) · la numeración empieza en 1001
-- ---------------------------------------------------------------------
CREATE TABLE ventas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  turno_id        INT         NOT NULL,
  usuario_id      INT         NOT NULL,
  fecha           DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal        INT         NOT NULL,
  iva             INT         NOT NULL,
  total           INT         NOT NULL,
  medio_pago      VARCHAR(10) NOT NULL,
  monto_recibido  INT,        -- solo efectivo
  cambio          INT,        -- solo efectivo
  estado          VARCHAR(10) NOT NULL DEFAULT 'completada',
  CONSTRAINT fk_ventas_turno   FOREIGN KEY (turno_id)   REFERENCES turnos_caja(id),
  CONSTRAINT fk_ventas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT chk_ventas_medio  CHECK (medio_pago IN ('efectivo', 'tarjeta', 'nequi')),
  CONSTRAINT chk_ventas_estado CHECK (estado IN ('completada', 'anulada')),
  INDEX idx_ventas_fecha (fecha)
) AUTO_INCREMENT = 1001;

CREATE TABLE venta_items (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  venta_id         INT NOT NULL,
  producto_id      INT NOT NULL,
  cantidad         INT NOT NULL,
  precio_unitario  INT NOT NULL,   -- precio al momento de la venta
  costo_unitario   INT NOT NULL,   -- para calcular la ganancia
  subtotal         INT GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  CONSTRAINT fk_items_venta    FOREIGN KEY (venta_id)    REFERENCES ventas(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT chk_items_cantidad CHECK (cantidad > 0)
);

-- =====================================================================
--  2. VISTAS (cada una alimenta una parte de las pantallas)
-- =====================================================================

-- Inventario: tabla con categoría, margen y estado
CREATE VIEW v_inventario AS
SELECT p.id, p.codigo, p.nombre, c.nombre AS categoria,
       p.precio_costo, p.precio_venta,
       p.precio_venta - p.precio_costo AS margen,
       p.stock, p.stock_minimo, p.imagen_url,
       CASE WHEN p.stock = 0              THEN 'Agotado'
            WHEN p.stock <= p.stock_minimo THEN 'Stock crítico'
            ELSE 'En stock' END AS estado
  FROM productos p JOIN categorias c ON c.id = p.categoria_id
 WHERE p.activo
 ORDER BY p.nombre;

-- Alerta de stock crítico (depende de v_inventario)
CREATE VIEW v_stock_critico AS
SELECT * FROM v_inventario WHERE estado <> 'En stock';

-- Control de caja: tarjetas de la pantalla de arqueo
CREATE VIEW v_resumen_turno AS
SELECT t.id AS turno_id, t.usuario_id, u.nombre AS cajero, t.estado, t.abierto_en, t.cerrado_en,
       t.monto_base,
       CAST(COALESCE(v.efectivo, 0) AS SIGNED) AS ventas_efectivo,
       CAST(COALESCE(v.tarjeta, 0)  AS SIGNED) AS ventas_tarjeta,
       CAST(COALESCE(v.nequi, 0)    AS SIGNED) AS ventas_nequi,
       CAST(COALESCE(v.tarjeta, 0) + COALESCE(v.nequi, 0) AS SIGNED) AS ventas_electronicas,
       CAST(COALESCE(m.ingresos, 0) AS SIGNED) AS ingresos,
       CAST(COALESCE(m.egresos, 0)  AS SIGNED) AS egresos,
       CAST(t.monto_base + COALESCE(v.efectivo, 0)
            + COALESCE(m.ingresos, 0) - COALESCE(m.egresos, 0) AS SIGNED) AS total_esperado,
       t.efectivo_contado, t.diferencia
  FROM turnos_caja t
  JOIN usuarios u ON u.id = t.usuario_id
  LEFT JOIN (
    SELECT turno_id,
           SUM(CASE WHEN medio_pago = 'efectivo' THEN total END) AS efectivo,
           SUM(CASE WHEN medio_pago = 'tarjeta'  THEN total END) AS tarjeta,
           SUM(CASE WHEN medio_pago = 'nequi'    THEN total END) AS nequi
      FROM ventas WHERE estado = 'completada' GROUP BY turno_id
  ) v ON v.turno_id = t.id
  LEFT JOIN (
    SELECT turno_id,
           SUM(CASE WHEN tipo = 'ingreso' THEN monto END) AS ingresos,
           SUM(CASE WHEN tipo = 'egreso'  THEN monto END) AS egresos
      FROM movimientos_caja GROUP BY turno_id
  ) m ON m.turno_id = t.id;

-- Reportes: tarjetas superiores (Ventas del día, Nº transacciones, Ganancia neta, Stock mínimo)
CREATE VIEW v_kpis_hoy AS
SELECT
  (SELECT CAST(COALESCE(SUM(total), 0) AS SIGNED) FROM ventas
    WHERE estado = 'completada'
      AND fecha >= CURDATE() AND fecha < CURDATE() + INTERVAL 1 DAY)        AS ventas_dia,
  (SELECT COUNT(*) FROM ventas
    WHERE estado = 'completada'
      AND fecha >= CURDATE() AND fecha < CURDATE() + INTERVAL 1 DAY)        AS transacciones,
  (SELECT CAST(COALESCE(SUM(i.cantidad * (i.precio_unitario - i.costo_unitario)), 0) AS SIGNED)
     FROM venta_items i JOIN ventas v ON v.id = i.venta_id
    WHERE v.estado = 'completada'
      AND v.fecha >= CURDATE() AND v.fecha < CURDATE() + INTERVAL 1 DAY)    AS ganancia_dia,
  (SELECT COUNT(*) FROM productos
    WHERE activo AND stock <= stock_minimo)                                AS productos_stock_minimo;

-- Reportes: gráfico "Ventas de la semana" (últimos 7 días, incluye días sin ventas)
CREATE VIEW v_ventas_semana AS
WITH RECURSIVE dias (dia) AS (
  SELECT CURDATE() - INTERVAL 6 DAY
  UNION ALL
  SELECT dia + INTERVAL 1 DAY FROM dias WHERE dia < CURDATE()
)
SELECT d.dia,
       ELT(WEEKDAY(d.dia) + 1, 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom') AS dia_corto,
       CAST(COALESCE(SUM(v.total), 0) AS SIGNED) AS total
  FROM dias d
  LEFT JOIN ventas v ON v.fecha >= d.dia AND v.fecha < d.dia + INTERVAL 1 DAY
                    AND v.estado = 'completada'
 GROUP BY d.dia
 ORDER BY d.dia;

-- Reportes: "Top 5 productos" de los últimos 7 días
CREATE VIEW v_top_productos AS
SELECT p.id, p.nombre, c.nombre AS categoria, p.imagen_url,
       CAST(SUM(i.cantidad) AS SIGNED) AS unidades
  FROM venta_items i
  JOIN ventas v     ON v.id = i.venta_id AND v.estado = 'completada'
  JOIN productos p  ON p.id = i.producto_id
  JOIN categorias c ON c.id = p.categoria_id
 WHERE v.fecha >= CURDATE() - INTERVAL 6 DAY
 GROUP BY p.id, p.nombre, c.nombre, p.imagen_url
 ORDER BY unidades DESC
 LIMIT 5;
