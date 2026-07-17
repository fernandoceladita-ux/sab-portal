import { Fragment, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { findModule } from '../data/menuData.js'
import { ITEM_CONTENT } from '../data/moduleContent.js'
import Carousel from '../components/Carousel.jsx'
import ItemCard from '../components/ItemCard.jsx'
import TramiteForm from '../components/TramiteForm.jsx'
import VacacionesForm from '../components/VacacionesForm.jsx'
import FiebreAmarillaView from '../components/FiebreAmarillaView.jsx'
import RegistroSunatView from '../components/RegistroSunatView.jsx'
import DomicilioDgacView from '../components/DomicilioDgacView.jsx'
import UniformesView from '../components/UniformesView.jsx'
import ConsultasViaticosView from '../components/ConsultasViaticosView.jsx'
import InstructivoValesView from '../components/InstructivoValesView.jsx'
import CambiosVoluntariosView from '../components/CambiosVoluntariosView.jsx'
import DescansoMedicoView from '../components/DescansoMedicoView.jsx'
import SolicitudMesSubsiguienteView from '../components/SolicitudMesSubsiguienteView.jsx'
import SeguroMedicoView from '../components/SeguroMedicoView.jsx'
import VisaPasaporteView from '../components/VisaPasaporteView.jsx'
import GruposPbsView from '../components/GruposPbsView.jsx'
import CambiosWebSabView from '../components/CambiosWebSabView.jsx'
import DetailPlaceholder from '../components/DetailPlaceholder.jsx'
import Reveal from '../components/Reveal.jsx'

const BANNER_IMAGE = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=70'

// Cada ítem con `form` en moduleContent.js apunta a uno de estos componentes.
const FORM_COMPONENTS = {
  'actualizacion-datos': TramiteForm,
  'cesion-vacaciones': VacacionesForm,
  'vacuna-fiebre-amarilla': FiebreAmarillaView,
  'registro-sunat': RegistroSunatView,
  'domicilio-dgac': DomicilioDgacView,
  'cambio-uniforme': UniformesView,
  'consultas-viaticos': ConsultasViaticosView,
  'instructivo-vales': InstructivoValesView,
  'cambios-voluntarios': CambiosVoluntariosView,
  'descanso-medico': DescansoMedicoView,
  'solicitud-mes-subsiguiente': SolicitudMesSubsiguienteView,
  'seguro-medico': SeguroMedicoView,
  'visa-pasaporte': VisaPasaporteView,
  'grupos-pbs': GruposPbsView,
  'cambios-web-sab': CambiosWebSabView,
}

export default function ModulePage() {
  const { moduleKey } = useParams()
  const [params] = useSearchParams()
  const mod = findModule(moduleKey)
  const allItems = useMemo(() => mod?.groups.flatMap((g) => g.items) ?? [], [mod])
  const [selectedId, setSelectedId] = useState(params.get('item') || null)
  const itemParam = params.get('item')

  useEffect(() => {
    if (itemParam) setSelectedId(itemParam)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [moduleKey, itemParam])

  if (!mod) return null

  const selectedItem = allItems.find((i) => i.id === selectedId)
  const selectedContent = selectedId ? ITEM_CONTENT[selectedId] : null
  const FormComponent = selectedContent?.form ? FORM_COMPONENTS[selectedContent.form] : null

  return (
    <Fragment key={moduleKey}>
      <section
        className="relative flex min-h-[200px] items-end bg-cover bg-center px-5 py-7 sm:min-h-[220px] sm:px-10"
        style={{ backgroundImage: `url('${BANNER_IMAGE}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-latam-profunda/90 via-latam-profunda/70 to-latam-profunda/30" />
        <div className="relative z-10 max-w-xl animate-fadeUp">
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{mod.heroTitle}</h1>
          <p className="mt-1.5 text-[17px] text-white sm:text-[20px]">{mod.heroSubtitle}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl animate-fadeUp px-0 py-8 [animation-delay:120ms] sm:px-6">
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
        {selectedItem && FormComponent && <FormComponent />}
        {selectedItem && !FormComponent && (
          <DetailPlaceholder item={selectedItem} content={selectedContent} />
        )}
      </Reveal>
    </Fragment>
  )
}
