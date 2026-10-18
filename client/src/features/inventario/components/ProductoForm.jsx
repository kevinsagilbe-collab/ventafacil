import { useState } from 'react';
import Button from '@/components/ui/Button.jsx';
import Field, { Alert, inputClass } from '@/components/ui/Field.jsx';

const VACIO = {
  codigo: '', nombre: '', categoria_id: '', precio_costo: '', precio_venta: '',
  iva_porcentaje: 19, stock: 0, stock_minimo: 5, imagen_url: '',
};

export default function ProductoForm({ producto, categorias, onSubmit, onCancel }) {
  const [form, setForm] = useState(() =>
    (producto ? { ...VACIO, ...producto, imagen_url: producto.imagen_url ?? '' } : VACIO));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await onSubmit({
        ...form,
        categoria_id: Number(form.categoria_id),
        precio_costo: Number(form.precio_costo),
        precio_venta: Number(form.precio_venta),
        iva_porcentaje: Number(form.iva_porcentaje),
        stock: Number(form.stock),
        stock_minimo: Number(form.stock_minimo),
      });
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Código">
        <input required value={form.codigo} onChange={set('codigo')} placeholder="BEB-001" className={inputClass} />
      </Field>
      <Field label="Nombre">
        <input required value={form.nombre} onChange={set('nombre')} className={inputClass} />
      </Field>
      <Field label="Categoría">
        <select required value={form.categoria_id} onChange={set('categoria_id')} className={inputClass}>
          <option value="" disabled>Selecciona…</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </Field>
      <Field label="IVA %">
        <input type="number" min="0" max="99" step="0.01" value={form.iva_porcentaje} onChange={set('iva_porcentaje')} className={inputClass} />
      </Field>
      <Field label="Precio costo">
        <input type="number" min="0" required value={form.precio_costo} onChange={set('precio_costo')} className={inputClass} />
      </Field>
      <Field label="Precio venta">
        <input type="number" min="0" required value={form.precio_venta} onChange={set('precio_venta')} className={inputClass} />
      </Field>
      <Field label="Stock actual">
        <input type="number" min="0" value={form.stock} onChange={set('stock')} className={inputClass} />
      </Field>
      <Field label="Stock mínimo" hint="Por debajo se marca como stock crítico">
        <input type="number" min="0" value={form.stock_minimo} onChange={set('stock_minimo')} className={inputClass} />
      </Field>
      <Field label="URL de la imagen" hint="Opcional" className="sm:col-span-2">
        <input type="url" value={form.imagen_url} onChange={set('imagen_url')} placeholder="https://…" className={inputClass} />
      </Field>

      {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" icon="check" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar producto'}</Button>
      </div>
    </form>
  );
}
