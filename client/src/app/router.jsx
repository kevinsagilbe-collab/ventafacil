import { createBrowserRouter, Navigate } from 'react-router';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import MainLayout from '@/layouts/MainLayout.jsx';
import NotFoundPage from '@/pages/NotFoundPage.jsx';
import LoginPage from '@/features/auth/LoginPage.jsx';
import CajaPage from '@/features/caja/CajaPage.jsx';
import InventarioPage from '@/features/inventario/InventarioPage.jsx';
import PosPage from '@/features/pos/PosPage.jsx';
import ReportesPage from '@/features/reportes/ReportesPage.jsx';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/pos" replace /> },
          { path: 'pos', element: <PosPage /> },
          { path: 'inventario', element: <InventarioPage /> },
          { path: 'caja', element: <CajaPage /> },
          {
            element: <ProtectedRoute roles={['admin']} />,
            children: [{ path: 'reportes', element: <ReportesPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
