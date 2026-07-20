export default function ItemCard({ item, content, active, onSelect }) {
  const cardClassName = `group flex w-[250px] flex-shrink-0 snap-center flex-col overflow-hidden rounded-2xl border bg-white text-left transition sm:w-[270px] ${
    active ? 'scale-[1.04] border-latam-estrellada shadow-card' : 'border-slate-200 shadow-sm hover:border-latam-estrellada/40'
  }`

  const cardContent = (
    <>
      <div className="h-32 w-full overflow-hidden bg-slate-100">
        <img src={content?.image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className={`mb-1.5 text-[15px] font-extrabold ${active ? 'text-latam-coral' : 'text-latam-estrellada'}`}>{item.label}</h3>
        <p className="mb-3 flex-1 text-[13px] leading-relaxed text-slate-500">{content?.description}</p>
        <div className="mb-4 flex flex-col gap-1">
          {content?.tags?.map((tag) => (
            <span key={tag} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-latam-coral" />
              {tag}
            </span>
          ))}
        </div>
        <span
          className={`mt-auto rounded-lg px-4 py-2.5 text-center text-[13px] font-extrabold transition ${
            active ? 'bg-latam-estrellada text-white' : 'bg-slate-100 text-latam-estrellada group-hover:bg-latam-estrellada group-hover:text-white'
          }`}
        >
          Ingresar
        </span>
      </div>
    </>
  )

  // Ítems con externalUrl (ej. AppSheet) abren en pestaña nueva en vez de
  // seleccionar el detalle dentro del portal.
  if (item.externalUrl) {
    return (
      <a id={`carousel-item-${item.id}`} href={item.externalUrl} target="_blank" rel="noopener noreferrer" className={cardClassName}>
        {cardContent}
      </a>
    )
  }

  return (
    <button id={`carousel-item-${item.id}`} onClick={onSelect} className={cardClassName}>
      {cardContent}
    </button>
  )
}
