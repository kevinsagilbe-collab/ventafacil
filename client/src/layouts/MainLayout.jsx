import { Link, NavLink, Outlet, useLocation } from 'react-router';
import Icon from '@/components/Icon.jsx';
import Logo from '@/components/Logo.jsx';
import { useAuth } from '@/features/auth/AuthContext.jsx';
import { CajaProvider, useCaja } from '@/features/caja/CajaContext.jsx';
import { formatFechaLarga, formatHora, iniciales, primerNombre, ROLES } from '@/utils/format.js';

const NAV = [
  { to: '/pos', label: 'Punto de venta', title: 'Punto de Venta', icon: 'pos' },
  { to: '/inventario', label: 'Inventario', title: 'Inventario', icon: 'inventory' },
  { to: '/caja', label: 'Control de caja', title: 'Control de Caja', icon: 'cash' },
  { to: '/reportes', label: 'Reportes', title: 'Dashboard y Reportes', icon: 'reports', soloAdmin: true },
];

function useNav() {
  const { esAdmin } = useAuth();
  return NAV.filter((item) => !item.soloAdmin || esAdmin);
}

export default function MainLayout() {
  return (
    <CajaProvider>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <div className="min-w-0 flex-1 pb-16 lg:pb-0">
          <Topbar />
          <Outlet />
        </div>
        <MobileNav />
      </div>
    </CajaProvider>
  );
}

function Sidebar() {
  const { usuario, logout } = useAuth();
  const links = useNav();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-5 lg:flex">
      <Logo />
      <p className="mb-2 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Menú principal</p>
      <nav className="space-y-1.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <Icon name={link.icon} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <EstadoCaja />

      <div className="mt-4 flex items-center gap-3 rounded-xl p-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
          {iniciales(usuario.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800">{usuario.nombre}</p>
          <p className="text-xs text-slate-400">{ROLES[usuario.rol]}</p>
        </div>
        <button type="button" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión"
                className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500">
          <Icon name="logout" className="size-4" />
        </button>
      </div>
    </aside>
  );
}

/** Tarjeta oscura "Caja abierta · Turno de Laura · Desde las 8:02 a. m." */
function EstadoCaja() {
  const { turno, cajaAbierta } = useCaja();

  return (
    <div className="mt-auto rounded-2xl bg-slate-950 p-4 text-white">
      <div className={`flex items-center gap-2 text-xs font-semibold ${cajaAbierta ? 'text-emerald-300' : 'text-slate-400'}`}>
        <span className={`size-2 rounded-full ${cajaAbierta ? 'bg-emerald-400' : 'bg-slate-500'}`} />
        {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
      </div>
      {cajaAbierta ? (
        <>
          <p className="mt-2 text-sm font-bold">Turno de {primerNombre(turno.cajero)}</p>
          <p className="mt-1 text-xs text-slate-400">Desde las {formatHora(turno.abierto_en)}</p>
        </>
      ) : (
        <Link to="/caja" className="mt-2 block text-sm font-bold text-white hover:text-emerald-300">
          Abrir turno →
        </Link>
      )}
    </div>
  );
}

function Topbar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const title = NAV.find((item) => pathname.startsWith(item.to))?.title ?? '';

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
      <div className="flex items-center gap-3 lg:hidden"><Logo /></div>
      <p className="hidden text-sm font-semibold text-slate-500 lg:block">{title}</p>
      <div className="flex items-center gap-2">
        <span className="hidden rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 sm:inline">
          {formatFechaLarga()}
        </span>
        <button type="button" onClick={logout} aria-label="Cerrar sesión"
                className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 lg:hidden">
          <Icon name="logout" className="size-4" />
        </button>
      </div>
    </header>
  );
}

function MobileNav() {
  const links = useNav();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          aria-label={link.label}
          className={({ isActive }) =>
            `grid size-11 place-items-center rounded-xl ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'}`}
        >
          <Icon name={link.icon} />
        </NavLink>
      ))}
    </nav>
  );
}
