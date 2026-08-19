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
//   Modals.html    modal de detalle de noticia + modal Reportes (Reporte de
//                  Demoras) — se muestran/ocultan con JS, no navegan
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
  hero: '1naWRjC2mqaDFRO8Ii4_BmkU81gbbhFkk',
  tituloHero: '1Ydays4nRyJBy_PZETHoUyss--2h-8YyL',
  logoLatam: '11abTjcpbU5KzruNghEI1SdIHu9zNAVVQ',
  // Versión blanca del logo (se usa arriba de todo, con el header
  // transparente; al hacer scroll y volverse blanco el fondo del header,
  // se intercambia por logoLatam de arriba, a color, para que no se pierda).
  logoLatamWhite: '1bHAo7BH2DZ0clMZ1nuZjzWh8K5aNE-Hf',
  // TODO: pegar los IDs reales de Drive de las noticias del hero (ver
  // Modals.html → modal-news). 6 fotos de personas para "Personas que
  // Inspiran" y 2 fotos de hotel para "Cambios en hoteles MVD y MBJ"
  // (Proyecto GENESYS no usa imágenes). Compartir cada archivo como
  // "Cualquier persona con el enlace: Lector" antes de pegar el ID.
  personaCarolineParra: '1rIqEsxfvMyHRFSKr23JgFlMrShV9pfwx',
  personaRoxanaVillanueva: '11N3mpnpC3qSgqh-4z0QpH4QrVRqgR0q-',
  personaMariaMendoza: '14COOBT6MHw7XUVmDSreGCwWi1XltPxaa',
  personaPaolaGutierrez: '1pX8vwc9h1RCYzz02iZ5aQ9jylD0H7gtY',
  personaRosaChinen: '1bfdQiDJDJzLPltuEgVWCcliVK3iad5tW',
  personaMariaSeoane: '1Ks8xq3BKNDrA_RD7p0-2z6xraBYTbpy2',
  hotelDazzlerMvd: '1ykw6lsb-QtdbYbwUMsV0GYxZXZRg6gJk',
  hotelGrandPalladiumMbj: '1LeCy-cwv3a4RbRU23OCMQdLWOmTMYXxF',
  // TODO: subir a Drive las 6 imágenes de public/img/gestion-operativa/instructivo_vales/
  // (paso1.png, paso2.png, paso3.png, paso4.png, "codigo QR de la app.png",
  // restaurantes_autorizados.png), compartir cada una como "Cualquier persona
  // con el enlace: Lector", y reemplazar los IDs de abajo (ver driveImg()).
  ivalPaso1: '1uyqCHhy_j-mI9kLUgmkWi6E6D5WKI7Vb',
  ivalPaso2: '1-QCLM780SoTYxYMwWmiFtlblDj5BkkGF',
  ivalPaso3: '1hgl13vh39MGJ__aRM8zxqpwp4aUJplkM',
  ivalPaso4: '1fyFbkwdIOE99REPIqL2BQY0_ernsL0RI',
  ivalQr: '1wVTAsdBavm-wzkLS4Ez2dG5QR0Ni7YNz',
  ivalRestaurantes: '1YyPyg0WQNTbI2efGo1waoiQn0ItHJTxE',
  // TODO: pegar los IDs reales de Drive para el header y las 5 tarjetas de
  // Gestión Personal (compartir cada archivo como "Cualquier persona con el
  // enlace: Lector" antes, o driveImg() devolverá '').
  gestionPersonalHero: '1n8-7VZ8wM6Oji-vQqKD6rXsUowIVwHJF',
  actualizacionDatosCard: '1ipjHwJ5UjsrBVdO5jFya3FpYPnZW8KlK',
  renovacionFotocheckCard: '1i_dGezxStUON6DX3k3nUn0km6o83h8Bd',
  domicilioDgacCard: '19AGy4MCn9oWQZAbWdVPZro5TTcERvN30',
  vacunaFiebreAmarillaCard: '1MNnQJ6uPQxIFLxQGcsHPk4er3NqM251v',
  visaPasaporteCard: '1ecYhyLPIbYTdJd2g9CFXDDjfSpRbjrsQ',
  // TODO: pegar los IDs reales de Drive para el header y las 7 tarjetas de
  // Mi Rol (mismo orden que HUB_IDS_MIROL en MiRol.html).
  miRolHero: '1netm7cZDkTjG70sBgjQlHhd5eeI0Nrbi',
  solicitudMesSubsiguienteCard: '1Z_NvThe5EhkBnENbudhbRHQEaKzCPQFY',
  cambiosVoluntariosCard: '1lQ-Pm7QwY9njHa8CyDkcbgg34K8W8Z79',
  descansoMedicoCard: '1J8UOiCkzgR0epPaAnb-QBwHRomUy8vqq',
  seguroMedicoCard: '1da9sXWBKME9a70Qn5uEL3PIUDw5BUT6I',
  cesionVacacionesCard: '1VAiyzD-sRC7Y0g3xRG-lMYl0j3tZzKeP',
  gruposPbsCard: '1ipjHwJ5UjsrBVdO5jFya3FpYPnZW8KlK',
  cambiosWebSabCard: '1pG7nm3IP8lIWPf0ges_W0cTRxasKJ77T',

  gestionOperacionalHero: '1PZ9-miuYDUaibtYeKgFiFqN7tHZ-hyb9',
  instructivoVales: '1zWVWc9-Xg2iIsAR7c7WyIqe_iNTIkDtF',
  consultasViaticos: '1xagbBQxoOrgcff-3DzNlAXzAeTxS3y27',
  cambioUniforme: '1pG7nm3IP8lIWPf0ges_W0cTRxasKJ77T',
  registroEquipos: '1HKAyaA4E6zprT4RJ9Gq5QAazjKRcXTA1'
}

