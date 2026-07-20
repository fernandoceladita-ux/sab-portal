import { useState } from 'react'
import {
  IconClock, IconCalendarX, IconCalendar, IconChart, IconCalendarCheck, IconCheck,
  IconUser, IconSparkle, IconPlane, IconChevronDown,
} from './icons.jsx'

const TABS = [
  {
    id: 'tiempos',
    label: 'Tiempos y Descansos',
    icon: IconClock,
    rules: [
      {
        icon: IconClock,
        title: 'Tiempo extra posterior al PDR',
        tone: 'danger',
        badge: 'Protección Activa',
        body: (
          <>
            Como medida de protección frente a demoras operacionales, se añade automáticamente{' '}
            <strong className="text-slate-800">01:00 hora de descanso adicional</strong> por encima del mínimo
            requerido por ley.
          </>
        ),
      },
      {
        icon: IconCalendarX,
        title: 'Reserva tarde seguida de libre',
        tone: 'danger',
        badge: 'No Permitido',
        body: (
          <>
            Por límites estrictos de activación de seguridad, <strong className="text-slate-800">se restringe</strong>{' '}
            realizar permutas de turnos de Reserva Tarde (HSB2 y ASB2) si están pegados inmediatamente a un día
            libre.
          </>
        ),
      },
      {
        icon: IconCalendar,
        title: 'ETA previo a libre (Llegadas de Noche)',
        tone: 'danger',
        badge: 'Restringido',
        body: (
          <>
            Se restringen los cambios con hora estimada de arribo (ETA){' '}
            <strong className="text-slate-800">posterior a las 22:30 horas</strong> si vas seguido de un día libre.
            Esto asegura tu holgura y protege el disfrute de tu libre. La única excepción es si toda tu tripulación
            tiene el vuelo programado igual.
          </>
        ),
      },
      {
        icon: IconClock,
        title: 'Block time 8 en 24 (Tiempo de Vuelo)',
        tone: 'danger',
        badge: 'Límite Estricto',
        body: (
          <>
            Se considera una holgura técnica de 35 minutos en periodos de 24 horas consecutivas. Esto significa que
            cualquier cambio aprobado debe dejarte con un{' '}
            <strong className="text-slate-800">máximo de 07:25 horas de tiempo de vuelo (TV)</strong> en ese rango.
          </>
        ),
      },
    ],
  },
  {
    id: 'limites',
    label: 'Límites de Horas y Libres',
    icon: IconCalendarX,
    rules: [
      {
        icon: IconChart,
        title: 'Limitación mensual y trimestral de horas block',
        tone: 'danger',
        badge: 'Cómputo Técnico',
        body: (
          <>
            Cada asignación de reserva programada computa automáticamente{' '}
            <strong className="text-slate-800">5 horas de vuelo</strong> para tu acumulado. Adicionalmente, el
            sistema aplica un margen de protección de 03 horas respecto a los topes mensuales (
            <strong className="text-slate-800">100 horas</strong>) y trimestrales (
            <strong className="text-slate-800">270 horas</strong>).
          </>
        ),
      },
      {
        icon: IconCalendarCheck,
        title: 'Mínimo de Libres legales',
        tone: 'danger',
        badge: 'Mínimo Obligatorio',
        body: (
          <>
            Ningún tripulante debe quedar con <strong className="text-slate-800">menos de 8 días libres al mes</strong>.
            Esto solo cambia si tienes más de 5 días seguidos bajo vacaciones, descanso médico, permisos de
            jefatura, licencias sin goce de haber o pedidos especiales.
          </>
        ),
      },
      {
        icon: IconCheck,
        title: 'Secuencias reglamentarias RAP',
        tone: 'danger',
        badge: 'Validado por RAP',
        body: (
          <>
            Las secuencias de bloques permitidos según la RAP son{' '}
            <strong className="text-slate-800">4x1, 5x2 o de 6 a 10 trabajados por 4 libres</strong>. Al salir de un
            periodo de vacaciones, estás obligado a terminar tu secuencia con los libres correspondientes.
          </>
        ),
      },
    ],
  },
  {
    id: 'operacion',
    label: 'Operación y Fechas Límite',
    icon: IconPlane,
    rules: [
      {
        icon: IconCalendarX,
        title: 'Empalme programación mes siguiente (Freeze de Roster)',
        tone: 'danger',
        badge: 'Tope: Día 13 del mes',
        body: (
          <>
            Todo cambio web que involucre modificaciones en las secuencias de trabajo de la{' '}
            <strong className="text-slate-800">última semana del mes</strong>, solo se aceptará{' '}
            <strong className="text-slate-800">hasta el día 13 del mes actual</strong> debido al cierre de sistemas
            del equipo de Roster.
          </>
        ),
      },
      {
        icon: IconUser,
        title: 'Cambio entre HRK',
        tone: 'danger',
        badge: 'Exclusivo HRK',
        body: (
          <>
            Los tripulantes que se encuentren bajo la modalidad de <strong className="text-slate-800">HRK mensual</strong>,
            están facultados para intercambiar vuelos únicamente con un Jefe de Servicio a Bordo (JSB) o con otro
            compañero con su mismo HRK mensual.
          </>
        ),
      },
      {
        icon: IconSparkle,
        title: 'Curva de Experiencia en Vuelo',
        tone: 'danger',
        badge: 'Bloqueado Automático',
        body: (
          <>
            Por altos estándares de seguridad y balance de cabina, en un mismo vuelo{' '}
            <strong className="text-slate-800">no podrá quedar asignado más de 1 tripulante nuevo</strong> (con
            menos de 3 meses cumplidos en la compañía).
          </>
        ),
      },
      {
        icon: IconPlane,
        title: 'Arribo en décimo día',
        tone: 'danger',
        badge: 'Tope: 20:00 hrs LIM',
        body: (
          <>
            Los tripulantes que se encuentren cumpliendo el{' '}
            <strong className="text-slate-800">décimo día de su secuencia de trabajo</strong>, deberán tener
            horario de aterrizaje máximo en Lima (LIM) las <strong className="text-slate-800">20:00 horas</strong>.
          </>
        ),
      },
    ],
  },
]

