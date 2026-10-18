import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { tokenStorage } from '@/api/http.js';
import { authApi } from '@/api/services.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(() => Boolean(tokenStorage.get()));

  // Si hay token guardado, recupera la sesión al recargar la página
  useEffect(() => {
    if (!tokenStorage.get()) return;
    authApi.me()
      .then(setUsuario)
      .catch(() => tokenStorage.clear())
      .finally(() => setCargando(false));
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUsuario(null);
  }, []);

  // http.js emite este evento cuando el backend responde 401
  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const { token, usuario } = await authApi.login(email, password);
    tokenStorage.set(token);
    setUsuario(usuario);
    return usuario;
  }, []);

  const value = useMemo(
    () => ({ usuario, cargando, login, logout, esAdmin: usuario?.rol === 'admin' }),
    [usuario, cargando, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
