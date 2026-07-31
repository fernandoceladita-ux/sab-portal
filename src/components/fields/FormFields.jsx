import { useEffect, useRef, useState } from 'react'
import { IconUpload, IconCheck, IconArrowRight, IconClock, IconClose, IconAlertTriangle } from '../icons.jsx'

const labelCls = 'block text-sm font-bold text-latam-estrellada mb-2'
const inputBaseCls = 'w-full rounded-xl border px-4 py-3 text-[15px] text-slate-800 placeholder:text-slate-400 outline-none transition-all'
const inputNormalCls = 'border-slate-200 bg-slate-50 focus:border-latam-estrellada focus:bg-white focus:ring-4 focus:ring-latam-estrellada/10'
const inputInvalidCls = 'border-latam-coral bg-latam-coral/5 ring-4 ring-latam-coral/15 animate-shake'
// `invalid` es opt-in: los campos que no lo pasan se comportan exactamente igual que antes.
const inputCls = (invalid) => `${inputBaseCls} ${invalid ? inputInvalidCls : inputNormalCls}`

export function FieldWrap({ label, hint, required, children }) {
  return (
    <div className="mb-5">
      {label && (
        <label className={labelCls}>
          {label} {required && <span className="text-latam-coral">*</span>}
          {hint && <span className="ml-1 font-normal text-slate-400 text-xs">{hint}</span>}
        </label>
      )}
      {children}
    </div>
  )
}

export function TextField({ label, hint, required, invalid, ...props }) {
  return (
    <FieldWrap label={label} hint={hint} required={required}>
      <input type="text" required={required} className={inputCls(invalid)} {...props} />
    </FieldWrap>
  )
}

export function DateField({ label, required, invalid, ...props }) {
  return (
    <FieldWrap label={label} required={required}>
      <input type="date" required={required} className={inputCls(invalid)} {...props} />
    </FieldWrap>
  )
}

export function MonthField({ label, required, invalid, ...props }) {
  return (
    <FieldWrap label={label} required={required}>
      <input type="month" required={required} className={inputCls(invalid)} {...props} />
    </FieldWrap>
  )
}

export function TimeField({ label, required, invalid, ...props }) {
  return (
    <FieldWrap label={label} required={required}>
      <input type="time" required={required} className={inputCls(invalid)} {...props} />
    </FieldWrap>
  )
}

export function TextareaField({ label, hint, required, invalid, ...props }) {
  return (
    <FieldWrap label={label} hint={hint} required={required}>
      <textarea rows={4} required={required} className={`${inputCls(invalid)} resize-none`} {...props} />
    </FieldWrap>
  )
}

