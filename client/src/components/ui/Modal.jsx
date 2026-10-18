import { useEffect } from 'react';
import Icon from '../Icon.jsx';

export default function Modal({ title, onClose, children, size = 'max-w-xl' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[calc(100vh-2rem)] w-full ${size} overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar"
                  className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700">
            <Icon name="close" className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
