import { useRef } from 'react'
import { IconChevronRight } from './icons.jsx'

export default function Carousel({ children }) {
  const trackRef = useRef(null)

  const scrollBy = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <button
        onClick={() => scrollBy(-1)}
        aria-label="Anterior"
        className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-latam-estrellada shadow-card md:flex"
      >
        <IconChevronRight className="h-4 w-4 rotate-180" />
      </button>
      <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:px-0">
        {children}
      </div>
      <button
        onClick={() => scrollBy(1)}
        aria-label="Siguiente"
        className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-latam-estrellada shadow-card md:flex"
      >
        <IconChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
