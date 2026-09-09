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
  // TODO: pega el ID de Drive de la imagen/gráfica de HVC STARS (panel 1 del
  // modal de noticias, ver Modals.html) y reemplaza este valor.
  hvcStarsHero: '1uFe-c2xlCzF4ngFYViVRamynls4-E2jJ',
  // TODO: pega el ID de Drive de la infografía de la nueva ruta Cusco - São
  // Paulo (panel 3 del modal de noticias, se muestra completa sin recortar).
  nuevaRutaCuscoSaoPaulo: '1tkJEvAFQuIRUnEUCt4Z7i4czs_QUZJsc',
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
  // TODO: sube una imagen para la tarjeta de Solicitud de Estacionamiento y
  // reemplaza este ID (driveImg() devuelve '' mientras empiece con
  // "REEMPLAZAR", así que la tarjeta simplemente no rompe con esto puesto).
  estacionamientoCard: '1iMJx7WhLaShyMkkVPGhP0cvfjpuIIpKT',
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
  // TODO: sube una imagen para la tarjeta de Evaluación de Desempeño y
  // reemplaza este ID (driveImg() devuelve '' mientras empiece con
  // "REEMPLAZAR", así que la tarjeta simplemente no rompe con esto puesto).
  evaluacionDesempenoCard: '1RuKe20hwJJlLPvZx0owSlLcYU6AsgCQP',

  gestionOperacionalHero: '1PZ9-miuYDUaibtYeKgFiFqN7tHZ-hyb9',
  instructivoVales: '1zWVWc9-Xg2iIsAR7c7WyIqe_iNTIkDtF',
  consultasViaticos: '1xagbBQxoOrgcff-3DzNlAXzAeTxS3y27',
  cambioUniforme: '1pG7nm3IP8lIWPf0ges_W0cTRxasKJ77T',
  registroEquipos: '1HKAyaA4E6zprT4RJ9Gq5QAazjKRcXTA1',
  // TODO: sube una imagen para la tarjeta de Reembolsos SAP Concur y
  // reemplaza este ID (driveImg() devuelve '' mientras empiece con
  // "REEMPLAZAR", así que la tarjeta simplemente no rompe con esto puesto).
  reembolsosConcur: '103vYpUed_q9uzqShzHRbGg4OmSL5EwxE'
}

