import { useRef, useState } from 'react'
import StepAccordion from './StepAccordion.jsx'
import {
  TextField, DateField, MonthField, TimeField, TextareaField, SelectField, WarningNote,
} from './fields/FormFields.jsx'
import {
  IconClock, IconCalendarCheck, IconPlane, IconIdCard, IconSparkle, IconSend, IconCheck,
} from './icons.jsx'

const MESES_ROL = [
  'Agosto 2026 (Dentro de plazo reglamentario)',
  'Septiembre 2026 (Dentro de plazo reglamentario)',
  'Julio 2026 (FUERA DE PLAZO - Solicitud Rechazada)',
]

const DOCUMENTOS_TECNICOS = ['Gestión Visa Crew y/o Turista', 'Gestión Pasaporte']

const PERMISOS_ESPECIALES = [
  'Permiso por matrimonio',
  'Permiso por mudanza',
  'Permiso por paternidad',
  'Permiso por boda de familiar directo',
]

const NOVEDADES = [
  { id: 'afectacion', label: 'Libre compensado por afectación (> 06:00 hrs)' },
  { id: 'adicionales', label: 'Libre compensado por vuelos adicionales' },
  { id: 'jefatura', label: 'Libre aprobado por jefatura directa' },
  { id: 'documentacion', label: 'Trámites de Documentación Técnica (Visa/Pasaporte)' },
  { id: 'permisos', label: 'Solicitud de Permisos Especiales' },
]

const PANEL_META = {
  afectacion: {
    title: 'Libre compensado por afectación de día libre > 06:00 hrs',
    icon: IconCalendarCheck,
    borderClass: 'border-latam-estrellada',
    bgClass: 'bg-latam-estrellada',
  },
  adicionales: {
    title: 'Libre compensado por asignación de vuelos adicionales',
    icon: IconPlane,
    borderClass: 'border-latam-estrellada',
    bgClass: 'bg-latam-estrellada',
  },
  jefatura: {
    title: 'Libre aprobado por jefatura directa',
    icon: IconCalendarCheck,
    borderClass: 'border-latam-estrellada',
    bgClass: 'bg-latam-estrellada',
  },
  documentacion: {
    title: 'Trámites de Documentación Técnica',
    icon: IconIdCard,
    borderClass: 'border-latam-estrellada',
    bgClass: 'bg-latam-estrellada',
  },
  permisos: {
    title: 'Formulario Unificado: Permisos Especiales',
    icon: IconSparkle,
    borderClass: 'border-latam-coral',
    bgClass: 'bg-latam-coral',
  },
}

