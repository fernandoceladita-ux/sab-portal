import { useRef, useState } from 'react'
import StepAccordion from './StepAccordion.jsx'
import { TextField, SelectField, FileUploadField } from './fields/FormFields.jsx'
import {
  IconAlertTriangle, IconDollar, IconCheck, IconSparkle, IconArrowUpRight, IconDownload,
  IconChevronDown, IconEdit, IconSend,
} from './icons.jsx'

const DISTRITOS = ['Miraflores', 'Santiago de Surco', 'Callao']

const TIPOS = [
  'Actualización Contacto Emergencia',
  'Actualización Dirección',
  'Actualización DNI',
  'Actualización Licencia peruana',
]

const COORD_STEPS = [
  'Abre la aplicación Google Maps.',
  'En la barra de búsqueda, escribe tu dirección o mueve el mapa hasta el lugar exacto.',
  'Mantén presionado el punto en el mapa (tu nuevo domicilio).',
  'Aparecerá un pin rojo. En la parte inferior, desliza la tarjeta de información hacia arriba.',
  'Verás los números de latitud y longitud. Tócalos para que se copien automáticamente y pégalos en la casilla superior.',
]

function TipCallout({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3 rounded-r-lg border-l-4 border-latam-diavivo bg-latam-diavivo/5 px-4 py-3 text-sm text-latam-estrellada">
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function CoordsGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-latam-estrellada transition hover:bg-slate-50"
      >
        Paso a paso para encontrar tus coordenadas desde el celular
        <IconChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <ol className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4">
            {COORD_STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-latam-coral/10 text-[11px] font-extrabold text-latam-coral">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default function DomicilioDgacView() {
  const formRef = useRef(null)
  const [tipo, setTipo] = useState('Actualización Dirección')
  const [invalidFields, setInvalidFields] = useState(new Set())
  const [sending, setSending] = useState(false)
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
    setTipo('Actualización Dirección')
    setInvalidFields(new Set())
    setError('')
  }

  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <div className="mb-6 flex items-start gap-3 p-5 text-slate-600">
        <p className="text-sm leading-relaxed">
          <strong className="font-extrabold uppercase tracking-wide text-latam-coral">Cumplimiento Regulatorio Obligatorio:</strong>{' '}
          Según la normativa, el titular de una licencia que cambia su domicilio legal no podrá ejercer los
          privilegios de vuelo pasados los treinta (30) días calendario de realizado el cambio, salvo que lo haya
          notificado por escrito formal ante la DGAC. ¡Evitemos penalidades y observaciones operacionales en
          auditorías!
        </p>
      </div>

      <StepAccordion number={1} title="Tasa de Pago en Págalo.pe">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-latam-diavivo/10 px-3 py-1 text-xs font-extrabold text-latam-diavivo">
          <IconDollar className="h-3.5 w-3.5" /> Costo del derecho: S/ 45.90
        </span>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Ingresa al portal virtual del Banco de la Nación. Busca y selecciona minuciosamente el{' '}
          <strong className="text-slate-800">Código 00224</strong> para efectuar el abono correspondiente. Descarga
          la constancia en formato PDF.
        </p>
        <TipCallout icon={IconCheck}>
          <strong>¿Listo para realizar el abono?</strong> Guarda el comprobante digital; lo necesitarás para
          adjuntarlo en el expediente físico.
        </TipCallout>
        <a
          href="https://www.pagalo.pe/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-latam-estrellada px-6 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-latam-coral hover:shadow-card"
        >
          Ir a Pagalo.pe <IconArrowUpRight className="h-4 w-4" />
        </a>
      </StepAccordion>

      <StepAccordion number={2} title="Completar el Formulario Oficial F-001-12">
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Descarga la solicitud oficial provista por la Dirección General de Aeronáutica Civil (DGAC). Rellena los
          campos con tus datos personales de forma clara.
        </p>
        <p className="mb-4 text-xs font-semibold text-latam-coral">
          Directiva de Llenado Obligatoria: Es indispensable marcar la casilla de "Duplicado de Licencia
          Aeronáutica" e indicar explícitamente dentro de la descripción el motivo: "Actualización de dirección".
        </p>
        <a
          href={`${import.meta.env.BASE_URL}docs/formulario-dgac-001-12.pdf`}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-latam-estrellada px-6 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-latam-coral hover:shadow-card"
        >
          <IconDownload className="h-4 w-4" /> Descargar Formulario
        </a>
      </StepAccordion>

      <StepAccordion number={3} title="Copia de DNI con Nueva Dirección">
        <p className="text-sm leading-relaxed text-slate-600">
          Prepara una copia clara y legible de tu Documento Nacional de Identidad (DNI). Para que la DGAC procese el
          trámite de forma conforme, es requisito indispensable que el nuevo domicilio ya figure impreso en el DNI.
        </p>
      </StepAccordion>

      <StepAccordion number={4} title="Presentación Física en Mesa de Partes" isLast>
        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          Lleva personalmente el expediente completo a las oficinas centrales de la DGAC (Mesa de Partes):
        </p>
        <ul className="mb-4 flex flex-col gap-1.5">
          {['Formulario 001 debidamente firmado y completado.', 'Voucher original de pago del Banco de la Nación.', 'Copia legible de tu DNI actualizado.'].map(
            (t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-latam-coral" />
                {t}
              </li>
            ),
          )}
        </ul>
        <TipCallout icon={IconSparkle}>
          <strong>Recomendación Operativa:</strong> Lleva un juego de copias adicional para que actúe como tu "Cargo
          de Entrega" sellado, sirviendo para el control y seguimiento regular de tu trámite.
        </TipCallout>
      </StepAccordion>

      <p className="mb-5 text-sm leading-relaxed text-slate-600">
          Una vez que la DGAC te haga entrega formal de tu nueva licencia física corregida, debes reportarlo de
          inmediato en los sistemas de la aerolínea completando la siguiente ficha digital:
        </p>

        <div className="overflow-hidden rounded-2xl border-t-4 border-latam-estrellada bg-white shadow-card">
          <div className="flex items-center gap-2 bg-latam-estrellada px-5 py-3.5 text-[15px] font-bold text-white">
            <IconEdit className="h-4 w-4" /> Formulario Digital
          </div>

          <form ref={formRef} noValidate onSubmit={submit} onInput={clearInvalid} onChange={clearInvalid} className="bg-[#fafbfc] px-5 py-6">
            <TextField
              name="bp"
              label="Ingresa tu BP"
              hint="(Código de empleado de 7 dígitos sin tildes)"
              required
              placeholder="Ej. 6014982"
              invalid={invalidFields.has('bp')}
            />
            <TextField
              name="nombre"
              label="Ingresa tus nombres y apellidos completos"
              hint="(Evitar colocar tildes)"
              required
              placeholder="Ej. Mario Fernandez"
              invalid={invalidFields.has('nombre')}
            />

            <div className="mb-5">
              <label className="mb-2 block text-sm font-bold text-latam-estrellada">
                Selecciona qué actualización deseas realizar <span className="text-latam-coral">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                {TIPOS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTipo(t)}
                    className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm font-bold transition ${
                      tipo === t
                        ? 'border-latam-coral bg-latam-coral/5 text-latam-estrellada shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-latam-estrellada/40'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        tipo === t ? 'border-latam-estrellada' : 'border-slate-300'
                      }`}
                    >
                      {tipo === t && <span className="h-2 w-2 rounded-full bg-latam-coral" />}
                    </span>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {tipo === 'Actualización Dirección' && (
              <div className="animate-fadeUp">
                <TextField
                  name="direccion"
                  label="Indícanos tu nueva dirección"
                  required
                  placeholder="Calle, Avenida, Mza y Lote, Nro..."
                  invalid={invalidFields.has('direccion')}
                />
                <SelectField
                  name="distrito"
                  label="Indícanos el distrito"
                  required
                  options={DISTRITOS}
                  invalid={invalidFields.has('distrito')}
                />
                <TextField
                  name="coordenadas"
                  label="Agregar sus coordenadas"
                  hint="(Formato numérico, ej: -12.0459, -77.0308)"
                  required
                  placeholder="Tu respuesta"
                  invalid={invalidFields.has('coordenadas')}
                />
                <CoordsGuide />
                <FileUploadField
                  name="licenciaArchivo"
                  label="Adjuntar foto de tu nueva Licencia emitida por DGAC"
                  hint="(Formato JPG o PNG legible)"
                  accept=".pdf,.png,.jpg,.jpeg"
                  maxSizeMB={10}
                  required
                  invalid={invalidFields.has('licenciaArchivo')}
                />
              </div>
            )}

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
                disabled={sending}
                className="flex items-center justify-center gap-2 rounded-xl bg-latam-estrellada px-8 py-3 text-sm font-extrabold text-white shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:bg-latam-coral enabled:hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? 'Guardando...' : 'Guardar Registro'} <IconSend className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 animate-fadeUp">{error}</div>
      )}

      {sent && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 animate-fadeUp">
          <IconCheck className="h-5 w-5" /> Registro enviado correctamente a los sistemas de soporte.
        </div>
      )}
    </div>
  )
}