// Páginas de módulo ya migradas (con su propio archivo .html). Las que no
// están acá siguen cayendo en Placeholder.html.
const MODULE_PAGES = {
  'gestion-personal': 'GestionPersonal',
  'mi-rol': 'MiRol',
  'gestion-operacional': 'GestionOperacional',
  // Prototipo interno (borradores IA de Consultas Reva) — a propósito sin
  // link en el menú ni tarjeta en Home, solo se llega por URL directa
  // (?page=consultas-ia). Ver ConsultasIA.html / ConsultasIAScript.html.
  'consultas-ia': 'ConsultasIA',
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

// TODO: crea una pestaña en el mismo Sheet (SHEET_ID) para "Solicitud de
// Estacionamiento ATO Lima" con estos headers en la fila 1, y reemplaza el
// -1 de abajo por su gid real (el número después de #gid= en la URL de esa
// pestaña) — mientras siga en -1, el envío falla con un error claro en vez
// de escribir en la pestaña equivocada:
//   Marca temporal | Correo | Nombres y Apellidos | DNI / Carnet de Extranjería |
//   Cargo / Gerencia | Celular de Contacto | Fecha de Ingreso | Fecha de Salida |
//   Marca de Vehículo | Modelo del Vehículo | Placa del Vehículo
const ESTACIONAMIENTO_GID = 2039975077

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

// Llamada desde EstacionamientoScript.html vía
// `google.script.run.submitEstacionamiento(payload)`. Sin adjunto: el
// formulario original (ver referencia) no pide ningún archivo, solo datos y
// la aceptación de las reglas.
function submitEstacionamiento(data) {
  if (!checkRateLimit()) {
    throw new Error('Demasiadas solicitudes en poco tiempo. Intenta de nuevo en un minuto.')
  }

  const correo = String(data.correo || '').trim().toLowerCase()
  if (!correo.endsWith('@latam.com')) {
    throw new Error('El correo debe ser una cuenta corporativa @latam.com')
  }

  const nombre = String(data.nombre || '').trim()
  const dni = String(data.dni || '').trim()
  const cargo = String(data.cargo || '').trim()
  const celular = String(data.celular || '').trim()
  const fechaIngreso = String(data.fechaIngreso || '').trim()
  const fechaSalida = String(data.fechaSalida || '').trim()
  const marca = String(data.marca || '').trim()
  const modelo = String(data.modelo || '').trim()
  const placa = String(data.placa || '').trim()
  if (!nombre || !dni || !cargo || !celular || !fechaIngreso || !fechaSalida || !marca || !modelo || !placa) {
    throw new Error('Completa todos los campos obligatorios')
  }
  if (!data.aceptaReglas) {
    throw new Error('Debes aceptar las Reglas y recomendaciones para proceder con el envío')
  }

  writeToSheet(ESTACIONAMIENTO_GID, {
    'Marca temporal': new Date(),
    'Correo': sanitizeValue(correo),
    'Nombres y Apellidos': sanitizeValue(nombre),
    'DNI / Carnet de Extranjería': sanitizeValue(dni),
    'Cargo / Gerencia': sanitizeValue(cargo),
    'Celular de Contacto': sanitizeValue(celular),
    'Fecha de Ingreso': sanitizeValue(fechaIngreso),
    'Fecha de Salida': sanitizeValue(fechaSalida),
    'Marca de Vehículo': sanitizeValue(marca),
    'Modelo del Vehículo': sanitizeValue(modelo),
    'Placa del Vehículo': sanitizeValue(placa.toUpperCase()),
  })

  return { status: 'ok' }
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
// Reembolsos SAP Concur — solicitud de aprobación previa (Gestión
// Operacional). Reemplaza al Google Form que antes usaba el botón "Solicita
// el correo de aprobación" en la vista de referencia: el tripulante llena el
// motivo/monto/voucher acá mismo, y lo que de verdad importa es que le llega
// un correo al focal de Soporte SAB para que revise y responda con la
// aprobación — guardar la fila en un Sheet es solo un registro opcional (ver
// REEMBOLSOS_CONCUR_GID). Visa/Pasaporte no requiere aprobación (por eso no
// aparece como motivo acá, igual que en el Google Form original).
// ============================================================================

// TODO: crea una carpeta en Drive para los vouchers de este formulario,
// compártela como "Cualquier persona con el enlace: Lector", y pega el ID
// acá (ver DEMORA_ARCHIVO_FOLDER_ID más arriba para el formato). Mientras no
// se reemplace, la subida del voucher falla — pero eso NUNCA bloquea el
// envío: el correo al focal se manda igual, solo que sin adjunto.
const REEMBOLSOS_CONCUR_FOLDER_ID = '1I4ZGop__3zzF6UFyTu8jZ6PL51lerVJk'

// TODO (opcional): crea una pestaña con estos headers EXACTOS en la fila 1
// — los mismos que deja un Google Form normal (marca temporal + una columna
// por pregunta, en el mismo orden que el formulario) — y pega su Sheet ID +
// gid acá para llevar un registro. Mientras GID siga en -1, simplemente no
// se guarda ninguna fila (el correo al focal se manda igual):
//   Marca temporal | Correo electrónico | Motivo | Monto |
//   Vuelo (en caso corresponda) | Fecha del gasto | Adjunta el Voucher | Comentarios
const REEMBOLSOS_CONCUR_SHEET_ID = '1WSl5ChIUUzCNO4jcV3UHxVlELuKtja1hHDSZdPJia8U'
const REEMBOLSOS_CONCUR_GID = 352305686

const REEMBOLSOS_CONCUR_FOCAL_EMAIL = 'yoko.noborikawa@latam.com'

// Debe calzar EXACTO con los value="..." de los radios "motivo" en
// ReembolsosConcurView.html.
const REEMBOLSOS_CONCUR_MOTIVO_LABELS = {
  cma: 'Examen Médico Aeronáutico',
  licencia: 'Licencia Peruana',
  equipaje: 'Equipaje',
  alimentacion: 'Contingencia - Alimentación Tripulación',
  movilizacion: 'Contingencia - Movilización',
}

// Llamada desde ReembolsosConcurScript.html vía
// `google.script.run.submitReembolsoConcur(payload)`.
function submitReembolsoConcur(data) {
  if (!checkRateLimit()) {
    throw new Error('Demasiadas solicitudes en poco tiempo. Intenta de nuevo en un minuto.')
  }

  const correo = String(data.correo || '').trim().toLowerCase()
  if (!correo.endsWith('@latam.com')) {
    throw new Error('El correo debe ser una cuenta corporativa @latam.com')
  }

  const motivoLabel = REEMBOLSOS_CONCUR_MOTIVO_LABELS[data.motivo]
  if (!motivoLabel) {
    throw new Error('Selecciona el motivo de tu reembolso')
  }

  const monto = String(data.monto || '').trim()
  const fechaGasto = String(data.fechaGasto || '').trim()
  if (!monto || !fechaGasto) {
    throw new Error('Monto y fecha del gasto son obligatorios')
  }

  // Igual que en submitConsultaSoporte: un fallo al subir el voucher
  // (típicamente porque falta reemplazar REEMBOLSOS_CONCUR_FOLDER_ID) nunca
  // debe impedir que la solicitud llegue igual al focal por correo — solo
  // queda sin adjunto y con rastro en Registros.
  let archivoUrl = ''
  if (data.archivo) {
    try {
      archivoUrl = uploadFileToDrive(data.archivo, data.archivoNombre, data.archivoTipo, REEMBOLSOS_CONCUR_FOLDER_ID)
    } catch (err) {
      Logger.log('submitReembolsoConcur: falló la subida del voucher: ' + (err && err.message ? err.message : err))
    }
  }

  if (REEMBOLSOS_CONCUR_GID !== -1) {
    try {
      writeToSheetIn(REEMBOLSOS_CONCUR_SHEET_ID, REEMBOLSOS_CONCUR_GID, {
        'Marca temporal': new Date(),
        'Correo electrónico': sanitizeValue(correo),
        'Motivo': motivoLabel,
        'Monto': sanitizeValue(monto),
        'Vuelo (en caso corresponda)': sanitizeValue(data.vuelo),
        'Fecha del gasto': sanitizeValue(fechaGasto),
        'Adjunta el Voucher': archivoUrl || '',
        'Comentarios': sanitizeValue(data.comentarios),
      })
    } catch (err) {
      Logger.log('submitReembolsoConcur: falló el registro en Sheet: ' + (err && err.message ? err.message : err))
    }
  }

  // El correo es lo que de verdad cumple el propósito de este formulario —
  // igual que avisarCoordinadorConsultaDerivada, nunca lanza: un fallo acá
  // solo queda en Registros, sin romper la respuesta al tripulante.
  try {
    MailApp.sendEmail({
      to: REEMBOLSOS_CONCUR_FOCAL_EMAIL,
      subject: 'Solicitud de aprobación - Reembolso ' + motivoLabel + ' (' + correo + ')',
      body: [
        'Hola,',
        '',
        'Un tripulante solicitó autorización para un reembolso de SAP Concur:',
        '',
        'Correo: ' + correo,
        'Motivo: ' + motivoLabel,
        'Monto: ' + monto,
        data.vuelo ? 'Vuelo: ' + data.vuelo : '',
        'Fecha del gasto: ' + fechaGasto,
        data.comentarios ? 'Comentarios: ' + data.comentarios : '',
        archivoUrl ? 'Voucher: ' + archivoUrl : 'Voucher: (no se pudo adjuntar automáticamente, pídeselo al tripulante por correo)',
        '',
        'Por favor responde la aprobación al correo del tripulante dentro del plazo de 5 días hábiles.',
      ].filter(Boolean).join('\n'),
    })
  } catch (err) {
    Logger.log('submitReembolsoConcur: falló el correo al focal: ' + (err && err.message ? err.message : err))
  }

  return { status: 'ok' }
}

// ============================================================================
// Apto Médico — Rama 1: Cita / Reprogramación.
//
// Mikife quiere que la IA se autogestione leyendo Sheets reales (no
// precedente histórico como el sistema de objetivos de más abajo, que sigue
// pausado). Kari agrupó las 5 consultas típicas de Apto Médico en 3 ramas;
// esta es la primera y la única que se activa por ahora. La decisión final
// es 100% determinística (comparar fechas) — la IA solo se usa para el
// primer paso: detectar si la consulta es sobre cita/reprogramación. Nunca
// inventa una fecha; si algo no se puede verificar con certeza, se deriva.
// ============================================================================

const APTO_2026_SHEET_ID = '1i5T7ce0GYazei1EgqY5Y22gcadFPR-iJ-cMsPYLJi44'
const APTO_2026_GID = 1996855301
// Confirmado con el usuario: encabezados en la fila 2, datos desde la fila 3.
const APTO_2026_DATA_START_ROW = 3
// Columnas 0-indexadas (A=0): A=BP, E=Fecha Cita programada, J=Fecha Vencimiento Apto.
const APTO_2026_COL = { bp: 0, fechaCitaProgramada: 4, fechaVencimientoApto: 9 }

// El vencimiento del EMO vive en OTRA pestaña del mismo Sheet — no es la
// pestaña "EMO 2026" que se ve a simple vista (esa trae otra cosa, fechas de
// examen realizado). Confirmado con el usuario: encabezados en la fila 3,
// datos desde la fila 4. Columnas: C=BP, G=Fecha Vencimiento EMO.
const EMO_VENCIMIENTO_GID = 1009628324
const EMO_VENCIMIENTO_DATA_START_ROW = 4
const EMO_VENCIMIENTO_COL = { bp: 2, fechaVencimiento: 6 }

// Busca el BP en la columna indicada y devuelve la ÚLTIMA fila que coincide
// (recorriendo de abajo hacia arriba) — pedido explícito del usuario, ya que
// un mismo BP puede aparecer varias veces y la fila más reciente es la de
// más abajo en la hoja.
function leerFilaMasRecientePorBP(spreadsheetId, gid, bpColIdx, dataStartRow, bpBuscado) {
  const ss = SpreadsheetApp.openById(spreadsheetId)
  const sheet = ss.getSheets().find((s) => s.getSheetId() === gid)
  if (!sheet) throw new Error('No se encontró la pestaña (gid) indicada')

  const lastRow = sheet.getLastRow()
  if (lastRow < dataStartRow) return null
  const rows = sheet.getRange(dataStartRow, 1, lastRow - dataStartRow + 1, sheet.getLastColumn()).getValues()

  const bpNormalizado = String(bpBuscado || '').trim()
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][bpColIdx] || '').trim() === bpNormalizado) return rows[i]
  }
  return null
}

// Una celda de fecha en Sheets llega como objeto Date real vía getValues();
// una celda vacía llega como '', y una con texto (ej. "reprogramar", o el
// "#N/A" de un VLOOKUP sin match) llega como string — ninguno de esos dos
// cuenta como fecha real.
function esFechaValida(valor) {
  return valor instanceof Date && !isNaN(valor.getTime())
}

// true = vencido o vence dentro del mes calendario en curso (el caso urgente
// que Kari resuelve a mano). null = no hay fecha confiable para decidir.
// Compara como texto "yyyyMMdd"/"yyyyMM" en el timezone de LA HOJA (no con
// aritmética de Date) — evita que un desfase de zona horaria entre la hoja
// y el proyecto de Apps Script corra la comparación un día justo en los
// bordes de mes (el mismo problema que corregimos en formatearFechaDDMMYYYY).
function esVencidoOEsteMes(fecha) {
  if (!esFechaValida(fecha)) return null
  const tz = obtenerTimeZoneHojaAptoMedico()
  const hoy = new Date()
  const fechaYYYYMMDD = Utilities.formatDate(fecha, tz, 'yyyyMMdd')
  const hoyYYYYMMDD = Utilities.formatDate(hoy, tz, 'yyyyMMdd')
  const fechaYYYYMM = Utilities.formatDate(fecha, tz, 'yyyyMM')
  const hoyYYYYMM = Utilities.formatDate(hoy, tz, 'yyyyMM')
  return fechaYYYYMMDD <= hoyYYYYMMDD || fechaYYYYMM === hoyYYYYMM
}

