import { useEffect, useRef, useState } from 'react'
import NoveltyBanner from './NoveltyBanner.jsx'

const AUTO_MS = 15000  // tiempo entre cambios automáticos
const FADE_MS = 480   // duración del fundido

// Rota entre varias <NoveltyBanner>, con fundido + leve desplazamiento,
// auto-avance, y puntos para navegar manualmente.
export default function NoveltyCarousel({ items, onOpenDetail, className = '' }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)

  const changeTo = (next) => {
    if (next === index) return
    setVisible(false)
    setTimeout(() => {
      setIndex(next)
      setVisible(true)
    }, FADE_MS)
  }

  useEffect(() => {
    if (items.length <= 1) return undefined
    timerRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % items.length)
        setVisible(true)
      }, FADE_MS)
    }, AUTO_MS)
    return () => clearInterval(timerRef.current)
  }, [items.length, index])

  if (!items?.length) return null
  const current = items[index]

  return (
    <div className={`relative z-20 flex w-full flex-col items-center gap-4 ${className}`}>
      <div
        className="w-full ease-out"
        style={{
          transitionProperty: 'opacity, transform',
          transitionDuration: `${FADE_MS}ms`,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <NoveltyBanner
          noticia={current.noticia}
          description={current.description}
          href={current.href}
          buttonLabel={current.buttonLabel}
          hasDetail={Boolean(current.detail || current.image)}
          onOpenDetail={() => onOpenDetail?.(current)}
        />
      </div>

      {items.length > 1 && (
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => changeTo(i)}
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
