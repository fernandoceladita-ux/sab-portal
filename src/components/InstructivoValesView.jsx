import { useEffect, useRef, useState } from 'react'
import Modal from './Modal.jsx'
import {
  IconSparkle, IconSmartphone, IconKey, IconQrCode, IconWifi, IconSearch,
  IconClipboard, IconClock, IconShieldCheck, IconUtensils, IconHelp,
  IconChevronDown, IconClose,
} from './icons.jsx'

const IMG_DIR = `${import.meta.env.BASE_URL}img/gestion-operativa/instructivo_vales/`
const QR_IMAGE = `${IMG_DIR}${encodeURIComponent('codigo QR de la app.png')}`
const RESTAURANTES_IMAGE = `${IMG_DIR}restaurantes_autorizados.png`

const STEPS = [
  {
    id: 1,
    title: 'Acceso y Descarga de la App',
    icon: IconSmartphone,
    image: `${IMG_DIR}paso1.png`,
    hasQrButton: true,
    body: (
      <>
        <strong className="text-slate-800">Tripulación de Cabina:</strong> ingresa desde tu One Device.{' '}
        <strong className="text-slate-800">Tripulación de Mando:</strong> descarga la app escaneando el código QR.
      </>
    ),
  },
  {
    id: 2,
    title: 'Visualiza tu Vale',
    icon: IconKey,
    image: `${IMG_DIR}paso2.png`,
    body: 'Ingresa a la sección "Generar Vale". Allí podrás encontrar el vale asignado y disponible del día de manera inmediata.',
  },
  {
    id: 3,
    title: 'Genera el Código QR',
    icon: IconQrCode,
    image: `${IMG_DIR}paso3.png`,
    body: 'Haz clic en la opción "Generar Vale". Se procesará la solicitud interna para emitir el código correspondiente para tu consumo.',
  },
  {
    id: 4,
    title: 'Presenta y Canjea',
    icon: IconShieldCheck,
    image: `${IMG_DIR}paso4.png`,
    body: 'Muestra el código QR generado en caja para que sea escaneado por el restaurante. También tienes la opción de dictar el código alfanumérico en pantalla.',
  },
]

const CONSIDERACIONES = [
  {
    icon: IconClipboard,
    title: 'Historial de Pendientes',
    body: 'En la sección "Vales generados" podrás encontrar todos los vales que emitiste pero que aún no han sido canjeados en restaurantes.',
  },
  {
    icon: IconClock,
    title: 'Vencimiento Diario',
    body: 'Una vez generado el vale, este puede ser usado una sola vez y hasta finalizar el día. Pasado este lapso, el vale vencerá automáticamente.',
    danger: true,
  },
  {
    icon: IconShieldCheck,
    title: 'Control de Consumo',
    body: 'En la sección "Vales usados" podrás validar el detalle histórico del vale que canjeaste y la información desglosada de lo consumido.',
  },
  {
    icon: IconWifi,
    title: 'Conexión Recomendada',
    body: 'Busca contar con una conexión a internet estable en tu dispositivo móvil al momento de generar el QR para un rendimiento óptimo.',
  },
]

function PhoneMockup({ src, alt }) {
  return (
    <div className="relative mx-auto w-full max-w-[230px]">
      <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-slate-900 bg-slate-900 shadow-card">
        <span className="absolute left-1/2 top-0 z-10 h-4 w-20 -translate-x-1/2 rounded-b-lg bg-slate-900" />
        <img key={src} src={src} alt={alt} className="w-full animate-fadeIn" />
      </div>
    </div>
  )
}

function QrButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-latam-estrellada/10 px-3 py-1.5 text-xs font-extrabold text-latam-estrellada transition hover:-translate-y-0.5 hover:bg-latam-estrellada hover:text-white"
    >
      <IconQrCode className="h-3.5 w-3.5" /> Ver QR de Descarga
    </button>
  )
}

