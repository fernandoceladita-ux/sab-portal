import { useState } from 'react'
import { IconChevronDown } from './icons.jsx'

export default function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="rounded-2xl bg-white p-2 shadow-soft sm:p-4">
      {items.map((it, i) => {
        const open = openIndex === i
        return (
          <div key={it.q} className={i !== items.length - 1 ? 'border-b border-slate-100' : ''}>
            <button
              onClick={() => setOpenIndex(open ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-2 py-4 text-left text-[15px] font-bold text-slate-800 sm:px-3"
            >
              {it.q}
              <IconChevronDown className={`h-5 w-5 flex-shrink-0 text-latam-coral transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <p className="px-2 pb-4 text-sm leading-relaxed text-slate-500 sm:px-3">{it.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
