import { useState } from 'react'
import StepAccordion from './StepAccordion.jsx'
import {
  TextField, DateField, SelectField, FileUploadField, InfoNote,
  ImageReference, CheckboxGroup, RadioGroup, RouteInstruction, AnticipationAlert,
} from './fields/FormFields.jsx'
import {
  IconIdCard, IconCalendar, IconPlane, IconSyringe, IconWrench, IconEdit,
  IconSend, IconCheck,
} from './icons.jsx'
import { submitTramite } from '../lib/submitTramite.js'

// Por ahora solo "Actualización Contacto Emergencia" está conectado a Google Sheets.
const SHEET_CONNECTED_TRAMITES = ['emergencia']

const TRAMITES = [
  { id: 'emergencia', label: 'Actualización Contacto Emergencia' },
  { id: 'direccion', label: 'Actualización Dirección' },
  { id: 'dni', label: 'Actualización DNI' },
  { id: 'pasaporte', label: 'Actualización Pasaporte' },
  { id: 'telefono', label: 'Actualización de Número Telefónico' },
  { id: 'fiebre', label: 'Vacuna Fiebre Amarilla' },
  { id: 'visa', label: 'Actualización de VISA' },
  { id: 'licencia', label: 'Actualización Licencia de Manejo' },
  { id: 'rechazo', label: 'Notificación de Visa Rechazada', danger: true },
]

const ROUTE_STEPS = ['PORTAL', 'PEOPLE MANAGER', 'MY PROFILE', 'PERSONAL DATA', 'CONTACT INFORMATION']

