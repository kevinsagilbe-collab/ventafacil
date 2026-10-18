import { useState } from 'react';
import { Link } from 'react-router';
import { reportesApi } from '@/api/services.js';
import Icon from '@/components/Icon.jsx';
import PageHeading from '@/components/PageHeading.jsx';
import ProductImage from '@/components/ProductImage.jsx';
import ErrorMessage from '@/components/ui/ErrorMessage.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import { useAsync } from '@/hooks/useAsync.js';
import { formatCOP, formatHora } from '@/utils/format.js';
import { exportarReporte } from './exportarReporte.js';
import WeeklySalesChart from './components/WeeklySalesChart.jsx';

/** Variación frente a ayer: "+12.5%", "−3.0%" o null si ayer fue 0 */
function variacion(hoy, ayer) {
  if (!ayer) return null;
  const pct = ((hoy - ayer) / ayer) * 100;
  return { texto: `${pct >= 0 ? '+' : '−'}${Math.abs(pct).toFixed(1)}%`, positiva: pct >= 0 };
}

export default function ReportesPage() {
  const [actualizado, setActualizado] = useState(new Date());
  const { data, loading, error, reload } = useAsync(async () => {
    const r = await reportesApi.dashboard();
    setActualizado(new Date());
    return r;
  }, []);

  if (loading && !data) return <Spinner />;
  if (error) return <main className="p-4 sm:p-7"><ErrorMessage error={error} onRetry={reload} /></main>;

  const { kpis, kpisAyer, ventasSemana, topProductos } = data;
  const criticos = kpis.productos_stock_minimo;

  const tarjetas = [
    { label: 'Ventas del día', valor: formatCOP(kpis.ventas_dia), icon: 'cash', color: 'bg-emerald-50 text-emerald-600',
      badge: variacion(kpis.ventas_dia, kpisAyer.ventas_dia) },
    { label: 'N° de transacciones', valor: kpis.transacciones, icon: 'pos', color: 'bg-blue-50 text-blue-600',
      badge: variacion(kpis.transacciones, kpisAyer.transacciones) },
    { label: 'Ganancia neta', valor: formatCOP(kpis.ganancia_dia), icon: 'trend', color: 'bg-violet-50 text-violet-600',
      badge: variacion(kpis.ganancia_dia, kpisAyer.ganancia_dia) },
    { label: 'Stock mínimo', valor: `${criticos} ${criticos === 1 ? 'producto' : 'productos'}`, icon: 'inventory',
      color: 'bg-amber-50 text-amber-600', revisar: criticos > 0 },
  ];

  return (
    <main className="p-4 sm:p-7">
      <PageHeading
        eyebrow="Resumen del negocio"
        title="Dashboard y Reportes"
        detail={`Información actualizada hoy a las ${formatHora(actualizado)}`}
        action={
          <button type="button" onClick={() => exportarReporte(data)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Icon name="download" className="size-4" />Exportar reporte
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map((t) => (
          <div key={t.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className={`grid size-10 place-items-center rounded-xl ${t.color}`}><Icon name={t.icon} /></span>
              {t.badge && (
                <span title="Frente a ayer"
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${t.badge.positiva ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {t.badge.texto}
                </span>
              )}
              {t.revisar && (
                <Link to="/inventario?criticos=1" className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-100">
                  Revisar
                </Link>
              )}
            </div>
            <p className="mt-5 text-xs font-semibold text-slate-400">{t.label}</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{t.valor}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">Ventas de la semana</h2>
              <p className="mt-1 text-xs text-slate-400">Ingresos diarios · pasa el mouse sobre una barra</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Últimos 7 días</span>
          </div>
          <WeeklySalesChart data={ventasSemana} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-extrabold text-slate-900">Top 5 productos</h2>
            <p className="mt-1 text-xs text-slate-400">Más vendidos en los últimos 7 días</p>
          </div>
          {topProductos.length === 0 && <p className="py-12 text-center text-sm text-slate-400">Aún no hay ventas.</p>}
          <div className="divide-y divide-slate-100">
            {topProductos.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="w-4 text-xs font-bold text-slate-300">{i + 1}</span>
                <ProductImage producto={p} className="size-10 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{p.nombre}</p>
                  <p className="text-xs text-slate-400">{p.categoria}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{p.unidades}</p>
                  <p className="text-[10px] text-slate-400">unidades</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