// Usa el timezone de LA HOJA (no el del proyecto de Apps Script) para
// formatear — si difieren, un Date leído vía getValues() se corre un día al
// formatearlo con un timezone distinto al de origen (justo lo que pasaba:
// una fecha guardada como 01/09/2026 se mostraba como 31/08/2026). Se
// memoriza dentro de esta misma ejecución para no llamar openById de más.
let _aptoMedicoSheetTimeZoneCache = null
function obtenerTimeZoneHojaAptoMedico() {
  if (!_aptoMedicoSheetTimeZoneCache) {
    _aptoMedicoSheetTimeZoneCache = SpreadsheetApp.openById(APTO_2026_SHEET_ID).getSpreadsheetTimeZone()
  }
  return _aptoMedicoSheetTimeZoneCache
}

function formatearFechaDDMMYYYY(fecha) {
  return Utilities.formatDate(fecha, obtenerTimeZoneHojaAptoMedico(), 'dd/MM/yyyy')
}

// Único uso de IA en toda esta rama: clasificar si la consulta libre del
// tripulante es sobre cita/reprogramación de su apto médico (para saber si
// esta rama aplica) — nunca decide fechas ni redacta la respuesta final.
function esConsultaCitaOReprogramacionAptoMedico(consultaTexto) {
  const prompt = [
    'Un tripulante de LATAM Airlines escribió esta consulta sobre su trámite de Apto Médico:',
    '"' + consultaTexto + '"',
    '',
    '¿Esta consulta trata específicamente sobre la CITA o REPROGRAMACIÓN de su apto médico? (ejemplos que SÍ cuentan: pregunta cuándo es su cita, pide que le den una fecha, dice que necesita reprogramar, pregunta si ya tiene fecha asignada).',
    '',
    'Responde ÚNICAMENTE "SI" o "NO", nada más.',
  ].join('\n')

  let salida
  try {
    salida = BibliotecaVertexAI.ejecutarPrompt(prompt)
  } catch (err) {
    Logger.log('esConsultaCitaOReprogramacionAptoMedico falló: ' + (err && err.message ? err.message : err))
    return false
  }
  return /^\s*s[ií]/i.test(String(salida || ''))
}

// Devuelve null si la consulta no es de esta rama (sigue el flujo normal de
// siempre), o { tipo: 'auto', respuesta } / { tipo: 'escalar', motivo }.
// Nunca lanza hacia afuera lo inesperado de las lecturas de Sheet — ver
// try/catch en cada lectura, siempre resuelve a 'escalar' ante la duda.
function resolverCitaReprogramacionAptoMedico(consultaTexto, bp) {
  if (!consultaTexto || !bp) return null
  if (!esConsultaCitaOReprogramacionAptoMedico(consultaTexto)) return null

  let filaApto
  try {
    filaApto = leerFilaMasRecientePorBP(APTO_2026_SHEET_ID, APTO_2026_GID, APTO_2026_COL.bp, APTO_2026_DATA_START_ROW, bp)
  } catch (err) {
    Logger.log('resolverCitaReprogramacionAptoMedico: falló la lectura de APTO 2026: ' + (err && err.message ? err.message : err))
    return { tipo: 'escalar', motivo: 'No se pudo leer la base de Apto Médico (' + (err && err.message ? err.message : err) + ')' }
  }
  if (!filaApto) {
    return { tipo: 'escalar', motivo: 'No se encontró el BP ' + bp + ' en la base de Apto Médico 2026' }
  }

  // Filtro 1: ¿la cita ya está programada? (columna "Fecha Cita programada")
  const fechaCitaProgramada = filaApto[APTO_2026_COL.fechaCitaProgramada]
  if (esFechaValida(fechaCitaProgramada)) {
    return {
      tipo: 'auto',
      respuesta: 'Tu apto médico ya está programado para el ' + formatearFechaDDMMYYYY(fechaCitaProgramada) + '. Si necesitas confirmar el lugar y la hora exactos, revisa tu rol.',
    }
  }

  // Filtro 2: ¿qué está vencido?
  const fechaVencApto = filaApto[APTO_2026_COL.fechaVencimientoApto]
  const aptoVencidoOEsteMes = esVencidoOEsteMes(fechaVencApto)
  if (aptoVencidoOEsteMes === null) {
    return { tipo: 'escalar', motivo: 'No se encontró una fecha de vencimiento de apto médico confiable para el BP ' + bp }
  }
  if (aptoVencidoOEsteMes) {
    // Incluye el caso especial que mencionó el usuario (ya con código "M" en
    // programación pero apto vencido/por vencer): misma regla, siempre se
    // deriva porque requiere el criterio manual de Kari ese mismo mes.
    return { tipo: 'escalar', motivo: 'Apto médico vencido o vence este mes (vence ' + formatearFechaDDMMYYYY(fechaVencApto) + ')' }
  }

  let filaEmo
  try {
    filaEmo = leerFilaMasRecientePorBP(APTO_2026_SHEET_ID, EMO_VENCIMIENTO_GID, EMO_VENCIMIENTO_COL.bp, EMO_VENCIMIENTO_DATA_START_ROW, bp)
  } catch (err) {
    Logger.log('resolverCitaReprogramacionAptoMedico: falló la lectura de vencimiento EMO: ' + (err && err.message ? err.message : err))
    return { tipo: 'escalar', motivo: 'No se pudo leer la base de vencimiento de EMO (' + (err && err.message ? err.message : err) + ')' }
  }
  const fechaVencEmo = filaEmo ? filaEmo[EMO_VENCIMIENTO_COL.fechaVencimiento] : null
  if (!esFechaValida(fechaVencEmo)) {
    // Sin dato confiable (BP no encontrado, o celda #N/A del VLOOKUP) — se
    // deriva en vez de arriesgarse a decirle al tripulante que está vigente.
    return { tipo: 'escalar', motivo: 'No se encontró una fecha de vencimiento de EMO confiable para el BP ' + bp }
  }

  // Mismo criterio que esVencidoOEsteMes: comparar como texto en el
  // timezone de la hoja, no con aritmética de Date.
  const tzEmo = obtenerTimeZoneHojaAptoMedico()
  const emoVencido = Utilities.formatDate(fechaVencEmo, tzEmo, 'yyyyMMdd') < Utilities.formatDate(new Date(), tzEmo, 'yyyyMMdd')
  if (emoVencido) {
    return {
      tipo: 'auto',
      respuesta: 'Tu EMO venció el ' + formatearFechaDDMMYYYY(fechaVencEmo) + '. Se reprogramará antes de terminar el año.',
    }
  }

  return {
    tipo: 'auto',
    respuesta: 'Revisamos tu información: tu apto médico vence el ' + formatearFechaDDMMYYYY(fechaVencApto) + ' y tu EMO vence el ' + formatearFechaDDMMYYYY(fechaVencEmo) + '. Ambos están vigentes, así que todavía no corresponde una reprogramación.',
  }
}

// "Escalar a Kari" = avisarle por correo al coordinador de Apto Médico
// (mismo correo temporal que CONSULTAS_COORDINADOR_EMAIL_TEMPORAL.aptoMedico,
// ver más abajo) para que reprograme a mano. Nunca lanza: un fallo acá no
// debe romper el envío de la consulta, que ya se guardó antes de llegar acá.
function avisarKariCitaReprogramacion(info) {
  const correo = CONSULTAS_COORDINADOR_EMAIL_TEMPORAL.aptoMedico
  if (!correo || correo.indexOf('REEMPLAZAR') === 0) return
  try {
    MailApp.sendEmail({
      to: correo,
      subject: 'Apto Médico — cita/reprogramación por revisar (' + info.bp + ')',
      body: [
        'Hola Kari,',
        '',
        'Un tripulante consultó sobre su cita/reprogramación de apto médico y necesita tu criterio:',
        '',
        'Motivo por el que se deriva: ' + info.motivo,
        '',
        'Nombre: ' + info.nombre + ' (BP ' + info.bp + ')',
        'Correo: ' + info.correo,
        'Consulta: "' + info.consulta + '"',
        '',
        'Por favor revisa y reprograma según tu criterio.',
      ].join('\n'),
    })
  } catch (err) {
    Logger.log('avisarKariCitaReprogramacion falló: ' + (err && err.message ? err.message : err))
  }
}

