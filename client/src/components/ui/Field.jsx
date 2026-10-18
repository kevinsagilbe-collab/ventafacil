// Campo de formulario con el estilo de los inputs del prototipo
export const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50';

export default function Field({ label, hint, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-bold text-slate-800">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-slate-400">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function Alert({ tone = 'error', children }) {
  const tones = {
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
  return <div role="status" className={`rounded-xl border px-4 py-3 text-sm font-medium ${tones[tone]}`}>{children}</div>;
}
