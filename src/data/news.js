// Noticias del hero. Agrega/quita objetos aquí — NoveltyCarousel las rota solo.
export const NEWS = [
  {
    noticia: 'Ampliación del Piloto: Sanguchito de Pollo',
    description: 'Implementación confirmada en las rutas internacionales de Punta Cana (PUJ) y Cancún (CUN).',
    href: '#',
    detail: {
      eyebrow: 'Extensión de Plazo',
      title: '¡Continúa el sándwich a bordo!',
      tag: 'Regional YC (PUJ + CUN)',
      body: 'Gracias a sus sugerencias y buenas ideas, se dio inicio con este piloto en nuestro servicio de catering, que busca elevar la experiencia de nuestros pasajeros a un nivel superior. El éxito del mismo va de la mano con el toque de hospitalidad que nos caracteriza en cada vuelo, durante la entrega del servicio.',
      highlight: 'Cambio de producto: El sándwich de jamón y queso será sustituido por un sándwich de pollo a la brasa con queso.',
      sections: [
        {
          icon: 'flight',
          title: 'Alcance Obligatorio',
          body: 'Aplica únicamente en los números de vuelos detallados para la ruta LIM–PUJ y LIM–CUN (solo one way):',
          table: {
            headers: ['Ruta', 'Vuelo', 'Hora'],
            rows: [
              ['LIM - CUN', '2456', '13:05'],
              ['LIM - PUJ', '2450', '12:30'],
            ],
          },
        },
        {
          icon: 'calendar_month',
          title: 'Vigencia de la Medida',
          body: 'Se inició el 01 de junio, y ahora se extiende la vigencia todo el mes de julio.',
        },
        {
          icon: 'fact_check',
          title: 'Medición de Avance (NIMBUS)',
          body: 'Se activa campaña en NIMBUS para que JSB y HR de manera obligatoria respondan la breve encuesta que necesitamos para medir el avance del piloto.',
        },
      ],
    },
  },
  {
    noticia: 'Reembolso Multas Elecciones 2026',
    description: 'Revisa los plazos y carga tus comprobantes oficiales de exoneración en el portal de Datos Personales.',
    href: '#',
    image: 'img/noticia_modal/plazo_reembolso.png',
  },
  {
    noticia: 'Autogestión: Contacto Movilización',
    description: 'Ya puedes contactar por tu propia cuenta.',
    href: '#',
    detail: {
      eyebrow: 'Canal Directo',
      title: '¡Contáctanos por Google Chat!',
      tag: 'Coordinación operativa 24/7',
      body: 'Ante cualquier contingencia que afecte tu asignación de vuelo, el canal más rápido de coordinación con Movilización es **Google Chat desde tu dispositivo móvil**, sin necesidad de llamada telefónica.',
      highlight: 'Nota: Ideal para resolver contingencias en tiempo real y asegurar la regularidad de tu itinerario de manera ágil.',
      footer: 'Simulación: Contenido informativo de referencia • Somos LATAM',
      sections: [
        {
          icon: 'help',
          title: 'Alcance / Cuándo Usarlo',
          body: 'Retrasos de transporte, imprevistos de salud de último momento o cualquier situación que ponga en riesgo tu presentación a tiempo.',
        },
        {
          icon: 'clock',
          title: 'Tiempo de Respuesta',
          body: 'El equipo de Movilización responde en un **máximo de 10 minutos** durante operación activa.',
        },
        {
          icon: 'phone',
          title: 'Canales Alternos',
          body: 'Si no tienes conexión a internet, comunícate a la central telefónica de Movilización disponible en tu credencial corporativa.',
        },
      ],
    },
  },
]
