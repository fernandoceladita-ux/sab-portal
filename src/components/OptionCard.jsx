import { Link } from 'react-router-dom'

export default function OptionCard({ to, title, icon, color, style }) {
  return (
    <Link
      to={to}
      style={style}
      className={`group relative isolate flex h-full min-h-[100px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl p-3 text-center shadow-soft transition hover:brightness-110 sm:min-h-[110px] sm:flex-row sm:justify-start sm:gap-4 sm:rounded-2xl sm:px-6 sm:text-left ${color}`}
    >
      <span className="pointer-events-none absolute left-1/2 top-3 -z-0 h-14 w-14 -translate-x-1/2 rounded-full bg-white/25 blur-2xl sm:left-14 sm:top-1/2 sm:h-24 sm:w-24 sm:-translate-x-1/2 sm:-translate-y-1/2" />
      <img src={icon} alt="" className="relative z-10 h-20 w-20 flex-shrink-0 object-contain sm:h-20 sm:w-20" />
      <h3 className="relative z-10 text-sm font-extrabold uppercase leading-tight tracking-wide text-white sm:text-2xl sm:tracking-wider">
        {title}
      </h3>
    </Link>
  )
}
