import { useRef, useState } from 'react'
import StepAccordion from './StepAccordion.jsx'
import { TextField, MonthField, TextareaField, SelectField, AnticipationAlert } from './fields/FormFields.jsx'
import { IconCalendarCheck, IconRepeat, IconSend, IconCheck } from './icons.jsx'

// TODO: ajustar a las categorías reales de tripulación cuando se confirmen.
const CATEGORIAS = ['JSB - Jefe de Servicio a Bordo', 'TC - Tripulante de Cabina', 'Sobrecargo']

const TIPOS = [
  { id: 'adicionales', label: 'Solicitud de vacaciones adicionales', icon: IconCalendarCheck },
  { id: 'cambio', label: 'Solicitud de cambio de vacaciones con un compañero', icon: IconRepeat },
  { id: 'cesion', label: 'Solicitud de cesión de vacaciones', icon: IconSend },
]

const RULES = {
  adicionales:
    'Regla de Plazo y Cupo: Estas solicitudes están estrictamente sujetas a disponibilidad de cupos en el mes requerido. Se dará respuesta formal en el mes previo al goce de vacaciones con un plazo mínimo de 15 días de anticipación.',
  cambio:
    'Regla de Validación Doble: Para proceder con el intercambio de periodos, tanto tú como tu compañero deberán ingresar de forma individual su respectiva solicitud cruzada en este sitio. Tiempo de respuesta máximo: 10 días hábiles. Plazo Anticipación: Ingresar hasta el último día de 2 meses previos al mes deseado.',
  cesion:
    'Regla de Cesión Legal: Al igual que el intercambio, ambos colaboradores involucrados en el traspaso reglamentario del bloque de descanso deben registrar su formulario de forma independiente en un plazo no menor a 2 meses antes del goce.',
}

export default function VacacionesForm() {
  const formRef = useRef(null)
  const [tipo, setTipo] = useState(null)
  const [tipoStepOpen, setTipoStepOpen] = useState(false)
  const [invalidFields, setInvalidFields] = useState(new Set())
  const [sent, setSent] = useState(false)
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

  const submit = (e) => {
    e.preventDefault()
    setError('')

    const invalid = new Set()
    for (const el of e.currentTarget.elements) {
      if (el.name && typeof el.checkValidity === 'function' && !el.checkValidity()) {
        invalid.add(el.name)
      }
    }

    if (!tipo || invalid.size > 0) {
      setInvalidFields(invalid)
      setError(!tipo ? 'Completa los campos obligatorios: selecciona el tipo de solicitud.' : 'Revisa los campos marcados: son obligatorios.')
      return
    }

    // TODO: conectar a Google Sheets (mismo patrón que TramiteForm/submitTramite)
    // cuando se confirmen los encabezados reales de la hoja para este trámite.
    setInvalidFields(new Set())
    setSent(true)
    setTimeout(() => setSent(false), 3500)
  }

  const clearForm = () => {
    formRef.current?.reset()
    setTipo(null)
    setInvalidFields(new Set())
    setError('')
  }

  const activeTipo = TIPOS.find((t) => t.id === tipo)

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
        Revisa el detalle de cada tipo de solicitud: los plazos de anticipación varían según el caso.
      </AnticipationAlert>

      <div className="mt-6">
        <StepAccordion number={1} title="Datos de Identificación">
          <TextField
            name="correo"
            type="email"
            label="Correo electrónico"
            required
            placeholder="nombre.apellido@latam.com"
            invalid={invalidFields.has('correo')}
          />
          <TextField name="bp" label="Ingresa tu BP" required invalid={invalidFields.has('bp')} />
          <TextField name="nombre" label="Apellidos y nombres" required invalid={invalidFields.has('nombre')} />
          <SelectField name="categoria" label="Categoría" required options={CATEGORIAS} invalid={invalidFields.has('categoria')} />
        </StepAccordion>

        <StepAccordion number={2} title="Tipo de Solicitud" isLast open={tipoStepOpen} onToggle={setTipoStepOpen}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {TIPOS.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTipo(t.id)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                  tipo === t.id
                    ? 'border-latam-coral bg-latam-coral/5 text-latam-estrellada shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-latam-estrellada/40'
                }`}
              >
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    tipo === t.id ? 'border-latam-estrellada' : 'border-slate-300'
                  }`}
                >
                  {tipo === t.id && <span className="h-2 w-2 rounded-full bg-latam-coral" />}
                </span>
                {t.label}
              </button>
            ))}
          </div>
        </StepAccordion>
      </div>

      {activeTipo && tipoStepOpen && (
        <div className="animate-fadeUp overflow-hidden rounded-2xl border-t-4 border-latam-estrellada bg-white shadow-card">
          <div className="flex items-center gap-2 bg-latam-estrellada px-5 py-3.5 text-[15px] font-bold text-white">
            <activeTipo.icon className="h-4 w-4" />
            {activeTipo.label}
          </div>
          <div className="bg-[#fafbfc] px-5 py-6">
            <AnticipationAlert>{RULES[tipo]}</AnticipationAlert>
            <div className="mt-5">
              {tipo === 'adicionales' && (
                <>
                  <MonthField name="mesAdicionales" label="Mes Solicitado de Adicionales" required invalid={invalidFields.has('mesAdicionales')} />
                  <TextField
                    name="diasAdicionales"
                    type="number"
                    min="1"
                    label="Cantidad de Días Solicitados"
                    required
                    placeholder="Ej. 5"
                    invalid={invalidFields.has('diasAdicionales')}
                  />
                  <TextareaField name="sustento" label="Sustento de la Solicitud" hint="(Opcional)" placeholder="Cuéntanos el motivo de tu solicitud..." />
                </>
              )}

              {tipo === 'cambio' && (
                <>
                  <TextField
                    name="companeroBP"
                    label="BP del Compañero de Permuta"
                    required
                    invalid={invalidFields.has('companeroBP')}
                  />
                  <TextField
                    name="companeroNombre"
                    label="Nombres Completos del Compañero"
                    required
                    invalid={invalidFields.has('companeroNombre')}
                  />
                  <MonthField name="mesCambio" label="Mes Original del Cambio" required invalid={invalidFields.has('mesCambio')} />
                </>
              )}

              {tipo === 'cesion' && (
                <>
                  <TextField
                    name="beneficiarioBP"
                    label="BP del Colaborador Beneficiario"
                    required
                    invalid={invalidFields.has('beneficiarioBP')}
                  />
                  <TextField
                    name="beneficiarioNombre"
                    label="Nombres Completos del Beneficiario"
                    required
                    invalid={invalidFields.has('beneficiarioNombre')}
                  />
                  <TextField
                    name="bloqueDias"
                    label="Bloque de Días a Ceder"
                    hint="(Ej. 01/03/2026 al 15/03/2026)"
                    required
                    invalid={invalidFields.has('bloqueDias')}
                  />
                </>
              )}
            </div>
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
          disabled={!tipo}
          className="flex items-center justify-center gap-2 rounded-xl bg-latam-estrellada px-8 py-3 text-sm font-extrabold text-white shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:bg-latam-coral enabled:hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enviar Solicitud <IconSend className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 animate-fadeUp">{error}</div>
      )}

      {sent && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 animate-fadeUp">
          <IconCheck className="h-5 w-5" /> Solicitud enviada correctamente a los sistemas de soporte.
        </div>
      )}
    </form>
  )
}