function ImageModal({ title, src, alt, onClose }) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <Modal onClose={onClose} className={`transform bg-white transition-all duration-300 ${entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-extrabold text-latam-estrellada">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-latam-coral"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5">
        <img src={src} alt={alt} className="w-full rounded-xl" />
      </div>
    </Modal>
  )
}

function DesktopGuide({ onOpenQr }) {
  const [activeId, setActiveId] = useState(1)
  const active = STEPS.find((s) => s.id === activeId)

  return (
    <div className="hidden gap-6 sm:grid sm:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-3">
        {STEPS.map((step) => {
          const isActive = step.id === activeId
          return (
            <div
              key={step.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveId(step.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveId(step.id)}
              className={`cursor-pointer rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                isActive ? 'border-latam-coral bg-latam-coral/5 shadow-sm' : 'border-slate-200 bg-white hover:border-latam-estrellada/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition ${
                    isActive ? 'bg-latam-coral text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.id}
                </span>
                <div className="min-w-0">
                  <p className={`flex items-center gap-1.5 text-sm font-extrabold ${isActive ? 'text-latam-coral' : 'text-latam-estrellada'}`}>
                    <step.icon className="h-4 w-4 flex-shrink-0" /> {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  {step.hasQrButton && <QrButton onClick={(e) => { e.stopPropagation(); onOpenQr() }} />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center rounded-2xl bg-slate-50 p-6">
        <PhoneMockup src={active.image} alt={active.title} />
      </div>
    </div>
  )
}

function MobileGuide({ onOpenQr }) {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const cards = Array.from(container.children)
    const io = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (mostVisible) {
          const idx = cards.indexOf(mostVisible.target)
          if (idx !== -1) setActiveIndex(idx)
        }
      },
      { root: container, threshold: [0.5, 0.75, 1] },
    )
    cards.forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])

  const scrollToIndex = (i) => {
    containerRef.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <div className="sm:hidden">
      <div ref={containerRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className="flex w-[82%] flex-shrink-0 snap-center flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-latam-coral text-sm font-extrabold text-white">
                {step.id}
              </span>
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-latam-estrellada">
                <step.icon className="h-4 w-4 flex-shrink-0" /> {step.title}
              </p>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{step.body}</p>
            {step.hasQrButton && <QrButton onClick={onOpenQr} />}
            <div className="mt-4 flex justify-center rounded-xl bg-slate-50 p-4">
              <PhoneMockup src={step.image} alt={step.title} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {STEPS.map((step, i) => (
          <button
            key={step.id}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Ir al paso ${step.id}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-6 bg-latam-coral' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function ConsideracionesAccordion() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <IconHelp className="h-4 w-4 flex-shrink-0 text-latam-estrellada" />
        <span className="flex-1 text-sm font-extrabold text-latam-estrellada">Consideraciones de Uso</span>
        <IconChevronDown className={`h-4 w-4 flex-shrink-0 text-latam-estrellada transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-5 sm:grid-cols-2">
            {CONSIDERACIONES.map((c) => (
              <div
                key={c.title}
                className={`rounded-xl border p-4 transition hover:-translate-y-0.5 ${
                  c.danger ? 'border-latam-coral/30 bg-latam-coral/5' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className={`mb-1.5 flex items-center gap-2 text-sm font-extrabold ${c.danger ? 'text-latam-coral' : 'text-latam-estrellada'}`}>
                  <c.icon className="h-4 w-4 flex-shrink-0" /> {c.title}
                </p>
                <p className="text-sm leading-relaxed text-slate-600">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InstructivoValesView() {
  const [qrOpen, setQrOpen] = useState(false)
  const [restaurantesOpen, setRestaurantesOpen] = useState(false)

  return (
    <div className="mx-auto max-w-4xl animate-fadeUp">
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-latam-coral/25 bg-latam-coral/5 p-5 text-latam-coral">
        <IconSparkle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <p className="text-sm leading-relaxed">
          <strong className="font-extrabold">Tripulante en Reserva de Aeropuerto:</strong> Si te encuentras bajo
          asignación de reserva en el aeropuerto, hasta próximo aviso, el procedimiento digital varía: deberás
          recoger tu vale en formato físico en la Oficina de Ventas para ser canjeado exclusivamente en el
          restaurante <strong>PeruSuyo Mercado Peruano</strong>.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-sm font-extrabold uppercase tracking-wide text-latam-estrellada">Guía de Uso</p>
        <DesktopGuide onOpenQr={() => setQrOpen(true)} />
        <MobileGuide onOpenQr={() => setQrOpen(true)} />
      </div>

      <ConsideracionesAccordion />

      <button
        type="button"
        onClick={() => setRestaurantesOpen(true)}
        className="mt-4 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-latam-estrellada/40 hover:shadow-sm"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-latam-coral/10">
          <IconUtensils className="h-4 w-4 text-latam-estrellada" />
        </span>
        <span className="flex-1 text-sm font-extrabold text-latam-estrellada">Red de Restaurantes Autorizados</span>
        <IconSearch className="h-4 w-4 flex-shrink-0 text-slate-400" />
      </button>
      <p className="mt-2 px-1 text-xs text-slate-400">Toca el título para ver el mapa completo.</p>

      {qrOpen && (
        <ImageModal title="Código QR de Descarga" src={QR_IMAGE} alt="Código QR para descargar la app" onClose={() => setQrOpen(false)} />
      )}
      {restaurantesOpen && (
        <ImageModal
          title="Red de Restaurantes Autorizados"
          src={RESTAURANTES_IMAGE}
          alt="Mapa de restaurantes autorizados"
          onClose={() => setRestaurantesOpen(false)}
        />
      )}
    </div>
  )
}
