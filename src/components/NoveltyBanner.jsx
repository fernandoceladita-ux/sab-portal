export default function NoveltyBanner({
  noticia,
  description,
  href = '#',
  buttonLabel = 'Ver detalle',
  hasDetail = false,
  onOpenDetail,
  className = '',
}) {
  return (
    <div
      className={`relative z-20 mx-auto flex w-full max-w-lg flex-col items-start gap-1.5 text-left animate-fadeUp [animation-delay:250ms] ${className}`}
    >
      <h3 className="text-3xl font-bold text-white">{noticia}</h3>
      <p className="text-lg leading-snug text-white sm:text-xl">{description}</p>

      {hasDetail ? (
        <button
          type="button"
          onClick={onOpenDetail}
          className="mt-2 inline-block rounded-lg bg-latam-coral px-5 py-2 text-sm font-bold uppercase tracking-wide text-white"
        >
          {buttonLabel}
        </button>
      ) : (
        <a
          href={href}
          className="mt-2 inline-block rounded-lg bg-latam-coral px-5 py-2 text-sm font-bold uppercase tracking-wide text-white"
        >
          {buttonLabel}
        </a>
      )}
    </div>
  )
}