// Páginas de módulo ya migradas (con su propio archivo .html). Las que no
// están acá siguen cayendo en Placeholder.html.
const MODULE_PAGES = {
  'gestion-personal': 'GestionPersonal',
  'mi-rol': 'MiRol',
  'gestion-operacional': 'GestionOperacional',
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
  const itemId = e.parameter.item || ''
  logPageView(page, itemId)
  const template = HtmlService.createTemplateFromFile('Index')
  template.page = page
  template.modulePageFile = MODULE_PAGES[page] || null
  template.itemId = itemId
  template.scriptUrl = ScriptApp.getService().getUrl()
  template.pageColor = MODULE_COLORS[page] || '#F5F5FA'
  return template
    .evaluate()
    .setTitle('SAB Perú · Servicio a Bordo — LATAM Airlines')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

// ============================================================================
// Analytics casero: cada carga de página (?page=...&item=...) dispara doGet()
// de nuevo en el servidor porque el sitio no es una SPA — así que registrar
// "vistas de página" es tan simple como un appendRow acá, sin tocar nada del
// cliente. Guarda en una pestaña "Analytics" propia dentro del mismo Sheet
// (SHEET_ID) que ya usan los trámites; la crea sola la primera vez si no
// existe todavía, con sus encabezados.
//
// Ojo: `Session.getActiveUser().getEmail()` solo devuelve algo si el
// deployment está configurado como "Ejecutar como: Usuario que accede" y el
// acceso está restringido a tu dominio de Workspace — si el deployment es
// "Ejecutar como: Yo" + acceso "Cualquier persona", esta columna va a salir
// vacía siempre (no hay forma de identificar al visitante en ese caso).
const ANALYTICS_SHEET_NAME = 'Analytics'

function logPageView(page, itemId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID)
    let sheet = ss.getSheetByName(ANALYTICS_SHEET_NAME)
    if (!sheet) {
      sheet = ss.insertSheet(ANALYTICS_SHEET_NAME)
      sheet.appendRow(['Marca temporal', 'Página', 'Ítem/Sección', 'Correo'])
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold')
    }
    let correo = ''
    try {
      correo = Session.getActiveUser().getEmail() || ''
    } catch (err) {
      correo = ''
    }
    sheet.appendRow([new Date(), page, itemId, correo])
  } catch (err) {
    // Un fallo al loguear (ej. permisos, cuota) nunca debe romper la carga
    // de la página — se ignora silenciosamente.
  }
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

// Mismo GID/carpeta que usa la app React (ver /apps-script/Code.gs) para
// el trámite "Domicilio DGAC" — comparten el mismo Sheet y Drive reales.
const DOMICILIO_DGAC_GID = 1159770071
const DOMICILIO_DGAC_FOLDER_ID = '1SAGqcibpIRcBgceY1y7D_GxalFzug4do'

// Mismos GID/carpeta que usa la app React (ver /apps-script/Code.gs) para
// los trámites del módulo "Mi Rol" — comparten el mismo Sheet y Drive reales.
const MES_SUBSIGUIENTE_GID = 1379865326
const DESCANSO_MEDICO_GID = 1801672376
const DESCANSO_MEDICO_FOLDER_ID = '1GD46b5Zigv8wSKE2jdpNwJnJV3-JH4JW'
const VACACIONES_GID = 1772728526

// Mismos GID/carpeta que usa la app React (ver /apps-script/Code.gs) para
// los trámites del módulo "Gestión Operacional" — comparten el mismo Sheet
// y Drive reales.
const UNIFORMES_GID = 815933579 // ya no se escribe acá, ver UNIFORMES_LANYARD_GID / UNIFORMES_CALIDAD_GID
const UNIFORMES_FOLDER_ID = '1ivO-uXw8HWzFICk0w3RzPwUv7tnYHNDT'

// Cambio de Uniforme se guardaba antes en 2 Google Forms/Sheets separados
// (uno por canal). Migramos de vuelta a 2 pestañas —mismo Sheet por ahora,
// pero con los headers EXACTOS de esos sheets originales— para que el día
// que se apunte directo a los sheets legacy solo haya que cambiar el GID acá,
// sin tocar el mapeo de columnas.
const UNIFORMES_LANYARD_GID = 784092675
const UNIFORMES_CALIDAD_GID = 1182245477
const REGISTRO_SUNAT_GID = 1592932357

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

