// Noticias del hero. Agrega/quita objetos aquí — NoveltyCarousel las rota solo.
export const NEWS = [
  {
    noticia: 'Personas que Inspiran',
    description: 'Conoce a las tripulantes con el mejor desempeño en Crew Care y Vuelos Impecables de junio.',
    href: '#',
    detail: {
      eyebrow: 'Reconocimiento',
      title: 'Personas que Inspiran',
      tag: 'Junio 2026',
      body: 'Cada mes reconocemos a quienes elevan la experiencia de nuestros pasajeros con su calidez y profesionalismo a bordo. Estas son las tripulantes que más se destacaron en junio:',
      // TODO: guarda las 6 fotos (rostro, se recortan en círculo) en
      // public/img/noticia_modal/personas/ con estos nombres exactos (o
      // ajusta las rutas de abajo si usas otros).
      recognitions: [
        {
          title: 'TOP Crew Care',
          badge: '100%',
          note: 'Mayor %CC con mínimo 20 muestras.',
          people: [
            { photo: 'img/noticia_modal/personas/caroline_parra.jpg', name: 'Caroline Mirella Parra Galvez' },
            { photo: 'img/noticia_modal/personas/roxana_villanueva.jpg', name: 'Roxana Esther Villanueva Del Aguila' },
            { photo: 'img/noticia_modal/personas/maria_mendoza.jpg', name: 'Maria Jose Mendoza Belaunde' },
          ],
        },
        {
          title: 'TOP Crew Care HVC',
          badge: '95%',
          note: 'Mayor %CC HVC con mínimo 20 muestras.',
          people: [
            { photo: 'img/noticia_modal/personas/paola_gutierrez.jpg', name: 'Paola Alejandra Gutierrez Espinoza' },
          ],
        },
        {
          title: 'TOP Vuelos Impecables',
          note: '3 vuelos impecables realizados.',
          people: [
            { photo: 'img/noticia_modal/personas/rosa_chinen.jpg', name: 'Rosa Angela Chinen Sanchez' },
            { photo: 'img/noticia_modal/personas/maria_seoane.jpg', name: 'Maria Seoane Garcia' },
          ],
        },
      ],
    },
  },
  {
    noticia: 'Proyecto GENESYS',
    description: 'Llamadas automáticas para notificar tu movimiento diario — llega el 10 de agosto.',
    href: '#',
    detail: {
      eyebrow: 'Nuevo Proyecto',
      title: 'Proyecto GENESYS: IA Crew',
      tag: 'Implementación: 10 de agosto',
      body: 'Genesys es un sistema de llamadas automáticas para los tripulantes. Estamos desarrollando una lógica para el cálculo automático del PDR, así como para la identificación de los horarios disponibles para realizar llamadas. Este análisis se encargará de integrar y comprender toda la información relevante.',
      highlight: 'Tu notificador de movimiento diario.',
      sections: [
        {
          icon: 'clock',
          title: 'Período de Descanso Reglamentario',
          body: 'Se calcula automáticamente para asegurar que cada llamada respete tu tiempo de descanso legal.',
        },
        {
          icon: 'fact_check',
          title: 'Otras Variables',
          body: 'El sistema integra información adicional relevante para identificar el mejor momento de contacto.',
        },
        {
          icon: 'calendar_month',
          title: 'Días Libres',
          body: 'Genesys reconoce tus días libres para no interrumpir tu descanso fuera de turno.',
        },
        {
          icon: 'help',
          title: 'Convenio Sindical',
          body: 'Toda la lógica de llamadas se ajusta a lo establecido en el convenio sindical vigente.',
        },
      ],
    },
  },
  {
    noticia: '¡Cambios en hoteles MVD y MBJ!',
    description: 'Nuevo contrato con Dazzler en MVD y tarifas de acompañantes en el Grand Palladium de MBJ.',
    href: '#',
    detail: {
      eyebrow: 'Actualización de Hoteles',
      title: '¡Cambios en hoteles MVD y MBJ!',
      body: 'Se actualizaron las condiciones de hospedaje para las bases de Montevideo (MVD) y Montego Bay (MBJ). Revisa los detalles de cada hotel a continuación:',
      // TODO: guarda las 2 fotos en public/img/noticia_modal/ con estos
      // nombres exactos (o ajusta las rutas de abajo si usas otros).
      hotels: [
        {
          image: 'img/noticia_modal/hotel_dazzler_mvd.jpg',
          title: 'MVD: Hotel Dazzler',
          subtitle: 'Contrato hasta el 31 de julio del 2029.',
          items: [
            'Incluye desayuno o desayuno de madrugada / to go.',
            'Wi-Fi incluido.',
            'Por día, 1 botella de agua por cada tripulante.',
            'Room service.',
            '20% de descuento en F&B.',
            'Servicio de Lavandería (2 prendas de uniforme pernocte).',
          ],
        },
        {
          image: 'img/noticia_modal/hotel_grand_palladium_mbj.jpg',
          title: 'MBJ: Hotel Grand Palladium',
          subtitle: 'Tarifas para acompañantes — del 1 de agosto al 19 de diciembre de 2026.',
          items: [
            'Acompañante 1: USD 86.36 + 10% + GART USD 4 per room per night.',
            'Acompañante 2: USD 136.36 + 10% + GART USD 4 per room per night.',
            'Niños 3-12 años: USD 86.36 + 10% + GART USD 4 per room per night.',
          ],
        },
      ],
    },
  },
]
