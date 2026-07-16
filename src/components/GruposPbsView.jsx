import { IconPdf, IconPlay } from './icons.jsx'

// TODO: reemplazar con el link real del PDF de Grupos PBS en Drive.
const PBS_PDF_URL = '#'
const PBS_VIDEO_URL = 'https://www.youtube.com/watch?v=HM1aVpZgpEg'

export default function GruposPbsView() {
  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        A continuación, consulta tu posicionamiento reglamentario asignado para el sistema de subastas
        preferenciales de vuelos (Preferential Bidding System). Utiliza el buscador predictivo para localizar tu
        registro de forma ágil.
      </p>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
        <a
          href={PBS_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-latam-estrellada px-5 py-3.5 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-latam-coral hover:shadow-card"
        >
          <IconPdf className="h-4 w-4 flex-shrink-0" /> Descargar Grupos PBS (PDF)
        </a>
        <a
          href={PBS_VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF0000] px-5 py-3.5 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card hover:brightness-110"
        >
          <IconPlay className="h-4 w-4 flex-shrink-0" /> Ver Video Taller PBS en YouTube
        </a>
      </div>
    </div>
  )
}
