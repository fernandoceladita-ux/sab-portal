import Modal from './Modal.jsx'
import { IconPlane, IconCalendar, IconClipboard, IconClose } from './icons.jsx'

const SECTION_ICONS = {
  flight: IconPlane,
  calendar_month: IconCalendar,
  fact_check: IconClipboard,
}

function InfoCard({ section }) {
  const Icon = SECTION_ICONS[section.icon] ?? IconClipboard
  return (
    <div className="flex flex-col rounded-xl border border-latam-diavivo/25 bg-latam-estrellada/40 p-3.5 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
        <Icon className="h-4 w-4 flex-shrink-0 text-latam-coral" />
        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-white">{section.title}</h4>
      </div>
      <p className="text-[12.5px] leading-relaxed text-slate-300">{section.body}</p>

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
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
        >
          <IconClose className="h-4 w-4" />
        </button>
        <img src={`${import.meta.env.BASE_URL}${image}`} alt={news.noticia} className="block w-full" />
      </Modal>
    )
  }

  const [mainSection, ...restSections] = detail.sections ?? []

  return (
    <Modal onClose={onClose} className="text-white">
      <div
        className="relative flex flex-col overflow-hidden rounded-2xl"
        style={{ background: 'linear-gradient(185deg, #0F004F 0%, #1B0088 55%, #080030 100%)' }}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-latam-diavivo opacity-40 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-latam-coral opacity-20 blur-[100px]" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
        >
          <IconClose className="h-4 w-4" />
        </button>

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

          <p className="text-[13.5px] font-light leading-relaxed text-slate-200">{detail.body}</p>

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
        </div>
      </div>
    </Modal>
  )
}
