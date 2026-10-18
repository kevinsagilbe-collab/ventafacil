# VentaFácil

Punto de venta para tiendas pequeñas: ventas, inventario, control de caja y reportes.

```
VentaFacil/
├── database/          Scripts SQL (MySQL 8 en Aiven)
│   ├── 01_esquema.sql      tablas y vistas
│   ├── 02_datos_prueba.sql usuarios, categorías y productos de demo (con fotos)
│   └── 03_imagenes_productos.sql  agrega las fotos a una base creada antes
├── server/            API REST · Node + Express + mysql2
│   ├── scripts/            seed-historial.js (ventas de la semana para Reportes)
│   └── src/
│       ├── config/         variables de entorno y pool de MySQL
│       ├── middlewares/    auth JWT, roles, manejo de errores
│       ├── modules/        un módulo por recurso: *.routes.js + *.service.js (SQL)
│       │   ├── auth/  categorias/  productos/  caja/  ventas/  reportes/
│       ├── routes.js       monta todos los módulos bajo /api
│       └── app.js · index.js
└── client/            SPA · React + Vite + React Router + Tailwind CSS v4
    └── src/
        ├── api/            http.js (fetch + token) y services.js (un objeto por recurso)
        ├── app/router.jsx  rutas
        ├── components/     Icon, Logo, SearchInput, PageHeading, ProductImage y ui/ (Button, Field, Modal…)
        ├── features/       una carpeta por pantalla, con sus componentes y estado
        │   ├── auth/  pos/  inventario/  caja/  reportes/
        ├── hooks/          useAsync
        ├── layouts/        MainLayout (sidebar + barra de turno)
        ├── utils/          formato COP / fechas
        └── styles/         index.css: Inter + Tailwind + base del prototipo
```

**Diseño**: las pantallas siguen el prototipo de Figma Make *MOCKUPS-PROYECTO-MODELADO* (Inter, acento emerald, tarjetas redondeadas, fondo `#F7F8FA`). El Login no existe en el prototipo y sigue ese mismo sistema visual.

## Puesta en marcha

1. **Base de datos**: en DBeaver, con una conexión **MySQL** a tu servicio de Aiven, ejecuta con `Alt+X` (Execute SQL Script) `database/01_esquema.sql` y luego `database/02_datos_prueba.sql`.
2. **Variables de entorno**:
   ```bash
   cp server/.env.example server/.env   # completa DATABASE_URL y JWT_SECRET
   ```
   `DATABASE_URL` es el *Service URI* de Aiven sin `?ssl-mode=REQUIRED`. Descarga el certificado CA de Aiven como `server/ca.pem` (o deja `DB_CA_CERT_PATH` vacío).
3. **Instalar y correr** (desde la raíz):
   ```bash
   npm install
   npm run seed:historial   # opcional: ventas de los últimos 7 días para Reportes
   npm run dev              # API en :3000 y web en :5173
   ```
   Si el historial se interrumpe o quieres regenerarlo: `npm run seed:historial -- --reset` (borra ventas, turnos y movimientos, y restaura el stock del prototipo).
4. Entra a http://localhost:5173 con `laura@ventafacil.com` / `demo123` (admin) o `carlos@ventafacil.com` / `demo123` (cajero).

## Decisiones de arquitectura

- **La lógica de negocio vive en los servicios del backend** (`ventas.service.js` → registrar venta, `caja.service.js` → abrir/cerrar turno), cada operación en una transacción con `SELECT … FOR UPDATE` para que dos cajas no vendan el mismo stock. Los errores de negocio llegan al cliente como 400 con un mensaje claro (p. ej. "Stock insuficiente…").
- **Sin procedimientos almacenados**: el SQL solo tiene tablas y vistas, así corre en DBeaver sin `DELIMITER`.
- **Un turno abierto por usuario**: columna generada `usuario_turno_abierto` + índice `UNIQUE` (MySQL no tiene índices parciales).
- **Zona horaria**: Colombia es UTC-5 fijo; el backend hace `SET time_zone = '-05:00'` en cada conexión para que `CURDATE()` de las vistas sea el día local.
- **Contraseñas** con bcrypt (`bcryptjs`) en el backend.
- **Roles**: `admin` puede editar inventario y ver reportes; `cajero` vende y maneja su caja.
- **En desarrollo** Vite redirige `/api` al backend, así que el cliente no necesita URL absoluta ni CORS.

## Endpoints

| Método | Ruta | Rol |
|---|---|---|
| POST | `/api/auth/login` · GET `/api/auth/me` | — |
| GET | `/api/categorias` | todos |
| GET | `/api/productos?q=&categoriaId=&criticos=true` · `/api/productos/:id` | todos |
| POST/PUT/DELETE | `/api/productos[/:id]` | admin |
| GET | `/api/caja/turno-actual` · `/api/caja/movimientos` | todos |
| POST | `/api/caja/abrir` · `/api/caja/movimientos` · `/api/caja/cerrar` | todos |
| GET/POST | `/api/ventas` · GET `/api/ventas/:id` | todos |
| GET | `/api/reportes/dashboard` | admin |
