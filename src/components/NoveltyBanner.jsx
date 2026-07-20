export default function NoveltyBanner({ noticia, description, className = '' }) {
  return (
    <div
      className={`relative z-20 mx-auto flex w-full max-w-lg flex-col items-start gap-1.5 px-4 text-left animate-fadeUp [animation-delay:250ms] ${className}`}
    >
      <div className="flex min-h-40 w-full flex-col justify-start gap-1.5 sm:min-h-44">
        <h3 className="text-3xl font-bold text-white">{noticia}</h3>
        <p className="text-lg leading-snug text-white sm:text-xl">{description}</p>
      </div>
    </div>
  )
}
