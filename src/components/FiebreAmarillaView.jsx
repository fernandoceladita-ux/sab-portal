import { useState } from 'react'
import { Link } from 'react-router-dom'
import StepAccordion from './StepAccordion.jsx'
import {
  IconAlertTriangle, IconUser, IconCalendar, IconClock, IconMail, IconIdCard, IconHome,
  IconClipboard, IconCheck, IconWhatsApp, IconSend,
} from './icons.jsx'

const TEMPLATE_FIELDS = [
  { label: 'Nombres y Apellidos', icon: IconUser },
  { label: 'Fecha de Nacimiento', icon: IconCalendar },
  { label: 'Edad', icon: IconClock },
  { label: 'Email Corporativo', icon: IconMail },
  { label: 'Documento de Identidad', icon: IconIdCard },
  { label: 'Dirección de Domicilio', icon: IconHome },
]

const TEMPLATE_TEXT = `Nombres y Apellidos:
Fecha de Nacimiento:
Edad:
Email Corporativo:
Documento de Identidad:
Dirección de Domicilio: `

const WHATSAPP_NUMBER = '51936716963'
const WHATSAPP_MESSAGE =
  'Hola, soy colaborador vigente de LATAM y quisiera coordinar mi cita para la vacuna contra la Fiebre Amarilla.'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export default function FiebreAmarillaView() {
  const [copied, setCopied] = useState(false)

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(TEMPLATE_TEXT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Clipboard API bloqueada (permisos/http) — el botón simplemente no confirma.
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Ya contamos con un procedimiento coordinado para que los Jefes de Servicio a Bordo y Tripulantes de Cabina
        pendientes de vacunación puedan hacerlo mediante el proveedor contratado por la empresa.
      </p>

      <div className="mb-6 rounded-2xl border border-latam-coral/25 bg-latam-coral/5 p-5">
        <div className="mb-3 flex items-center gap-2 text-latam-coral">
          <IconAlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-extrabold uppercase tracking-wide">
            ¿Qué debes evitar? Recomendaciones operacionales previas
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-bold text-latam-estrellada">Sintomatología Febril</p>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-700">No tener fiebre</strong> un día antes ni el mismo día programado
              para tu vacunación. En caso de presentar temperatura alta, deberás reprogramar tu cita.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-latam-estrellada">Estado de Gestación</p>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-700">No estar gestando.</strong> Si te encuentras embarazada, este
              procedimiento queda suspendido temporalmente por resguardo médico aeronáutico.
            </p>
          </div>
        </div>
      </div>

      <StepAccordion number={1} title="Coordinación de Cita y Envío de Datos por WhatsApp">
        <p className="mb-5 text-sm text-slate-600">
          Si cumples de forma conforme con las recomendaciones del filtro superior, comunícate con la gestora del
          proveedor médico asignado.
        </p>

        <p className="mb-3 text-sm font-extrabold text-latam-estrellada">Copia y rellena esta plantilla en el chat:</p>
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TEMPLATE_FIELDS.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700"
            >
              <f.icon className="h-4 w-4 flex-shrink-0 text-latam-coral" />
              {f.label}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={copyTemplate}
          className={`mb-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold transition-all duration-300 sm:w-auto ${
            copied ? 'bg-green-600 text-white' : 'bg-latam-estrellada text-white hover:-translate-y-0.5 hover:bg-latam-coral hover:shadow-card'
          }`}
        >
          <span className={`flex transition-transform duration-300 ${copied ? 'scale-125 rotate-[360deg]' : 'scale-100'}`}>
            {copied ? <IconCheck className="h-4 w-4" /> : <IconClipboard className="h-4 w-4" />}
          </span>
          {copied ? '¡Copiado al portapapeles!' : 'Copiar Plantilla'}
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-latam-estrellada/30">
          <p className="mb-1 text-sm font-extrabold text-latam-estrellada">Atención del Proveedor de Salud</p>
          <p className="mb-2 text-sm text-slate-600">
            Gestora de Citas: <strong className="text-slate-800">Rosa Tapia</strong> · WhatsApp:{' '}
            <strong className="text-slate-800">936 716 963</strong>
          </p>
          <p className="mb-4 text-xs font-semibold text-latam-coral">
            Mensaje inicial obligatorio: Indica que eres colaborador vigente de LATAM.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card hover:brightness-105"
          >
            <IconWhatsApp className="h-4 w-4" /> Enviar Mensaje
          </a>
        </div>
      </StepAccordion>

      <StepAccordion number={2} title="Registro e Ingreso del Carné en el SITE LP" isLast>
        <div className="rounded-xl border border-dashed border-latam-coral/40 bg-latam-coral/5 p-5 text-center">
          <p className="mb-1.5 text-sm font-extrabold text-latam-estrellada">¿Ya cuentas con tu carné de vacunación oficial?</p>
          <p className="mb-5 text-sm leading-relaxed text-slate-600">
            Una vez inoculado, el centro médico te otorgará tu cartilla internacional. Es tu responsabilidad
            registrarla de inmediato en el sistema para actualizar tu estatus en las bases de datos globales y
            habilitar tu programación en rol para rutas restringidas.
          </p>
          <Link
            to="/gestion-personal?item=actualizacion-datos&tramite=fiebre"
            className="inline-flex items-center gap-2 rounded-xl bg-latam-estrellada px-6 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-latam-coral hover:shadow-card"
          >
            Abrir Ficha de Actualización de Datos <IconSend className="h-4 w-4" />
          </Link>
        </div>
      </StepAccordion>
    </div>
  )
}