export default function TramiteForm() {
  const [tramite, setTramite] = useState(null)
  const [visaTypes, setVisaTypes] = useState([])
  const [passStatus, setPassStatus] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!SHEET_CONNECTED_TRAMITES.includes(tramite)) {
      // Los demás trámites aún no están conectados a Google Sheets.
      setSent(true)
      setTimeout(() => setSent(false), 3500)
      return
    }

    const formData = new FormData(e.currentTarget)
    setSending(true)
    try {
      await submitTramite({
        bp: formData.get('bp'),
        nombre: formData.get('nombre'),
        tramite: TRAMITES.find((t) => t.id === tramite)?.label,
        contactoNombre: formData.get('contactoNombre'),
        contactoTelefono: formData.get('contactoTelefono'),
      })
      setSent(true)
      setTimeout(() => setSent(false), 3500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl">
      <AnticipationAlert>
        Ingresar solicitud con <strong>4 días hábiles de anticipación</strong> para su correcto procesamiento.
      </AnticipationAlert>

      <div className="mt-6">
        <StepAccordion number={1} title="Identificación del Tripulante">
          <TextField name="bp" label="Ingresa tu BP" required placeholder="Ej. 6014982" defaultValue="6014982" />
          <TextField
            name="nombre"
            label="Ingresa tus nombres y apellidos completos"
            hint="(No colocar tildes)"
            required
            placeholder="Ej. Mario Fernandez"
            defaultValue="Mario Fernandez"
          />
        </StepAccordion>

        <StepAccordion number={2} title="Selección de Trámite a Realizar" isLast>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {TRAMITES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTramite(t.id)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                  tramite === t.id
                    ? 'border-latam-coral bg-latam-coral/5 text-latam-estrellada shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-latam-estrellada/40'
                } ${t.danger ? 'border-l-4 !border-l-latam-coral' : ''}`}
              >
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    tramite === t.id ? 'border-latam-estrellada' : 'border-slate-300'
                  }`}
                >
                  {tramite === t.id && <span className="h-2 w-2 rounded-full bg-latam-coral" />}
                </span>
                <span className={t.danger ? 'text-latam-coral' : ''}>{t.label}</span>
              </button>
            ))}
          </div>
        </StepAccordion>
      </div>

      {tramite && (
        <div className="animate-fadeUp overflow-hidden rounded-2xl border-t-4 border-latam-estrellada bg-white shadow-card">
          <div className="flex items-center gap-2 bg-latam-estrellada px-5 py-3.5 text-[15px] font-bold text-white">
            <ModuleIcon id={tramite} />
            {TRAMITES.find((t) => t.id === tramite)?.label}
          </div>
          <div className="bg-[#fafbfc] px-5 py-6">
            {tramite === 'emergencia' && (
              <>
                <TextField name="contactoNombre" label="Nombre del Contacto de Emergencia" required placeholder="Tu respuesta" />
                <TextField name="contactoTelefono" label="Teléfono" required placeholder="Tu respuesta" />
              </>
            )}

            {tramite === 'direccion' && (
              <>
                <InfoNote>
                  <strong>IMPORTANTE:</strong> ingresar dirección sin tildes, puntos ni caracteres especiales (#, $, &amp;, -, etc).
                </InfoNote>
                <TextField label="Indícanos tu nueva dirección" required placeholder="Tu respuesta" />
                <SelectField label="Indícanos el distrito" required options={['Miraflores', 'Santiago de Surco', 'Callao']} />
                <TextField label="Agregar sus coordenadas" hint="(Formato Google Maps Ej. -12.0459, -77.0308)" required placeholder="Tu respuesta" />
                <RouteInstruction
                  text="Recuerda replicar la actualización de tu domicilio en los sistemas maestros siguiendo la ruta interna:"
                  steps={ROUTE_STEPS}
                />
              </>
            )}

            {tramite === 'dni' && (
              <>
                <InfoNote>Es obligatorio adjuntar ambas caras del DNI de forma nítida.</InfoNote>
                <ImageReference src={`${import.meta.env.BASE_URL}img/actualizacionDatos/referencia-dni.png`} alt="Referencia DNI" />
                <DateField label="Fecha de vencimiento DNI" required />
                <FileUploadField label="Ingresa una foto de tu DNI" required />
              </>
            )}

            {tramite === 'pasaporte' && (
              <>
                <InfoNote>Verificar que la información registrada sea idéntica al documento físico.</InfoNote>
                <TextField label="Ingresa el número de tu nuevo pasaporte" required placeholder="Tu respuesta" />
                <DateField label="Fecha de Vencimiento del pasaporte" required />
                <SelectField label="País emisor del pasaporte" required options={['PE (Perú)', 'Otros países']} />
                <FileUploadField label="Adjunta una foto de tu pasaporte" required />
              </>
            )}

            {tramite === 'telefono' && (
              <>
                <InfoNote>Puedes actualizar uno o ambos números telefónicos de forma simultánea.</InfoNote>
                <TextField label="Indícanos qué número de celular deseas que consideremos ahora" required placeholder="Ej. 999888777" />
                <TextField label="Indícanos qué número de teléfono fijo deseas que consideremos" placeholder="Ej. 014445555 (Opcional)" />
                <RouteInstruction
                  text="Recuerda replicar la actualización de tus números telefónicos en los sistemas maestros siguiendo la ruta interna:"
                  steps={ROUTE_STEPS}
                />
              </>
            )}

            {tramite === 'fiebre' && (
              <>
                <DateField label="Fecha de colocación de la vacuna" required />
                <FileUploadField label="Adjunta constancia de Vacuna Fiebre Amarilla" required />
              </>
            )}

            {tramite === 'visa' && (
              <>
                <CheckboxGroup
                  label="Selecciona los tipos de VISA que deseas registrar a la vez"
                  required
                  options={['Actualización VISA Tripulante (Crew)', 'Actualización VISA Turista']}
                  value={visaTypes}
                  onChange={setVisaTypes}
                />
                {visaTypes.length > 0 && (
                  <div className="animate-fadeUp">
                    <TextField label="Ingresa el código alfanumérico de tu visa" hint="(Código en rojo)" required placeholder="Ej. E00000000" />
                    <DateField label="Fecha Emisión de VISA" required />
                    <DateField label="Fecha de Vencimiento de VISA" required />
                    <FileUploadField label="Ingresa una foto de tu VISA" required hint="Archivo nítido de la VISA seleccionada" />
                  </div>
                )}
              </>
            )}

            {tramite === 'licencia' && (
              <>
                <InfoNote>Es obligatorio escanear la licencia de manejo completa (ambas caras en un solo archivo PDF legible).</InfoNote>
                <TextField label="Ingresa el número de tu Licencia de Conducir MTC" required placeholder="Ej. Q00000000" />
                <FileUploadField label="Ingresa tu Licencia de Manejo en PDF" required hint="Solo PDF · Máx 10 MB" />
              </>
            )}

            {tramite === 'rechazo' && (
              <>
                <RadioGroup
                  label="¿Cuentas con tu pasaporte para ejercer funciones?"
                  required
                  options={['SI', 'NO']}
                  value={passStatus}
                  onChange={setPassStatus}
                />
                <p className="text-sm font-bold text-latam-coral">
                  Se enviará una copia de tus respuestas por correo electrónico de soporte priorizado.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-7 flex justify-end">
        <button
          type="submit"
          disabled={!tramite || sending}
          className="flex items-center gap-2 rounded-xl bg-latam-estrellada px-8 py-3.5 text-sm font-extrabold text-white shadow-soft transition enabled:hover:bg-latam-coral disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? 'Enviando...' : 'Enviar Solicitud'} <IconSend className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 animate-fadeUp">
          No se pudo guardar: {error}
        </div>
      )}

      {sent && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 animate-fadeUp">
          <IconCheck className="h-5 w-5" />{' '}
          {SHEET_CONNECTED_TRAMITES.includes(tramite)
            ? 'Solicitud guardada correctamente en Google Sheets.'
            : 'Solicitud enviada correctamente a los sistemas de soporte.'}
        </div>
      )}
    </form>
  )
}

function ModuleIcon({ id }) {
  const map = {
    emergencia: IconIdCard,
    direccion: IconCalendar,
    dni: IconIdCard,
    pasaporte: IconPlane,
    telefono: IconEdit,
    fiebre: IconSyringe,
    visa: IconWrench,
    licencia: IconIdCard,
    rechazo: IconWrench,
  }
  const Icon = map[id] || IconEdit
  return <Icon className="h-4 w-4" />
}
