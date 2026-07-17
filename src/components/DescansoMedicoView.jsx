import { useRef, useState } from 'react'
import StepAccordion from './StepAccordion.jsx'
import { TextField, DateField, SelectField, FileUploadField, RouteInstruction, WarningNote } from './fields/FormFields.jsx'
import {
  IconSmartphone, IconMail, IconShieldCheck, IconWifi, IconArrowUpRight, IconChevronDown,
  IconSend, IconCheck,
} from './icons.jsx'

// TODO: ajustar a las filiales/rangos reales cuando se confirmen.
const FILIALES = ['PE (LATAM Perú)', 'CL (LATAM Chile)', 'CO (LATAM Colombia)', 'EC (LATAM Ecuador)']
const RANKS = ['JSB (Jefe de Servicio a Bordo)', 'SB (Sobrecargo)', 'TC (Tripulante de Cabina)']

const CONTACT_CHANNELS = [
  {
    icon: IconSmartphone,
    title: 'Central Telefónica MD',
    body: (
      <>
        Llamar al <strong className="text-slate-800">01-411-8347 (Opción 2)</strong>
      </>
    ),
  },
  {
    icon: IconMail,
    title: 'Vía Correo Electrónico',
    body: (
      <>
        <strong className="text-slate-800">movimiento.trip@lan.com</strong> (Esperar acuse)
      </>
    ),
  },
]

const INTL_ASSISTANCE = [
  {
    icon: IconSmartphone,
    title: 'Activación por APP',
    body: 'Utiliza de forma prioritaria la APP oficial de Universal Assistance desde tu One Device para la activación inmediata del servicio.',
  },
  {
    icon: IconWifi,
    title: 'Llamadas Gratis por Wifi',
    body: 'Realiza llamadas por Wifi sin costo directo a través de la misma plataforma digital o de su sitio web oficial.',
  },
  {
    icon: IconSmartphone,
    title: 'Línea Internacional',
    body: (
      <>
        Teléfono único con cobro revertido: <strong className="text-slate-800">+54 11 2206 0706</strong> (si
        registras cobros, podrás solicitar reembolso posterior).
      </>
    ),
  },
]

