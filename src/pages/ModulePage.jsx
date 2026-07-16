import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { findModule } from '../data/menuData.js'
import { ITEM_CONTENT } from '../data/moduleContent.js'
import Carousel from '../components/Carousel.jsx'
import ItemCard from '../components/ItemCard.jsx'
import TramiteForm from '../components/TramiteForm.jsx'
import DetailPlaceholder from '../components/DetailPlaceholder.jsx'
import Reveal from '../components/Reveal.jsx'

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=70'

export default function ModulePage() {
  const { moduleKey } = useParams()
  const [params] = useSearchParams()
  const mod = findModule(moduleKey)
  const allItems = useMemo(() => mod?.groups.flatMap((g) => g.items) ?? [], [mod])
  const [selectedId, setSelectedId] = useState(params.get('item') || null)

  useEffect(() => {
    const fromUrl = params.get('item')
    if (fromUrl) setSelectedId(fromUrl)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [moduleKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mod) return null

  const selectedItem = allItems.find((i) => i.id === selectedId)
  const selectedContent = selectedId ? ITEM_CONTENT[selectedId] : null

  return (
    <>
      <section
        className="relative flex min-h-[150px] items-end bg-cover bg-center px-5 py-7 sm:min-h-[190px] sm:px-10"
        style={{ backgroundImage: `url('${BANNER_IMAGE}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-latam-profunda/90 via-latam-profunda/70 to-latam-profunda/30" />
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{mod.heroTitle}</h1>
          <p className="mt-1.5 text-sm text-white/75 sm:text-[15px]">{mod.heroSubtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-0 py-8 sm:px-6">
        <Carousel>
          {allItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              content={ITEM_CONTENT[item.id]}
              active={selectedId === item.id}
              onSelect={() => setSelectedId(item.id)}
            />
          ))}
        </Carousel>
      </section>

      <Reveal as="section" className="mx-auto max-w-4xl px-5 pb-16 sm:px-6">
        {!selectedItem && (
          <div className="rounded-2xl bg-white p-8 text-center text-sm font-medium text-slate-400 shadow-sm">
            Selecciona una opción del carrusel para ver más detalles aquí.
          </div>
        )}
        {selectedItem && selectedContent?.hasForm && <TramiteForm />}
        {selectedItem && !selectedContent?.hasForm && (
          <DetailPlaceholder item={selectedItem} content={selectedContent} />
        )}
      </Reveal>
    </>
  )
}
