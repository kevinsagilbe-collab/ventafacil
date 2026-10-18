import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import Icon from '@/components/Icon.jsx';
import Logo from '@/components/Logo.jsx';
import Button from '@/components/ui/Button.jsx';
import { Alert } from '@/components/ui/Field.jsx';
import { useAuth } from './AuthContext.jsx';

// No existe en el prototipo: sigue su sistema visual (Inter, emerald, tarjetas redondeadas, fondo #F7F8FA)
export default function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fa] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>

        <form onSubmit={onSubmit}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          <p className="text-sm font-semibold text-emerald-600">Bienvenido de nuevo</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">Inicia sesión</h1>
          <p className="mt-2 text-sm text-slate-500">Ingresa con tu cuenta para abrir tu caja.</p>

          <div className="mt-7 space-y-4">
            <InputConIcono icon="mail" label="Correo electrónico" name="email" type="email"
                           autoComplete="username" placeholder="tucorreo@ventafacil.com"
                           value={form.email} onChange={onChange} />
            <InputConIcono icon="lock" label="Contraseña" name="password" type="password"
                           autoComplete="current-password" placeholder="••••••••"
                           value={form.password} onChange={onChange} />
          </div>

          {error && <div className="mt-4"><Alert>{error}</Alert></div>}

          <Button type="submit" icon={enviando ? undefined : 'check'} disabled={enviando} className="mt-6 h-12 w-full">
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">VentaFácil · Punto de venta para tu negocio</p>
      </div>
    </main>
  );
}

function InputConIcono({ icon, label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      <span className="relative mt-2 block">
        <Icon name={icon} className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          required
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
          {...props}
        />
      </span>
    </label>
  );
}
