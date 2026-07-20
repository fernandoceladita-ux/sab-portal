import { useEffect, useState } from 'react'
import { MODULES } from '../data/menuData.js'
import { NEWS } from '../data/news.js'
import OptionCard from '../components/OptionCard.jsx'
import NoveltyCarousel from '../components/NoveltyCarousel.jsx'
import NewsDetailModal from '../components/NewsDetailModal.jsx'
import ReporteDiarioModal from '../components/ReporteDiarioModal.jsx'
import AbsentismoModal from '../components/AbsentismoModal.jsx'
import Reveal from '../components/Reveal.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import FaqAccordion from '../components/FaqAccordion.jsx'
import HelpCard from '../components/HelpCard.jsx'
import {
  IconChevronDown, IconHelp,
  IconLifeBuoy, IconClipboard, IconGraduation, IconCalendarX, IconUtensils,
} from '../components/icons.jsx'

const MODULE_ICONS = {
  'gestion-personal': `${import.meta.env.BASE_URL}img/btn_banners_home/btn_datos_personales.png`,
  'mi-rol': `${import.meta.env.BASE_URL}img/btn_banners_home/btn_mi_rol.png`,
  'gestion-operacional': `${import.meta.env.BASE_URL}img/btn_banners_home/btn_gestion_operativa.png`,
}
// Used only for the full-color transition screen (mobile PageWipe), not the cards.
const MODULE_WIPE_ICONS = {
  'gestion-personal': `${import.meta.env.BASE_URL}img/btn_banners_home/btn_datos_personales.png`,
  'mi-rol': `${import.meta.env.BASE_URL}img/btn_banners_home/btn_mi_rol.png`,
  'gestion-operacional': `${import.meta.env.BASE_URL}img/btn_banners_home/btn_gestion_operativa.png`,
}
const MODULE_COLORS = {
  'gestion-personal': 'bg-latam-diavivo',
  'mi-rol': 'bg-latam-estrellada',
  'gestion-operacional': 'bg-latam-profunda',
}

const SOPORTE_OSSA_URL =
  'https://www.appsheet.com/start/3522a874-2c91-4844-bd27-b76938550f60?platform=desktop#appName=PreviewOSSAV2-594103936&vss=H4sIAAAAAAAAA6WOMQ7CMBAE_7K1X-AWUSAUGhANpjDxRbJI7Ch2ApHlj9HyMS4BRB1R3pxmdxMGS7d91OUV8pR-15ZGSCSFw9iSglRYeRc7XysIhZ1u3rAg93woZOSz-MqRAmRa4Mo_egWsIRdtZambgiaNAz4SvyeFwSwgCzR91Jea5p0s5Mys8mUfyBx5xNLysHHre6udKbzhvErXgfIL8ni8pFYBAAA=&view=Men%C3%BA'
const MENU_DOM_URL = 'https://drive.google.com/file/d/1mVBRLaGphXi7r8TyKiPpUMkOs9MArmbq/view'

const FAQ_ITEMS = [
  {
    q: '¿Qué debo hacer si mis vales de alimentación no se han cargado?',
    a: 'Ingresa al Centro de Ayuda abajo en la opción "Soporte Vales" o reporta directamente en el formulario de AppSheet adjuntando tu ID. El tiempo de resolución estimado es menor a 24 horas.',
  },
  {
    q: '¿Cómo registro un descanso médico de última hora?',
    a: 'Usa la tarjeta "Absentismos" del Centro de Ayuda para registrar el descanso médico con tu documentación de sustento. Tu coordinador CPL recibirá la notificación de forma automática.',
  },
  {
    q: '¿Cuál es la fecha límite para solicitar cambios en el rol de programación?',
    a: 'Las solicitudes de cambio se reciben hasta 4 días hábiles antes de la fecha de operación, a través de la sección "Mi Rol". Solicitudes fuera de este plazo se evalúan solo por contingencia.',
  },
]

