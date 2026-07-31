// ============================================================================
// SAB Portal — migración a Web App con Google Apps Script.
//
// Por qué existe esto: la empresa no permite desplegar el sitio en GitHub
// Pages / GitLab Pages, así que el mismo diseño (idéntico, mismo sistema de
// clases/colores/animaciones) se reconstruye aquí como una Web App de Apps
// Script, servida desde HtmlService en vez de un build de Vite.
//
// Estructura de archivos de este proyecto:
//   Code.gs        este archivo: enrutamiento (doGet) + helper de imágenes
//   Index.html     shell HTML: <head>, incluye Styles.html, Header.html,
//                  el contenido de la página activa, Footer.html y Scripts.html
//   Styles.html    generado con `npx tailwindcss -i ./src/index.css -o …`
//                  (mismas clases utilitarias que el proyecto React — no se
//                  edita a mano, se regenera si cambia el diseño)
//   Header.html    header + mega-menú desktop + drawer mobile
//   Footer.html
//   Home.html      hero + carrusel de novedades + tarjetas de módulos + FAQ
//                  + Centro de Ayuda (home actual)
//   Placeholder.html  página temporal para módulos aún no migrados
//   Modals.html    modal de detalle de noticia + modal Reporte Diario +
//                  modal Absentismo (se muestran/ocultan con JS, no navegan)
//   Scripts.html   todo el JS del sitio (menú, carrusel, acordeón FAQ, modales)
//
// Cómo desplegar:
//   1. Crea un proyecto nuevo en https://script.google.com (o Extensiones >
//      Apps Script desde un Sheet/Doc si prefieres, da igual para una Web App).
//   2. Crea cada archivo de esta carpeta con el mismo nombre exacto (los
//      .html como "Archivo HTML", Code.gs ya viene creado por defecto).
//   3. Completa DRIVE_ASSETS más abajo con los IDs reales de Drive (ver
//      instrucciones en el mensaje del chat).
//   4. Implementar > Nueva implementación > Aplicación web.
//      - Ejecutar como: Yo
//      - Quién tiene acceso: según a quién le quieras dar acceso (ej. "Cualquier
//        persona de LATAM" si tu Workspace lo permite, o "Cualquier persona").
// ============================================================================

// IDs de archivo de Google Drive para las imágenes pesadas (fotos/logo) que
// no conviene incrustar como base64 en el HTML. Sube estos archivos a una
// carpeta de Drive, compártela como "Cualquier persona con el enlace: Lector",
// y reemplaza cada valor por el ID real (lo sacas de la URL para compartir
// de cada archivo: .../d/ESTE_ES_EL_ID/view).
const DRIVE_ASSETS = {
  hero: 'REEMPLAZAR_ID_HERO_PNG',
  tituloHero: 'REEMPLAZAR_ID_TITULO_HERO_PNG',
  logoLatam: 'REEMPLAZAR_ID_LOGO_LATAM_PNG',
  noticiaReembolso: 'REEMPLAZAR_ID_PLAZO_REEMBOLSO_PNG',
}

function doGet(e) {
  const page = (e.parameter.page || 'home').toLowerCase()
  const template = HtmlService.createTemplateFromFile('Index')
  template.page = page
  template.itemId = e.parameter.item || ''
  return template
    .evaluate()
    .setTitle('SAB Perú · Servicio a Bordo — LATAM Airlines')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

// Permite que un .html incluya a otro con <?!= include('NombreDeArchivo') ?>
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}

// URL directa de una imagen alojada en Drive, lista para usar en <img src>.
// Requiere que el archivo esté compartido como "Cualquier persona con el
// enlace". El parámetro de ancho (w) evita que Drive sirva la imagen a su
// resolución original completa cuando no hace falta.
function driveImg(key, width) {
  const id = DRIVE_ASSETS[key]
  if (!id || id.startsWith('REEMPLAZAR')) return ''
  return `https://lh3.googleusercontent.com/d/${id}${width ? '=w' + width : ''}`
}
