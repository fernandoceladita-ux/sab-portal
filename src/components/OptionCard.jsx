import { Link } from 'react-router-dom'
import { IconArrowUpRight } from './icons.jsx'

export default function OptionCard({ to, title, image, icon: Icon, style }) {
  return (
    <Link
      to={to}
      style={style}
      className="group relative isolate flex min-h-[100px] flex-col justify-end overflow-hidden rounded-xl bg-cover bg-center p-2.5 shadow-soft transition sm:min-h-[190px] sm:rounded-2xl sm:p-5"
    >
      <img src={image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-latam-profunda/55 via-latam-profunda/80 to-latam-profunda/95 transition group-hover:from-latam-diavivo/55 group-hover:to-latam-profunda" />
      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-latam-coral sm:right-4 sm:top-4 sm:h-8 sm:w-8">
        <IconArrowUpRight className="h-2.5 w-2.5 text-white sm:h-3.5 sm:w-3.5" />
      </span>
      <span className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/25 bg-white/15 backdrop-blur sm:mb-3 sm:h-11 sm:w-11 sm:rounded-xl">
        <Icon className="h-3.5 w-3.5 text-white sm:h-5 sm:w-5" />
      </span>
      <h3 className="text-[11px] font-extrabold leading-tight text-white sm:text-lg">{title}</h3>
    </Link>
  )
}
