import { useRef, useState } from 'react'
import { IconUpload, IconCheck, IconArrowRight, IconClock } from '../icons.jsx'

const labelCls = 'block text-sm font-bold text-latam-estrellada mb-2'
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-latam-estrellada focus:bg-white focus:ring-4 focus:ring-latam-estrellada/10'

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

export function TextField({ label, hint, required, ...props }) {
  return (
    <FieldWrap label={label} hint={hint} required={required}>
      <input type="text" className={inputCls} {...props} />
    </FieldWrap>
  )
}

export function DateField({ label, required, ...props }) {
  return (
    <FieldWrap label={label} required={required}>
      <input type="date" className={inputCls} {...props} />
    </FieldWrap>
  )
}

export function SelectField({ label, required, options = [], ...props }) {
  return (
    <FieldWrap label={label} required={required}>
      <select className={inputCls} defaultValue="" {...props}>
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

export function FileUploadField({ label, required, hint = 'PDF o imagen · Máx 10 MB' }) {
  const inputRef = useRef(null)
  const [fileName, setFileName] = useState('')

  return (
    <FieldWrap label={label} required={required}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center transition hover:border-latam-estrellada hover:bg-latam-estrellada/5"
      >
        <IconUpload className="h-7 w-7 text-latam-estrellada" />
        <span className="text-sm font-semibold text-slate-600">
          {fileName || 'Toca para subir un archivo'}
        </span>
        <span className="text-xs text-slate-400">{hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
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
      <p className="mb-3 text-sm text-slate-500">{text}</p>
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
