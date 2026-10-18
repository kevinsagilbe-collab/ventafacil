import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { categoriasApi, productosApi, ventasApi } from '@/api/services.js';
import SearchInput from '@/components/SearchInput.jsx';
import ErrorMessage from '@/components/ui/ErrorMessage.jsx';
import { Alert } from '@/components/ui/Field.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import { useCaja } from '@/features/caja/CajaContext.jsx';
import { useAsync } from '@/hooks/useAsync.js';
import { formatCOP } from '@/utils/format.js';
import ProductGrid from './components/ProductGrid.jsx';
import Ticket from './components/Ticket.jsx';
import { useCart } from './useCart.js';

export default function PosPage() {
  const { cajaAbierta, refrescar: refrescarCaja } = useCaja();
  const cart = useCart();
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null); // { venta } | { error }

  const categorias = useAsync(() => categoriasApi.listar(), []);
  const productos = useAsync(() => productosApi.listar({ categoriaId }), [categoriaId]);

  const filtrados = (productos.data ?? []).filter((p) => {
    const q = busqueda.trim().toLowerCase();
    return !q || `${p.nombre} ${p.codigo}`.toLowerCase().includes(q);
  });

  const enTicket = useMemo(
    () => Object.fromEntries(cart.items.map(({ producto, cantidad }) => [producto.id, cantidad])),
    [cart.items],
  );

  async function completarVenta(pago) {
    setProcesando(true);
    setResultado(null);
    try {
      const venta = await ventasApi.registrar({
        ...pago,
        items: cart.items.map(({ producto, cantidad }) => ({ producto_id: producto.id, cantidad })),
      });
      setResultado({ venta });
      cart.vaciar();
      productos.reload(); // el stock cambió
      refrescarCaja();    // los totales del turno cambiaron
      return true;
    } catch (error) {
      setResultado({ error });
      return false;
    } finally {
      setProcesando(false);
    }
  }

  const chips = [{ id: null, nombre: 'Todos' }, ...(categorias.data ?? [])];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col xl:flex-row">
      <section className="min-w-0 flex-1 p-4 sm:p-7">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="md:shrink-0">
            <p className="text-sm font-semibold text-emerald-600">Nueva venta</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">Selecciona los productos</h1>
          </div>
          <div className="w-full md:max-w-md">
            <SearchInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o código de barras..." />
          </div>
        </div>

        {!cajaAbierta && (
          <div className="mb-6">
            <Alert tone="warning">
              La caja está cerrada. <Link to="/caja" className="font-bold underline">Abre un turno</Link> para empezar a vender.
            </Alert>
          </div>
        )}
        {resultado?.venta && (
          <div className="mb-6">
            <Alert tone="success">
              Orden #{resultado.venta.id} registrada · {formatCOP(resultado.venta.total)}
              {resultado.venta.cambio > 0 && ` · Cambio ${formatCOP(resultado.venta.cambio)}`}
            </Alert>
          </div>
        )}
        <ErrorMessage error={resultado?.error} />

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {chips.map((c) => (
            <button key={c.nombre} type="button" onClick={() => setCategoriaId(c.id)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      categoriaId === c.id ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}>
              {c.nombre}
            </button>
          ))}
        </div>

        <ErrorMessage error={productos.error} onRetry={productos.reload} />
        {productos.loading && !productos.data
          ? <Spinner />
          : <ProductGrid productos={filtrados} enTicket={enTicket} onSelect={cart.agregar} />}
      </section>

      <Ticket cart={cart} onCompletar={completarVenta}
              procesando={procesando} deshabilitado={!cajaAbierta} />
    </div>
  );
}
