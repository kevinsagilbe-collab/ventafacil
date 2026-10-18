import { useState } from 'react';
import Icon from '@/components/Icon.jsx';
import ProductImage from '@/components/ProductImage.jsx';
import { formatCOP, MEDIOS_PAGO } from '@/utils/format.js';

export default function Ticket({ cart, onCompletar, procesando, deshabilitado }) {
  const [medioPago, setMedioPago] = useState('efectivo');
  const [recibido, setRecibido] = useState('');

  const montoRecibido = Number(recibido) || 0;
  const esEfectivo = medioPago === 'efectivo';
  const cambio = esEfectivo && montoRecibido >= cart.total ? montoRecibido - cart.total : null;
  const faltaEfectivo = esEfectivo && recibido !== '' && montoRecibido < cart.total;
  const vacio = cart.items.length === 0;

  async function completar() {
    const ok = await onCompletar({
      medio_pago: medioPago,
      monto_recibido: esEfectivo && recibido ? montoRecibido : null,
    });
    if (ok) setRecibido('');
  }

  return (
    <aside className="w-full border-t border-slate-200 bg-white xl:w-[380px] xl:shrink-0 xl:border-l xl:border-t-0">
      {/* El panel ocupa todo el alto; su contenido queda fijo al hacer scroll del catálogo */}
      <div className="p-5 xl:sticky xl:top-0 xl:max-h-screen xl:overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Ticket de venta</p>
          {/* El número real (#1001…) lo asigna la BD al guardar */}
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">Nueva orden</h2>
        </div>
        <button type="button" onClick={cart.vaciar} disabled={vacio}
                className="text-xs font-semibold text-slate-400 enabled:hover:text-rose-500 disabled:opacity-50">
          Limpiar
        </button>
      </div>

      <div className="my-5 max-h-[310px] space-y-3 overflow-y-auto pr-1">
        {vacio && (
          <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
            El ticket está vacío
          </div>
        )}
        {cart.items.map(({ producto, cantidad }) => (
          <div key={producto.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
            <ProductImage producto={producto} className="size-12 shrink-0 rounded-lg text-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">{producto.nombre}</p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-600">{formatCOP(producto.precio_venta)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button type="button" onClick={() => cart.cambiarCantidad(producto.id, cantidad - 1)} aria-label="Quitar uno"
                        className="grid size-6 place-items-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200">−</button>
                <span className="w-4 text-center text-xs font-bold">{cantidad}</span>
                <button type="button" onClick={() => cart.cambiarCantidad(producto.id, cantidad + 1)} aria-label="Agregar uno"
                        disabled={cantidad >= producto.stock}
                        className="grid size-6 place-items-center rounded-md bg-slate-100 text-slate-600 enabled:hover:bg-slate-200 disabled:opacity-40">+</button>
              </div>
            </div>
            <button type="button" onClick={() => cart.cambiarCantidad(producto.id, 0)} aria-label="Eliminar"
                    className="self-start text-slate-300 hover:text-rose-500">
              <Icon name="trash" className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-y border-slate-200 py-4 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span><span className="font-semibold text-slate-700">{formatCOP(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>IVA</span><span className="font-semibold text-slate-700">{formatCOP(cart.iva)}</span>
        </div>
        <div className="flex items-end justify-between pt-2">
          <span className="font-bold text-slate-900">Total</span>
          <span className="text-2xl font-extrabold tracking-tight text-slate-950">{formatCOP(cart.total)}</span>
        </div>
      </div>

      <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">Medio de pago</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Medio de pago">
        {MEDIOS_PAGO.map((m) => (
          <button key={m.value} type="button" role="radio" aria-checked={medioPago === m.value}
                  onClick={() => setMedioPago(m.value)}
                  className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
                    medioPago === m.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}>
            {m.label}
          </button>
        ))}
      </div>

      {esEfectivo && (
        <div className="mt-4">
          <div className="flex h-12 items-center rounded-xl border border-slate-200 px-4 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50">
            <span className="mr-2 text-sm font-bold text-slate-400">$</span>
            <input type="number" min="0" step="100" inputMode="numeric" aria-label="Monto recibido"
                   placeholder={`Monto recibido (${formatCOP(cart.total)})`}
                   value={recibido} onChange={(e) => setRecibido(e.target.value)}
                   className="min-w-0 flex-1 text-sm font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400" />
          </div>
          {cambio !== null && cart.total > 0 && (
            <p className="mt-2 flex justify-between text-sm text-slate-500">
              Cambio <span className="font-extrabold text-emerald-600">{formatCOP(cambio)}</span>
            </p>
          )}
          {faltaEfectivo && <p className="mt-2 text-xs font-semibold text-rose-500">El monto recibido es menor al total</p>}
        </div>
      )}

      <button type="button" onClick={completar} disabled={deshabilitado || procesando || vacio || faltaEfectivo}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
        <Icon name="check" className="size-4" />
        {procesando ? 'Procesando…' : 'Completar venta'}
      </button>
      </div>
    </aside>
  );
}
