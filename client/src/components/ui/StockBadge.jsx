// Estados que calcula v_inventario
const TONOS = {
  'En stock': 'bg-emerald-50 text-emerald-700',
  'Stock crítico': 'bg-amber-100 text-amber-800',
  Agotado: 'bg-rose-50 text-rose-700',
};

export default function StockBadge({ estado }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${TONOS[estado] ?? 'bg-slate-100 text-slate-600'}`}>
      {estado}
    </span>
  );
}