// Llamada desde DomicilioDgacScript.html vía
// `google.script.run.submitDomicilioDgac(payload)`.
function submitDomicilioDgac(data) {
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

  const licenciaUrl = data.licenciaArchivo
    ? uploadFileToDrive(data.licenciaArchivo, data.licenciaArchivoNombre, data.licenciaArchivoTipo, DOMICILIO_DGAC_FOLDER_ID)
    : ''

  writeToSheet(DOMICILIO_DGAC_GID, buildDomicilioDgacRow(data, correo, licenciaUrl))
  return { status: 'ok' }
}

function buildDomicilioDgacRow(data, correo, licenciaUrl) {
  return {
    'Marca temporal': new Date(),
    'Correo': sanitizeValue(correo),
    'BP': sanitizeValue(data.bp),
    'Nombre': sanitizeValue(data.nombre),
    'Tipo de Actualización': sanitizeValue(data.tipo),
    'Nueva Dirección': sanitizeValue(data.direccion),
    'Distrito': sanitizeValue(data.distrito),
    'Coordenadas': sanitizeValue(data.coordenadas),
    'Foto Nueva Licencia DGAC': licenciaUrl || '',
  }
}

// Llamada desde SolicitudMesSubsiguienteScript.html vía
// `google.script.run.submitMesSubsiguiente(payload)`.
function submitMesSubsiguiente(data) {
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

  writeToSheet(MES_SUBSIGUIENTE_GID, buildMesSubsiguienteRow(data, correo))
  return { status: 'ok' }
}

// Texto legible que se guarda en "Selecciona el tipo de solicitud que deseas
// realizar", reconstruido a partir de las opciones del Paso 2 del site
// (ver SolicitudMesSubsiguienteView.html) — el payload solo trae el id corto
// (afectacion/adicionales/jefatura/documentacion/permisos).
const MES_NOVEDAD_LABELS = {
  afectacion: 'Libre compensado por afectación (> 06:00 hrs)',
  adicionales: 'Libre compensado por vuelos adicionales',
  jefatura: 'Libre aprobado por jefatura directa',
  documentacion: 'Trámites de Documentación Técnica',
  permisos: 'Solicitud de Permisos Especiales',
}

function buildMesSubsiguienteRow(data, correo) {
  const tipoPermiso = String(data.tipoPermiso || '').trim()
  const documentoTecnico = String(data.documentoTecnico || '').trim()

  return {
    'Marca temporal': new Date(),
    'Dirección de correo electrónico': sanitizeValue(correo),
    'Ingresa tu BP': sanitizeValue(data.bp),
    'Ingresa tus nombres y apellidos completos': sanitizeValue(data.nombre),
    // Para "Solicitud de Permisos Especiales" y "Documentación Técnica" se
    // guarda el tipo/documento elegido tal cual (no la etiqueta genérica del
    // paso 2) — así queda igual que en el Sheet original.
    'Selecciona el tipo de solicitud que deseas realizar': sanitizeValue(
      data.novedad === 'permisos' ? tipoPermiso
        : data.novedad === 'documentacion' ? documentoTecnico
        : (MES_NOVEDAD_LABELS[data.novedad] || data.novedad)
    ),

    // Panel "Permisos Especiales": el site pide una sola Fecha de
    // inicio/fin genérica; el Sheet original tenía una columna por tipo
    // de permiso. Se enruta el mismo valor ingresado a la columna que
    // corresponde según el tipo elegido, dejando las demás vacías.
    'Fecha de inicio (Matrimonio)': tipoPermiso === 'Permiso por matrimonio' ? sanitizeValue(data.fechaInicioPermiso) : '',
    'Fecha de fin (Matrimonio)': tipoPermiso === 'Permiso por matrimonio' ? sanitizeValue(data.fechaFinPermiso) : '',
    'Fecha de inicio (Paternidad)': tipoPermiso === 'Permiso por paternidad' ? sanitizeValue(data.fechaInicioPermiso) : '',
    'Fecha de fin (Paternidad)': tipoPermiso === 'Permiso por paternidad' ? sanitizeValue(data.fechaFinPermiso) : '',
    'Fecha (Mudanza)': tipoPermiso === 'Permiso por mudanza' ? sanitizeValue(data.fechaInicioPermiso) : '',
    'Fecha (Boda Familiar Directo)': tipoPermiso === 'Permiso por boda de familiar directo' ? sanitizeValue(data.fechaInicioPermiso) : '',

    // Panel "Documentación Técnica": Gestión de Visa usa el bloque
    // combinado (con comentario); Gestión de Pasaporte usa el bloque
    // genérico, sin comentario (confirmado contra el Form original:
    // sección "Gestión de visa" vs "Gestión de pasaporte").
    'Fecha Cita / Fecha de entrega de pasaporte por renovación de visa': documentoTecnico === 'Gestión Visa Crew y/o Turista' ? sanitizeValue(data.fechaCita) : '',
    'Hora Cita / Hora entrega pasaporte por renovación de visa': documentoTecnico === 'Gestión Visa Crew y/o Turista' ? sanitizeValue(data.horaCita) : '',
    'Comentario adicional (Gestión Visa Crew y/o Turista)': documentoTecnico === 'Gestión Visa Crew y/o Turista' ? sanitizeValue(data.comentario4) : '',
    'Fecha Cita': documentoTecnico === 'Gestión Pasaporte' ? sanitizeValue(data.fechaCita) : '',
    'Hora Cita': documentoTecnico === 'Gestión Pasaporte' ? sanitizeValue(data.horaCita) : '',

    'Fecha de afectación de libre': sanitizeValue(data.fechaAfectacion),
    'Número de vuelo (Afectación)': sanitizeValue(data.numVuelo1),
    'Ruta (Afectación)': sanitizeValue(data.ruta1),
    'Hora de llegada de vuelo': sanitizeValue(data.horaLlegada1),
    'Comentario adicional (Afectación)': sanitizeValue(data.comentario1),

    'Fecha de afectación de vuelos adicionales': sanitizeValue(data.fechaVuelosAdicionales),
    'Número de vuelo (Vuelos Adicionales)': sanitizeValue(data.numVuelo2),
    'Ruta (Vuelos Adicionales)': sanitizeValue(data.ruta2),
    'Fecha que deseo mi libre (mes subsiguiente)': sanitizeValue(data.mesLibreDeseado),
    'Comentario adicional (Vuelos Adicionales)': sanitizeValue(data.comentario2),

    'Fecha de libre': sanitizeValue(data.fechaLibreJefatura),
    'Motivo de la otorgación del libre': sanitizeValue(data.motivoJefatura),

    // 'Estado de Solicitud', 'Freeze', 'CPL', 'Comentarios', 'Comentarios2',
    // 'Enviar correo' y 'Status de correo' son columnas de uso manual del
    // equipo de Roles — no se completan desde el formulario.
  }
}

