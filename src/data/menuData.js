import {
  IconEdit, IconIdCard, IconCalendar, IconPlane, IconSyringe, IconWrench,
  IconRepeat, IconGem, IconHeartPulse, IconUser, IconPdf, IconChart,
  IconDollar, IconShirt,
} from '../components/icons.jsx'

// Each module maps 1:1 to a top-nav item and mega-menu dropdown.
// `groups` mirrors the two-column layout from the reference screenshots.
export const MODULES = [
  {
    key: 'datos-personales',
    label: 'Datos Personales',
    path: '/datos-personales',
    heroTitle: 'Datos Personales',
    heroSubtitle: 'Gestiona tu expediente interno y tus trámites regulatorios ante entidades y organismos legales.',
    groups: [
      {
        title: 'Expediente Personal',
        items: [
          { id: 'actualizacion-datos', label: 'Actualización de Datos', icon: IconEdit },
          { id: 'renovacion-fotocheck', label: 'Renovación de Fotocheck', icon: IconIdCard },
          { id: 'cesion-vacaciones', label: 'Intercambio o Cesión de Vacaciones', icon: IconCalendar },
        ],
      },
      {
        title: 'Entidades y Legal',
        items: [
          { id: 'domicilio-dgac', label: 'Domicilio DGAC', icon: IconPlane },
          { id: 'vacuna-fiebre-amarilla', label: 'Vacuna Fiebre Amarilla', icon: IconSyringe },
          { id: 'registro-sunat', label: 'Registro de Equipos SUNAT', icon: IconWrench },
        ],
      },
    ],
  },
  {
    key: 'mi-rol',
    label: 'Mi Rol',
    path: '/mi-rol',
    heroTitle: 'Mi Rol',
    heroSubtitle: 'Consulta y gestiona tu programación, tus tiempos de vuelo y tu habilitación operativa.',
    groups: [
      {
        title: 'Gestión de Tiempos',
        items: [
          { id: 'solicitud-mes-subsiguiente', label: 'Solicitud Mes Subsiguiente', icon: IconIdCard },
          { id: 'cambios-voluntarios', label: 'Cambios Voluntarios', icon: IconRepeat },
          { id: 'registro-medico', label: 'Registro Médico', icon: IconGem },
          { id: 'seguro-medico', label: 'Activa tu seguro Médico', icon: IconHeartPulse },
        ],
      },
      {
        title: 'PBS, Visas y Habilitación',
        items: [
          { id: 'visa-pasaporte', label: 'Procedimiento Visa / Pasaporte', icon: IconUser },
          { id: 'grupos-pbs', label: 'Grupos PBS 2026', icon: IconPdf },
          { id: 'cambios-web-sab', label: 'Cambios Web SAB LP', icon: IconChart },
        ],
      },
    ],
  },
  {
    key: 'gestion-operativa',
    label: 'Gestión Operativa',
    path: '/gestion-operativa',
    heroTitle: 'Gestión Operativa',
    heroSubtitle: 'Todo sobre viáticos, alimentación y presentación personal para tus operaciones diarias.',
    groups: [
      {
        title: 'Viáticos y Alimentación',
        items: [
          { id: 'instructivo-vales', label: 'Instructivo de Vales', icon: IconPdf },
          { id: 'consultas-viaticos', label: 'Consultas Viáticos y Horas de Vuelo', icon: IconDollar },
        ],
      },
      {
        title: 'Presentación Personal',
        items: [
          { id: 'cambio-uniforme', label: 'Cambio de Uniforme', icon: IconShirt },
        ],
      },
    ],
  },
]

export const findModule = (key) => MODULES.find((m) => m.key === key)

export const findItem = (itemId) => {
  for (const mod of MODULES) {
    for (const group of mod.groups) {
      const item = group.items.find((i) => i.id === itemId)
      if (item) return { ...item, module: mod, group }
    }
  }
  return null
}
