import { useState } from 'react';
import { cajaApi } from '@/api/services.js';
import Icon from '@/components/Icon.jsx';
import PageHeading from '@/components/PageHeading.jsx';
import Button from '@/components/ui/Button.jsx';
import ErrorMessage from '@/components/ui/ErrorMessage.jsx';
import { Alert } from '@/components/ui/Field.jsx';
import Modal from '@/components/ui/Modal.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import { formatCOP, formatHora } from '@/utils/format.js';
import { useCaja } from './CajaContext.jsx';
import AbrirTurnoForm from './components/AbrirTurnoForm.jsx';
import MovimientosPanel from './components/MovimientosPanel.jsx';

export default function CajaPage() {
  const { turno, cargando, error, refrescar } = useCaja();
  const [arqueo, setArqueo] = useState(null);

  if (cargando) return <Spinner />;
  if (error) return <main className="p-4 sm:p-7"><ErrorMessage error={error} onRetry={refrescar} /></main>;

  return (
    <main className="p-4 sm:p-7">
      {arqueo ? <ArqueoResultado arqueo={arqueo} onListo={() => setArqueo(null)} />
        : turno ? <TurnoAbierto turno={turno} refrescar={refrescar} onCerrado={async (a) => { setArqueo(a); await refrescar(); }} />
        : <AbrirTurnoForm onAbierto={refrescar} />}
    </main>
  );
}

function TurnoAbierto({ turno, refrescar, onCerrado }) {
  const [contado, setContado] = useState('');
  const [movimientosAbierto, setMovimientosAbierto] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [error, setError] = useState('');

  const esperado = turno.total_esperado;
  const diferencia = contado === '' ? null : Number(contado) - esperado;
  const cuadrada = diferencia === 0;

  const metricas = [
    { label: 'Monto inicial (Base)', valor: turno.monto_base, color: 'bg-blue-50 text-blue-600' },
    { label: 'Ventas en efectivo', valor: turno.ventas_efectivo, color: 'bg-emerald-50 text-emerald-600' },
    {
      label: 'Ventas electrónicas', valor: turno.ventas_electronicas, color: 'bg-violet-50 text-violet-600',
      detalle: `Tarjeta ${formatCOP(turno.ventas_tarjeta)} · Nequi ${formatCOP(turno.ventas_nequi)}`,
    },
    {
      label: 'Total esperado en caja', valor: esperado, color: 'bg-slate-900 text-white', oscuro: true,
      detalle: (turno.ingresos || turno.egresos)
        ? `Incluye +${formatCOP(turno.ingresos)} / −${formatCOP(turno.egresos)}`
        : null,
    },
  ];

  async function cerrar() {
    if (contado === '') { setError('Ingresa el efectivo físico contado antes de cerrar.'); return; }
    if (!window.confirm('¿Cerrar la caja? No podrás registrar más ventas en este turno.')) return;
    setCerrando(true);
    setError('');
    try {
      await onCerrado(await cajaApi.cerrar(Number(contado)));
    } catch (err) {
      setError(err.message);
      setCerrando(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow={`Turno activo · ${formatHora(turno.abierto_en)}`}
        title="Control y Arqueo de Caja"
        detail="Verifica los movimientos y realiza el cierre del turno."
      />

      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metricas.map((m) => (
            <div key={m.label} className={`rounded-2xl p-4 ${m.color}`}>
              <p className={`text-xs font-semibold ${m.oscuro ? 'text-slate-400' : 'opacity-70'}`}>{m.label}</p>
              <p className="mt-3 text-xl font-extrabold tracking-tight">{formatCOP(m.valor)}</p>
              {m.detalle && <p className={`mt-1 text-[11px] ${m.oscuro ? 'text-slate-400' : 'opacity-70'}`}>{m.detalle}</p>}
            </div>
          ))}
        </div>

        <div className="my-8 h-px bg-slate-100" />

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label htmlFor="efectivo-contado" className="text-sm font-bold text-slate-800">Efectivo físico contado</label>
            <p className="mb-3 mt-1 text-xs text-slate-400">Ingresa el total de billetes y monedas en caja.</p>
            <div className="flex h-14 items-center rounded-xl border border-slate-200 px-4 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50">
              <span className="mr-2 font-bold text-slate-400">$</span>
              <input id="efectivo-contado" type="number" min="0" step="100" inputMode="numeric" placeholder="0"
                     value={contado} onChange={(e) => setContado(e.target.value)}
                     className="min-w-0 flex-1 text-xl font-extrabold text-slate-900 outline-none placeholder:text-slate-300" />
            </div>
          </div>

          <div className={`rounded-2xl border p-5 ${
            diferencia === null ? 'border-slate-200 bg-slate-50' : cuadrada ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Diferencia de caja</p>
                <p className={`mt-2 text-2xl font-extrabold ${
                  diferencia === null ? 'text-slate-300' : cuadrada ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {diferencia === null ? '—' : `${diferencia > 0 ? '+' : ''}${formatCOP(diferencia)}`}
                </p>
              </div>
              <span className={`grid size-11 place-items-center rounded-full ${
                diferencia === null ? 'bg-slate-100 text-slate-400' : cuadrada ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                <Icon name={cuadrada ? 'check' : 'alert'} />
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {diferencia === null ? 'Ingresa el efectivo contado para calcular la diferencia.'
                : cuadrada ? 'El efectivo coincide con el valor esperado.'
                : diferencia > 0 ? 'Hay un sobrante entre el valor contado y el esperado.'
                : 'Hay un faltante entre el valor contado y el esperado.'}
            </p>
          </div>
        </div>

        {error && <div className="mt-6"><Alert>{error}</Alert></div>}

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setMovimientosAbierto(true)}>Registrar Egreso / Ingreso</Button>
          <Button variant="dark" onClick={cerrar} disabled={cerrando}>
            {cerrando ? 'Cerrando…' : 'Cerrar Caja y Generar Arqueo'}
          </Button>
        </div>
      </div>

      {movimientosAbierto && (
        <Modal title="Egresos e ingresos de caja" onClose={() => setMovimientosAbierto(false)}>
          <MovimientosPanel turnoId={turno.turno_id} onRegistrado={refrescar} />
        </Modal>
      )}
    </>
  );
}

function ArqueoResultado({ arqueo, onListo }) {
  const cuadrada = arqueo.diferencia === 0;
  return (
    <>
      <PageHeading eyebrow="Turno cerrado" title="Arqueo de Caja" detail="Resumen del cierre del turno." />
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 p-4 text-white">
            <p className="text-xs font-semibold text-slate-400">Total esperado</p>
            <p className="mt-3 text-xl font-extrabold tracking-tight">{formatCOP(arqueo.total_esperado)}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 p-4 text-blue-600">
            <p className="text-xs font-semibold opacity-70">Efectivo contado</p>
            <p className="mt-3 text-xl font-extrabold tracking-tight">{formatCOP(arqueo.efectivo_contado)}</p>
          </div>
          <div className={`rounded-2xl p-4 ${cuadrada ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <p className="text-xs font-semibold opacity-70">Diferencia</p>
            <p className="mt-3 text-xl font-extrabold tracking-tight">
              {arqueo.diferencia > 0 ? '+' : ''}{formatCOP(arqueo.diferencia)}
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
          <Button onClick={onListo} icon="check">Listo</Button>
        </div>
      </div>
    </>
  );
}
