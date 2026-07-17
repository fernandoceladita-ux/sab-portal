# SAB Perú — Portal Servicio a Bordo (LATAM Airlines)

Web interna para tripulantes, construida con **React + Tailwind CSS + Vite**, mobile-first
(pensada para el uso diario desde celular) y con experiencia completa en escritorio.

## Cómo correrlo

Necesitas Node.js 18+ instalado.

```bash
npm install
npm run dev       # entorno de desarrollo, http://localhost:5173
npm run build     # genera la versión de producción en /dist
npm run preview   # sirve /dist localmente para revisarlo
```

> Este proyecto se generó sin conexión a internet en el entorno donde se creó, así que
> `npm install` no se pudo ejecutar aquí para verificarlo. Revisa la consola la primera vez
> que lo corras; si algo no compila, es probablemente un detalle menor de importaciones.

## Estructura

```
src/
  components/         Componentes reutilizables (Header, Footer, Button, cards, campos de formulario...)
    fields/FormFields.jsx   Inputs reutilizables: texto, fecha, select, subir archivo, checkbox/radio, etc.
    icons.jsx               Set propio de íconos SVG (sin dependencias externas)
    TramiteForm.jsx         Formulario multi-paso de "Actualización de Datos" (9 flujos condicionales)
  data/
    menuData.js         Contenido de los 3 menús (Datos Personales / Mi Rol / Gestión Operacional)
    moduleContent.js     Descripciones, tags e imágenes de cada trámite (carrusel)
  pages/
    Home.jsx            Home: hero + 3 tarjetas (visible sin scroll) + FAQ + Centro de Ayuda
    ModulePage.jsx       Página genérica reutilizada por los 3 módulos (banner + carrusel + detalle)
  App.jsx                Rutas
public/img/               Imágenes propias (ver README.txt dentro de actualizacionDatos)
```

## Cómo agregar un nuevo trámite

1. Agrega el ítem en `src/data/menuData.js` dentro del grupo correspondiente (aparece automático
   en el mega-menú del header, en el menú mobile y en el carrusel del módulo).
2. Agrega su descripción/imagen en `src/data/moduleContent.js`.
3. Si necesita un formulario propio (no solo un placeholder), agrégalo dentro de
   `src/components/TramiteForm.jsx` (o crea un componente nuevo) y marca `hasForm: true`
   en `moduleContent.js`.

## Marca

Colores y tipografía definidos en `tailwind.config.js` según el brand book de LATAM:
Noche Profunda `#0F004F`, Noche Estrellada `#1B0088` (dominante), Día Vivo `#4257E8`,
Coral Atardecer `#ED1650`, tipografía Lato (alternativa a LATAM Sans para web).

## Pendiente / próximos pasos sugeridos

- Conectar el envío de `TramiteForm` a tu backend real (Apps Script / BigQuery / AppSheet).
- Completar los formularios de "Mi Rol" y "Gestión Operacional" (hoy muestran un placeholder;
  siguen el mismo patrón que "Actualización de Datos").
- Reemplazar las imágenes de Unsplash por fotografía propia de LATAM si aplica por licencia interna.