// Prueba manual: selecciona esta función en el desplegable de arriba del
// editor de Apps Script y dale a "Ejecutar" — no pasa por el formulario web
// ni requiere un despliegue nuevo (el editor siempre corre el código
// guardado más reciente). Cambia BP_DE_PRUEBA por un BP real de tu hoja
// APTO 2026 y revisa el resultado en Ver > Registros.
function testResolverCitaReprogramacionAptoMedico() {
  const BP_DE_PRUEBA = '2692547' // reemplaza por el BP que quieras probar
  const consultaTexto = '¿Cuándo es mi cita de apto médico?'

  Logger.log('¿Es cita/reprogramación?: ' + esConsultaCitaOReprogramacionAptoMedico(consultaTexto))

  const filaApto = leerFilaMasRecientePorBP(APTO_2026_SHEET_ID, APTO_2026_GID, APTO_2026_COL.bp, APTO_2026_DATA_START_ROW, BP_DE_PRUEBA)
  Logger.log('Fila APTO 2026 encontrada: ' + JSON.stringify(filaApto))

  const filaEmo = leerFilaMasRecientePorBP(APTO_2026_SHEET_ID, EMO_VENCIMIENTO_GID, EMO_VENCIMIENTO_COL.bp, EMO_VENCIMIENTO_DATA_START_ROW, BP_DE_PRUEBA)
  Logger.log('Fila vencimiento EMO encontrada: ' + JSON.stringify(filaEmo))

  const resultado = resolverCitaReprogramacionAptoMedico(consultaTexto, BP_DE_PRUEBA)
  Logger.log('Resultado final: ' + JSON.stringify(resultado))
}

// Utilidad para encontrar BPs de ejemplo reales de cada rama, sin tener que
// leer la hoja APTO 2026 a ojo. Escanea todas las filas desde
// APTO_2026_DATA_START_ROW y clasifica cada BP según el mismo criterio que
// resolverCitaReprogramacionAptoMedico (sin llamar a la IA ni tocar nada).
// Correr desde el editor (Ejecutar > buscarEjemplosPorRamaAptoMedico) y
// revisar Ver > Registros: te da hasta 3 BPs por categoría, priorizando
// "escalarVencido" y "escalarSinFilaEnAptoNiEmo" para que puedas probar la
// derivación a Kari.
function buscarEjemplosPorRamaAptoMedico() {
  const ss = SpreadsheetApp.openById(APTO_2026_SHEET_ID)
  const sheet = ss.getSheets().find((s) => s.getSheetId() === APTO_2026_GID)
  if (!sheet) throw new Error('No se encontró la pestaña (gid) de APTO 2026')

  const lastRow = sheet.getLastRow()
  if (lastRow < APTO_2026_DATA_START_ROW) throw new Error('La hoja APTO 2026 no tiene filas de datos')
  const rows = sheet.getRange(APTO_2026_DATA_START_ROW, 1, lastRow - APTO_2026_DATA_START_ROW + 1, sheet.getLastColumn()).getValues()

  const categorias = {
    autoCitaProgramada: [],
    escalarVencido: [],
    escalarSinFechaVencConfiable: [],
    autoEmoVencido: [],
    autoInformativo: [],
  }

  // Recorre de abajo hacia arriba (como leerFilaMasRecientePorBP) y se queda
  // solo con la ÚLTIMA fila de cada BP, para no clasificar un BP repetido
  // usando una fila vieja que ya no es la vigente.
  const vistos = {}
  for (let i = rows.length - 1; i >= 0; i--) {
    const bp = String(rows[i][APTO_2026_COL.bp] || '').trim()
    if (!bp || vistos[bp]) continue
    vistos[bp] = true

    const fechaCita = rows[i][APTO_2026_COL.fechaCitaProgramada]
    if (esFechaValida(fechaCita)) {
      if (categorias.autoCitaProgramada.length < 3) categorias.autoCitaProgramada.push(bp + ' (cita: ' + formatearFechaDDMMYYYY(fechaCita) + ')')
      continue
    }

    const fechaVencApto = rows[i][APTO_2026_COL.fechaVencimientoApto]
    const vencidoOEsteMes = esVencidoOEsteMes(fechaVencApto)
    if (vencidoOEsteMes === null) {
      if (categorias.escalarSinFechaVencConfiable.length < 3) categorias.escalarSinFechaVencConfiable.push(bp)
      continue
    }
    if (vencidoOEsteMes) {
      if (categorias.escalarVencido.length < 3) categorias.escalarVencido.push(bp + ' (vence: ' + formatearFechaDDMMYYYY(fechaVencApto) + ')')
      continue
    }

    // Apto vigente: para saber si es "EMO vencido" o "informativo" hay que
    // mirar también la otra hoja — se hace solo para los primeros que
    // encuentre, para no disparar de más lecturas de Sheet en este escaneo.
    if (categorias.autoEmoVencido.length < 3 || categorias.autoInformativo.length < 3) {
      const filaEmo = leerFilaMasRecientePorBP(APTO_2026_SHEET_ID, EMO_VENCIMIENTO_GID, EMO_VENCIMIENTO_COL.bp, EMO_VENCIMIENTO_DATA_START_ROW, bp)
      const fechaVencEmo = filaEmo ? filaEmo[EMO_VENCIMIENTO_COL.fechaVencimiento] : null
      if (esFechaValida(fechaVencEmo)) {
        const tzEmo = obtenerTimeZoneHojaAptoMedico()
        const emoVencido = Utilities.formatDate(fechaVencEmo, tzEmo, 'yyyyMMdd') < Utilities.formatDate(new Date(), tzEmo, 'yyyyMMdd')
        if (emoVencido && categorias.autoEmoVencido.length < 3) categorias.autoEmoVencido.push(bp + ' (EMO venció: ' + formatearFechaDDMMYYYY(fechaVencEmo) + ')')
        else if (!emoVencido && categorias.autoInformativo.length < 3) categorias.autoInformativo.push(bp)
      }
    }
  }

  Logger.log('=== Ejemplos por rama (Apto Médico) ===')
  Logger.log('AUTO — ya tiene cita programada: ' + JSON.stringify(categorias.autoCitaProgramada))
  Logger.log('ESCALAR — apto vencido o vence este mes (septiembre 2026): ' + JSON.stringify(categorias.escalarVencido))
  Logger.log('ESCALAR — sin fecha de vencimiento de apto confiable: ' + JSON.stringify(categorias.escalarSinFechaVencConfiable))
  Logger.log('AUTO — apto vigente pero EMO vencido: ' + JSON.stringify(categorias.autoEmoVencido))
  Logger.log('AUTO — ambos vigentes (informativo): ' + JSON.stringify(categorias.autoInformativo))
  return categorias
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

// Pestaña "Resumen_LP" del mismo Sheet de Consultas: consolida TODAS las
// consultas de todos los temas (cada fila trae su codigo_operacion, que es
// el mismo valor que se generó al guardarla en su pestaña por tema) y ahí es
// donde el coordinador va marcando estado_rpta (Pendiente/Completado/etc.) a
// mano. Es SOLO LECTURA desde acá — ver consultarEstadoPorCodigoOperacion:
// nunca se escribe nada en esta pestaña desde el código.
const CONSULTAS_RESUMEN_GID = 1228321511

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

  // El sistema de objetivos por precedente histórico (generarRespuestaConsultaIA,
  // más abajo) sigue pausado — esta función no lo llama. Lo que SÍ está
  // activo es la Rama 1 de Apto Médico (cita/reprogramación, ver
  // resolverCitaReprogramacionAptoMedico más arriba): solo para ese tema,
  // solo si la consulta cae en esa rama; cualquier otra consulta de Apto
  // Médico (o de cualquier otro tema) sigue el flujo normal de siempre, sin
  // tocar nada. Un fallo acá nunca debe impedir que la consulta se registre.
  let respuestaIA = null
  let derivada = false
  if (data.tema === 'aptoMedico') {
    try {
      const resultado = resolverCitaReprogramacionAptoMedico(String(data.consulta || '').trim(), bp)
      if (resultado && resultado.tipo === 'auto') {
        respuestaIA = 'Hola ' + nombre + ',\n\n' + resultado.respuesta
      } else if (resultado && resultado.tipo === 'escalar') {
        derivada = true
        avisarKariCitaReprogramacion({
          nombre: nombre,
          bp: bp,
          correo: correo,
          consulta: String(data.consulta || '').trim(),
          motivo: resultado.motivo,
        })
      }
    } catch (err) {
      Logger.log('submitConsultaSoporte: falló resolverCitaReprogramacionAptoMedico: ' + (err && err.message ? err.message : err))
    }
  }

  // Ojo: a propósito NO se persiste respuestaIA en esta fila (la consulta se
  // guarda igual que siempre, sin tocar su esquema).
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

  if (respuestaIA) return { status: 'ok', respuestaIA: respuestaIA }
  if (derivada) return { status: 'ok', derivada: true }
  return { status: 'ok' }
}