export default function SolicitudMesSubsiguienteView() {
  const formRef = useRef(null)
  const [novedad, setNovedad] = useState(null)
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

    if (!novedad || invalid.size > 0) {
      setInvalidFields(invalid)
      setError(!novedad ? 'Selecciona la novedad o excepción que deseas reportar.' : 'Revisa los campos marcados: son obligatorios.')
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
    setNovedad(null)
    setInvalidFields(new Set())
    setFormValid(false)
    setError('')
  }

  const meta = novedad ? PANEL_META[novedad] : null

  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Este portal te permite postular de forma anticipada tus requerimientos, restricciones y preferencias
        operacionales para la conformación del rol de vuelos.
      </p>

      <div className="mb-6 rounded-2xl border-l-4 border-latam-estrellada bg-latam-estrellada/5 p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-latam-estrellada">
          <IconClock className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-extrabold uppercase tracking-wide">Plazo Máximo Improrrogable:</p>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Las solicitudes deben ingresarse con <strong className="text-slate-800">un mínimo de 2 meses de anticipación</strong>.
          Por ejemplo, si requieres una solicitud para el rol de <strong className="text-slate-800">julio</strong>, la
          fecha límite máxima de ingreso en el sistema es el <strong className="text-slate-800">31 de mayo</strong>.
        </p>
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-700 sm:text-sm">
          <IconClock className="mt-0.5 h-4 w-4 flex-shrink-0" />
          Por favor, tomar en cuenta el empalme en las solicitudes para evitar impacto en las actividades ya
          programadas por rol.
        </p>
      </div>

      <form ref={formRef} noValidate onSubmit={submit} onInput={syncState} onChange={syncState}>
        <StepAccordion number={1} title="Identificación del Tripulante">
          <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <TextField name="bp" label="Ingresa tu BP" required placeholder="Ej. 6014982" invalid={invalidFields.has('bp')} />
            <TextField
              name="nombre"
              label="Apellidos y Nombres"
              required
              placeholder="Ej. Mario Fernandez"
              invalid={invalidFields.has('nombre')}
            />
            <div className="sm:col-span-2">
              <SelectField
                name="mesRol"
                label="Selecciona el Mes del Rol a Postular"
                required
                options={MESES_ROL}
                invalid={invalidFields.has('mesRol')}
              />
            </div>
          </div>
        </StepAccordion>

        <StepAccordion number={2} title="Selecciona la novedad o excepción que deseas reportar" isLast>
          <div className="grid grid-cols-1 gap-3 p-1 md:grid-cols-2 lg:grid-cols-3">
            {NOVEDADES.map((n) => (
              <button
                type="button"
                key={n.id}
                onClick={() => setNovedad(n.id)}
                className={`flex min-h-[64px] items-center gap-3 rounded-xl border bg-white p-4 text-left text-sm font-bold transition ${
                  novedad === n.id
                    ? 'border-latam-coral bg-latam-coral/5 text-latam-estrellada shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:border-latam-estrellada/40'
                }`}
              >
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    novedad === n.id ? 'border-latam-estrellada' : 'border-slate-300'
                  }`}
                >
                  {novedad === n.id && <span className="h-2 w-2 rounded-full bg-latam-coral" />}
                </span>
                {n.label}
              </button>
            ))}
          </div>

          {meta && (
            <div className={`mt-5 animate-fadeUp overflow-hidden rounded-2xl border-t-4 bg-white shadow-card ${meta.borderClass}`}>
              <div className={`flex items-center gap-2 px-5 py-3.5 text-[15px] font-bold text-white ${meta.bgClass}`}>
                <meta.icon className="h-4 w-4 flex-shrink-0" /> {meta.title}
              </div>
              <div className="bg-[#fafbfc] px-5 py-6">
                {novedad === 'afectacion' && (
                  <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                    <DateField name="fechaAfectacion" label="Fecha de afectación de libre" required invalid={invalidFields.has('fechaAfectacion')} />
                    <TextField name="numVuelo1" label="Número de vuelo" required placeholder="Ej. LA2456" invalid={invalidFields.has('numVuelo1')} />
                    <TextField name="ruta1" label="Ruta" required placeholder="Ej. LIM - MIA" invalid={invalidFields.has('ruta1')} />
                    <TimeField name="horaLlegada1" label="Hora de llegada de vuelo" required invalid={invalidFields.has('horaLlegada1')} />
                    <div className="sm:col-span-2">
                      <TextareaField name="comentario1" label="Comentario adicional" required invalid={invalidFields.has('comentario1')} />
                    </div>
                  </div>
                )}

                {novedad === 'adicionales' && (
                  <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                    <DateField
                      name="fechaVuelosAdicionales"
                      label="Fecha de afectación de vuelos adicionales"
                      required
                      invalid={invalidFields.has('fechaVuelosAdicionales')}
                    />
                    <TextField name="numVuelo2" label="Número de vuelo" required placeholder="Ej. LA2456" invalid={invalidFields.has('numVuelo2')} />
                    <TextField name="ruta2" label="Ruta" required placeholder="Ej. LIM - MIA" invalid={invalidFields.has('ruta2')} />
                    <MonthField
                      name="mesLibreDeseado"
                      label="Fecha que deseo mi libre (mes subsiguiente)"
                      required
                      invalid={invalidFields.has('mesLibreDeseado')}
                    />
                    <div className="sm:col-span-2">
                      <TextareaField name="comentario2" label="Comentario adicional" required invalid={invalidFields.has('comentario2')} />
                    </div>
                  </div>
                )}

                {novedad === 'jefatura' && (
                  <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                    <DateField name="fechaLibreJefatura" label="Fecha de libre" required invalid={invalidFields.has('fechaLibreJefatura')} />
                    <div className="sm:col-span-2">
                      <TextareaField
                        name="motivoJefatura"
                        label="Motivo de la otorgación del libre"
                        required
                        invalid={invalidFields.has('motivoJefatura')}
                      />
                    </div>
                  </div>
                )}

                {novedad === 'documentacion' && (
                  <>
                    <div className="mb-5 rounded-xl border border-latam-coral/25 bg-latam-coral/5 p-4 text-sm leading-relaxed text-slate-600">
                      <strong className="text-latam-coral">Recordatorio de Restricción Operativa:</strong> No se
                      aceptan citas en fechas de empalme (del 01 al 05 de cada mes). Se realizará la debida
                      protección de Rol en el mes que coloque su fecha de cita desde el día 06.
                    </div>
                    <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <SelectField
                          name="documentoTecnico"
                          label="Selecciona el documento técnico a tramitar"
                          required
                          options={DOCUMENTOS_TECNICOS}
                          invalid={invalidFields.has('documentoTecnico')}
                        />
                      </div>
                      <DateField name="fechaCita" label="Fecha de la cita" required invalid={invalidFields.has('fechaCita')} />
                      <TimeField name="horaCita" label="Hora de la cita" required invalid={invalidFields.has('horaCita')} />
                      <div className="sm:col-span-2">
                        <TextareaField name="comentario4" label="Comentario adicional" invalid={invalidFields.has('comentario4')} />
                      </div>
                    </div>
                  </>
                )}

                {novedad === 'permisos' && (
                  <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <SelectField
                        name="tipoPermiso"
                        label="Selecciona el tipo de permiso legal que requieres solicitar"
                        required
                        options={PERMISOS_ESPECIALES}
                        invalid={invalidFields.has('tipoPermiso')}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <WarningNote>
                        Recuerda que la fecha de matrimonio debe estar incluida dentro de los 5 días solicitados.
                      </WarningNote>
                    </div>
                    <DateField name="fechaInicioPermiso" label="Fecha de inicio" required invalid={invalidFields.has('fechaInicioPermiso')} />
                    <DateField name="fechaFinPermiso" label="Fecha de fin" required invalid={invalidFields.has('fechaFinPermiso')} />
                  </div>
                )}
              </div>
            </div>
          )}
        </StepAccordion>

        <div className="mt-2 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={cancel}
            className="w-full rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-600 transition hover:-translate-y-0.5 hover:border-latam-estrellada hover:text-latam-estrellada sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!formValid || !novedad || sending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-latam-estrellada px-8 py-3 text-sm font-extrabold text-white shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:bg-latam-coral enabled:hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {sending ? 'Enviando...' : 'Enviar Requerimiento a Roles'} <IconSend className="h-4 w-4" />
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 animate-fadeUp">{error}</div>
      )}

      {sent && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 animate-fadeUp">
          <IconCheck className="h-5 w-5" /> Requerimiento enviado correctamente a los sistemas de Roles.
        </div>
      )}
    </div>
  )
}