function InternationalAssistanceAccordion() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-latam-estrellada transition hover:bg-slate-50"
      >
        Si necesitas asistencia médica en un viaje internacional, ver aquí
        <IconChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 p-4">
            <div className="rounded-2xl border border-latam-diavivo/25 bg-latam-diavivo/5 p-5">
              <p className="mb-4 text-sm leading-relaxed text-slate-600">
                Si la emergencia de salud, malestar o accidente ocurre mientras te encuentras cumpliendo funciones
                asignadas por rol en el <strong className="text-slate-800">extranjero o fuera de tu país base</strong>,
                cuentas con la cobertura activa del seguro médico de la compañía:
              </p>

              <div className="mb-4 flex items-center gap-2 rounded-xl bg-latam-estrellada px-4 py-3 text-sm font-extrabold text-white">
                <IconShieldCheck className="h-4 w-4 flex-shrink-0" /> Nuevo Proveedor Oficial: Universal Assistance
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {INTL_ASSISTANCE.map((card) => (
                  <div key={card.title} className="rounded-xl bg-white p-4 shadow-sm">
                    <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-latam-coral/10">
                      <card.icon className="h-4 w-4 text-latam-estrellada" />
                    </span>
                    <h4 className="mb-1 text-[13.5px] font-extrabold text-latam-estrellada">{card.title}</h4>
                    <p className="text-[12.5px] leading-relaxed text-slate-500">{card.body}</p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                <strong className="text-slate-800">Flujo de Atención Extranjero:</strong> Contacta al seguro
                indicando tu nombre, BP, síntomas y ciudad de ubicación. La asistencia evaluará si se asiste por
                Telemedicina, atención médica en el lugar o derivación clínica, finalizando al decretarse tu alta
                médica. Puedes autogestionar tus certificados de cobertura en la sección Coberturas del sitio web.
              </p>

              {/* TODO: ajustar la URL oficial de Universal Assistance cuando se confirme. */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-latam-estrellada bg-white px-6 py-3 text-sm font-extrabold text-latam-estrellada shadow-sm transition hover:-translate-y-0.5 hover:bg-latam-estrellada hover:text-white"
              >
                Ir al Sitio de Universal Assistance <IconArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DescansoMedicoView() {
  const formRef = useRef(null)
  const [invalidFields, setInvalidFields] = useState(new Set())
  const [formValid, setFormValid] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const syncState = (e) => {
    const name = e.target.name
    if (name && invalidFields.has(name)) {
      setInvalidFields((prev) => {
        const next = new Set(prev)
        next.delete(name)
        return next
      })
    }
    setFormValid(formRef.current?.checkValidity() ?? false)
  }

  const submit = (e) => {
    e.preventDefault()
    setError('')

    const invalid = new Set()
    for (const el of e.currentTarget.elements) {
      if (el.name && typeof el.checkValidity === 'function' && !el.checkValidity()) {
        invalid.add(el.name)
      }
    }

    if (invalid.size > 0) {
      setInvalidFields(invalid)
      setError('Revisa los campos marcados: son obligatorios.')
      return
    }

    setInvalidFields(new Set())
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setTimeout(() => setSent(false), 3500)
    }, 700)
  }

  const cancel = () => {
    formRef.current?.reset()
    setInvalidFields(new Set())
    setFormValid(false)
    setError('')
  }

  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        En caso detectes síntomas de alguna incapacidad en tu salud que te impida realizar tus labores programadas
        (inclusive en condición de reserva), sigue estrictamente los pasos del flujo regulatorio de la compañía.
      </p>

      <StepAccordion number={1} title="Reportar de inmediato a Movimiento Diario" defaultOpen>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Si el tiempo hasta el inicio de la actividad o el STD de tu vuelo es{' '}
          <strong className="text-slate-800">mayor o igual a 05 horas</strong>, debes comunicarte prioritariamente
          para dar aviso formal a la operación:
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONTACT_CHANNELS.map((c) => (
            <div key={c.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-latam-coral/10">
                <c.icon className="h-4 w-4 text-latam-estrellada" />
              </span>
              <div className="min-w-0">
                <p className="text-[13.5px] font-extrabold text-latam-estrellada">{c.title}</p>
                <p className="text-[13px] leading-relaxed text-slate-600">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        <InternationalAssistanceAccordion />
      </StepAccordion>

      <StepAccordion number={2} title="Completar Formulario de Descanso Médico">
        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          Completa las casillas mandatorias adjuntando el documento sustentatorio de los días asignados de descanso
          médico:
        </p>

        <form ref={formRef} noValidate onSubmit={submit} onInput={syncState} onChange={syncState}>
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                name="correo"
                type="email"
                label="Correo electrónico"
                required
                disabled
                defaultValue="mario.fernandez@latam.com"
              />
            </div>
            <TextField
              name="bp"
              type="number"
              label="BP"
              required
              placeholder="Ej. 6014982"
              invalid={invalidFields.has('bp')}
            />
            <SelectField name="filial" label="Filial" required options={FILIALES} invalid={invalidFields.has('filial')} />
            <div className="sm:col-span-2">
              <SelectField name="rank" label="Rank" required options={RANKS} invalid={invalidFields.has('rank')} />
            </div>

            <div>
              <DateField
                name="fechaInicio"
                label="Fecha de inicio DM"
                required
                invalid={invalidFields.has('fechaInicio')}
              />
              <WarningNote>
                La fecha de inicio no puede ser anterior al día de hoy. Por favor corroborar que sea correcta.
              </WarningNote>
            </div>
            <div>
              <DateField
                name="fechaFin"
                label="Fecha de Término DM"
                required
                invalid={invalidFields.has('fechaFin')}
              />
              <WarningNote>Por favor tener cuidado y corroborar que las fechas ingresadas sean las correctas.</WarningNote>
            </div>

            <div className="sm:col-span-2">
              <FileUploadField
                name="documentoDM"
                label="Sube el documento de Descanso Médico (Ambas Caras)"
                required
                accept=".pdf,.png,.jpg,.jpeg"
                maxSizeMB={10}
                invalid={invalidFields.has('documentoDM')}
              />
            </div>
          </div>

          <div className="mt-2 flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-600 transition hover:-translate-y-0.5 hover:border-latam-estrellada hover:text-latam-estrellada"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formValid || sending}
              className="flex items-center justify-center gap-2 rounded-xl bg-latam-estrellada px-8 py-3 text-sm font-extrabold text-white shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:bg-latam-coral enabled:hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? 'Enviando...' : 'Enviar Notificación'} <IconSend className="h-4 w-4" />
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 animate-fadeUp">{error}</div>
        )}

        {sent && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 animate-fadeUp">
            <IconCheck className="h-5 w-5" /> Registro enviado correctamente a los sistemas de soporte.
          </div>
        )}
      </StepAccordion>

      <StepAccordion number={3} title="Cumplir con la Política de Descansos Médicos LATAM" isLast>
        <p className="mb-2 text-sm leading-relaxed text-slate-600">
          Es responsabilidad del colaborador conocer y cumplir a cabalidad las directrices normativas de
          regularización de licencias médicas. Revisa la documentación oficial siguiendo esta ruta jerárquica en
          intranet:
        </p>
        <RouteInstruction
          steps={['Portal', 'RH Connect', 'Home', 'Yo en LATAM', 'Reglamentos y Políticas LATAM Perú', 'Política Descansos Médicos']}
        />
      </StepAccordion>
    </div>
  )
}
