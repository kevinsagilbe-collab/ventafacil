import { RouterProvider } from 'react-router';
import { router } from './app/router.jsx';
import { AuthProvider } from './features/auth/AuthContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
