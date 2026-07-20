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
      {/* `overflow-x-auto` sin `overflow-y` explícito hace que el navegador
          calcule igual `overflow-y: auto` (regla del spec de CSS), así que
          este contenedor recorta verticalmente. El padding vertical evita que
          eso corte la sombra/el crecimiento del card activo (`scale-[1.04]`).
          `shadow-card` tiene offset hacia abajo (0 18px 40px), por eso el
          padding inferior es mayor que el superior. */}
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[calc(50%-125px)] pb-16 pt-6 sm:px-0"
      >
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
