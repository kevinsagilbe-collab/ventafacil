import Icon from '../Icon.jsx';

// Variantes del prototipo: botón verde (acción principal), oscuro (cierre), con borde (secundario)
const VARIANTES = {
  primary: 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 disabled:bg-slate-300 disabled:shadow-none',
  dark: 'bg-slate-950 text-white shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:bg-slate-300 disabled:shadow-none',
  outline: 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 disabled:bg-slate-300',
};

export default function Button({ variant = 'primary', icon, className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${VARIANTES[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} className="size-4" />}
      {children}
    </button>
  );
}
