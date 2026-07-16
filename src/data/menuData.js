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
          {
            id: 'renovacion-fotocheck',
            label: 'Renovación de Fotocheck',
            icon: IconIdCard,
            externalUrl:
              'https://www.appsheet.com/Account/Login?appName=Solicitud%20De%20Credenciales%20PE&FullScope=False&provider=google&returnUrl=https%3A%2F%2Fwww.appsheet.com%2Fstart%2Ffc09f2b3-fd11-46ae-882b-d8ce2cb7a8d1%3Fplatform%3Ddesktop#appName=SolicitudDeCredencialesPE-501453028&vss=H4sIAAAAAAAAA6WOOw7CMBAF7_Jqn8AliAIhaEA0mMLEG8kisaPYCUSW786aj1ID5b7VjCZhtHTbR11dIU9pvjY0QSIpHKaOFKTC0rvY-0ZBKOx0-xoXltxIzhqtkJHP4mOIFCDTtwL5b4GANeSirS31xVZYtrxJfheOh5lCFmiHqC8NPbOZypm32ldDIHPknJ8ywtqt7p12ZusNS2vdBMoPSSDo2G8BAAA=&view=Bienvenida',
          },
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
