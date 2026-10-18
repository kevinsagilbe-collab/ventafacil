import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cajaApi } from '@/api/services.js';

/** Turno de caja abierto del usuario (v_resumen_turno). Lo usan el header, el POS y Caja. */
const CajaContext = createContext(null);

export function CajaProvider({ children }) {
  const [turno, setTurno] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const refrescar = useCallback(async () => {
    try {
      setError(null);
      setTurno(await cajaApi.turnoActual());
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { refrescar(); }, [refrescar]);

  const value = useMemo(
    () => ({ turno, cajaAbierta: Boolean(turno), cargando, error, refrescar }),
    [turno, cargando, error, refrescar],
  );

  return <CajaContext.Provider value={value}>{children}</CajaContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCaja() {
  const ctx = useContext(CajaContext);
  if (!ctx) throw new Error('useCaja debe usarse dentro de <CajaProvider>');
  return ctx;
}
