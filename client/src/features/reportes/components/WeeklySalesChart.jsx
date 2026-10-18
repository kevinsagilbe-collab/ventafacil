import { formatCOP } from '@/utils/format.js';

/**
 * Barras de una serie (v_ventas_semana). El día con más ventas se resalta en
 * emerald-500 y el resto en emerald-100, como en el prototipo. Tooltip al pasar el mouse o con foco.
 */
export default function WeeklySalesChart({ data }) {
  const max = Math.max(...data.map((d) => d.total), 0);
  const escala = max || 1;

  return (
    <figure className="m-0">
      <div className="mt-8 flex h-64 items-end justify-between gap-3 border-b border-slate-200 px-2">
        {data.map((d) => {
          const esMax = max > 0 && d.total === max;
          return (
            <div key={d.dia} className="group flex h-full flex-1 flex-col items-center justify-end gap-3">
              <div tabIndex={0} aria-label={`${d.dia_corto}: ${formatCOP(d.total)}`}
                   className="relative flex w-full flex-1 items-end outline-none">
                <span role="tooltip"
                      className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100"
                      style={{ bottom: `calc(${(d.total / escala) * 100}% + 6px)` }}>
                  {formatCOP(d.total)}
                </span>
                <div className={`min-h-[3px] w-full rounded-t-lg transition group-hover:opacity-80 ${esMax ? 'bg-emerald-500' : 'bg-emerald-100'}`}
                     style={{ height: `${(d.total / escala) * 100}%` }} />
              </div>
              <span className="pb-3 text-[11px] font-semibold text-slate-400">{d.dia_corto}</span>
            </div>
          );
        })}
      </div>

      {/* Vista en tabla para lectores de pantalla */}
      <table className="sr-only">
        <caption>Ventas por día</caption>
        <tbody>
          {data.map((d) => <tr key={d.dia}><th>{d.dia_corto}</th><td>{formatCOP(d.total)}</td></tr>)}
        </tbody>
      </table>
    </figure>
  );
}
