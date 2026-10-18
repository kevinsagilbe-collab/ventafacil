import { useState } from 'react';
import { cajaApi } from '@/api/services.js';
import PageHeading from '@/components/PageHeading.jsx';
import Button from '@/components/ui/Button.jsx';
import { Alert } from '@/components/ui/Field.jsx';

export default function AbrirTurnoForm({ onAbierto }) {
  const [monto, setMonto] = useState('200000');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError('');
    try {
      await cajaApi.abrir(Number(monto));
      await onAbierto();
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <>
      <PageHeading eyebrow="Caja cerrada" title="Abrir Turno de Caja" detail="Registra el efectivo con el que empiezas el turno." />
      <form onSubmit={onSubmit}
            className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8">
        <label htmlFor="monto-base" className="text-sm font-bold text-slate-800">Monto inicial (Base)</label>
        <p className="mb-3 mt-1 text-xs text-slate-400">Billetes y monedas disponibles para dar cambio.</p>
        <div className="flex h-14 items-center rounded-xl border border-slate-200 px-4 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50">
          <span className="mr-2 font-bold text-slate-400">$</span>
          <input id="monto-base" type="number" min="0" step="100" required inputMode="numeric"
                 value={monto} onChange={(e) => setMonto(e.target.value)}
                 className="min-w-0 flex-1 text-xl font-extrabold text-slate-900 outline-none" />
        </div>
        {error && <div className="mt-4"><Alert>{error}</Alert></div>}
        <Button type="submit" icon="check" disabled={enviando} className="mt-6 h-12 w-full">
          {enviando ? 'Abriendo…' : 'Abrir turno'}
        </Button>
      </form>
    </>
  );
}
