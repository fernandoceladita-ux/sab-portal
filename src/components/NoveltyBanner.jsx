export default function NoveltyBanner({
  noticia,
  description,
  href = '#',
  buttonLabel = 'Ver detalle',
  className = '',
}) {
  return (
    <div
      className={`relative z-20 mx-auto flex w-full max-w-lg flex-col items-start gap-1.5 text-left animate-fadeUp [animation-delay:250ms] ${className}`}
    >
      <h3 className="text-3xl font-bold text-white">{noticia}</h3>
      <p className="text-xl leading-snug text-white">{description}</p>
      
        <a href={href}
        className="mt-2 inline-block rounded-lg bg-latam-coral px-5 py-2 text-sm font-bold uppercase tracking-wide text-white"
      >
        {buttonLabel}
      </a>
    </div>
  )
}