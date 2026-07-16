import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

// Trámites conectados a Google Sheets. "licencia" queda afuera: su única
// columna relevante en el Sheet es de archivo (ver Code.gs).
const SHEET_CONNECTED_TRAMITES = ['emergencia', 'direccion', 'dni', 'pasaporte', 'telefono', 'fiebre', 'rechazo', 'visa']

// Cada tipo de VISA marcado en el checkbox tiene su propio bloque de campos
// (código/fechas), porque el Sheet tiene columnas separadas para cada uno.
const VISA_TYPE_FIELDS = {
  'Actualización VISA Tripulante (Crew)': { prefix: 'visaTripulante', label: 'VISA Tripulante' },
  'Actualización VISA Turista': { prefix: 'visaTurista', label: 'VISA Turista' },
}

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
  const formRef = useRef(null)
  const [searchParams] = useSearchParams()
  const [tramite, setTramite] = useState(() => {
    const fromUrl = searchParams.get('tramite')
    return TRAMITES.some((t) => t.id === fromUrl) ? fromUrl : null
  })
  const [visaTypes, setVisaTypes] = useState([])
  const [passStatus, setPassStatus] = useState('')
  const [invalidFields, setInvalidFields] = useState(new Set())
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const clearInvalid = (e) => {
    const name = e.target.name
    if (name && invalidFields.has(name)) {
      setInvalidFields((prev) => {
        const next = new Set(prev)
        next.delete(name)
        return next
      })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    const invalid = new Set()
    for (const el of e.currentTarget.elements) {
      if (el.name && typeof el.checkValidity === 'function' && !el.checkValidity()) {
        invalid.add(el.name)
      }
    }

    // RadioGroup/CheckboxGroup son botones, no inputs nativos, así que el
    // navegador no los valida solo — se revisan a mano.
    let customError = ''
    if (tramite === 'rechazo' && !passStatus) {
      customError = 'Completa los campos obligatorios: selecciona si cuentas con tu pasaporte.'
    }
    if (tramite === 'visa' && visaTypes.length === 0) {
      customError = 'Completa los campos obligatorios: selecciona al menos un tipo de VISA.'
    }

    if (invalid.size > 0 || customError) {
      setInvalidFields(invalid)
      setError(customError || 'Revisa los campos marcados: son obligatorios.')
      return
    }

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
        direccion: formData.get('direccion'),
        distrito: formData.get('distrito'),
        coordenadas: formData.get('coordenadas'),
        dniVencimiento: formData.get('dniVencimiento'),
        pasaporteNumero: formData.get('pasaporteNumero'),
        pasaporteVencimiento: formData.get('pasaporteVencimiento'),
        pasaportePais: formData.get('pasaportePais'),
        celular: formData.get('celular'),
        telefonoFijo: formData.get('telefonoFijo'),
        fiebreFecha: formData.get('fiebreFecha'),
        rechazoPasaporte: tramite === 'rechazo' ? passStatus : undefined,
        visaTripulanteCodigo: formData.get('visaTripulanteCodigo'),
        visaTripulanteEmision: formData.get('visaTripulanteEmision'),
        visaTripulanteVencimiento: formData.get('visaTripulanteVencimiento'),
        visaTuristaCodigo: formData.get('visaTuristaCodigo'),
        visaTuristaEmision: formData.get('visaTuristaEmision'),
        visaTuristaVencimiento: formData.get('visaTuristaVencimiento'),
      })
      setSent(true)
      setTimeout(() => setSent(false), 3500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const clearForm = () => {
    formRef.current?.reset()
    setVisaTypes([])
    setPassStatus('')
    setInvalidFields(new Set())
    setError('')
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={submit}
      onInput={clearInvalid}
      onChange={clearInvalid}
      className="mx-auto max-w-3xl animate-fadeUp"
    >
      <AnticipationAlert>
        Ingresar solicitud con <strong>4 días hábiles de anticipación</strong> para su correcto procesamiento.
      </AnticipationAlert>

      <div className="mt-6">
        <StepAccordion number={1} title="Identificación del Tripulante">
          <TextField name="bp" label="Ingresa tu BP" required placeholder="Ej. 6014982" invalid={invalidFields.has('bp')} />
          <TextField
            name="nombre"
            label="Ingresa tus nombres y apellidos completos"
            hint="(No colocar tildes)"
            required
            placeholder="Ej. Mario Fernandez"
            invalid={invalidFields.has('nombre')}
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
                <TextField
                  name="contactoNombre"
                  label="Nombre del Contacto de Emergencia"
                  required
                  placeholder="Tu respuesta"
                  invalid={invalidFields.has('contactoNombre')}
                />
                <TextField
                  name="contactoTelefono"
                  label="Teléfono"
                  required
                  placeholder="Tu respuesta"
                  invalid={invalidFields.has('contactoTelefono')}
                />
              </>
            )}

            {tramite === 'direccion' && (
              <>
                <InfoNote>
                  <strong>IMPORTANTE:</strong> ingresar dirección sin tildes, puntos ni caracteres especiales (#, $, &amp;, -, etc).
                </InfoNote>
                <TextField
                  name="direccion"
                  label="Indícanos tu nueva dirección"
                  required
                  placeholder="Tu respuesta"
                  invalid={invalidFields.has('direccion')}
                />
                <SelectField
                  name="distrito"
                  label="Indícanos el distrito"
                  required
                  options={['Miraflores', 'Santiago de Surco', 'Callao']}
                  invalid={invalidFields.has('distrito')}
                />
                <TextField
                  name="coordenadas"
                  label="Agregar sus coordenadas"
                  hint="(Formato Google Maps Ej. -12.0459, -77.0308)"
                  required
                  placeholder="Tu respuesta"
                  invalid={invalidFields.has('coordenadas')}
                />
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
                <DateField name="dniVencimiento" label="Fecha de vencimiento DNI" required invalid={invalidFields.has('dniVencimiento')} />
                <FileUploadField name="dniArchivo" label="Ingresa una foto de tu DNI" required invalid={invalidFields.has('dniArchivo')} />
              </>
            )}

            {tramite === 'pasaporte' && (
              <>
                <InfoNote>Verificar que la información registrada sea idéntica al documento físico.</InfoNote>
                <TextField
                  name="pasaporteNumero"
                  label="Ingresa el número de tu nuevo pasaporte"
                  required
                  placeholder="Tu respuesta"
                  invalid={invalidFields.has('pasaporteNumero')}
                />
                <DateField
                  name="pasaporteVencimiento"
                  label="Fecha de Vencimiento del pasaporte"
                  required
                  invalid={invalidFields.has('pasaporteVencimiento')}
                />
                <SelectField
                  name="pasaportePais"
                  label="País emisor del pasaporte"
                  required
                  options={['PE (Perú)', 'Otros países']}
                  invalid={invalidFields.has('pasaportePais')}
                />
                <FileUploadField
                  name="pasaporteArchivo"
                  label="Adjunta una foto de tu pasaporte"
                  required
                  invalid={invalidFields.has('pasaporteArchivo')}
                />
              </>
            )}

            {tramite === 'telefono' && (
              <>
                <InfoNote>Puedes actualizar uno o ambos números telefónicos de forma simultánea.</InfoNote>
                <TextField
                  name="celular"
                  label="Indícanos qué número de celular deseas que consideremos ahora"
                  required
                  placeholder="Ej. 999888777"
                  invalid={invalidFields.has('celular')}
                />
                <TextField
                  name="telefonoFijo"
                  label="Indícanos qué número de teléfono fijo deseas que consideremos"
                  placeholder="Ej. 014445555 (Opcional)"
                  invalid={invalidFields.has('telefonoFijo')}
                />
                <RouteInstruction
                  text="Recuerda replicar la actualización de tus números telefónicos en los sistemas maestros siguiendo la ruta interna:"
                  steps={ROUTE_STEPS}
                />
              </>
            )}

            {tramite === 'fiebre' && (
              <>
                <DateField name="fiebreFecha" label="Fecha de colocación de la vacuna" required invalid={invalidFields.has('fiebreFecha')} />
                <FileUploadField
                  name="fiebreArchivo"
                  label="Adjunta constancia de Vacuna Fiebre Amarilla"
                  required
                  invalid={invalidFields.has('fiebreArchivo')}
                />
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
                {visaTypes.map((type) => {
                  const cfg = VISA_TYPE_FIELDS[type]
                  if (!cfg) return null
                  return (
                    <div key={type} className="animate-fadeUp mb-5 rounded-xl border border-slate-200 bg-white p-4">
                      <p className="mb-3 text-sm font-extrabold uppercase tracking-wide text-latam-estrellada">{cfg.label}</p>
                      <TextField
                        name={`${cfg.prefix}Codigo`}
                        label="Ingresa el código alfanumérico de tu visa"
                        hint="(Código en rojo)"
                        required
                        placeholder="Ej. E00000000"
                        invalid={invalidFields.has(`${cfg.prefix}Codigo`)}
                      />
                      <DateField
                        name={`${cfg.prefix}Emision`}
                        label="Fecha Emisión de VISA"
                        required
                        invalid={invalidFields.has(`${cfg.prefix}Emision`)}
                      />
                      <DateField
                        name={`${cfg.prefix}Vencimiento`}
                        label="Fecha de Vencimiento de VISA"
                        required
                        invalid={invalidFields.has(`${cfg.prefix}Vencimiento`)}
                      />
                      <FileUploadField
                        name={`${cfg.prefix}Archivo`}
                        label="Ingresa una foto de tu VISA"
                        required
                        hint="Archivo nítido de la VISA seleccionada"
                        invalid={invalidFields.has(`${cfg.prefix}Archivo`)}
                      />
                    </div>
                  )
                })}
              </>
            )}

            {tramite === 'licencia' && (
              <>
                <InfoNote>Es obligatorio escanear la licencia de manejo completa (ambas caras en un solo archivo PDF legible).</InfoNote>
                <TextField
                  name="licenciaNumero"
                  label="Ingresa el número de tu Licencia de Conducir MTC"
                  required
                  placeholder="Ej. Q00000000"
                  invalid={invalidFields.has('licenciaNumero')}
                />
                <FileUploadField
                  name="licenciaArchivo"
                  label="Ingresa tu Licencia de Manejo en PDF"
                  required
                  hint="Solo PDF · Máx 10 MB"
                  accept=".pdf"
                  invalid={invalidFields.has('licenciaArchivo')}
                />
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

      <div className="mt-7 flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={clearForm}
          className="rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-600 transition hover:-translate-y-0.5 hover:border-latam-estrellada hover:text-latam-estrellada"
        >
          Borrar formulario
        </button>
        <button
          type="submit"
          disabled={!tramite || sending}
          className="flex items-center justify-center gap-2 rounded-xl bg-latam-estrellada px-8 py-3 text-sm font-extrabold text-white shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:bg-latam-coral enabled:hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? 'Enviando...' : 'Enviar Solicitud'} <IconSend className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 animate-fadeUp">{error}</div>
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
