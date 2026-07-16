import { IconClock } from './icons.jsx'

export default function DetailPlaceholder({ item, content }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-latam-estrellada/10">
        <item.icon className="h-6 w-6 text-latam-estrellada" />
      </span>
      <h3 className="mb-2 text-lg font-extrabold text-latam-estrellada">{item.label}</h3>
      <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-slate-500">{content?.description}</p>
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
        <IconClock className="h-3.5 w-3.5" /> Formulario disponible próximamente en esta web
      </span>
    </div>
  )
}