export default function Home() {
  const [activeNews, setActiveNews] = useState(null)
  const [reporteOpen, setReporteOpen] = useState(false)
  const [absentismoOpen, setAbsentismoOpen] = useState(false)

  useEffect(() => {
    document.title = 'SAB Perú · Inicio'
  }, [])

  return (
    <>
      {/* HERO + CARDS: fits one screen, no scroll needed to see the 3 options */}
      <div className="hero-vh flex flex-col">
        <section className="relative isolate flex flex-[5] min-h-[260px] flex-col items-center justify-between px-5 pb-5 pt-9">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-[center_top_20%] sm:bg-[center_70%]"
            style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/hero.png')` }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-latam-profunda/30" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          <div className="relative z-10 flex w-full max-w-lg flex-1 flex-col items-center animate-fadeUp">
            <img
              src={`${import.meta.env.BASE_URL}img/titulo_hero.png`}
              alt="SAB · Servicio a Bordo · LATAM Airlines Perú"
              className="w-full sm:max-w-[540px]"
            />
          </div>

          <NoveltyCarousel items={NEWS} onOpenDetail={setActiveNews} />
        </section>

        <section className="flex flex-[1] flex-col justify-center px-5 pb-3 pt-6 sm:pt-8">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-3 gap-2 sm:gap-4">
            {MODULES.map((mod, i) => (
              <div key={mod.key} className="h-full animate-fadeUp" style={{ animationDelay: `${350 + i * 120}ms` }}>
                <OptionCard
                  to={mod.path}
                  title={mod.label}
                  icon={MODULE_ICONS[mod.key]}
                  wipeIcon={MODULE_WIPE_ICONS[mod.key]}
                  color={MODULE_COLORS[mod.key]}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
            className="mx-auto mt-5 flex flex-col items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1.5px] text-slate-400"
          >
            <span className="flex h-8 w-8 animate-bob items-center justify-center rounded-full border border-slate-200">
              <IconChevronDown className="h-3.5 w-3.5 text-latam-estrellada" />
            </span>
            Desliza hacia abajo
          </button>
        </section>
      </div>

      {/* FAQ */}
      <Reveal as="section" id="faq" className="mx-auto max-w-4xl scroll-mt-[84px] px-5 py-14 sm:py-16">
        <SectionHeading eyebrow="Ayuda rápida" title="Preguntas Frecuentes" icon={IconHelp} />
        <FaqAccordion items={FAQ_ITEMS} />
      </Reveal>

      {/* Centro de Ayuda y Reportes */}
      <div className="bg-[#FFF1F6]">
        <Reveal as="section" className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
          <SectionHeading eyebrow="Soporte" title="Centro de Ayuda y Reportes" icon={IconLifeBuoy} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HelpCard
              icon={IconClipboard}
              title="Movimiento Diario"
              description="Formulario de movimiento diario y Zero Claims."
              ctaLabel="Reportar"
              onClick={() => setReporteOpen(true)}
            />
            <HelpCard
              icon={IconGraduation}
              title="Cursos y Licencias"
              description="Soporte sobre entrenamientos, simuladores y vigencia. Será dirigido a OSSA."
              ctaLabel="Ir a Soporte"
              href={SOPORTE_OSSA_URL}
            />
            <HelpCard
              icon={IconCalendarX}
              title="Absentismos"
              description="Carga aquí tus descansos médicos y licencias."
              ctaLabel="Registrar"
              onClick={() => setAbsentismoOpen(true)}
            />
          </div>
        </Reveal>
      </div>

      {(activeNews?.detail || activeNews?.image) && (
        <NewsDetailModal news={activeNews} onClose={() => setActiveNews(null)} />
      )}
      {reporteOpen && <ReporteDiarioModal onClose={() => setReporteOpen(false)} />}
      {absentismoOpen && <AbsentismoModal onClose={() => setAbsentismoOpen(false)} />}
    </>
  )
}