export default function PageHeading({ eyebrow, title, detail, action }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold text-emerald-600">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {detail && <p className="mt-2 text-sm text-slate-500">{detail}</p>}
      </div>
      {action}
    </div>
  );
}
