import { useRef, useState } from 'react'
import { IconUpload, IconCheck, IconClose } from '../icons.jsx'

// Variante oscura de FormFields.jsx, para formularios dentro de modales con
// fondo de marca (bg-latam-estrellada). Misma API/forma que los campos claros.
const darkLabelCls = 'mb-2 block text-sm font-bold text-white'
const darkInputBaseCls = 'w-full rounded-xl border px-4 py-3 text-[15px] text-white placeholder:text-white/40 outline-none transition-all'
const darkInputNormalCls = 'border-white/15 bg-white/10 focus:border-latam-coral focus:bg-white/15 focus:ring-4 focus:ring-latam-coral/20'
const darkInputInvalidCls = 'border-latam-coral bg-latam-coral/10 ring-4 ring-latam-coral/20 animate-shake'
const darkInputCls = (invalid) => `${darkInputBaseCls} ${invalid ? darkInputInvalidCls : darkInputNormalCls}`

function DarkFieldWrap({ label, required, children }) {
  return (
    <div className="mb-5">
      {label && (
        <label className={darkLabelCls}>
          {label} {required && <span className="text-latam-coral">*</span>}
        </label>
      )}
      {children}
    </div>
  )
}

export function DarkSelectField({ label, required, invalid, options = [], ...props }) {
  return (
    <DarkFieldWrap label={label} required={required}>
      <select required={required} className={darkInputCls(invalid)} defaultValue="" {...props}>
        <option value="" disabled className="text-slate-500">
          Elegir tipo...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-slate-800">
            {opt}
          </option>
        ))}
      </select>
    </DarkFieldWrap>
  )
}

export function DarkTextareaField({ label, required, invalid, ...props }) {
  return (
    <DarkFieldWrap label={label} required={required}>
      <textarea rows={3} required={required} className={`${darkInputCls(invalid)} resize-none`} {...props} />
    </DarkFieldWrap>
  )
}

export function DarkDateField({ label, required, invalid, ...props }) {
  return (
    <DarkFieldWrap label={label} required={required}>
      <input type="date" required={required} className={`${darkInputCls(invalid)} [color-scheme:dark]`} {...props} />
    </DarkFieldWrap>
  )
}

export function DarkFileUploadField({
  label,
  required,
  hint = 'Formatos: PDF, PNG, JPG (Máx. 10MB)',
  name,
  accept = '.pdf,.png,.jpg,.jpeg',
  maxSizeMB = 10,
  invalid,
}) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState('')

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
  }

  const removeFile = () => {
    setFile(null)
    setFileError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const showError = fileError || invalid

  return (
    <DarkFieldWrap label={label} required={required}>
      {file ? (
        <div className="flex animate-fadeUp items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
              <IconCheck className="h-4 w-4 text-green-400" />
            </span>
            <p className="truncate text-sm font-bold text-white">{file.name}</p>
          </div>
          <button
            type="button"
            onClick={removeFile}
            aria-label="Quitar archivo"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-latam-coral"
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
              ? 'animate-shake border-latam-coral bg-latam-coral/10'
              : dragOver
                ? 'scale-[1.01] border-white/40 bg-white/10'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
          }`}
        >
          <IconUpload className={`h-7 w-7 ${showError ? 'text-latam-coral' : 'text-white/70'}`} />
          <span className="text-sm font-semibold text-white/90">
            {dragOver ? (
              'Suelta el archivo aquí'
            ) : (
              <>
                <span className="rounded bg-latam-coral/30 px-1.5 py-0.5">Haz clic aquí</span> para subir el
                documento escaneado
              </>
            )}
          </span>
          <span className="text-xs text-white/40">{hint}</span>
        </button>
      )}

      {fileError && <p className="mt-2 text-xs font-bold text-latam-coral">{fileError}</p>}

      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        required={required}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </DarkFieldWrap>
  )
}
