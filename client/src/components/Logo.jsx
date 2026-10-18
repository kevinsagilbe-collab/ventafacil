import Icon from './Icon.jsx';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
        <Icon name="bag" />
      </span>
      <div>
        <p className="text-base font-extrabold tracking-tight text-slate-950">VentaFácil</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Negocio inteligente</p>
      </div>
    </div>
  );
}
