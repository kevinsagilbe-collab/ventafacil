export default function Spinner({ fullScreen = false }) {
  return (
    <div role="status" className={`grid place-items-center ${fullScreen ? 'min-h-screen' : 'py-16'}`}>
      <span aria-label="Cargando" className="size-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-500" />
    </div>
  );
}
