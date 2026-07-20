import { useRef, useState } from 'react'
import { TextField, DateField, SelectField } from './fields/FormFields.jsx'
import { IconIdCard, IconCalendarCheck, IconClock, IconEdit, IconSend, IconCheck } from './icons.jsx'

const INFO_CARDS = [
  {
    icon: IconIdCard,
    title: 'Límite de Registro',
    description: 'Se puede registrar un solo artículo por persona de forma activa.',
  },
  {
    icon: IconCalendarCheck,
    title: 'Vigencia',
    description: 'No es necesario actualizar o volver a realizar este proceso si no se cambia el artículo.',
  },
  {
    icon: IconClock,
    title: 'Restricción por Cambio',
    description: 'En caso que cambie el artículo, debe esperar un año para volver a registrarlo.',
  },
]

const EQUIPO_OPCIONES = ['Laptop', 'Tablet']
const USO_OPCIONES = ['Uso Corporativo', 'Uso Mixto (Corporativo y Personal)', 'Uso Personal']

export default function RegistroSunatView() {
  const formRef = useRef(null)
  const [invalidFields, setInvalidFields] = useState(new Set())
  const [clearing, setClearing] = useState(false)
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
    setSent(false)

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

  const clearForm = () => {
    setClearing(true)
    setTimeout(() => {
      formRef.current?.reset()
      setInvalidFields(new Set())
      setError('')
      setClearing(false)
    }, 220)
  }

  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Completa el formulario integrado abajo para registrar tus herramientas de trabajo tecnológicas corporativas y
        personales.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {INFO_CARDS.map((card) => (
          <div
            key={card.title}
            className="flex flex-col items-start gap-2 rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-card"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-latam-coral/10">
              <card.icon className="h-4 w-4 text-latam-estrellada" />
            </span>
            <h4 className="text-[13.5px] font-extrabold text-latam-estrellada">{card.title}</h4>
            <p className="text-[12.5px] leading-relaxed text-slate-500">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border-t-4 border-latam-estrellada bg-white shadow-card">
        <div className="flex items-center gap-2 bg-latam-estrellada px-5 py-3.5 text-[15px] font-bold text-white">
          <IconEdit className="h-4 w-4" /> Formulario Digital de Inscripción
        </div>

        <form ref={formRef} noValidate onSubmit={submit} onInput={clearInvalid} onChange={clearInvalid} className="bg-[#fafbfc] px-5 py-6">
          <div className={`grid grid-cols-1 gap-x-5 transition-opacity duration-200 sm:grid-cols-2 ${clearing ? 'opacity-0' : 'opacity-100'}`}>
            <div className="sm:col-span-2">
              <TextField
                name="correo"
                type="email"
                label="Correo electrónico"
                required
                placeholder="nombre.apellido@latam.com"
                invalid={invalidFields.has('correo')}
              />
            </div>
            <TextField name="bp" label="BP" required invalid={invalidFields.has('bp')} />
            <TextField name="nombre" label="Apellidos y Nombres" required invalid={invalidFields.has('nombre')} />
            <DateField name="fechaNacimiento" label="Fecha de Nacimiento" required invalid={invalidFields.has('fechaNacimiento')} />
            <TextField
              name="pasaporte"
              label="Pasaporte"
              required
              placeholder="Ingresa el número de pasaporte"
              invalid={invalidFields.has('pasaporte')}
            />
            <SelectField
              name="tipoEquipo"
              label="Tipo de Equipo"
              required
              options={EQUIPO_OPCIONES}
              invalid={invalidFields.has('tipoEquipo')}
            />
            <SelectField name="uso" label="Uso" required options={USO_OPCIONES} invalid={invalidFields.has('uso')} />
            <div className="sm:col-span-2">
              <TextField name="marca" label="Marca" required placeholder="Ej. Lenovo, Apple, HP" invalid={invalidFields.has('marca')} />
            </div>
            <TextField
              name="modelo"
              label="Modelo"
              hint="(Ingresar sin guiones)"
              required
              placeholder="Ej. ThinkPad T490"
              invalid={invalidFields.has('modelo')}
            />
            <TextField
              name="serie"
              label="Serie"
              hint="(Ingresar sin guiones)"
              required
              placeholder="Ej. PF1K2345"
              invalid={invalidFields.has('serie')}
            />
          </div>

          <div className="mt-2 flex flex-col-reverse justify-end gap-3 sm:flex-row">
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
              className="flex items-center justify-center gap-2 rounded-xl bg-latam-estrellada px-8 py-3 text-sm font-extrabold text-white shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:bg-latam-coral enabled:hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? 'Guardando...' : 'Enviar Registro'} <IconSend className="h-4 w-4" />
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