// Llamada desde DescansoMedicoScript.html vía
// `google.script.run.submitDescansoMedico(payload)`.
function submitDescansoMedico(data) {
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

  const documentoUrl = data.documentoDM
    ? uploadFileToDrive(data.documentoDM, data.documentoDMNombre, data.documentoDMTipo, DESCANSO_MEDICO_FOLDER_ID)
    : ''

  writeToSheet(DESCANSO_MEDICO_GID, buildDescansoMedicoRow(data, correo, documentoUrl))
  return { status: 'ok' }
}

function buildDescansoMedicoRow(data, correo, documentoUrl) {
  return {
    'Marca temporal': new Date(),
    'Correo': sanitizeValue(correo),
    'BP': sanitizeValue(data.bp),
    'Nombre': sanitizeValue(data.nombre),
    'Filial': sanitizeValue(data.filial),
    'Rank': sanitizeValue(data.rank),
    'Fecha de Inicio DM': sanitizeValue(data.fechaInicio),
    'Fecha de Término DM': sanitizeValue(data.fechaFin),
    'Documento DM': documentoUrl || '',
  }
}

// Llamada desde VacacionesScript.html vía
// `google.script.run.submitVacaciones(payload)`.
function submitVacaciones(data) {
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

  writeToSheet(VACACIONES_GID, buildVacacionesRow(data, correo))
  return { status: 'ok' }
}

function buildVacacionesRow(data, correo) {
  return {
    'Marca temporal': new Date(),
    'Correo': sanitizeValue(correo),
    'BP': sanitizeValue(data.bp),
    'Nombre': sanitizeValue(data.nombre),
    'Categoría': sanitizeValue(data.categoria),
    'Tipo de Solicitud': sanitizeValue(data.tipo),
    'Mes Solicitado (Adicionales)': sanitizeValue(data.mesAdicionales),
    'Días Solicitados': sanitizeValue(data.diasAdicionales),
    'Sustento': sanitizeValue(data.sustento),
    'BP Compañero (Cambio)': sanitizeValue(data.companeroBP),
    'Nombre Compañero (Cambio)': sanitizeValue(data.companeroNombre),
    'Mes Original (Cambio)': sanitizeValue(data.mesCambio),
    'BP Beneficiario (Cesión)': sanitizeValue(data.beneficiarioBP),
    'Nombre Beneficiario (Cesión)': sanitizeValue(data.beneficiarioNombre),
    'Bloque de Días a Ceder (Cesión)': sanitizeValue(data.bloqueDias),
  }
}

