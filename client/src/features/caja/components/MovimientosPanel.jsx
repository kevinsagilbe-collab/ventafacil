import { useState } from 'react';
import { cajaApi } from '@/api/services.js';
import Button from '@/components/ui/Button.jsx';
import ErrorMessage from '@/components/ui/ErrorMessage.jsx';
import Field, { Alert, inputClass } from '@/components/ui/Field.jsx';
import { useAsync } from '@/hooks/useAsync.js';
import { formatCOP, formatHora } from '@/utils/format.js';

/** Formulario "Registrar Egreso / Ingreso" + lista de movimientos del turno */
export default function MovimientosPanel({ turnoId, onRegistrado }) {
  const movimientos = useAsync(() => cajaApi.movimientos(), [turnoId]);
  const [form, setForm] = useState({ tipo: 'egreso', monto: '', concepto: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await cajaApi.registrarMovimiento({ ...form, monto: Number(form.monto) });
      setForm({ ...form, monto: '', concepto: '' });
      await Promise.all([onRegistrado(), movimientos.reload()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de movimiento">
          {[['egreso', 'Egreso'], ['ingreso', 'Ingreso']].map(([valor, label]) => (
            <button key={valor} type="button" role="radio" aria-checked={form.tipo === valor}
                    onClick={() => setForm({ ...form, tipo: valor })}
                    className={`rounded-xl border px-2 py-3 text-xs font-bold transition ${
                      form.tipo === valor ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <Field label="Monto">
            <input type="number" min="1" step="100" required value={form.monto} onChange={set('monto')} className={inputClass} />
          </Field>
          <Field label="Concepto">
            <input required maxLength={200} value={form.concepto} onChange={set('concepto')}
                   placeholder="Ej: Pago domicilio proveedor" className={inputClass} />
          </Field>
        </div>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" variant="dark" disabled={enviando} className="w-full">
          Registrar {form.tipo}
        </Button>
      </form>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Movimientos del turno</p>
        <ErrorMessage error={movimientos.error} onRetry={movimientos.reload} />
        {movimientos.data?.length === 0 && (
          <div className="grid h-20 place-items-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
            Sin movimientos
          </div>
        )}
        <ul className="divide-y divide-slate-100">
          {movimientos.data?.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{m.concepto}</p>
                <p className="text-xs text-slate-400">{m.tipo === 'egreso' ? 'Egreso' : 'Ingreso'} · {formatHora(m.creado_en)}</p>
              </div>
              <span className={`text-sm font-extrabold ${m.tipo === 'egreso' ? 'text-rose-500' : 'text-emerald-600'}`}>
                {m.tipo === 'egreso' ? '−' : '+'}{formatCOP(m.monto)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
