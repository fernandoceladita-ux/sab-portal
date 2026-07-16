import { Link } from 'react-router-dom'
import StepAccordion from './StepAccordion.jsx'
import { RouteInstruction } from './fields/FormFields.jsx'
import { IconClock, IconCalendarCheck, IconSmartphone, IconCheck, IconSend } from './icons.jsx'

export default function VisaPasaporteView() {
  return (
    <div className="mx-auto max-w-3xl animate-fadeUp">
      <p className="mb-6 text-sm leading-relaxed text-slate-600">
        Compartimos el procedimiento mandatorio unificado para la renovación de tu documentación técnica de vuelo
        alineado a nuestras guías globales.
      </p>

      <div className="mb-6 rounded-2xl border border-latam-coral/25 bg-latam-coral/5 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-latam-coral">
          <IconClock className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-extrabold uppercase tracking-wide">Reglas Críticas de Anticipación (leer antes de iniciar)</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4">
            <p className="mb-1.5 flex items-center gap-2 text-sm font-extrabold text-latam-estrellada">
              <IconCalendarCheck className="h-4 w-4 flex-shrink-0 text-latam-coral" /> Mínimo 2 Meses de Anticipación
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              Tanto para solicitar la <strong className="text-slate-800">protección en rol</strong> como para que el
              documento nuevo sea considerado en la programación próxima (Ej: cita en junio se registra máximo el
              30 de abril).
            </p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="mb-1.5 flex items-center gap-2 text-sm font-extrabold text-latam-estrellada">
              <IconClock className="h-4 w-4 flex-shrink-0 text-latam-coral" /> Mínimo 4 Días Hábiles
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              La actualización del nuevo documento emitido debe ingresarse al menos{' '}
              <strong className="text-slate-800">4 días hábiles antes</strong> de realizar un vuelo internacional
              que lo exija.
            </p>
          </div>
        </div>
      </div>

      <div>
        <StepAccordion number={1} title="Tramitar la Carta de Presentación Consular (Cartas Visa)">
          <p className="mb-4 text-sm leading-relaxed text-slate-600">
            Antes de agendar de manera formal tu cita ante la embajada, debes tramitar tu carta corporativa
            ingresando al portal siguiendo de manera exacta esta ruta:
          </p>
          <RouteInstruction steps={['Portal', 'Mis Aplicaciones', 'Mis Solicitudes', 'Certificados e Informes', 'Cartas Visa']} />
          <p className="mt-4 text-xs font-semibold text-latam-coral">
            ⚠️ Criterio de Selección: Selecciona estrictamente la opción COMISIONES y coloca como motivo de viaje:
            VISA CREW (puedes registrar fechas y ciudades referenciales).
          </p>
        </StepAccordion>

        <StepAccordion number={2} title="Agendar la Cita y Activar la Protección de Rol">
          <p className="mb-4 text-sm leading-relaxed text-slate-600">
            Programa tu cita consular y registra la fecha y hora con el mínimo de 2 meses de anticipación
            requerido. Ten en cuenta los siguientes parámetros operacionales:
          </p>
          <ul className="flex flex-col gap-3">
            <li className="text-sm leading-relaxed text-slate-600">
              <strong className="text-slate-800">Fechas Sugeridas:</strong> Agenda tu cita para fechas posteriores
              al día 5 de cada mes para proteger los empalmes y la continuidad de los vuelos.
            </li>
            <li className="text-sm leading-relaxed text-slate-600">
              <strong className="text-slate-800">Asignación de Vuelos:</strong> La protección no equivale a un día
              libre, sino a una asignación especial que te libere para asistir al trámite.
            </li>
            <li className="text-sm leading-relaxed text-slate-600">
              <strong className="text-slate-800">Restricción Geográfica Operativa:</strong> A partir del día 6 del
              mes en que vayas a quedar sin pasaporte, se asignarán únicamente{' '}
              <strong className="text-slate-800">vuelos domésticos o regionales protegidos</strong> (Argentina,
              Brasil, Bolivia, Chile, Ecuador, Paraguay y Uruguay). Esta protección se mantendrá fija hasta que
              registres tus nuevos documentos.
            </li>
          </ul>
        </StepAccordion>

        <StepAccordion number={3} title="Solicitar Reembolso vía SAB Concur">
          <p className="mb-4 text-sm leading-relaxed text-slate-600">
            El reembolso económico por los costos arancelarios de la renovación de tu Pasaporte y/o Visa Crew se
            realiza de forma autónoma:
          </p>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="mb-1 flex items-center gap-2 text-sm font-extrabold text-green-700">
              <IconSmartphone className="h-4 w-4 flex-shrink-0" /> Plataforma SAB Concur
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              Disponible de forma directa en tu <strong className="text-slate-800">One Device</strong>. Recuerda
              que puedes consultar el manual detallado de la aplicación ubicado en el SITE LP.
            </p>
          </div>
        </StepAccordion>

        <StepAccordion number={4} title="Registro Final de Documento Emitido o Alerta de Rechazo" isLast>
          <div className="rounded-2xl border-2 border-dashed border-latam-coral/40 bg-latam-coral/5 p-5 text-center sm:p-6">
            <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <IconCheck className="h-5 w-5 text-green-600" />
            </span>
            <p className="mb-1.5 text-sm font-extrabold text-latam-estrellada">¿Ya cuentas con tu nuevo Pasaporte o VISA?</p>
            <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-slate-600">
              ¡Excelente! Para regularizar tu estatus en las bases de datos y levantar de manera definitiva
              cualquier restricción operacional en Rol, ingresa la información oficial a través de la ficha digital
              unificada de actualización.
            </p>
            <Link
              to="/datos-personales?item=actualizacion-datos&tramite=visa"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-latam-estrellada px-6 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-latam-coral hover:shadow-card sm:w-auto"
            >
              Abrir Ficha de Actualización en Sección VISA <IconSend className="h-4 w-4" />
            </Link>
          </div>
        </StepAccordion>
      </div>
    </div>
  )
}
