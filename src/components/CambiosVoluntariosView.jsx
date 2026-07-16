import { useState } from 'react'
import { IconShieldCheck, IconCheck, IconKey, IconRepeat, IconArrowUpRight } from './icons.jsx'

// TODO: reemplazar con las URLs reales de Solicitudes Web y del formulario de Jira Service Desk.
const SOLICITUDES_WEB_URL = '#'
const JIRA_URL = '#'

const REGISTRO_STEPS = [
  'Ingresa al enlace del Portal de Solicitudes Web provisto abajo.',
  'Inicia sesión con tus credenciales corporativas de la compañía (LAN / LATAM).',
  'Una vez dentro, el sistema indexará tu número de BP de forma automática y te dejará apto para el uso de formularios de cambios voluntarios.',
]

const ACCESO_STEPS = [
  'Asegúrate de tener a la mano los datos exactos del vuelo original y del tramo por el que deseas permutar.',
  'Haz clic en el botón de abajo para ir directamente a la mesa de soporte de Project Management LATAM.',
  'Completa las casillas requeridas por el formulario de Jira Service Desk y realiza el seguimiento de tu aprobación.',
]

export default function CambiosVoluntariosView() {
  const [hasAccount, setHasAccount] = useState(null)

  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Para gestionar una permuta voluntaria de tramos en la mesa de ayuda institucional, es un{' '}
        <strong className="text-slate-800">requisito indispensable</strong> constar en la base de datos de
        Solicitudes Web. Evita rechazos automáticos de tu ticket validando tu acceso a continuación.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
        <p className="text-base font-extrabold text-latam-estrellada">¿Es la primera vez que vas a solicitar un cambio de vuelo?</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">
          Si nunca te has registrado en la plataforma de Solicitudes Web o cambiaste de One Device, necesitas
          habilitar tu cuenta primero.
        </p>
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setHasAccount(false)}
            className={`rounded-xl border-2 px-5 py-2.5 text-sm font-extrabold transition hover:-translate-y-0.5 ${
              hasAccount === false ? 'border-latam-coral bg-latam-coral/10 text-latam-coral' : 'border-latam-coral/40 bg-white text-latam-coral hover:bg-latam-coral/5'
            }`}
          >
            No estoy registrado / Es mi primer cambio
          </button>
          <button
            type="button"
            onClick={() => setHasAccount(true)}
            className={`rounded-xl px-5 py-2.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 ${
              hasAccount === true ? 'bg-latam-coral' : 'bg-latam-estrellada hover:bg-latam-coral'
            }`}
          >
            Sí, ya tengo cuenta activa
          </button>
        </div>
      </div>

      {hasAccount === false && (
        <div className="animate-fadeUp mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
            <IconShieldCheck className="h-5 w-5 flex-shrink-0 text-latam-coral" />
            <p className="text-sm font-extrabold text-latam-estrellada">Paso Obligatorio: Habilitación en Base de Datos</p>
          </div>
          <ul className="mb-5 flex flex-col gap-2.5">
            {REGISTRO_STEPS.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                <IconCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" /> {t}
              </li>
            ))}
          </ul>
          <a
            href={SOLICITUDES_WEB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-latam-coral px-6 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-latam-estrellada hover:shadow-card"
          >
            <IconKey className="h-4 w-4" /> 1. Registrarse en Solicitudes Web Aquí
          </a>
        </div>
      )}

      {hasAccount === true && (
        <div className="animate-fadeUp mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
            <IconRepeat className="h-5 w-5 flex-shrink-0 text-latam-diavivo" />
            <p className="text-sm font-extrabold text-latam-estrellada">Acceso Directo: Crear Ticket de Cambio Voluntario</p>
          </div>
          <ul className="mb-5 flex flex-col gap-2.5">
            {ACCESO_STEPS.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                <IconCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" /> {t}
              </li>
            ))}
          </ul>
          <a
            href={JIRA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-latam-diavivo px-6 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-latam-estrellada hover:shadow-card"
          >
            <IconArrowUpRight className="h-4 w-4" /> 2. Ingresar Solicitud en Jira Service Desk
          </a>
        </div>
      )}
    </div>
  )
}
