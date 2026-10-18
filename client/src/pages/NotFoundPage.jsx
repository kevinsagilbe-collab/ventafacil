import { Link } from 'react-router';
import Logo from '@/components/Logo.jsx';

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fa] p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
        <div className="flex justify-center"><Logo /></div>
        <p className="mt-8 text-sm font-semibold text-emerald-600">Error 404</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">Esta página no existe</h1>
        <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-emerald-500 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
