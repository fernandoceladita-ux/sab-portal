import { useState } from 'react'
import { IconChevronDown } from './icons.jsx'

export default function StepAccordion({ number, title, defaultOpen = true, isLast, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="relative">
      {!isLast && (
        <span className="absolute left-9 top-4 -z-10 h-[calc(100%+20px)] w-[3px] -translate-x-1/2 rounded-full bg-latam-coral" />
      )}
      <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-3 px-5 py-4 text-left"
        >
          <span className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-latam-coral text-sm font-extrabold text-white ring-4 ring-white">
            {number}
          </span>
          <span className="flex-1 text-[15px] font-extrabold text-latam-profunda">{title}</span>
          <IconChevronDown className={`h-5 w-5 flex-shrink-0 text-latam-estrellada transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
        <div
          className="grid transition-all duration-300 ease-out"
          style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            <div className="border-t border-slate-100 px-5 py-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
