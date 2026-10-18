export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  return (
    <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
      <span>{error.message ?? String(error)}</span>
      {onRetry && (
        <button type="button" onClick={() => onRetry()} className="shrink-0 font-bold underline-offset-2 hover:underline">
          Reintentar
        </button>
      )}
    </div>
  );
}
