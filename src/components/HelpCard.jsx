// `onClick` (ej. abrir un modal local) y `href` (enlace externo) son opt-in:
// si se pasa `onClick`, el CTA es un <button>; si no, sigue siendo el <a> de siempre.
export default function HelpCard({ icon: Icon, title, description, ctaLabel, href = '#', onClick }) {
  const ctaCls = 'mt-1 rounded-lg bg-latam-estrellada px-4 py-2.5 text-[13px] font-extrabold text-white transition hover:bg-latam-coral'

  return (
    <div className="flex flex-col items-start gap-2.5 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-latam-coral/10">
          <Icon className="h-5 w-5 text-latam-estrellada" />
        </span>
        <h4 className="text-[15px] font-extrabold text-latam-estrellada">{title}</h4>
      </div>
      <p className="flex-1 text-[13px] leading-relaxed text-slate-500">{description}</p>
      {onClick ? (
        <button type="button" onClick={onClick} className={ctaCls}>
          {ctaLabel}
        </button>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className={ctaCls}>
          {ctaLabel}
        </a>
      )}
    </div>
  )
}
