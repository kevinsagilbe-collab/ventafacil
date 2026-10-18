import { useCallback, useEffect, useState } from 'react';

/**
 * Ejecuta una función async al montar (y cuando cambian `deps`).
 *   const { data, loading, error, reload } = useAsync(() => productosApi.listar(), []);
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const load = useCallback(async (isCancelled = () => false) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await run();
      if (!isCancelled()) setState({ data, loading: false, error: null });
    } catch (error) {
      if (!isCancelled()) setState((s) => ({ ...s, loading: false, error }));
    }
  }, [run]);

  useEffect(() => {
    let cancelled = false;
    load(() => cancelled);
    return () => { cancelled = true; };
  }, [load]);

  return { ...state, reload: load };
}