// Llamada desde UniformesScript.html vía
// `google.script.run.submitCambioUniforme(payload)`.
// A diferencia de los demás trámites, Cambio de Uniforme no tiene un único
// campo bp/nombre (varía según canal: lanyard o calidad), así que valida
// correo/nombreColaborador en vez de la regla genérica bp+nombre.
function submitCambioUniforme(data) {
  if (!checkRateLimit()) {
    throw new Error('Demasiadas solicitudes en poco tiempo. Intenta de nuevo en un minuto.')
  }

  const correo = String(data.correo || '').trim().toLowerCase()
  if (!correo.endsWith('@latam.com')) {
    throw new Error('El correo debe ser una cuenta corporativa @latam.com')
  }
  if (!String(data.nombreColaborador || '').trim()) {
    throw new Error('Nombre y apellidos son obligatorios')
  }

  // Cada canal va a su propia pestaña con headers idénticos al sheet legacy
  // correspondiente (ver comentario en UNIFORMES_LANYARD_GID más arriba).
  if (data.canal === 'lanyard') {
    writeToSheet(UNIFORMES_LANYARD_GID, buildLanyardRow(data, correo))
    return { status: 'ok' }
  }

  if (data.canal === 'calidad') {
    const fotoUrl = data.calidadFoto
      ? uploadFileToDrive(data.calidadFoto, data.calidadFotoNombre, data.calidadFotoTipo, UNIFORMES_FOLDER_ID)
      : ''
    writeToSheet(UNIFORMES_CALIDAD_GID, buildCalidadRow(data, correo, fotoUrl))
    return { status: 'ok' }
  }

  throw new Error('Canal no reconocido')
}

// Headers idénticos al Google Sheet original de "Solicitud de Lanyards
// Región Andina" (Marca temporal, Dirección de correo electrónico, Ingresar
// BP, Motivo, Nombre, Base).
function buildLanyardRow(data, correo) {
  return {
    'Marca temporal': new Date(),
    'Dirección de correo electrónico': sanitizeValue(correo),
    'Ingresar BP': sanitizeValue(data.lanyardBP),
    'Motivo': sanitizeValue(data.motivo),
    'Nombre': sanitizeValue(data.lanyardNombre),
    'Base': sanitizeValue(data.base),
  }
}

// Headers idénticos al Google Sheet original de "Formulario de reclamos de
// calidad de prendas LP" (las columnas RECIBIDO / SOLICITUD DE EMERGENCIA /
// ENTREGA / CASOS CALIDAD / FOTO las llena el equipo a mano después, no el
// formulario — si esa pestaña las tiene, quedan vacías y no pasa nada).
function buildCalidadRow(data, correo, fotoUrl) {
  return {
    'Marca temporal': new Date(),
    'Dirección de correo electrónico': sanitizeValue(correo),
    'BP': sanitizeValue(data.calidadBP),
    'NOMBRE': sanitizeValue(data.calidadNombre),
    'Descripción de solicitud por calidad': sanitizeValue(data.calidadTipo),
    'Detallar cual fue el error en la talla o el problema por la mala calidad': sanitizeValue(data.calidadDetalle),
    'SUBIR FOTO DE PRENDA O ARTÍCULO CON ETIQUETA (es necesario para que se identifique qué proveedor es).': fotoUrl || '',
  }
}

// Llamada desde RegistroSunatScript.html vía
// `google.script.run.submitRegistroSunat(payload)`.
function submitRegistroSunat(data) {
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

  writeToSheet(REGISTRO_SUNAT_GID, buildRegistroSunatRow(data, correo))
  return { status: 'ok' }
}

// Headers idénticos al Google Sheet original de "Registro de Equipos SUNAT"
// (las columnas Fecha de Registro / Status / Comentario / Tiempo de
// Respuesta a TC (días) las llena el equipo a mano después, no el
// formulario — si la pestaña las tiene, quedan vacías y no pasa nada).
function buildRegistroSunatRow(data, correo) {
  return {
    'Marca temporal': new Date(),
    'Dirección de correo electrónico': sanitizeValue(correo),
    'BP': sanitizeValue(data.bp),
    'APELLIDOS Y NOMBRES': sanitizeValue(data.nombre),
    'PASAPORTE': sanitizeValue(data.pasaporte),
    'TIPO DE EQUIPO': sanitizeValue(data.tipoEquipo),
    'USO': sanitizeValue(data.uso),
    'MARCA': sanitizeValue(data.marca),
    'MODELO (sin guiones)': sanitizeValue(data.modelo),
    'SERIE (sin guiones)': sanitizeValue(data.serie),
    'FECHA DE NACIMIENTO (dd/mm/aaaa)': sanitizeValue(data.fechaNacimiento),
  }
}

// ============================================================================
// Reportes — modal "Reportes" en Home (Centro de Ayuda y Reportes). Por
// ahora solo existe el tipo "Reporte de Demoras", con 2 sub-tipos que van
// cada uno a su propia pestaña, con headers idénticos a los Sheets
// originales de AppSheet. Se puede sumar más tipos de reporte más adelante
// sin tocar lo ya armado acá.
//
// En AppSheet, id/codigo_operacion/pais/correo/fecha_hora se llenan solos
// (cuenta de Google + fórmula); acá no hay ese contexto automático, así que
// correo/bp/nombre/categoria/correo_cpl los pide el formulario, y
// id/codigo_operacion/pais/fecha_hora se arman en el servidor.
// ============================================================================