// Pestaña APARTE (no toca ninguno de los sheets de consultas de siempre) que
// mapea cada intento de la IA: qué objetivo detectó y qué respondió (o que
// se derivó). Reemplaza estos dos valores por los de una pestaña que crees
// a mano —en cualquier Sheet, puede ser uno nuevo— con estos headers exactos
// en la fila 1: fecha_hora / codigo_operacion / tema / correo / bp / nombre /
// consulta / objetivo_detectado / respuesta_ia / derivada.
const CONSULTAS_IA_LOG_SHEET_ID = '1VG7IlMERaOXMFWiLUdkHNeUoLloLJ-qt'
const CONSULTAS_IA_LOG_GID = 2089341002

// Nunca lanza: igual que avisarCoordinadorConsultaDerivada, un fallo acá
// (típicamente porque todavía falta reemplazar CONSULTAS_IA_LOG_SHEET_ID/GID)
// no debe romper el envío de la consulta, que ya se guardó antes de llegar
// acá — solo queda rastro en Registros para poder revisarlo.
function registrarLogIA(info) {
  if (CONSULTAS_IA_LOG_GID === -1) return
  try {
    writeToSheetIn(CONSULTAS_IA_LOG_SHEET_ID, CONSULTAS_IA_LOG_GID, {
      'fecha_hora': new Date(),
      'codigo_operacion': info.codigoOperacion,
      'tema': info.tema,
      'correo': sanitizeValue(info.correo),
      'bp': sanitizeValue(info.bp),
      'nombre': sanitizeValue(info.nombre),
      'consulta': sanitizeValue(info.consulta),
      'objetivo_detectado': info.objetivoDetectado,
      'respuesta_ia': sanitizeValue(info.respuestaIA),
      'derivada': info.derivada ? 'Sí' : 'No',
    })
  } catch (err) {
    Logger.log('registrarLogIA falló: ' + (err && err.message ? err.message : err))
  }
}

// Correo temporal de aviso al coordinador — mientras Responsables_Consultas
// no tiene una columna de correo, se define acá a mano por tema. Reemplaza
// el valor de 'aptoMedico' por tu correo real para probar el flujo completo
// (acordado: Apto Médico primero, tú mismo haces de coordinador por ahora).
const CONSULTAS_COORDINADOR_EMAIL_TEMPORAL = {
  aptoMedico: 'fernando.celadita@latam.com',
}

