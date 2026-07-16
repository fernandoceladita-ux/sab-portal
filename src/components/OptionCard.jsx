import { Link } from 'react-router-dom'
import { usePageWipe } from '../context/PageWipe.jsx'

export default function OptionCard({ to, title, icon, wipeIcon, color, style }) {
  const wipeTo = usePageWipe()

  const handleClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
    e.preventDefault()
    wipeTo(to, color, title, wipeIcon ?? icon)
  }

  return (
    <Link
      to={to}
      onClick={handleClick}
      style={style}
      className={`group relative isolate flex h-full min-h-[100px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl p-3 text-center shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card hover:brightness-110 active:translate-y-0 active:scale-[0.97] sm:min-h-[110px] sm:flex-row sm:justify-start sm:gap-4 sm:rounded-2xl sm:px-6 sm:text-left ${color}`}
    >
      <span className="pointer-events-none absolute left-1/2 top-3 -z-0 h-14 w-14 -translate-x-1/2 rounded-full bg-white/25 blur-2xl transition-opacity duration-300 animate-pulse [animation-duration:3s] group-hover:animate-none group-hover:bg-white/40 sm:left-14 sm:top-1/2 sm:h-24 sm:w-24 sm:-translate-x-1/2 sm:-translate-y-1/2" />
      <img
        src={icon}
        alt=""
        className="relative z-10 h-20 w-20 flex-shrink-0 object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3 sm:h-20 sm:w-20"
      />
      <h3 className="relative z-10 text-sm font-extrabold uppercase leading-tight tracking-wide text-white transition-transform duration-300 sm:text-2xl sm:tracking-wider sm:group-hover:translate-x-1">
        {title}
      </h3>
    </Link>
  )
}