// TODO: crear ambas pestañas en el mismo Sheet (SHEET_ID) con esos headers
// exactos ("Pago_Demora_4H_Sin_Hotel_LP" / "Pago_Demora_145_Fuera_Avion_LP")
// y reemplazar estos -1 por el gid real de cada una (el número después de
// #gid= en la URL de esa pestaña). -1 nunca es un gid real, así que mientras
// no se reemplace, writeToSheet falla con un error claro en vez de escribir
// por accidente en la pestaña equivocada.
const DEMORA_SIN_HOTEL_GID = 523210422
const DEMORA_FUERA_AVION_GID = 345983368
// TODO: crear una carpeta en Drive para los "Archivo de referencia" de este
// reporte, compartirla como "Cualquier persona con el enlace: Lector", y
// pegar el ID acá (ver driveImg()/demás *_FOLDER_ID para el formato).
const DEMORA_ARCHIVO_FOLDER_ID = '1CjlIt4LLX9APfxtFuAgw8rvq__yvAPbG'

const DEMORA_TIPO_LABELS = {
  'sin-hotel': 'Pago por demora de vuelo > 4 horas sin beneficio de espera en hotel - LP',
  'fuera-avion': 'Pago por demora de vuelo inicial > 1:45 horas fuera del avión - LP',
}

// Llamada desde ReportesScript.html vía `google.script.run.submitReporteDemora(payload)`.
function submitReporteDemora(data) {
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

  const subtipo = String(data.subtipo || '').trim()
  if (subtipo !== 'sin-hotel' && subtipo !== 'fuera-avion') {
    throw new Error('Selecciona el tipo de demora que deseas reportar')
  }

  const archivoUrl = data.archivo
    ? uploadFileToDrive(data.archivo, data.archivoNombre, data.archivoTipo, DEMORA_ARCHIVO_FOLDER_ID)
    : ''

  // Mismo formato de id corto (8 caracteres hex) que ya usa AppSheet para
  // armar 'codigo_operacion' — ahí sale solo, acá se arma a mano.
  const id = Utilities.getUuid().split('-')[0]
  const pais = 'LP' // fijo por ahora — más adelante puede variar (ver conversación).
  const codigoOperacion = id + '-LATAM-' + pais

  if (subtipo === 'sin-hotel') {
    writeToSheet(DEMORA_SIN_HOTEL_GID, buildDemoraSinHotelRow(data, correo, id, codigoOperacion, pais, archivoUrl))
  } else {
    writeToSheet(DEMORA_FUERA_AVION_GID, buildDemoraFueraAvionRow(data, correo, id, codigoOperacion, pais, archivoUrl))
  }

  return { status: 'ok' }
}

function buildDemoraSinHotelRow(data, correo, id, codigoOperacion, pais, archivoUrl) {
  return {
    'pago_demora_4h_sin_hotel_lp_id': id,
    'codigo_operacion': codigoOperacion,
    'pais': pais,
    'correo': sanitizeValue(correo),
    'fecha_hora': new Date(),
    'bp': sanitizeValue(data.bp),
    'nombre': sanitizeValue(data.nombre),
    'categoria': sanitizeValue(data.categoria),
    'correo_cpl': sanitizeValue(data.correoCpl),
    'tipo': DEMORA_TIPO_LABELS['sin-hotel'],
    'demora_mayor_4h_sin_hotel': sanitizeValue(data.demoraSiNo),
    'fecha': sanitizeValue(data.fecha),
    'numero_vuelo': sanitizeValue(data.numeroVuelo),
    'tripulacion': sanitizeValue(data.tripulacion),
    'comentario_adicional': sanitizeValue(data.comentarioAdicional),
    'archivo_referencia': archivoUrl || '',
    'ATO': sanitizeValue(data.ato),
    'Validación MD': sanitizeValue(data.validacionMd),
  }
}

function buildDemoraFueraAvionRow(data, correo, id, codigoOperacion, pais, archivoUrl) {
  return {
    'pago_demora_145_fuera_avion_lp_id': id,
    'codigo_operacion': codigoOperacion,
    'pais': pais,
    'correo': sanitizeValue(correo),
    'fecha_hora': new Date(),
    'bp': sanitizeValue(data.bp),
    'nombre': sanitizeValue(data.nombre),
    'categoria': sanitizeValue(data.categoria),
    'correo_cpl': sanitizeValue(data.correoCpl),
    'tipo': DEMORA_TIPO_LABELS['fuera-avion'],
    'demora_mayor_145_fuera_avion': sanitizeValue(data.demoraSiNo),
    'fecha': sanitizeValue(data.fecha),
    'numero_vuelo': sanitizeValue(data.numeroVuelo),
    'tripulacion': sanitizeValue(data.tripulacion),
    'comentario_adicional': sanitizeValue(data.comentarioAdicional),
    'archivo_referencia': archivoUrl || '',
  }
}

