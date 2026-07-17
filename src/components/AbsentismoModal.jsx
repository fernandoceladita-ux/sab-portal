import { useRef, useState } from 'react'
import Modal from './Modal.jsx'
import { DarkSelectField, DarkDateField, DarkFileUploadField } from './fields/DarkFormFields.jsx'
import { IconClose, IconSend, IconCheck } from './icons.jsx'

// TODO: ajustar a los tipos de descanso/licencia reales cuando se confirmen.
const TIPOS_DESCANSO = ['Descanso Médico', 'Licencia Particular', 'Licencia por Maternidad/Paternidad']

export default function AbsentismoModal({ onClose }) {
  const formRef = useRef(null)
  const [invalidFields, setInvalidFields] = useState(new Set())
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

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
    const invalid = new Set()
    for (const el of e.currentTarget.elements) {
      if (el.name && typeof el.checkValidity === 'function' && !el.checkValidity()) {
        invalid.add(el.name)
      }
    }
    if (invalid.size > 0) {
      setInvalidFields(invalid)
      return
    }
    setInvalidFields(new Set())
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setTimeout(onClose, 1800)
    }, 700)
  }

  return (
    <Modal onClose={onClose} className="bg-latam-estrellada text-white">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
      >
        <IconClose className="h-4 w-4" />
      </button>

      <div className="px-6 pb-7 pt-6 sm:px-7">
        <span className="mb-4 inline-flex items-center rounded-full bg-latam-coral px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
          Absentismos
        </span>
        <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-white">Registro de Descanso Médico</h2>
        <p className="mt-1 text-sm text-slate-300">Carga de licencias y descansos</p>

        {sent ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3.5 text-sm font-bold text-white animate-fadeUp">
            <IconCheck className="h-5 w-5 flex-shrink-0 text-green-400" /> Descanso registrado correctamente.
          </div>
        ) : (
          <form ref={formRef} noValidate onSubmit={submit} onInput={clearInvalid} onChange={clearInvalid} className="mt-6">
            <DarkSelectField
              name="tipoDescanso"
              label="Tipo de descanso"
              required
              options={TIPOS_DESCANSO}
              invalid={invalidFields.has('tipoDescanso')}
            />
            <DarkDateField name="fechaInicio" label="Fecha de inicio" required invalid={invalidFields.has('fechaInicio')} />
            <DarkFileUploadField
              name="constancia"
              label="Adjuntar constancia médica"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              maxSizeMB={10}
              invalid={invalidFields.has('constancia')}
            />

            <div className="mt-2 flex flex-col-reverse justify-end gap-3 border-t border-white/10 pt-5 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border-2 border-white/20 bg-transparent px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex items-center justify-center gap-2 rounded-xl bg-latam-coral px-6 py-3 text-sm font-extrabold text-white shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {sending ? 'Registrando...' : 'Registrar Descanso'} <IconSend className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
