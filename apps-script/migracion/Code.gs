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
// TODO: crear ambas pestañas en el mismo Sheet (SHEET_ID) con esos headers
// exactos y reemplazar estos placeholders por su GID real (el número después
// de #gid= en la URL de cada pestaña). Mientras diga REEMPLAZAR, writeToSheet
// va a fallar con "No se encontró la pestaña (gid) indicada".
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