// ============================================================================
// Consultas Soporte SAB — modal en Home (Centro de Ayuda y Reportes). Antes
// vivía en AppSheet, con una vista distinta por filial (LP/4C/XL) y ~25
// temas, cada uno resuelto por un responsable fijo. Se migra de a poco: por
// ahora solo estos 5 temas y solo LP; el resto (y 4C/XL) se agregan más
// adelante sumando entradas a CONSULTAS_TEMAS, sin tocar submitConsultaSoporte.
//
// Vive en un Google Sheet APARTE del resto del sitio (no usa SHEET_ID) — por
// eso usa writeToSheetIn en vez de writeToSheet.
//
// Igual que en Reportes: id/codigo_operacion/pais/fecha_hora se arman acá
// (antes salían solos de AppSheet). A diferencia de Reportes, acá
// coordinador_responsable TAMPOCO se pide al tripulante: se resuelve
// automático buscando el tema en la pestaña de Responsables (ver
// resolveCoordinadorResponsable) — cada tema ya tiene un responsable fijo.
// ============================================================================

const CONSULTAS_SHEET_ID = '1nmB84XLrocV_MCYchPK5g1ypqj5mHQf0Pe_cY_eq7YM'
const CONSULTAS_RESPONSABLES_GID = 297897581

// Cada tema tiene su propio gid de Sheet y su propia carpeta de Drive, por
// país. Por ahora solo LP está armado (gid/folder reales); cuando tengas los
// de 4C y XL, se agregan como una clave más dentro de gidByPais/folderIdByPais
// de CADA tema — no hace falta tocar submitConsultaSoporte.
// `temaSheet` es el texto EXACTO tal como aparece en la columna "Tema" de la
// pestaña de Responsables (gid 297897581) — se usa para resolver el
// coordinador_responsable. `idColumnKey` es el nombre real del primer header
// de cada hoja (ej. "lck_lp_id") — los 5 confirmados contra el header real.
const CONSULTAS_TEMAS = {
  lck: {
    label: 'Verificación de Competencia / Chequeo en línea / Hands on (LCK)',
    temaSheet: 'Verificación de Competencia / Chequeo en línea / Hands on (LCK)',
    idColumnKey: 'lck_lp_id', // confirmado
    gidByPais: { LP: 1441840812 },
    folderIdByPais: { LP: '1Uw4p4xg0VuB3BZ4YXArvCDiyQ10W1gNW' },
  },
  aptoMedico: {
    label: 'Apto Médico',
    temaSheet: 'Apto Médico',
    idColumnKey: 'apto_medico_lp_id', // confirmado
    gidByPais: { LP: 1888173382 },
    folderIdByPais: { LP: '1IGkN2MG9HqbPwmbTdozt70CHWbnBdRRe' },
  },
  reva: {
    label: 'Curso Entrenamiento Periódico (Reva)',
    temaSheet: 'Curso Entrenamiento Periódico (Reva)',
    idColumnKey: 'reva_lp_id', // confirmado
    gidByPais: { LP: 1065806131 },
    folderIdByPais: { LP: '1TWSE3S5G8c-QB1twAhivzIiQUP27cexS' },
  },
  experienciaReciente: {
    label: 'Experiencia reciente 90 días / Re-entrenamiento Vuelo',
    temaSheet: 'Experiencia reciente 90 días / Re-entrenamiento Vuelo',
    idColumnKey: 'experiencia_reciente_lp_id', // confirmado
    gidByPais: { LP: 1978889809 },
    folderIdByPais: { LP: '1X7cWj_G_W5GqsjuEE_Gu2un__tp0jdSk' },
  },
  licenciaLocal: {
    label: 'Licencia Local / Convalidación Licencia Chilena',
    temaSheet: 'Licencia Local / Convalidación Licencia Chilena',
    idColumnKey: 'lic_local_conv_lic_chilena_lp_id', // confirmado
    gidByPais: { LP: 298358111 },
    folderIdByPais: { LP: '15cS8x7jmt9IPXYl9MBCmPh54NH5-cyh5' },
  },
  // Segunda tanda (misma mecánica, todavía falta la carpeta de Drive de cada
  // una — quedan con REEMPLAZAR hasta que las crees y me pases los IDs).
  recalificacionInicial50: {
    label: 'Curso Recalificación (Inicial al 50%)',
    temaSheet: 'Curso Recalificación (Inicial al 50%)',
    idColumnKey: 'recalificacion_inicial_50_lp_id', // confirmado
    gidByPais: { LP: 9456956 },
    folderIdByPais: { LP: '1p0GrLNZoHrL6EV0yoKZ2HNd3Ltx8q48I' },
  },
  transicionHabilitacion: {
    label: 'Curso Transición Flota (Bi o Tri-habilitación) - Solo Perú',
    temaSheet: 'Curso Transición Flota (Bi o Tri-habilitación) - Solo Perú',
    idColumnKey: 'transicion_habilitacion_lp_id', // confirmado
    gidByPais: { LP: 1378690069 },
    folderIdByPais: { LP: '18_tCCmLZmHvk61tQIfNrDSJyQ1omK-Pd' },
  },
  dmpSick: {
    label: 'Descanso Médico Prolongado (DMP/SICK)',
    temaSheet: 'Descanso Médico Prolongado (DMP/SICK)',
    idColumnKey: 'dmp_sick_lp_id', // confirmado
    gidByPais: { LP: 908218918 },
    folderIdByPais: { LP: '13G2fZReKn0qqPCV84cOmRLFWpX4W6HSl' },
  },
  licenciaSinSueldo: {
    label: 'Licencia sin sueldo (LSG/LNP)',
    temaSheet: 'Licencia sin sueldo (LSG/LNP)',
    idColumnKey: 'licencia_sin_sueldo_lp_id', // confirmado
    gidByPais: { LP: 1579743640 },
    folderIdByPais: { LP: '1IMIUePiGyATl7r-27RHFHkOJrltErSgb' },
  },
  natalidad: {
    label: 'Natalidad (NAT/LP)',
    temaSheet: 'Natalidad (NAT/LP)',
    idColumnKey: 'natalidad_lp_id', // confirmado
    gidByPais: { LP: 1621001756 },
    folderIdByPais: { LP: '1Ay-DVZ6tcZ7258j7aAWu7d3yHZbUrFsH' },
  },
  valeEdenred: {
    label: 'Vale de Alimentación: Edenred + High Rank',
    temaSheet: 'Vale de Alimentación: Edenred + High Rank',
    idColumnKey: 'vale_edenred_lp_id', // confirmado
    gidByPais: { LP: 1447837966 },
    folderIdByPais: { LP: '1q5k_QIFl1dKoEQc7gSV4B53XXfcuV0y7' },
  },
  cancelacionVacacionesMaternidad: {
    label: 'Cancelación de vacaciones por maternidad',
    temaSheet: 'Cancelación de vacaciones por maternidad',
    idColumnKey: 'cancelacion_vacaciones_maternidad_lp_id', // confirmado
    gidByPais: { LP: 2132606979 },
    folderIdByPais: { LP: '1e8ICsye_5qRonpIQ37fXPIo_qtOszttP' },
  },
}