export function SelectField({ label, required, invalid, options = [], ...props }) {
  return (
    <FieldWrap label={label} required={required}>
      <select required={required} className={inputCls(invalid)} defaultValue="" {...props}>
        <option value="" disabled>
          Elegir una opción...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
}

const formatFileSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

// Drag & drop + validación de formato/peso + preview con botón de quitar.
// `name`/`accept`/`maxSizeMB`/`onFileChange` son opcionales — los usos
// existentes sin esos props siguen funcionando exactamente igual que antes.
export function FileUploadField({
  label,
  required,
  hint = 'PDF o imagen · Máx 10 MB',
  name,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSizeMB = 10,
  invalid,
  onFileChange,
  resetSignal,
}) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState('')

  // El preview (nombre de archivo + check verde) vive en este estado interno,
  // separado del <input type="file"> nativo — por eso un `form.reset()` o un
  // reset manual de `value` desde el padre no lo hace desaparecer. Cambiar
  // `resetSignal` (ej. un contador que el padre incrementa tras enviar o
  // borrar el formulario) es la señal explícita para limpiarlo.
  useEffect(() => {
    if (resetSignal === undefined) return
    setFile(null)
    setFileError('')
    if (inputRef.current) inputRef.current.value = ''
    // Solo debe dispararse cuando el padre cambia la señal, no en cada
    // render ni cuando cambia el propio archivo seleccionado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  const acceptExts = accept.split(',').map((s) => s.trim().toLowerCase())

  const validate = (f) => {
    const ext = `.${f.name.split('.').pop().toLowerCase()}`
    if (!acceptExts.includes(ext)) return `Formato no permitido. Usa: ${accept.replaceAll('.', ' ').toUpperCase().trim()}`
    if (f.size > maxSizeMB * 1024 * 1024) return `El archivo supera los ${maxSizeMB}MB permitidos.`
    return ''
  }

  const handleFile = (f) => {
    if (!f) return
    const err = validate(f)
    setFileError(err)
    setFile(err ? null : f)
    onFileChange?.(err ? null : f)
  }

  const removeFile = () => {
    setFile(null)
    setFileError('')
    if (inputRef.current) inputRef.current.value = ''
    onFileChange?.(null)
  }

  const showError = fileError || invalid

  return (
    <FieldWrap label={label} hint={hint} required={required}>
      {file ? (
        <div className="flex animate-fadeUp items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
              <IconCheck className="h-4 w-4 text-green-600" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-700">{file.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            aria-label="Quitar archivo"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-latam-coral"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files?.[0]
            if (f && inputRef.current) {
              const dt = new DataTransfer()
              dt.items.add(f)
              inputRef.current.files = dt.files
            }
            handleFile(f)
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-all ${
            showError
              ? 'animate-shake border-latam-coral bg-latam-coral/5'
              : dragOver
                ? 'scale-[1.01] border-latam-estrellada bg-latam-estrellada/10'
                : 'border-slate-300 bg-slate-50 hover:border-latam-estrellada hover:bg-latam-estrellada/5'
          }`}
        >
          <IconUpload className={`h-7 w-7 ${showError ? 'text-latam-coral' : 'text-latam-estrellada'}`} />
          <span className="text-sm font-semibold text-slate-600">
            {dragOver ? 'Suelta el archivo aquí' : 'Haz clic aquí para subir el archivo o arrastra la imagen'}
          </span>
          <span className="text-xs text-slate-400">
            Formatos permitidos: {accept.replaceAll('.', ' ').toUpperCase().trim()} (Máx. {maxSizeMB}MB)
          </span>
        </button>
      )}

      {fileError && <p className="mt-2 text-xs font-bold text-latam-coral">{fileError}</p>}

      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        required={required}
        // sr-only (not `hidden`/display:none): inputs that aren't rendered are
        // excluded from HTML5 required-field validation, so the browser would
        // silently allow submitting without a file.
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </FieldWrap>
  )
}

export function InfoNote({ children }) {
  return <p className="mb-4 text-sm leading-relaxed text-slate-500">{children}</p>
}

export function ImageReference({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      className="mb-4 w-full rounded-xl border border-slate-200 object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

export function CheckboxGroup({ label, required, options = [], value = [], onChange }) {
  const toggle = (opt) => {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])
  }
  return (
    <FieldWrap label={label} required={required}>
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        {options.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-semibold text-slate-700 active:bg-slate-100">
            <span
              onClick={() => toggle(opt)}
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition ${
                value.includes(opt) ? 'border-latam-estrellada bg-latam-estrellada' : 'border-slate-300 bg-white'
              }`}
            >
              {value.includes(opt) && <IconCheck className="h-3.5 w-3.5 text-white" />}
            </span>
            <span onClick={() => toggle(opt)}>{opt}</span>
          </label>
        ))}
      </div>
    </FieldWrap>
  )
}

export function RadioGroup({ label, required, options = [], value, onChange }) {
  return (
    <FieldWrap label={label} required={required}>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-xl border-2 px-6 py-2.5 text-sm font-bold transition ${
              value === opt
                ? 'border-latam-coral bg-latam-coral/10 text-latam-coral'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </FieldWrap>
  )
}

export function RouteInstruction({ text, steps = [] }) {
  return (
    <div className="mt-2 border-t border-slate-200 pt-5">
      {text && <p className="mb-3 text-sm text-slate-500">{text}</p>}
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[#f1f0f7] p-3.5 font-mono text-[13px] font-bold text-latam-estrellada">
        {steps.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {s}
            {i < steps.length - 1 && <IconArrowRight className="h-3.5 w-3.5 text-slate-400" />}
          </span>
        ))}
        <span className="inline-flex items-center justify-center rounded border border-slate-200 bg-white p-1">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-latam-coral" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14 5l4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  )
}

export function AnticipationAlert({ children }) {
  return (
    <div className="flex items-center gap-3 rounded-r-lg border-l-4 border-latam-estrellada bg-latam-estrellada/5 px-4 py-3 text-sm font-bold text-latam-estrellada">
      <IconClock className="h-5 w-5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  )
}

// Nota corta de advertencia (amarillo pálido) para colgar debajo de un campo puntual.
export function WarningNote({ children }) {
  return (
    <p className="-mt-3 mb-5 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
      <IconAlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      {children}
    </p>
  )
}
