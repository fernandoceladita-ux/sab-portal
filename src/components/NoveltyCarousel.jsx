import { useEffect, useRef, useState } from 'react'
import NoveltyBanner from './NoveltyBanner.jsx'

const AUTO_MS = 15000 // tiempo entre cambios automáticos

// Carrusel deslizable con el dedo (scroll-snap nativo), auto-avance,
// y puntos para navegar manualmente.
export default function NoveltyCarousel({ items, onOpenDetail, className = '' }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  const scrollToIndex = (i) => {
    trackRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined
    const slides = Array.from(track.children)
    const io = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (mostVisible) {
          const idx = slides.indexOf(mostVisible.target)
          if (idx !== -1) setIndex(idx)
        }
      },
      { root: track, threshold: [0.5, 0.75, 1] },
    )
    slides.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1) return undefined
    const timer = setInterval(() => {
      scrollToIndex((index + 1) % items.length)
    }, AUTO_MS)
    return () => clearInterval(timer)
  }, [items.length, index])

  if (!items?.length) return null

  return (
    <div className={`relative z-20 flex w-full flex-col items-center gap-4 ${className}`}>
      <div
        ref={trackRef}
        className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {items.map((item, i) => (
          <div key={i} className="w-full flex-shrink-0 snap-center">
            <NoveltyBanner
              noticia={item.noticia}
              description={item.description}
              href={item.href}
              buttonLabel={item.buttonLabel}
              hasDetail={Boolean(item.detail || item.image)}
              onOpenDetail={() => onOpenDetail?.(item)}
            />
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Ver novedad ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-latam-coral' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
