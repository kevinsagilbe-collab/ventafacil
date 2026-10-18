import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext.jsx';
import Spinner from './ui/Spinner.jsx';

/** Sin sesión → /login. Con `roles`, además exige que el usuario tenga uno de ellos. */
export default function ProtectedRoute({ roles }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Spinner fullScreen />;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />;

  return <Outlet />;
}
