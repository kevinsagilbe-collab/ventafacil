// Foto del producto (imagen_url) o, si no tiene, su inicial sobre fondo gris
export default function ProductImage({ producto, className = '' }) {
  if (producto.imagen_url) {
    return <img src={producto.imagen_url} alt="" loading="lazy" className={`object-cover ${className}`} />;
  }
  return (
    <span aria-hidden="true" className={`grid place-items-center bg-slate-100 font-extrabold text-slate-300 ${className}`}>
      {producto.nombre[0]}
    </span>
  );
}
