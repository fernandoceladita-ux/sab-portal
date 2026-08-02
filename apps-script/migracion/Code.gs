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

// Páginas de módulo ya migradas (con su propio archivo .html). Las que no
// están acá siguen cayendo en Placeholder.html.
const MODULE_PAGES = {
  'gestion-personal': 'GestionPersonal',
}

// Mismos hex que bg-latam-* en tailwind.config.js. Se inyectan como
// style inline en <html> para que el primer frame de cada página ya
// tenga el color de la tarjeta que la abrió (ver pageWipe en Scripts.html)
// — así el parpadeo en blanco mientras carga el CSS de 260KB no se nota,
// porque el fondo ya es el mismo color que la cobertura, no blanco.
const MODULE_COLORS = {
  'gestion-personal': '#4257E8',
  'mi-rol': '#1B0088',
  'gestion-operacional': '#0F004F',
}

function doGet(e) {
  const page = (e.parameter.page || 'home').toLowerCase()
  const template = HtmlService.createTemplateFromFile('Index')
  template.page = page
  template.modulePageFile = MODULE_PAGES[page] || null
  template.itemId = e.parameter.item || ''
  template.scriptUrl = ScriptApp.getService().getUrl()
  template.pageColor = MODULE_COLORS[page] || '#F5F5FA'
  return template
    .evaluate()
    .setTitle('SAB Perú · Servicio a Bordo — LATAM Airlines')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

// Permite que un .html incluya a otro con <?!= include('NombreDeArchivo') ?>.
// Usa createTemplateFromFile (no createHtmlOutputFromFile): esta última sirve
// el archivo tal cual, SIN evaluar sus propios <?= ?> — así que cualquier
// scriptlet dentro del archivo incluido (ej. driveImg(...) en Home.html)
// nunca se procesaba y quedaba como texto literal. `data` es opcional: son
// variables de plantilla (no funciones globales, esas ya son visibles desde
// cualquier archivo) que el archivo incluido necesita y que no vienen del
// template padre — ej. include('GestionPersonal', { itemId: itemId }).
function include(filename, data) {
  const tmpl = HtmlService.createTemplateFromFile(filename)
  if (data) {
    Object.keys(data).forEach((key) => { tmpl[key] = data[key] })
  }
  return tmpl.evaluate().getContent()
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

// ============================================================================
// Actualización de Datos — guardado directo al mismo Google Sheet.
//
// A diferencia de la versión React (que hace `fetch` a un Web App de Apps
// Script SEPARADO, autenticado con un token compartido porque el sitio y la
// hoja viven en proyectos distintos), acá el sitio MISMO es un proyecto de
// Apps Script — así que el formulario llama a `submitActualizacionDatos`
// directo vía `google.script.run` (ver Scripts.html), sin token ni endpoint
// expuesto: Apps Script ya sabe qué usuario ejecuta la llamada.
//
// Mismo Sheet y mismas carpetas de Drive que usa la app React
// (ver /apps-script/Code.gs) — comparten el mismo Google Sheet real.
// ============================================================================

const SHEET_ID = '1WSl5ChIUUzCNO4jcV3UHxVlELuKtja1hHDSZdPJia8U'
const ACTUALIZACION_DATOS_GID = 2110233367
const ACTUALIZACION_DNI_FOLDER_ID = '1uDCbkzcOn8mja8t3GFGjpAoWLzzrAqIh'
const ACTUALIZACION_PASAPORTE_FOLDER_ID = '1Rm0bG2HrXN5G1rtQh0Zrp-ZwELeFhilb'
const ACTUALIZACION_VISA_TRIPULANTE_FOLDER_ID = '1b2HmUomJNp3Pa_6cEQg4DPI_4VaggrCP'
const ACTUALIZACION_VISA_TURISTA_FOLDER_ID = '1CVaFg2hVhRqGTOKhAyi7mfhGmJohp6nC'
const ACTUALIZACION_FIEBRE_FOLDER_ID = '1_ZfdWWM5_PP2eqcE6ULzIXIwT_SEc9ql'
const ACTUALIZACION_LICENCIA_FOLDER_ID = '1_vfAxpYceoOUxkw5fXsBFtoAzwcDnfKQ'

// Máximo de envíos aceptados por minuto, contados globalmente.
const RATE_LIMIT_PER_MINUTE = 20

// Llamada desde Scripts.html vía `google.script.run.submitActualizacionDatos(payload)`.
// Si algo falla, lanzar un Error acá dispara el `withFailureHandler` del cliente.
function submitActualizacionDatos(data) {
  if (!checkRateLimit()) {
    throw new Error('Demasiadas solicitudes en poco tiempo. Intenta de nuevo en un minuto.')
  }

  const bp = String(data.bp || '').trim()
  const nombre = String(data.nombre || '').trim()
  if (!bp || !nombre) {
    throw new Error('BP y nombre son obligatorios')
  }

  const correo = String(data.correo || '').trim().toLowerCase()
  if (!correo.endsWith('@latam.com')) {
    throw new Error('El correo debe ser una cuenta corporativa @latam.com')
  }

  const dniUrl = data.dniArchivo ? uploadFileToDrive(data.dniArchivo, data.dniArchivoNombre, data.dniArchivoTipo, ACTUALIZACION_DNI_FOLDER_ID) : ''
  const pasaporteUrl = data.pasaporteArchivo ? uploadFileToDrive(data.pasaporteArchivo, data.pasaporteArchivoNombre, data.pasaporteArchivoTipo, ACTUALIZACION_PASAPORTE_FOLDER_ID) : ''
  const fiebreUrl = data.fiebreArchivo ? uploadFileToDrive(data.fiebreArchivo, data.fiebreArchivoNombre, data.fiebreArchivoTipo, ACTUALIZACION_FIEBRE_FOLDER_ID) : ''
  const visaTripulanteUrl = data.visaTripulanteArchivo ? uploadFileToDrive(data.visaTripulanteArchivo, data.visaTripulanteArchivoNombre, data.visaTripulanteArchivoTipo, ACTUALIZACION_VISA_TRIPULANTE_FOLDER_ID) : ''
  const visaTuristaUrl = data.visaTuristaArchivo ? uploadFileToDrive(data.visaTuristaArchivo, data.visaTuristaArchivoNombre, data.visaTuristaArchivoTipo, ACTUALIZACION_VISA_TURISTA_FOLDER_ID) : ''
  const licenciaUrl = data.licenciaArchivo ? uploadFileToDrive(data.licenciaArchivo, data.licenciaArchivoNombre, data.licenciaArchivoTipo, ACTUALIZACION_LICENCIA_FOLDER_ID) : ''

  writeToSheet(ACTUALIZACION_DATOS_GID, buildActualizacionDatosRow(data, correo, {
    dniUrl, pasaporteUrl, fiebreUrl, visaTripulanteUrl, visaTuristaUrl, licenciaUrl,
  }))

  return { status: 'ok' }
}

function buildActualizacionDatosRow(data, correo, fileUrls) {
  // Ojo con "Ingresa una foto de tu VISA": el encabezado está DUPLICADO en el
  // Sheet (una vez para Tripulante, otra para Turista, mismo texto literal).
  // `writeToSheet` distingue la 2da aparición agregando " (2)" al buscarla.
  return {
    'Marca temporal': new Date(),
    'Dirección de correo electrónico': sanitizeValue(correo),
    'Ingresa tu BP': sanitizeValue(data.bp),
    'Ingresa tus nombres y apellidos completos': sanitizeValue(data.nombre),
    'Selecciona que actualización deseas realizar': sanitizeValue(data.tramite),
    'Nombre del Contacto de Emergencia': sanitizeValue(data.contactoNombre),
    'Teléfono': sanitizeValue(data.contactoTelefono),
    'Indícanos tu nueva dirección': sanitizeValue(data.direccion),
    'Indícanos el distrito': sanitizeValue(data.distrito),
    'Agregar sus coordenadas': sanitizeValue(data.coordenadas),
    'Fecha vencimiento DNI': sanitizeValue(data.dniVencimiento),
    'Ingresa una foto de tu DNI': fileUrls.dniUrl || '',
    'Ingresa el número de tu nuevo pasaporte': sanitizeValue(data.pasaporteNumero),
    'Fecha de Vencimiento del pasaporte': sanitizeValue(data.pasaporteVencimiento),
    'País emisor de pasaporte': sanitizeValue(data.pasaportePais),
    'Adjunta una foto de tu pasaporte': fileUrls.pasaporteUrl || '',
    'Indícanos qué número de celular deseas que consideremos ahora': sanitizeValue(data.celular),
    'Indícanos qué número de teléfono fijo deseas que consideremos ahora': sanitizeValue(data.telefonoFijo),
    'Fecha de vacunación': sanitizeValue(data.fiebreFecha),
    'Ingresa una foto de tu Certificado Internacional de Vacunación contra la Fiebre Amarilla': fileUrls.fiebreUrl || '',
    'Cuentas con tu pasaporte para ejercer funciones': sanitizeValue(data.rechazoPasaporte),
    'Ingresa el código alfanumérico de tu visa (código en rojo) Tripulante': sanitizeValue(data.visaTripulanteCodigo),
    'Fecha Emisión de VISA Tripulante': sanitizeValue(data.visaTripulanteEmision),
    'Fecha de Vencimiento de VISA Tripulante': sanitizeValue(data.visaTripulanteVencimiento),
    'Ingresa una foto de tu VISA': fileUrls.visaTripulanteUrl || '',
    'Ingresa el código alfanumérico de tu visa (código en rojo) Turista': sanitizeValue(data.visaTuristaCodigo),
    'Fecha Emisión de VISA Turista': sanitizeValue(data.visaTuristaEmision),
    'Fecha de Vencimiento de VISA Turista': sanitizeValue(data.visaTuristaVencimiento),
    'Ingresa una foto de tu VISA (2)': fileUrls.visaTuristaUrl || '',
    'Ingresa el número de tu Licencia de Conducir MTC': sanitizeValue(data.licenciaNumero),
    'Ingresa tu Licencia Peruana:': fileUrls.licenciaUrl || '',
  }
}

function uploadFileToDrive(base64, fileName, mimeType, folderId) {
  if (!base64) return ''
  const folder = DriveApp.getFolderById(folderId)
  const bytes = Utilities.base64Decode(base64)
  const blob = Utilities.newBlob(bytes, mimeType || 'application/octet-stream', fileName || 'documento')
  const file = folder.createFile(blob)
  return file.getUrl()
}

function writeToSheet(targetGid, valuesByHeader) {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  const sheet = ss.getSheets().find((s) => s.getSheetId() === targetGid)
  if (!sheet) throw new Error('No se encontró la pestaña (gid) indicada')

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map((h) => h.toString().trim())

  const seen = {}
  const row = headers.map((header) => {
    seen[header] = (seen[header] || 0) + 1
    const key = seen[header] > 1 ? `${header} (${seen[header]})` : header
    if (key in valuesByHeader) return valuesByHeader[key]
    return header in valuesByHeader ? valuesByHeader[header] : ''
  })
  sheet.appendRow(row)
}

function checkRateLimit() {
  const cache = CacheService.getScriptCache()
  const bucket = 'submits_' + Math.floor(Date.now() / 60000)
  const count = Number(cache.get(bucket) || 0)
  if (count >= RATE_LIMIT_PER_MINUTE) return false
  cache.put(bucket, String(count + 1), 90)
  return true
}

function sanitizeValue(value) {
  if (value === undefined || value === null) return ''
  const str = String(value).slice(0, 500)
  return /^[=+\-@]/.test(str) ? "'" + str : str
}

// Genera las <option> del distrito para el trámite "Actualización Dirección"
// (ver ActualizacionDatosForm.html). Misma lista que usa la app React.
const DISTRITOS = [
  'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla',
  'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria',
  'Lima (Cercado de Lima)', 'Lince', 'Los Olivos', 'Lurigancho-Chosica', 'Lurín',
  'Magdalena del Mar', 'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra',
  'Punta Hermosa', 'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro',
  'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis', 'San Martín de Porres',
  'San Miguel', 'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco',
  'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo',
]

function districtOptionsHtml() {
  return DISTRITOS.map((d) => `<option value="${d}">${d}</option>`).join('\n')
}
