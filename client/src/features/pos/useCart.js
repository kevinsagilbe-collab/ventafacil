import { useMemo, useReducer } from 'react';

// Estado del ticket: { [productoId]: { producto, cantidad } }
function cartReducer(state, action) {
  switch (action.type) {
    case 'agregar': {
      const { producto } = action;
      const cantidad = (state[producto.id]?.cantidad ?? 0) + 1;
      if (cantidad > producto.stock) return state; // no permite vender más del stock
      return { ...state, [producto.id]: { producto, cantidad } };
    }
    case 'cambiarCantidad': {
      const item = state[action.id];
      if (!item) return state;
      if (action.cantidad <= 0) {
        const { [action.id]: _, ...resto } = state;
        return resto;
      }
      return { ...state, [action.id]: { ...item, cantidad: Math.min(action.cantidad, item.producto.stock) } };
    }
    case 'vaciar':
      return {};
    default:
      return state;
  }
}

/**
 * Totales calculados igual que registrar_venta() en la BD (precio_venta + IVA por producto).
 * Son solo una vista previa: el total definitivo lo devuelve el backend.
 */
export function useCart() {
  const [state, dispatch] = useReducer(cartReducer, {});

  const items = useMemo(() => Object.values(state), [state]);

  const totales = useMemo(() => {
    let subtotal = 0;
    let iva = 0;
    for (const { producto, cantidad } of items) {
      subtotal += producto.precio_venta * cantidad;
      iva += (producto.precio_venta * cantidad * producto.iva_porcentaje) / 100;
    }
    iva = Math.round(iva);
    return { subtotal, iva, total: subtotal + iva, unidades: items.reduce((n, i) => n + i.cantidad, 0) };
  }, [items]);

  return {
    items,
    ...totales,
    agregar: (producto) => dispatch({ type: 'agregar', producto }),
    cambiarCantidad: (id, cantidad) => dispatch({ type: 'cambiarCantidad', id, cantidad }),
    vaciar: () => dispatch({ type: 'vaciar' }),
  };
}