// Llamada desde ConsultasScript.html vía `google.script.run.submitConsultaSoporte(payload)`.
function submitConsultaSoporte(data) {
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

  const temaConfig = CONSULTAS_TEMAS[data.tema]
  if (!temaConfig) {
    throw new Error('Selecciona el tema de tu consulta')
  }

  const pais = 'LP' // fijo por ahora — más adelante vendrá de un selector de filial.
  const gid = temaConfig.gidByPais[pais]
  const folderId = temaConfig.folderIdByPais[pais]
  if (!gid || !folderId) {
    throw new Error('Este tema todavía no está disponible para tu filial')
  }

  const archivoUrl = data.archivo
    ? uploadFileToDrive(data.archivo, data.archivoNombre, data.archivoTipo, folderId)
    : ''

  // Mismo formato de id corto (8 hex) y codigo_operacion que ya usa Reportes.
  const id = Utilities.getUuid().split('-')[0]
  const codigoOperacion = id + '-LATAM-' + pais
  const coordinadorResponsable = resolveCoordinadorResponsable(temaConfig.temaSheet, pais)

  writeToSheetIn(CONSULTAS_SHEET_ID, gid, {
    [temaConfig.idColumnKey]: id,
    'codigo_operacion': codigoOperacion,
    'pais': pais,
    'correo': sanitizeValue(correo),
    'fecha_hora': new Date(),
    'bp': sanitizeValue(data.bp),
    'nombre': sanitizeValue(data.nombre),
    'categoria': sanitizeValue(data.categoria),
    'correo_cpl': sanitizeValue(data.correoCpl),
    'tipo': temaConfig.label,
    'coordinador_responsable': coordinadorResponsable,
    'consulta': sanitizeValue(data.consulta),
    'archivo_referencia': archivoUrl || '',
  })

  return { status: 'ok' }
}

// Busca en la pestaña de Responsables (gid 297897581, misma spreadsheet que
// Consultas) la fila cuyo "Tema" coincide exacto y cuyo "Pais" (separado por
// comas, ej. "LP,4C") incluye el país dado. Devuelve el Responsable, o ''
// si no encuentra match (el equipo de soporte lo completa a mano en ese caso).
function resolveCoordinadorResponsable(temaSheet, pais) {
  const ss = SpreadsheetApp.openById(CONSULTAS_SHEET_ID)
  const sheet = ss.getSheets().find((s) => s.getSheetId() === CONSULTAS_RESPONSABLES_GID)
  if (!sheet) return ''

  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return ''
  const rows = sheet.getRange(2, 1, lastRow - 1, 3).getValues() // Tema, Responsable, Pais

  const match = rows.find((row) => {
    const tema = String(row[0]).trim()
    const paises = String(row[2]).split(',').map((p) => p.trim())
    return tema === temaSheet && paises.includes(pais)
  })
  return match ? String(match[1]).trim() : ''
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
  writeToSheetIn(SHEET_ID, targetGid, valuesByHeader)
}

// Igual que writeToSheet, pero permite apuntar a un Spreadsheet distinto al
// principal (SHEET_ID) — lo usa Consultas Soporte SAB, que vive en su propio
// Google Sheet separado (ver CONSULTAS_SHEET_ID).
function writeToSheetIn(spreadsheetId, targetGid, valuesByHeader) {
  const ss = SpreadsheetApp.openById(spreadsheetId)
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