const BADGE_TONES = {
  danger: 'bg-latam-coral text-white',
}

function RuleCard({ icon: Icon, title, body, badge, tone }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-latam-estrellada/30">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-4 text-left">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-latam-estrellada/10">
          <Icon className="h-4 w-4 text-latam-estrellada" />
        </span>
        <span className="flex-1 text-sm font-extrabold text-latam-estrellada">{title}</span>
        <span
          className={`hidden flex-shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide sm:inline-flex ${BADGE_TONES[tone]}`}
        >
          {badge}
        </span>
        <IconChevronDown className={`h-4 w-4 flex-shrink-0 text-latam-estrellada transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-4 pb-4 pt-3">
            <p className="text-sm leading-relaxed text-slate-600">{body}</p>
            <span
              className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide sm:hidden ${BADGE_TONES[tone]}`}
            >
              {badge}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CambiosWebSabView() {
  const [tab, setTab] = useState('tiempos')
  const active = TABS.find((t) => t.id === tab)

  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Antes de coordinar o procesar un cambio voluntario de tramos en la plataforma, revisa estas normativas e
        indicaciones mandatorias. El sistema web validará automáticamente que no vulnere ninguno de estos límites
        de regulaciones de descanso y seguridad.
      </p>

      <div className="grid grid-cols-3 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative flex flex-wrap items-center justify-center gap-1.5 px-1.5 py-3 text-center text-[13px] font-bold leading-tight transition sm:text-sm ${
              tab === t.id ? 'text-latam-coral' : 'text-slate-500 hover:text-latam-estrellada'
            }`}
          >
            <t.icon className="h-4 w-4 flex-shrink-0" />
            {t.label}
            {tab === t.id && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-latam-coral" />}
          </button>
        ))}
      </div>

      <div key={tab} className="animate-fadeIn mt-5 flex flex-col gap-3">
        {active.rules.map((rule) => (
          <RuleCard key={rule.title} {...rule} />
        ))}
      </div>
    </div>
  )
}
