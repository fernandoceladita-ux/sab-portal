// Extra copy for each item's carousel card + detail panel.
// `hasForm: true` items render the full interactive form (currently only
// "Actualización de Datos" is fully built out, matching what was requested).
export const ITEM_CONTENT = {
  'actualizacion-datos': {
    description: 'Actualización general de la ficha informativa interna.',
    tags: ['Expediente Personal', 'Formulario'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=70',
    form: 'actualizacion-datos',
  },
  'renovacion-fotocheck': {
    description: 'Solicitud digital de renovación de credenciales aeroportuarias.',
    tags: ['Expediente Personal', 'AppSheet'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=70',
  },
  'cesion-vacaciones': {
    description: 'Solicita el intercambio, la cesión o un pedido adicional de tus días de vacaciones.',
    tags: ['Expediente Personal', 'Formulario'],
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=700&q=70',
    form: 'cesion-vacaciones',
  },
  'domicilio-dgac': {
    description: 'Actualiza tu domicilio declarado ante la Dirección General de Aeronáutica Civil.',
    tags: ['Entidades y Legal', 'Formulario'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=700&q=70',
    form: 'domicilio-dgac',
  },
  'vacuna-fiebre-amarilla': {
    description: 'Registra tu constancia de vacunación contra la fiebre amarilla.',
    tags: ['Entidades y Legal', 'Documento'],
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=700&q=70',
    form: 'vacuna-fiebre-amarilla',
  },
  'registro-sunat': {
    description: 'Declaración obligatoria de dispositivos tecnológicos personales ante aduanas.',
    tags: ['Entidades y Legal', 'Registro de Formulario'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=70',
    form: 'registro-sunat',
  },
  'solicitud-mes-subsiguiente': {
    description: 'Envía tu solicitud de preferencias de rol para el mes subsiguiente.',
    tags: ['Gestión de Tiempos', 'Formulario'],
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=700&q=70',
  },
  'cambios-voluntarios': {
    description: 'Publica u ofrece cambios voluntarios de tramos con otros tripulantes.',
    tags: ['Gestión de Tiempos', 'AppSheet'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=700&q=70',
    form: 'cambios-voluntarios',
  },
  'descanso-medico': {
    description: 'Registra descansos médicos y adjunta tu documentación de sustento.',
    tags: ['Gestión de Tiempos', 'Formulario'],
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=700&q=70',
  },
  'seguro-medico': {
    description: 'Activa o consulta el estado de tu seguro médico como tripulante.',
    tags: ['Gestión de Tiempos', 'Beneficio'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=70',
    form: 'seguro-medico',
  },
  'visa-pasaporte': {
    description: 'Procedimiento a seguir para renovación o incidencias de visa y pasaporte.',
    tags: ['PBS, Visas y Habilitación', 'Procedimiento'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=70',
    form: 'visa-pasaporte',
  },
  'grupos-pbs': {
    description: 'Consulta los grupos PBS asignados para el periodo 2026.',
    tags: ['PBS, Visas y Habilitación', 'PDF'],
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=700&q=70',
    form: 'grupos-pbs',
  },
  'cambios-web-sab': {
    description: 'Historial y detalle de cambios publicados en la web SAB LP.',
    tags: ['PBS, Visas y Habilitación', 'Novedades'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=700&q=70',
    form: 'cambios-web-sab',
  },
  'instructivo-vales': {
    description: 'Guía paso a paso para el uso correcto de tus vales de alimentación.',
    tags: ['Viáticos y Alimentación', 'PDF'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=70',
    form: 'instructivo-vales',
  },
  'consultas-viaticos': {
    description: 'Revisa el cálculo de tus viáticos según tus horas de vuelo del periodo.',
    tags: ['Viáticos y Alimentación', 'Consulta'],
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=700&q=70',
    form: 'consultas-viaticos',
  },
  'cambio-uniforme': {
    description: 'Solicita el cambio o reposición de piezas de tu uniforme.',
    tags: ['Presentación Personal', 'Formulario'],
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=700&q=70',
    form: 'cambio-uniforme',
  },
}
