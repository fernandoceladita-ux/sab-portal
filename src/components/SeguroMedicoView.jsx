import StepAccordion from './StepAccordion.jsx'
import { RouteInstruction } from './fields/FormFields.jsx'
import { IconSmartphone, IconInfo } from './icons.jsx'

export default function SeguroMedicoView() {
  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Guía de contingencia y autogestión de salud para Tripulaciones de Mando y Cabina en funciones fuera de su
        país base.
      </p>

      <div>
        <StepAccordion number={1} title="Descarga la Aplicación">
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            Descarga desde Play Store o App Store la aplicación oficial <strong className="text-slate-800">"Universal Assistance"</strong>.
            Es recomendable tenerla instalada preventivamente en tu celular corporativo (One Device).
          </p>
          <span className="inline-flex items-center gap-2 rounded-lg bg-latam-diavivo/10 px-3.5 py-2 text-xs font-extrabold text-latam-diavivo">
            <IconSmartphone className="h-4 w-4" /> Disponible en Google Play & Apple App Store
          </span>
        </StepAccordion>

        <StepAccordion number={2} title="Conecta con la Asistencia Médica">
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            Ingresa a la app de Universal Assistance, dirígete al menú principal y selecciona el ícono "Líneas de
            asistencia". Presiona el botón <strong className="text-slate-800">"WIFI CALL"</strong> para conectarte
            de forma gratuita con un operador de la aseguradora. Asegúrate de estar conectado a una red WiFi
            estable o disponer de datos móviles de internet.
          </p>
          <RouteInstruction steps={['Menú', 'Líneas de asistencia', 'WIFI CALL']} />
        </StepAccordion>

        <StepAccordion number={3} title="Brinda Información Importante">
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            Una vez que atiendan tu llamada, identifícate formalmente como{' '}
            <strong className="text-slate-800">Tripulante de LATAM</strong> y proporciona los siguientes datos
            obligatorios:
          </p>
          <ul className="mb-4 flex flex-col gap-1.5 border-l-2 border-slate-200 pl-4">
            {[
              'Nombre completo y número de BP',
              'País y ciudad exacta donde te encuentras ubicado',
              'Síntomas detallados del malestar o accidente',
            ].map((t) => (
              <li key={t} className="text-sm text-slate-600">
                {t}
              </li>
            ))}
          </ul>
          <p className="mb-3 text-sm leading-relaxed text-slate-600">
            Espera que el operador evalúe tu caso. Él te indicará si recibirás atención por{' '}
            <strong className="text-slate-800">telemedicina</strong>, asistencia asistida en tu ubicación actual o
            serás derivado a un centro de salud.{' '}
            <strong className="text-slate-800">Anota siempre el número de asistencia proporcionado.</strong>
          </p>
          <p className="text-xs font-semibold text-latam-coral">
            ⚠️ Recuerda: La asistencia médica finaliza formalmente cuando el profesional de la salud dictamina que
            estás apto para retomar tus funciones asignadas o si regresas de inmediato a tu país de origen.
          </p>
        </StepAccordion>

        <StepAccordion number={4} title="Centro Médico" isLast>
          <p className="text-sm leading-relaxed text-slate-600">
            Al acudir al centro asignado, informa que cuentas con cobertura internacional vigente con{' '}
            <strong className="text-slate-800">Universal Assistance</strong> y muestra tu documento de identidad.
            Sigue las indicaciones del personal para recibir atención sin demoras. Todos los exámenes clínicos y
            medicamentos indicados estarán cubiertos hasta que recibas el{' '}
            <strong className="text-slate-800">alta médica definitiva</strong>.
          </p>
        </StepAccordion>
      </div>

      <div className="mt-2 rounded-2xl border border-latam-diavivo/25 bg-latam-diavivo/5 p-5">
        <div className="mb-3 flex items-center gap-2 text-latam-diavivo">
          <IconInfo className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-extrabold uppercase tracking-wide">Información de Control Operativo</p>
        </div>
        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          En ciertos casos excepcionales, la clínica médica puede requerir una confirmación directa de la
          aseguradora antes de proceder con exámenes clínicos complejos. Ante esta situación, comuníquese de
          inmediato con el operador con tu número de asistencia para agilizar la cobertura.
        </p>
        <ul className="flex flex-col gap-2">
          <li className="text-sm text-slate-600">
            <strong className="text-latam-estrellada">Gestión de Reembolsos:</strong> Los reembolsos autorizados por
            gastos de traslados logísticos o medicamentos adquiridos fuera de la clínica deben gestionarse de forma
            autónoma a través de la misma aplicación de Universal Assistance.
          </li>
          <li className="text-sm text-slate-600">
            <strong className="text-latam-estrellada">Consejo Práctico:</strong> Te recomendamos tomar fotografías
            nítidas a todos recibos físicos, recetas y comprobantes de pago para facilitar y asegurar el proceso de
            validación.
          </li>
        </ul>
      </div>
    </div>
  )
}
