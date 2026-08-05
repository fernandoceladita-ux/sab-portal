import Modal from './Modal.jsx'
import { IconPlane, IconCalendar, IconClipboard, IconClose, IconHelp, IconClock, IconSmartphone, IconCheck, IconStar } from './icons.jsx'

const SECTION_ICONS = {
  flight: IconPlane,
  calendar_month: IconCalendar,
  fact_check: IconClipboard,
  help: IconHelp,
  clock: IconClock,
  phone: IconSmartphone,
}

// Soporta un marcado mínimo `**frase**` en los textos de la noticia para
// resaltar sutilmente una frase puntual (ej. un plazo o un canal de contacto),
// sin necesitar JSX dentro de la data (news.js es un .js plano).
function renderHighlighted(text) {
  if (!text) return text
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <span key={i} className="rounded bg-latam-coral/25 px-1.5 py-0.5 font-semibold text-white">
        {part.slice(2, -2)}
      </span>
    ) : (
      part
    ),
  )
}

function GalleryCard({ item }) {
  return (
    <div className="overflow-hidden rounded-xl border border-latam-coral/35 bg-latam-estrellada/40 backdrop-blur-sm">
      <img src={`${import.meta.env.BASE_URL}${item.image}`} alt={item.caption ?? ''} className="block aspect-video w-full object-cover" />
      {item.caption && (
        <p className="px-3.5 py-2.5 text-[12.5px] font-semibold leading-snug text-white">{renderHighlighted(item.caption)}</p>
      )}
    </div>
  )
}

