import { useRef, useState } from 'react'
import StepAccordion from './StepAccordion.jsx'
import { TextField, TextareaField, RadioGroup, FileUploadField } from './fields/FormFields.jsx'
import { IconShirt, IconIdCard, IconShieldCheck, IconArrowUpRight, IconSend, IconCheck } from './icons.jsx'

// TODO: reemplazar con la URL real de la Plataforma Armario Latam.
const ARMARIO_URL = '#'

const CANALES = [
  {
    id: 'armario',
    label: 'Plataforma Armario Latam (Click aquí)',
    icon: IconShirt,
    external: true,
  },
  {
    id: 'lanyard',
    label: 'Solicitud de lanyard por daño o pérdida',
    icon: IconIdCard,
  },
  {
    id: 'calidad',
    label: 'Formulario para cambio de uniforme por problemas de calidad',
    icon: IconShieldCheck,
  },
]

export default function UniformesView() {
  const formRef = useRef(null)
  const [canal, setCanal] = useState(null)
  const [canalStepOpen, setCanalStepOpen] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [base, setBase] = useState('')
  const [calidadTipo, setCalidadTipo] = useState('')
  const [invalidFields, setInvalidFields] = useState(new Set())
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const selectCanal = (c) => {
    if (c.external) {
      window.open(ARMARIO_URL, '_blank', 'noopener,noreferrer')
      return
    }
    setCanal(c.id)
    setInvalidFields(new Set())
    setError('')
  }

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

    let customError = ''
    if (canal === 'lanyard' && (!motivo || !base)) {
      customError = 'Completa los campos obligatorios: selecciona el motivo y la base.'
    }
    if (canal === 'calidad' && !calidadTipo) {
      customError = 'Completa los campos obligatorios: selecciona el tipo de solicitud por calidad.'
    }

    if (invalid.size > 0 || customError) {
      setInvalidFields(invalid)
      setError(customError || 'Revisa los campos marcados: son obligatorios.')
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

  const clearForm = () => {
    formRef.current?.reset()
    setCanal(null)
    setMotivo('')
    setBase('')
    setCalidadTipo('')
    setInvalidFields(new Set())
    setError('')
  }

  const activeCanal = CANALES.find((c) => c.id === canal)

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={submit}
      onInput={clearInvalid}
      onChange={clearInvalid}
      className="mx-auto max-w-3xl animate-fadeUp"
    >
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Gestiona de manera prioritaria el abastecimiento, reemplazo de lanyards o reporte de prendas debido a
        contingencias operacionales o problemas de calidad en fábrica.
      </p>

      <div className="mt-6">
        <StepAccordion number={1} title="Identificación del Colaborador">
          <TextField
            name="correo"
            type="email"
            label="Correo electrónico Corporativo"
            required
            placeholder="nombre.apellido@latam.com"
            invalid={invalidFields.has('correo')}
          />
          <TextField
            name="nombreColaborador"
            label="Nombre y Apellidos"
            required
            invalid={invalidFields.has('nombreColaborador')}
          />
        </StepAccordion>

        <StepAccordion
          number={2}
          title="Selecciona el canal o requerimiento de uniformes"
          isLast
          open={canalStepOpen}
          onToggle={setCanalStepOpen}
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {CANALES.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => selectCanal(c)}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition hover:-translate-y-0.5 ${
                  canal === c.id
                    ? 'border-latam-coral bg-latam-coral/5 text-latam-estrellada shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-latam-estrellada/40'
                }`}
              >
                <c.icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${canal === c.id ? 'text-latam-coral' : 'text-slate-400'}`} />
                <span>{c.label}</span>
                {c.external && <IconArrowUpRight className="ml-auto h-4 w-4 flex-shrink-0 text-slate-400" />}
              </button>
            ))}
          </div>
        </StepAccordion>
      </div>

      {activeCanal && canalStepOpen && (
        <div className="animate-fadeUp overflow-hidden rounded-2xl border-t-4 border-latam-estrellada bg-white shadow-card">
          <div className="flex items-center gap-2 bg-latam-estrellada px-5 py-3.5 text-[15px] font-bold text-white">
            <activeCanal.icon className="h-4 w-4" />
            {canal === 'lanyard' ? 'Solicitud de Lanyards Región Andina' : 'Formulario de Reclamos de Calidad de Prendas LP'}
          </div>
          <div className="bg-[#fafbfc] px-5 py-6">
            {canal === 'lanyard' && (
              <>
                <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                  <TextField
                    name="lanyardBP"
                    label="Ingresar BP"
                    required
                    invalid={invalidFields.has('lanyardBP')}
                  />
                  <TextField
                    name="lanyardNombre"
                    label="Nombre Completo"
                    required
                    invalid={invalidFields.has('lanyardNombre')}
                  />
                </div>
                <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                  <RadioGroup label="Motivo" required options={['Rotura', 'Desgaste', 'Pérdida']} value={motivo} onChange={setMotivo} />
                  <RadioGroup label="Base" required options={['LP', 'XL', '4C']} value={base} onChange={setBase} />
                </div>
              </>
            )}

            {canal === 'calidad' && (
              <>
                <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                  <TextField name="calidadBP" label="BP" required invalid={invalidFields.has('calidadBP')} />
                  <TextField
                    name="calidadNombre"
                    label="Nombre"
                    required
                    invalid={invalidFields.has('calidadNombre')}
                  />
                </div>
                <RadioGroup
                  label="Descripción de solicitud por calidad"
                  required
                  options={['Error de talla (si es una talla más no aplica cambio)', 'Mala calidad (escribir en detalles fecha estimada en que recibió prenda o artículo)']}
                  value={calidadTipo}
                  onChange={setCalidadTipo}
                />
                <TextareaField
                  name="calidadDetalle"
                  label="Detallar cuál fue el error en la talla o el problema por la mala calidad"
                  required
                  placeholder="Escribe tu respuesta detallada aquí..."
                  invalid={invalidFields.has('calidadDetalle')}
                />
                <FileUploadField
                  name="calidadArchivo"
                  label="Subir foto de prenda o artículo con etiqueta"
                  hint="(es necesario para identificar qué proveedor es) · Formatos válidos: JPG, PNG, PDF · Máx 10 MB"
                  accept=".jpg,.jpeg,.png,.pdf"
                  maxSizeMB={10}
                  required
                  invalid={invalidFields.has('calidadArchivo')}
                />
              </>
            )}
          </div>
        </div>
      )}

      {activeCanal && (
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
            disabled={sending}
            className={`flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-extrabold text-white shadow-soft transition disabled:cursor-not-allowed disabled:opacity-50 ${
              canal === 'calidad'
                ? 'bg-latam-coral enabled:hover:-translate-y-0.5 enabled:hover:bg-latam-estrellada enabled:hover:shadow-card'
                : 'bg-latam-estrellada enabled:hover:-translate-y-0.5 enabled:hover:bg-latam-coral enabled:hover:shadow-card'
            }`}
          >
            {sending ? 'Enviando...' : canal === 'lanyard' ? 'Enviar Solicitud de Lanyard' : 'Enviar Reporte de Calidad'}
            <IconSend className="h-4 w-4" />
          </button>
        </div>
      )}

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