// Nunca lanza: un fallo al mandar el correo no debe romper el envío de la
// consulta (que ya se guardó antes de llegar acá). Si falla, queda en
// Registros para poder revisarlo.
function avisarCoordinadorConsultaDerivada(temaKey, tipoLabel, info) {
  const correo = CONSULTAS_COORDINADOR_EMAIL_TEMPORAL[temaKey]
  if (!correo || correo.indexOf('REEMPLAZAR') === 0) return
  try {
    MailApp.sendEmail({
      to: correo,
      subject: 'Nueva consulta de ' + tipoLabel + ' por responder (24h) — ' + info.codigoOperacion,
      body: [
        'Hola,',
        '',
        'Llegó una nueva consulta de "' + tipoLabel + '" que no pudo responderse automáticamente y quedó pendiente:',
        '',
        'Tripulante: ' + info.nombre + ' (BP ' + info.bp + ')',
        'Código de operación: ' + info.codigoOperacion,
        'Consulta: "' + info.consulta + '"',
        '',
        'Por favor ingresa a la hoja de Consultas y respóndela dentro de las próximas 24 horas.',
      ].join('\n'),
    })
  } catch (err) {
    Logger.log('avisarCoordinadorConsultaDerivada falló: ' + (err && err.message ? err.message : err))
  }
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

// Abre la pestaña "Resumen_LP" (consolida todos los temas) y devuelve sus
// headers + filas ya leídas — usado tanto por consultarEstadoPorCodigoOperacion
// como por consultarEstadoPorBP para no repetir la lectura del Sheet.
// SOLO LECTURA, nunca escribe nada acá (ver comentario de CONSULTAS_RESUMEN_GID).
function leerResumenLP() {
  const ss = SpreadsheetApp.openById(CONSULTAS_SHEET_ID)
  const sheet = ss.getSheets().find((s) => s.getSheetId() === CONSULTAS_RESUMEN_GID)
  if (!sheet) throw new Error('No se encontró la pestaña Resumen_LP (revisa CONSULTAS_RESUMEN_GID)')

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map((h) => h.toString().trim())
  const idx = {
    codigo: headers.indexOf('codigo_operacion'),
    bp: headers.indexOf('bp'),
    estado: headers.indexOf('estado_rpta'),
    tipo: headers.indexOf('tipo'),
    consulta: headers.indexOf('consulta'),
    fechaHora: headers.indexOf('fecha_hora'),
    fechaPrevista: headers.indexOf('fecha_prevista_resolucion'),
  }
  if (idx.codigo === -1 || idx.estado === -1) {
    throw new Error('Faltan columnas esperadas (codigo_operacion/estado_rpta) en Resumen_LP')
  }

  const lastRow = sheet.getLastRow()
  const rows = lastRow < 2 ? [] : sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues()
  return { idx: idx, rows: rows }
}

function filaAResultado(fila, idx) {
  return {
    encontrado: true,
    codigoOperacion: String(fila[idx.codigo] || '').trim(),
    estado: String(fila[idx.estado] || '').trim() || 'Pendiente',
    tipo: idx.tipo !== -1 ? String(fila[idx.tipo] || '').trim() : '',
    consulta: idx.consulta !== -1 ? String(fila[idx.consulta] || '').trim() : '',
    fechaHora: idx.fechaHora !== -1 && fila[idx.fechaHora]
      ? Utilities.formatDate(new Date(fila[idx.fechaHora]), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm')
      : '',
    fechaPrevistaResolucion: idx.fechaPrevista !== -1 && fila[idx.fechaPrevista]
      ? Utilities.formatDate(new Date(fila[idx.fechaPrevista]), Session.getScriptTimeZone(), 'dd/MM/yyyy')
      : '',
  }
}

// Llamada desde ConsultaEstadoScript.html vía
// `google.script.run.consultarEstadoPorCodigoOperacion(codigoOperacion)`.
// Por ahora el tripulante solo tiene su código de operación (o su BP, ver
// consultarEstadoPorBP) para identificarse — no hay login todavía.
function consultarEstadoPorCodigoOperacion(codigoOperacion) {
  const codigo = String(codigoOperacion || '').trim()
  if (!codigo) throw new Error('Ingresa tu código de operación')

  const { idx, rows } = leerResumenLP()
  const fila = rows.find((row) => String(row[idx.codigo] || '').trim().toLowerCase() === codigo.toLowerCase())
  return fila ? filaAResultado(fila, idx) : { encontrado: false }
}

// Llamada desde ConsultaEstadoScript.html vía
// `google.script.run.consultarEstadoPorBP(bp)`. Devuelve TODAS las consultas
// de ese BP (de cualquier tema), más recientes primero.
function consultarEstadoPorBP(bp) {
  const bpBuscado = String(bp || '').trim()
  if (!bpBuscado) throw new Error('Ingresa tu BP')

  const { idx, rows } = leerResumenLP()
  if (idx.bp === -1) throw new Error('Falta la columna "bp" en Resumen_LP')

  return rows
    .filter((row) => String(row[idx.bp] || '').trim().toLowerCase() === bpBuscado.toLowerCase())
    .map((row) => filaAResultado(row, idx))
    .reverse()
}

// ============================================================================
// Respuesta instantánea con IA para Consultas Soporte SAB (fase 2).
//
// A diferencia del prototipo de Reva (borrador para que un humano revise),
// acá SÍ hay respuestas verificadas de precedente real — vienen del análisis
// "Analisis_Consultas_SAB_LP.xlsx" (hoja 6_Detalle_clasificado), que el jefe
// mantiene en un Sheet aparte con columnas TIPO / CONSULTA / COD_OBJETIVO /
// OBJETIVO / INTENCION / RESPUESTA / CALIDAD_RESPUESTA. La clasificación NO
// es solo por INTENCION (4 categorías) — es por OBJETIVO puntual dentro de
// cada TIPO (ver pestaña "2_Objetivos_por_TIPO": ahí el jefe marcó en VERDE
// los objetivos que son pura información/procedimiento general, respondibles
// sin mirar el caso puntual, y en AMARILLO/blanco los que sí requieren
// gestión o revisar datos puntuales del tripulante) — por eso
// CONSULTAS_OBJETIVOS_SEGUROS es la lista, por TEMA, de los OBJETIVO exactos
// en verde. Solo para los temas en CONSULTAS_IA_INSTANTANEA_TEMAS y SOLO si
// el objetivo detectado está en esa lista, la IA responde directo en la web
// — nunca inventa fechas ni datos de un caso puntual: si no está segura,
// responde OTRO y el flujo cae a lo de siempre (consulta registrada, aviso
// al coordinador, la ve él).
// ============================================================================

// Temas que reciben respuesta instantánea. Agregar una clave más acá (debe
// existir en CONSULTAS_TEMAS y en CONSULTAS_OBJETIVOS_SEGUROS) cuando se
// sume otro tipo, sin tocar el resto.
const CONSULTAS_IA_INSTANTANEA_TEMAS = ['aptoMedico']

// Apunta directo a la hoja "6_Detalle_clasificado" del Sheet de análisis que
// arma el jefe (mismo contenido que Analisis_Consultas_SAB_LP.xlsx, pero
// vivo en Sheets): ya trae los headers TIPO / CONSULTA / OBJETIVO / RESPUESTA
// / CALIDAD_RESPUESTA que necesita buscarEjemplosConocimiento, junto con
// otras columnas (CODIGO_OPERACION, COD_OBJETIVO, INTENCION, etc.) que
// simplemente se ignoran. Ojo: esta hoja debe estar compartida (al menos
// como Lector) con la cuenta que ejecuta este proyecto de Apps Script
// ("Ejecutar como: Yo" del deploy).
const CONOCIMIENTO_SHEET_ID = '1VG7IlMERaOXMFWiLUdkHNeUoLloLJ-qt'
const CONOCIMIENTO_GID = 114081849

// Por TEMA: los OBJETIVO exactos (columna OBJETIVO de 6_Detalle_clasificado)
// resaltados en VERDE en la pestaña "2_Objetivos_por_TIPO" — pura consulta de
// información/procedimiento general, sin gestión ni revisión de caso puntual,
// Y que además ya se pueden responder solo con el procedimiento general (no
// requieren mirar el estado real de un trámite puntual — ver
// CONSULTAS_OBJETIVOS_VERDES_PENDIENTES más abajo para los que sí). Todo
// objetivo que NO esté en esta lista (amarillo, blanco, verde pendiente, o
// cualquiera que el modelo no reconozca) siempre se deriva a un coordinador
// humano. El texto debe ser IDÉNTICO al de la columna OBJETIVO del Excel/Sheet.
const CONSULTAS_OBJETIVOS_SEGUROS = {
  aptoMedico: [
    'Consulta general sobre el apto médico sin detalle especificado',
    'Consulta sobre documentación requerida (F-001, DNI, informes)',
    'Notificación de vencimiento próximo del apto médico',
    'Consulta sobre detalles de la cita (fecha, hora, lugar, indicaciones)',
    'Consulta sobre vigencia del apto médico',
  ],
}

// Objetivos que el jefe marcó en VERDE (son pura consulta, no gestión) pero
// que la IA TODAVÍA no puede responder sola: requieren revisar el estado real
// del trámite del tripulante (si ya se entregó/recogió su apto médico, si su
// reprogramación ya solicitada tiene fecha, si su renovación por vencimiento
// ya se programó) y eso vive en otro sistema que todavía no está conectado
// acá. Mientras tanto se derivan igual que los amarillos. Cuando se conecte
// esa fuente de datos, mover la clave correspondiente a
// CONSULTAS_OBJETIVOS_SEGUROS — no se usa en ninguna lógica todavía, es solo
// para no perder de vista cuáles faltan.
const CONSULTAS_OBJETIVOS_VERDES_PENDIENTES = {
  aptoMedico: [
    'Seguimiento de la entrega o recojo del apto médico',
    'Solicitud de programación o renovación por vencimiento próximo',
    'Seguimiento de una reprogramación ya solicitada',
  ],
}

// Tokeniza en español para comparar similitud de texto: minúsculas, sin
// tildes, sin puntuación, y descarta palabras muy cortas o stopwords — así
// "quiero reprogramar mi apto médico" y "necesito reprogramar mi apto
// médico" comparten casi todos sus tokens relevantes.
const CONOCIMIENTO_STOPWORDS_ES = ['de', 'la', 'el', 'los', 'las', 'en', 'y', 'a', 'que', 'un', 'una', 'unos', 'unas',
  'para', 'con', 'mi', 'mis', 'su', 'sus', 'al', 'del', 'por', 'es', 'me', 'lo', 'le', 'les', 'se', 'no', 'si', 'ya',
  'o', 'como', 'esta', 'este', 'esto', 'estas', 'estos', 'soy', 'ser', 'muy', 'the']

function tokenizarConsulta(texto) {
  const normalizado = String(texto || '')
    .toLowerCase()
    .normalize('NFD').replace(new RegExp('[̀-ͯ]', 'g'), '')
    .replace(/[^a-z0-9\s]/g, ' ')
  const set = {}
  normalizado.split(/\s+/).forEach((palabra) => {
    if (palabra.length > 2 && CONOCIMIENTO_STOPWORDS_ES.indexOf(palabra) === -1) set[palabra] = true
  })
  return set
}

// Similitud simple (Jaccard sobre tokens) entre dos textos — no requiere
// llamar a ningún servicio de embeddings, alcanza para encontrar el
// precedente real más parecido a la consulta nueva dentro de este TIPO.
function similitudTexto(tokensA, tokensB) {
  const clavesA = Object.keys(tokensA)
  const clavesB = Object.keys(tokensB)
  if (!clavesA.length || !clavesB.length) return 0
  let interseccion = 0
  clavesA.forEach((t) => { if (tokensB[t]) interseccion++ })
  const union = new Set(clavesA.concat(clavesB)).size
  return union ? interseccion / union : 0
}

// Devuelve { porCategoria, similares }:
//  - porCategoria: hasta 3 ejemplos por cada objetivo seguro (precedente
//    "de manual", para que el modelo vea el patrón típico de cada categoría).
//  - similares: hasta 3 ejemplos, de CUALQUIER objetivo (seguro o no), que
//    son los más parecidos EN TEXTO a esta consulta puntual — el ancla más
//    fuerte para decidir el caso, porque es precedente real de un caso
//    prácticamente igual, no un promedio de la categoría.
// Ambos, filtrados a este TIPO y a calidad "Respondida completamente" —
// así el modelo solo ve precedente verificado, nunca casos mal resueltos.
function buscarEjemplosConocimiento(tipoLabel, objetivosSeguros, consultaTexto) {
  const ss = SpreadsheetApp.openById(CONOCIMIENTO_SHEET_ID)
  const sheet = ss.getSheets().find((s) => s.getSheetId() === CONOCIMIENTO_GID)
  if (!sheet) throw new Error('No se encontró la pestaña de la base de conocimiento (revisa CONOCIMIENTO_SHEET_ID/CONOCIMIENTO_GID)')

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map((h) => h.toString().trim())
  const tipoIdx = headers.indexOf('TIPO')
  const consultaIdx = headers.indexOf('CONSULTA')
  const objetivoIdx = headers.indexOf('OBJETIVO')
  const respuestaIdx = headers.indexOf('RESPUESTA')
  const calidadIdx = headers.indexOf('CALIDAD_RESPUESTA')
  if ([tipoIdx, consultaIdx, objetivoIdx, respuestaIdx, calidadIdx].indexOf(-1) !== -1) {
    throw new Error('Faltan columnas esperadas (TIPO/CONSULTA/OBJETIVO/RESPUESTA/CALIDAD_RESPUESTA) en la base de conocimiento')
  }

  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return { porCategoria: [], similares: [] }
  const rows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues()

  const porObjetivo = {}
  objetivosSeguros.forEach((o) => { porObjetivo[o] = [] })
  const pool = []

  rows.forEach((row) => {
    const tipo = String(row[tipoIdx] || '').trim()
    const objetivo = String(row[objetivoIdx] || '').trim()
    const calidad = String(row[calidadIdx] || '').trim()
    if (tipo !== tipoLabel) return
    if (calidad !== 'Respondida completamente') return
    const consulta = String(row[consultaIdx] || '').trim()
    const respuesta = String(row[respuestaIdx] || '').trim()
    if (!consulta || !respuesta) return
    const ejemplo = { objetivo: objetivo, consulta: consulta, respuesta: respuesta }
    pool.push(ejemplo)
    if (porObjetivo[objetivo] !== undefined && porObjetivo[objetivo].length < 3) {
      porObjetivo[objetivo].push(ejemplo)
    }
  })

  const porCategoria = Object.keys(porObjetivo).reduce((acc, k) => acc.concat(porObjetivo[k]), [])

  let similares = []
  if (consultaTexto) {
    const tokensQuery = tokenizarConsulta(consultaTexto)
    similares = pool
      .map((ejemplo) => ({ ejemplo: ejemplo, score: similitudTexto(tokensQuery, tokenizarConsulta(ejemplo.consulta)) }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((p) => p.ejemplo)
  }

  return { porCategoria: porCategoria, similares: similares }
}

// Clasifica el objetivo puntual de la consulta y, si cae en uno de los
// seguros para este tema, redacta una respuesta basada en los ejemplos.
// Devuelve null (nunca lanza) si no aplica, si la base de conocimiento no
// tiene ejemplos para este tipo, o si la IA no respetó el formato esperado
// — en cualquier duda, null (y la consulta cae al flujo normal de siempre).
function generarRespuestaConsultaIA(tipoLabel, consultaTexto, objetivosSeguros) {
  if (!consultaTexto || !objetivosSeguros || !objetivosSeguros.length) return null
  const ejemplos = buscarEjemplosConocimiento(tipoLabel, objetivosSeguros, consultaTexto)
  if (!ejemplos.porCategoria.length) return null

  const ejemplosTexto = ejemplos.porCategoria.map((e) =>
    'Objetivo: ' + e.objetivo + '\nConsulta: "' + e.consulta + '"\nRespuesta: "' + e.respuesta + '"'
  ).join('\n\n')

  const similaresTexto = ejemplos.similares.length
    ? ejemplos.similares.map((e) =>
        'Objetivo: ' + e.objetivo + '\nConsulta: "' + e.consulta + '"\nRespuesta: "' + e.respuesta + '"'
      ).join('\n\n')
    : '(No se encontró ningún caso real parecido en texto a esta consulta.)'

  const prompt = [
    'Eres el asistente de Soporte SAB de LATAM Airlines Perú, especializado en el trámite "' + tipoLabel + '".',
    '',
    'A continuación hay ejemplos REALES de consultas de tripulantes ya respondidas correctamente por el equipo de soporte, agrupados por el objetivo puntual de quien consulta (precedente típico de cada categoría):',
    '',
    ejemplosTexto,
    '',
    'Estos otros son los casos reales MÁS PARECIDOS EN TEXTO a la consulta nueva de más abajo (pueden ser de cualquier objetivo, incluido alguno que normalmente se deriva) — son el mejor indicio de cómo se trató un caso prácticamente igual:',
    '',
    similaresTexto,
    '',
    'Ahora analiza esta consulta NUEVA de un tripulante:',
    '"' + consultaTexto + '"',
    '',
    'REGLA MÁS IMPORTANTE: esto NO es un chat. El tripulante no puede responderte ni aclarar nada después — tu respuesta es la única que va a recibir, o se deriva a un coordinador. Por eso, NUNCA hagas una pregunta de vuelta ni le pidas un dato que le falta dar (motivo, fecha, archivo, etc.). Si para responder bien necesitarías terminar pidiéndole algo, eso significa que este caso NO es ninguno de los objetivos de la lista — es OTRO.',
    '',
    'Tu tarea:',
    '1. Decide si su objetivo es EXACTAMENTE uno de estos (y solo estos):\n' + objetivosSeguros.map((o) => '   - ' + o).join('\n') + '\n   Prioriza SIEMPRE el patrón de los casos "MÁS PARECIDOS" de arriba por encima de cualquier intuición general tuya: si el caso real más parecido a este fue tratado como uno de los objetivos seguros (aunque mencione de paso un problema técnico, un trámite o falte un detalle), trata este igual; si el más parecido fue derivado o pide una gestión/acción puntual sobre SU caso individual (que le cambien, resuelvan o inicien algo puntual), este probablemente también debe derivarse.',
    '2. Si SÍ calza con uno de esos objetivos exactos, redacta una respuesta FINAL y completa como las de los ejemplos: profesional, breve, en español, tono LATAM, basada en el procedimiento general (nunca inventes fechas, números ni datos específicos del caso del tripulante que no estén en su consulta, y nunca saludes ni firmes — eso ya lo agrega el sistema).',
    '3. Si NO calza con ninguno, responde exactamente OTRO (nada más, en ambos campos).',
    '',
    'Responde ÚNICAMENTE en este formato exacto, sin texto adicional antes ni después:',
    'OBJETIVO: <uno de los objetivos exactos de la lista, o OTRO>',
    'RESPUESTA: <tu respuesta, o OTRO>',
  ].join('\n')

  let salida
  try {
    salida = BibliotecaVertexAI.ejecutarPrompt(prompt)
  } catch (err) {
    Logger.log('BibliotecaVertexAI.ejecutarPrompt falló: ' + (err && err.message ? err.message : err))
    return null
  }
  if (!salida) return null

  const objetivoMatch = salida.match(/OBJETIVO:\s*(.+)/i)
  const respuestaMatch = salida.match(/RESPUESTA:\s*([\s\S]+)/i)
  if (!objetivoMatch || !respuestaMatch) {
    Logger.log('Salida del modelo no respetó el formato esperado: ' + salida)
    return null
  }

  const objetivo = objetivoMatch[1].trim()
  const respuesta = respuestaMatch[1].trim()
  if (objetivo === 'OTRO' || respuesta === 'OTRO') {
    Logger.log('Modelo clasificó como OTRO (se deriva) para: "' + consultaTexto + '"')
    return null
  }
  if (objetivosSeguros.indexOf(objetivo) === -1) {
    Logger.log('Modelo devolvió un objetivo fuera de la lista segura: "' + objetivo + '"')
    return null
  }

  return { objetivo: objetivo, respuesta: respuesta }
}

// Prueba manual: selecciona esta función en el desplegable de arriba del
// editor de Apps Script y dale a "Ejecutar" — no pasa por el formulario web
// ni requiere un despliegue nuevo (el editor siempre corre el código guardado
// más reciente). Todo el resultado queda en Ver > Registros:
//   - "Ejemplos encontrados: 0" -> problema de acceso/headers/TIPO en la hoja
//     de conocimiento (6_Detalle_clasificado), no del modelo.
//   - "BibliotecaVertexAI.ejecutarPrompt falló: ..." -> problema con la
//     librería/credenciales de Vertex AI.
//   - "Modelo clasificó como OTRO..." -> el modelo sí corrió, pero no ubicó
//     la consulta en ninguno de los objetivos seguros.
//   - "Resultado: {...}" con objetivo/respuesta -> funcionó de punta a punta.
function testGenerarRespuestaConsultaIA() {
  const tipoLabel = 'Apto Médico'
  const objetivosSeguros = CONSULTAS_OBJETIVOS_SEGUROS.aptoMedico
  const consultaTexto = 'Tengo apto médico mañana 4oct, pero aún no tengo las indicaciones, el lugar ni la hora, agradecería información'

  const ejemplos = buscarEjemplosConocimiento(tipoLabel, objetivosSeguros, consultaTexto)
  Logger.log('Ejemplos por categoría: ' + ejemplos.porCategoria.length)
  ejemplos.porCategoria.forEach((e) => Logger.log('  - [' + e.objetivo + '] ' + e.consulta.slice(0, 90)))
  Logger.log('Más parecidos a esta consulta: ' + ejemplos.similares.length)
  ejemplos.similares.forEach((e) => Logger.log('  - [' + e.objetivo + '] ' + e.consulta.slice(0, 90)))

  const resultado = generarRespuestaConsultaIA(tipoLabel, consultaTexto, objetivosSeguros)
  Logger.log('Resultado: ' + JSON.stringify(resultado))
}

// ============================================================================
// Prototipo: borrador de respuesta con IA para Consultas de Reva LP.
//
// Por qué "borrador" y no auto-respuesta: el Sheet de Consultas nunca guardó
// la respuesta real que dio el coordinador a cada consulta (solo la
// pregunta) — así que la IA no tiene de dónde aprender respuestas
// verificadas. Genera un TEXTO SUGERIDO para que el coordinador (V.Sullca
// hoy) lo revise, edite y recién ahí lo envíe por correo — nunca se manda
// solo. Acotado a Reva LP por ahora; si funciona bien se puede repetir el
// mismo patrón para los demás temas de CONSULTAS_TEMAS.
//
// Requiere la columna "borrador_respuesta_ia" en la fila 1 de la pestaña de
// Reva (gid 1065806131) — agrégala a mano antes de correr esto; si no
// existe, tira error claro en vez de escribir en la columna equivocada.
// ============================================================================

const REVA_BORRADOR_COLUMN = 'borrador_respuesta_ia'

// Arma el prompt y llama a BibliotecaVertexAI para UNA consulta de Reva
// (identificada por su reva_lp_id, ej. "fa5e8e41"), y escribe el resultado
// en REVA_BORRADOR_COLUMN de esa misma fila.
function generarBorradorRevaIA(revaLpId) {
  const config = CONSULTAS_TEMAS.reva
  const ss = SpreadsheetApp.openById(CONSULTAS_SHEET_ID)
  const sheet = ss.getSheets().find((s) => s.getSheetId() === config.gidByPais.LP)
  if (!sheet) throw new Error('No se encontró la pestaña de Reva')

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map((h) => h.toString().trim())
  const idColIdx = headers.indexOf(config.idColumnKey)
  const consultaColIdx = headers.indexOf('consulta')
  const nombreColIdx = headers.indexOf('nombre')
  const categoriaColIdx = headers.indexOf('categoria')
  const borradorColIdx = headers.indexOf(REVA_BORRADOR_COLUMN)
  if (idColIdx === -1 || consultaColIdx === -1) {
    throw new Error('Faltan columnas esperadas (' + config.idColumnKey + ' / consulta) en la pestaña de Reva')
  }
  if (borradorColIdx === -1) {
    throw new Error('Falta la columna "' + REVA_BORRADOR_COLUMN + '" en la fila 1 de la pestaña de Reva — agrégala antes de correr esto')
  }

  const lastRow = sheet.getLastRow()
  if (lastRow < 2) throw new Error('La pestaña de Reva no tiene consultas todavía')
  const allRows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues()

  const targetRowIdx = allRows.findIndex((row) => String(row[idColIdx]).trim() === revaLpId)
  if (targetRowIdx === -1) throw new Error('No se encontró ninguna consulta de Reva con id ' + revaLpId)

  const targetRow = allRows[targetRowIdx]
  const consultaTexto = String(targetRow[consultaColIdx] || '').trim()
  const nombre = String(targetRow[nombreColIdx] || '').trim()
  const categoria = String(targetRow[categoriaColIdx] || '').trim()
  if (!consultaTexto) throw new Error('Esa fila no tiene texto de consulta')

  const borrador = generarBorradorConVertexAI(consultaTexto, nombre, categoria, allRows, consultaColIdx, targetRowIdx)

  sheet.getRange(targetRowIdx + 2, borradorColIdx + 1).setValue(borrador)
  return { status: 'ok', borrador: borrador }
}

// Arma el prompt (consulta actual + hasta 6 consultas recientes de Reva como
// contexto de qué se suele preguntar, NUNCA como respuestas verificadas —
// esa distinción se lo aclara al modelo explícitamente) y llama a
// BibliotecaVertexAI.ejecutarPrompt.
function generarBorradorConVertexAI(consultaTexto, nombre, categoria, allRows, consultaColIdx, excludeRowIdx) {
  const otras = allRows
    .filter((row, i) => i !== excludeRowIdx && String(row[consultaColIdx] || '').trim())
    .slice(-6)
    .map((row) => '- ' + String(row[consultaColIdx]).trim())
    .join('\n')

  const prompt = [
    'Eres un asistente de soporte para tripulantes de cabina de LATAM Airlines Perú (SAB), especializado en el trámite "Curso Entrenamiento Periódico (Reva)": la revalidación periódica de la licencia/habilitación de tripulante de cabina (cursos en Academia Corporativa, examen médico ocupacional, día de prácticas en el CAE, chequeos de competencia en Airbus/Boeing).',
    '',
    'Redacta un BORRADOR de respuesta profesional, breve y en español para la siguiente consulta de un tripulante. Este borrador lo va a revisar y editar un coordinador humano antes de enviarlo — no se envía directo al tripulante, así que no hace falta saludo largo ni firma.',
    '',
    'Nombre del tripulante: ' + (nombre || 'No especificado'),
    'Categoría: ' + (categoria || 'No especificada'),
    'Consulta: "' + consultaTexto + '"',
    otras ? '\nPara contexto, estas son otras consultas recientes sobre Reva (son solo ejemplo de qué se suele preguntar — NO asumas que ya fueron respondidas ni de qué forma, no están incluidas sus respuestas):\n' + otras : '',
    '',
    'Instrucciones:',
    '- Si la consulta es sobre un problema técnico reconocible (ej. plataforma o examen que se cuelga, curso no cargado, error del sistema al enviar un examen), da una respuesta de troubleshooting directa y práctica.',
    '- Si la consulta requiere verificar datos específicos del tripulante (programación de rol, fechas exactas, reprogramaciones, vencimientos individuales de licencia), NO inventes fechas ni datos — redacta la respuesta indicando que se está revisando su caso puntual, y termina el borrador con la etiqueta exacta "[REQUIERE REVISIÓN DE ROL]" en una línea aparte.',
    '- Tono formal pero cercano, como se usa en LATAM.',
  ].filter(Boolean).join('\n')

  try {
    return BibliotecaVertexAI.ejecutarPrompt(prompt)
  } catch (err) {
    throw new Error('Error al generar el borrador con IA: ' + err.message)
  }
}

// Utilidad para probar cómodo desde el editor de Apps Script: lista las
// consultas de Reva que todavía no tienen borrador generado, con su id y el
// texto de la consulta — así no hay que abrir el Sheet para copiar un id.
// Correr esta función (Ejecutar > listarConsultasRevaSinBorrador), revisar
// el resultado en "Registro de ejecución" (Ver > Registros), y usar uno de
// esos ids para probar generarBorradorRevaIA('ese-id') a mano.
function listarConsultasRevaSinBorrador() {
  const config = CONSULTAS_TEMAS.reva
  const ss = SpreadsheetApp.openById(CONSULTAS_SHEET_ID)
  const sheet = ss.getSheets().find((s) => s.getSheetId() === config.gidByPais.LP)
  if (!sheet) throw new Error('No se encontró la pestaña de Reva')

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map((h) => h.toString().trim())
  const idColIdx = headers.indexOf(config.idColumnKey)
  const consultaColIdx = headers.indexOf('consulta')
  const borradorColIdx = headers.indexOf(REVA_BORRADOR_COLUMN)
  if (borradorColIdx === -1) {
    throw new Error('Falta la columna "' + REVA_BORRADOR_COLUMN + '" en la fila 1 de la pestaña de Reva — agrégala antes de correr esto')
  }

  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  const allRows = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues()

  const pendientes = allRows
    .filter((row) => String(row[consultaColIdx] || '').trim() && !String(row[borradorColIdx] || '').trim())
    .map((row) => ({ id: String(row[idColIdx]).trim(), consulta: String(row[consultaColIdx]).trim() }))

  Logger.log(JSON.stringify(pendientes, null, 2))
  return pendientes
}

// Wrapper sin parámetros para poder correrlo con el botón "Ejecutar" del
// editor (que no permite pasar argumentos) — cambia el id de ejemplo por uno
// real que te haya dado listarConsultasRevaSinBorrador().
function testGenerarBorradorRevaIA() {
  const resultado = generarBorradorRevaIA('CAMBIAR_POR_UN_ID_REAL')
  Logger.log(resultado.borrador)
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
