import { useState } from 'react'
import { RouteInstruction } from './fields/FormFields.jsx'
import { IconPlane, IconUtensils, IconAlertTriangle, IconCheck } from './icons.jsx'

const TABS = [
  {
    id: 'horas',
    label: 'Horas Voladas',
    icon: IconPlane,
    steps: [
      {
        title: 'Haz click en "Horas Voladas"',
        body: 'Inicia el proceso seleccionando la categoría correspondiente dentro del menú lateral de la plataforma.',
      },
      {
        title: 'Selecciona el año',
        body: 'Filtra el año correspondiente que requieres auditar (ej. selecciona "2025" o el año en curso).',
      },
      {
        title: 'Escoge el mes que deseas consultar',
        body: 'Esto te redirigirá a un enlace con el detalle correspondiente. A continuación, podrás visualizar el resumen de las horas voladas en el mes, junto con el detalle por vuelo, incluyendo fecha, ruta, duración y número de vuelo.',
      },
    ],
  },
  {
    id: 'vales',
    label: 'Vales de Alimentación',
    icon: IconUtensils,
    steps: [
      {
        title: 'Haz click en "Vales de Alimentación"',
        body: 'Selecciona el apartado correspondiente para ingresar a la gestión de bonos alimentarios operacionales.',
      },
      {
        title: 'Selecciona el año',
        body: 'Esto te llevará a un enlace directo con la base de datos y el detalle histórico de la información de haberes.',
      },
      {
        title: 'Aplica el filtro mensual',
        body: 'Filtra según el mes que deseas consultar y luego haz click en "Cargar datos".',
      },
      {
        title: 'Desglose analítico de bonos',
        body: 'A continuación, visualizarás el monto total neto pagado por mes, junto con el desglose de cada bono recibido.',
      },
    ],
  },
]

function StepList({ steps }) {
  return (
    <ol className="flex flex-col gap-5">
      {steps.map((step, i) => (
        <li key={step.title} className="flex items-start gap-3.5">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-latam-coral/10 text-sm font-extrabold text-latam-coral">
            {i + 1}
          </span>
          <div>
            <p className="text-sm font-extrabold text-latam-estrellada">{step.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function ConsultasViaticosView() {
  const [tab, setTab] = useState('horas')
  const active = TABS.find((t) => t.id === tab)

  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <h2 className="text-2xl font-extrabold text-latam-estrellada sm:text-[28px]">Horas de Vuelo y Vales de Alimentación</h2>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-slate-600">
        Estimados Jefes de Servicio a Bordo y Tripulantes de Cabina: en línea con nuestra cultura JETS, mejoramos el
        acceso y visualización detallada de tus haberes operacionales corporativos.
      </p>

      <RouteInstruction text="Ruta de acceso:" steps={['Portal SAB LATAM', 'Tu Trabajo', 'Pagos Variables']} />

      <div className="mt-6 flex border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition ${
              tab === t.id ? 'text-latam-coral' : 'text-slate-500 hover:text-latam-estrellada'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {tab === t.id && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-latam-coral" />}
          </button>
        ))}
      </div>

      <div key={tab} className="animate-fadeUp rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6">
        <StepList steps={active.steps} />

        {tab === 'vales' && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-extrabold text-latam-estrellada">Detalle de Vales de Alimentación</p>
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-sm font-semibold text-slate-600">Total Vales de Alimentación:</span>
              <span className="text-base font-extrabold text-latam-coral">S/. 581.00</span>
            </div>
            <ul className="flex flex-col gap-2">
              {['Bono por cumplimiento de rol asignado', 'Bono por horas de vuelo de operación'].map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                  <IconCheck className="h-4 w-4 flex-shrink-0 text-green-600" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-latam-coral/25 bg-latam-coral/5 p-5">
        <div className="mb-3 flex items-center gap-2 text-latam-coral">
          <IconAlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-extrabold uppercase tracking-wide">Importante</p>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Si al consultar la información aparece este mensaje en la parte superior de la pantalla, significa que los
          datos del mes seleccionado aún no han sido cargados o no cuentas con información del mes.
        </p>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="mb-2 truncate font-mono text-[11px] text-slate-400">
            Una página insertada en n-ykrumlztzrjvsjmyxcdrsjxujty4xexirkbka4y-6lu-script.googleusercontent.com dice
          </p>
          <p className="mb-3 text-sm font-semibold text-white">No se encontraron datos para este usuario en el mes seleccionado.</p>
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-white"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
