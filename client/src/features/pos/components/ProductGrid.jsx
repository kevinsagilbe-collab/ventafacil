import Icon from '@/components/Icon.jsx';
import ProductImage from '@/components/ProductImage.jsx';
import { formatCOP } from '@/utils/format.js';

export default function ProductGrid({ productos, enTicket, onSelect }) {
  if (productos.length === 0) {
    return (
      <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
        No hay productos que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
      {productos.map((p) => {
        // Unidades que quedan descontando las que ya están en el ticket
        const disponibles = p.stock - (enTicket[p.id] ?? 0);
        const agotado = disponibles <= 0;
        return (
          <button
            key={p.id}
            type="button"
            disabled={agotado}
            onClick={() => onSelect(p)}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:border-emerald-300 enabled:hover:shadow-lg enabled:hover:shadow-slate-200/70 disabled:opacity-60"
          >
            <div className="relative h-32 overflow-hidden bg-slate-100 sm:h-36">
              <ProductImage producto={p} className="h-full w-full text-4xl transition duration-300 group-enabled:group-hover:scale-105" />
              <span className={`absolute right-2 top-2 rounded-lg px-2 py-1 text-[10px] font-bold shadow-sm ${
                agotado ? 'bg-rose-100 text-rose-700' : p.estado !== 'En stock' ? 'bg-amber-100 text-amber-800' : 'bg-white/95 text-slate-600'
              }`}>
                {agotado ? 'Agotado' : `${disponibles} disponibles`}
              </span>
            </div>
            <div className="p-3.5">
              <p className="truncate text-sm font-bold text-slate-800">{p.nombre}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-base font-extrabold text-emerald-600">{formatCOP(p.precio_venta)}</span>
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600 transition group-enabled:group-hover:bg-emerald-500 group-enabled:group-hover:text-white">
                  <Icon name="plus" className="size-4" />
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