function HotelCard({ hotel }) {
  return (
    <div className="overflow-hidden rounded-xl border border-latam-coral/35 bg-latam-estrellada/40 backdrop-blur-sm">
      {hotel.image && (
        <img src={`${import.meta.env.BASE_URL}${hotel.image}`} alt={hotel.title} className="block aspect-video w-full object-cover" />
      )}
      <div className="p-3.5">
        <h4 className="text-[13px] font-extrabold text-white">{hotel.title}</h4>
        {hotel.subtitle && <p className="mt-0.5 text-[12px] italic text-slate-300">{hotel.subtitle}</p>}
        {hotel.items && hotel.items.length > 0 && (
          <ul className="mt-2.5 flex flex-col gap-1.5 border-t border-white/10 pt-2.5">
            {hotel.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-slate-200">
                <IconCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-latam-coral" />
                {renderHighlighted(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function PersonCard({ person }) {
  return (
    <div className="flex w-[76px] flex-shrink-0 flex-col items-center gap-1.5 text-center sm:w-28 sm:gap-2">
      <img
        src={`${import.meta.env.BASE_URL}${person.photo}`}
        alt={person.name}
        className="h-16 w-16 rounded-full border-2 border-latam-coral object-cover shadow-lg sm:h-24 sm:w-24"
      />
      <p className="text-[10px] font-bold leading-snug text-white sm:text-[11.5px]">{person.name}</p>
    </div>
  )
}

function RecognitionGroup({ group }) {
  return (
    <div className="rounded-xl border border-latam-coral/35 bg-latam-estrellada/40 p-2.5 backdrop-blur-sm sm:p-3.5">
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-white/10 pb-2.5">
        <IconStar className="h-4 w-4 flex-shrink-0 text-latam-coral" />
        <h4 className="text-[13px] font-extrabold text-white">{group.title}</h4>
        {group.badge && (
          <span className="ml-auto rounded-full bg-latam-coral px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
            {group.badge}
          </span>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {group.people.map((person) => (
          <PersonCard key={person.name} person={person} />
        ))}
      </div>
      {group.note && <p className="mt-3 text-center text-[11px] italic text-slate-400">{group.note}</p>}
    </div>
  )
}

function InfoCard({ section }) {
  const Icon = SECTION_ICONS[section.icon] ?? IconClipboard
  return (
    <div className="flex flex-col rounded-xl border border-latam-coral/35 bg-latam-estrellada/40 p-3.5 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
        <Icon className="h-4 w-4 flex-shrink-0 text-latam-coral" />
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white">{section.title}</h4>
      </div>
      <p className="text-[12.5px] leading-relaxed text-slate-300">{renderHighlighted(section.body)}</p>

      {section.table && (
        <div className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-black/20 text-[12px]">
          <div className="grid grid-cols-3 border-b border-white/10 bg-white/5 px-3 py-2 font-semibold text-slate-300">
            {section.table.headers.map((h) => (
              <div key={h} className={h === section.table.headers[2] ? 'text-right' : h === section.table.headers[1] ? 'text-center' : ''}>
                {h}
              </div>
            ))}
          </div>
          <div className="divide-y divide-white/5">
            {section.table.rows.map((row) => (
              <div key={row.join('-')} className="grid grid-cols-3 items-center px-3 py-2">
                <div className="font-bold text-white">{row[0]}</div>
                <div className="text-center text-slate-300">{row[1]}</div>
                <div className="text-right font-extrabold text-latam-coral">{row[2]}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewsDetailModal({ news, onClose }) {
  const { detail, image } = news
  if (!detail && !image) return null

  if (image) {
    return (
      <Modal onClose={onClose} className="bg-latam-profunda">
        {/* Envoltorio `sticky top-0 h-0`: al no ocupar alto no empuja el
            resto del contenido, pero al pegarse al techo del contenedor que
            SÍ scrollea (el de Modal.jsx) mantiene el botón absolute que
            lleva adentro siempre visible, en vez de scrollear junto con la
            imagen larga. */}
        <div className="sticky top-0 z-20 h-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-md backdrop-blur-sm transition hover:bg-white/20"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
        <img src={`${import.meta.env.BASE_URL}${image}`} alt={news.noticia} className="block w-full" />
      </Modal>
    )
  }

  const [mainSection, ...restSections] = detail.sections ?? []

  return (
    <Modal onClose={onClose} className="text-white">
      {/* Envoltorio `sticky top-0 h-0` fuera del panel con `overflow-hidden`:
          si el botón quedara adentro de ese panel (como antes), su
          `overflow-hidden` rompe el sticky (dejaría de despegarse), y como
          el panel entero scrollea dentro del contenedor de Modal.jsx, la X
          terminaba desapareciendo al bajar en noticias largas (ej. la de
          reconocimientos, con 6 fotos). Al no ocupar alto (h-0) no empuja
          el resto del contenido hacia abajo. */}
      <div className="sticky top-0 z-30 h-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white shadow-md backdrop-blur-sm transition hover:bg-white/20"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>

      <div
        className="relative flex flex-col overflow-hidden rounded-2xl"
        style={{ background: 'linear-gradient(185deg, #0F004F 0%, #1B0088 55%, #080030 100%)' }}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-latam-diavivo opacity-40 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-latam-coral opacity-20 blur-[100px]" />

        <div className="relative h-40 w-full overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0F004F] via-[#0F004F]/50 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0F004F]/60 to-transparent" />
          <img
            src={`${import.meta.env.BASE_URL}img/hero.png`}
            alt=""
            className="h-full w-full scale-105 object-cover object-[center_65%]"
          />
          <span className="absolute left-5 top-4 z-20 text-[10px] font-bold uppercase tracking-[3px] text-slate-300">
            Comunicados
          </span>
        </div>

        <div className="relative z-10 space-y-4 px-6 pb-7 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-latam-coral px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              {detail.eyebrow}
            </span>
            {detail.tag && (
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">{detail.tag}</span>
            )}
          </div>

          <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white">{detail.title}</h2>

          <p className="text-[13.5px] font-light leading-relaxed text-slate-200">{renderHighlighted(detail.body)}</p>

          {detail.highlight && (
            <div className="rounded-r-xl border-l-4 border-latam-coral bg-white/5 p-3.5">
              <p className="text-[13px] font-medium italic leading-snug text-slate-200">{detail.highlight}</p>
            </div>
          )}

          {mainSection && <InfoCard section={mainSection} />}

          {restSections.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {restSections.map((section) => (
                <InfoCard key={section.title} section={section} />
              ))}
            </div>
          )}

          {detail.gallery && detail.gallery.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {detail.gallery.map((item) => (
                <GalleryCard key={item.image} item={item} />
              ))}
            </div>
          )}

          {detail.recognitions && detail.recognitions.length > 0 && (
            <div className="flex flex-col gap-3">
              {detail.recognitions.map((group) => (
                <RecognitionGroup key={group.title} group={group} />
              ))}
            </div>
          )}

          {detail.hotels && detail.hotels.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {detail.hotels.map((hotel) => (
                <HotelCard key={hotel.title} hotel={hotel} />
              ))}
            </div>
          )}

          {detail.footer && (
            <p className="border-t border-white/10 pt-4 text-center text-[11px] uppercase tracking-wider text-slate-400">
              {detail.footer}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
