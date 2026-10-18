import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { categoriasApi, productosApi } from '@/api/services.js';
import Icon from '@/components/Icon.jsx';
import PageHeading from '@/components/PageHeading.jsx';
import ProductImage from '@/components/ProductImage.jsx';
import SearchInput from '@/components/SearchInput.jsx';
import Button from '@/components/ui/Button.jsx';
import ErrorMessage from '@/components/ui/ErrorMessage.jsx';
import Modal from '@/components/ui/Modal.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import StockBadge from '@/components/ui/StockBadge.jsx';
import { useAuth } from '@/features/auth/AuthContext.jsx';
import { useAsync } from '@/hooks/useAsync.js';
import { formatCOP } from '@/utils/format.js';
import ProductoForm from './components/ProductoForm.jsx';

const COLUMNAS = ['Código', 'Nombre del producto', 'Categoría', 'Precio costo', 'Precio venta', 'Stock actual', 'Estado'];

export default function InventarioPage() {
  const { esAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const soloCriticos = searchParams.get('criticos') === '1'; // Reportes enlaza aquí con ?criticos=1
  const [q, setQ] = useState('');
  const [editando, setEditando] = useState(null); // null | 'nuevo' | producto

  const categorias = useAsync(() => categoriasApi.listar(), []);
  const productos = useAsync(
    () => productosApi.listar({ q, criticos: soloCriticos || undefined }),
    [q, soloCriticos],
  );

  const toggleCriticos = () => setSearchParams(soloCriticos ? {} : { criticos: '1' }, { replace: true });

  async function guardar(data) {
    if (editando === 'nuevo') await productosApi.crear(data);
    else await productosApi.actualizar(editando.id, data);
    setEditando(null);
    productos.reload();
  }

  async function eliminar(producto) {
    if (!window.confirm(`¿Eliminar "${producto.nombre}" del inventario?`)) return;
    try {
      await productosApi.eliminar(producto.id);
      productos.reload();
    } catch (err) {
      window.alert(err.message);
    }
  }

  const lista = productos.data ?? [];

  return (
    <main className="p-4 sm:p-7">
      <PageHeading
        eyebrow="Catálogo"
        title="Inventario de Productos"
        detail="Administra precios, existencias y disponibilidad."
        action={esAdmin && <Button icon="plus" onClick={() => setEditando('nuevo')}>Nuevo Producto</Button>}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <SearchInput value={q} onChange={setQ} placeholder="Buscar producto o código..." />
          </div>
          <button type="button" onClick={toggleCriticos} aria-pressed={soloCriticos}
                  className={`flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                    soloCriticos ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
            <Icon name="filter" className="size-4" />
            {soloCriticos ? 'Solo stock crítico' : 'Filtros'}
          </button>
        </div>

        <div className="px-4 pt-4 empty:hidden"><ErrorMessage error={productos.error} onRetry={productos.reload} /></div>

        {productos.loading && !productos.data ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {COLUMNAS.map((c) => <th key={c} className="px-5 py-3.5">{c}</th>)}
                  {esAdmin && <th className="px-5 py-3.5">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lista.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">{p.codigo}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ProductImage producto={p} className="size-9 shrink-0 rounded-lg text-sm" />
                        <span className="text-sm font-bold text-slate-800">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">{p.categoria}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatCOP(p.precio_costo)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-800">{formatCOP(p.precio_venta)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-800">{p.stock} und.</td>
                    <td className="px-5 py-4"><StockBadge estado={p.estado} /></td>
                    {esAdmin && (
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setEditando(p)} aria-label={`Editar ${p.nombre}`}
                                  className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600">
                            <Icon name="edit" className="size-4" />
                          </button>
                          <button type="button" onClick={() => eliminar(p)} aria-label={`Eliminar ${p.nombre}`}
                                  className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                            <Icon name="trash" className="size-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {lista.length === 0 && <p className="py-12 text-center text-sm text-slate-400">Sin resultados.</p>}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-400">
          <span>Mostrando {lista.length} {lista.length === 1 ? 'producto' : 'productos'}</span>
          {soloCriticos && <span>Filtro: stock crítico o agotado</span>}
        </div>
      </div>

      {editando && (
        <Modal title={editando === 'nuevo' ? 'Nuevo producto' : 'Editar producto'} onClose={() => setEditando(null)}>
          <ProductoForm
            producto={editando === 'nuevo' ? null : editando}
            categorias={categorias.data ?? []}
            onSubmit={guardar}
            onCancel={() => setEditando(null)}
          />
        </Modal>
      )}
    </main>
  );
}
