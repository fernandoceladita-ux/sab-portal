// Pega este código en el editor de Apps Script de tu Google Sheet
// (Extensiones > Apps Script), reemplaza SHARED_TOKEN por un valor propio,
// y despliega como Web App (ver instrucciones que te dio Claude en el chat).
//
// El script NO usa columnas fijas: en cada envío lee la fila 1 (encabezados)
// de la pestaña indicada y coloca cada valor en la columna cuyo encabezado
// coincida exactamente con el texto — así no hay riesgo de desalinear datos
// aunque cambies el orden de columnas más adelante.
//
// Un mismo token sirve para todos los formularios: solo confirma que la
// petición viene de nuestra app, no está atado a ninguna pestaña en
// particular. Lo que cambia por formulario es `formType` en el payload, que
// decide a qué GID y con qué mapeo de encabezados se escribe.

const SHARED_TOKEN = 'CAMBIA_ESTE_TOKEN'
const SHEET_ID = '1WSl5ChIUUzCNO4jcV3UHxVlELuKtja1hHDSZdPJia8U'

// Máximo de envíos aceptados por minuto, contados globalmente (no hay forma
// de identificar al llamante individual en un Web App anónimo de Apps
// Script). Frena ráfagas/spam sin depender de nada del lado del cliente.
const RATE_LIMIT_PER_MINUTE = 20

function doGet() {
  // Solo para verificar en el navegador que el deployment está vivo.
  // El formulario real siempre usa doPost.
  return jsonResponse({ status: 'ok', message: 'SAB Portal sheet bridge activo. Este endpoint solo acepta POST.' })
}

function doPost(e) {
  try {
    if (!checkRateLimit()) {
      return jsonResponse({ status: 'error', message: 'Demasiadas solicitudes en poco tiempo. Intenta de nuevo en un minuto.' })
    }

    const data = JSON.parse(e.postData.contents)

    if (data.token !== SHARED_TOKEN) {
      return jsonResponse({ status: 'error', message: 'Token inválido' })
    }

    if (!String(data.bp || '').trim() || !String(data.nombre || '').trim()) {
      return jsonResponse({ status: 'error', message: 'BP y nombre son obligatorios' })
    }

    const correo = String(data.correo || '').trim().toLowerCase()
    if (!correo.endsWith('@latam.com')) {
      return jsonResponse({ status: 'error', message: 'El correo debe ser una cuenta corporativa @latam.com' })
    }

    if (data.formType === 'mes-subsiguiente') {
      return writeToSheet(MES_SUBSIGUIENTE_GID, buildMesSubsiguienteRow(data, correo))
    }

    if (data.formType === 'descanso-medico') {
      const documentoUrl = uploadFileToDrive(data.documentoDM, data.documentoDMNombre, data.documentoDMTipo)
      return writeToSheet(DESCANSO_MEDICO_GID, buildDescansoMedicoRow(data, correo, documentoUrl))
    }

    // Sin formType (o 'actualizacion-datos'): comportamiento original.
    return writeToSheet(ACTUALIZACION_DATOS_GID, buildActualizacionDatosRow(data, correo))
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message })
  }
}

const ACTUALIZACION_DATOS_GID = 2110233367
const MES_SUBSIGUIENTE_GID = 1379865326
// TODO: reemplazar por el GID real de la pestaña "Descanso Médico" (créala
// con los encabezados que te pasé y pon aquí el número después de #gid= en
// la URL al hacer click en esa pestaña).
const DESCANSO_MEDICO_GID = 1801672376
const DESCANSO_MEDICO_FOLDER_ID = '1GD46b5Zigv8wSKE2jdpNwJnJV3-JH4JW'

function buildActualizacionDatosRow(data, correo) {
  // "licencia" no está acá: su única columna relevante es de archivo.
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
    'Ingresa el número de tu nuevo pasaporte': sanitizeValue(data.pasaporteNumero),
    'Fecha de Vencimiento del pasaporte': sanitizeValue(data.pasaporteVencimiento),
    'País emisor de pasaporte': sanitizeValue(data.pasaportePais),
    'Indícanos qué número de celular deseas que consideremos ahora': sanitizeValue(data.celular),
    'Indícanos qué número de teléfono fijo deseas que consideremos ahora': sanitizeValue(data.telefonoFijo),
    'Fecha de vacunación': sanitizeValue(data.fiebreFecha),
    'Cuentas con tu pasaporte para ejercer funciones': sanitizeValue(data.rechazoPasaporte),
    'Ingresa el código alfanumérico de tu visa (código en rojo) Tripulante': sanitizeValue(data.visaTripulanteCodigo),
    'Fecha Emisión de VISA Tripulante': sanitizeValue(data.visaTripulanteEmision),
    'Fecha de Vencimiento de VISA Tripulante': sanitizeValue(data.visaTripulanteVencimiento),
    'Ingresa el código alfanumérico de tu visa (código en rojo) Turista': sanitizeValue(data.visaTuristaCodigo),
    'Fecha Emisión de VISA Turista': sanitizeValue(data.visaTuristaEmision),
    'Fecha de Vencimiento de VISA Turista': sanitizeValue(data.visaTuristaVencimiento),
  }
}

function buildMesSubsiguienteRow(data, correo) {
  return {
    'Marca temporal': new Date(),
    'Correo': sanitizeValue(correo),
    'BP': sanitizeValue(data.bp),
    'Nombre': sanitizeValue(data.nombre),
    'Mes del Rol': sanitizeValue(data.mesRol),
    'Novedad': sanitizeValue(data.novedad),
    'Fecha Afectación': sanitizeValue(data.fechaAfectacion),
    'N° Vuelo (Afectación)': sanitizeValue(data.numVuelo1),
    'Ruta (Afectación)': sanitizeValue(data.ruta1),
    'Hora Llegada (Afectación)': sanitizeValue(data.horaLlegada1),
    'Comentario (Afectación)': sanitizeValue(data.comentario1),
    'Fecha Vuelos Adicionales': sanitizeValue(data.fechaVuelosAdicionales),
    'N° Vuelo (Adicionales)': sanitizeValue(data.numVuelo2),
    'Ruta (Adicionales)': sanitizeValue(data.ruta2),
    'Mes Libre Deseado': sanitizeValue(data.mesLibreDeseado),
    'Comentario (Adicionales)': sanitizeValue(data.comentario2),
    'Fecha Libre (Jefatura)': sanitizeValue(data.fechaLibreJefatura),
    'Motivo (Jefatura)': sanitizeValue(data.motivoJefatura),
    'Documento Técnico': sanitizeValue(data.documentoTecnico),
    'Fecha de Cita': sanitizeValue(data.fechaCita),
    'Hora de Cita': sanitizeValue(data.horaCita),
    'Comentario (Documentación)': sanitizeValue(data.comentario4),
    'Tipo de Permiso': sanitizeValue(data.tipoPermiso),
    'Fecha Inicio Permiso': sanitizeValue(data.fechaInicioPermiso),
    'Fecha Fin Permiso': sanitizeValue(data.fechaFinPermiso),
  }
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

// Decodifica el base64 recibido del formulario y sube el archivo a la
// carpeta de Drive configurada. Hereda los permisos de esa carpeta — no lo
// hace público, así que la carpeta debe estar compartida con quien deba
// revisar los sustentos.
function uploadFileToDrive(base64, fileName, mimeType) {
  if (!base64) return ''
  const folder = DriveApp.getFolderById(DESCANSO_MEDICO_FOLDER_ID)
  const bytes = Utilities.base64Decode(base64)
  const blob = Utilities.newBlob(bytes, mimeType || 'application/octet-stream', fileName || 'documento')
  const file = folder.createFile(blob)
  return file.getUrl()
}

function writeToSheet(targetGid, valuesByHeader) {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  const sheet = ss.getSheets().find((s) => s.getSheetId() === targetGid)
  if (!sheet) {
    return jsonResponse({ status: 'error', message: 'No se encontró la pestaña (gid) indicada' })
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map((h) => h.toString().trim())

  const row = headers.map((header) => (header in valuesByHeader ? valuesByHeader[header] : ''))
  sheet.appendRow(row)

  return jsonResponse({ status: 'ok' })
}

// Contador por minuto en CacheService (compartido entre todas las
// ejecuciones del script). Al tope, corta en seco durante el resto de ese
// minuto — se resetea solo en el siguiente bucket.
function checkRateLimit() {
  const cache = CacheService.getScriptCache()
  const bucket = 'submits_' + Math.floor(Date.now() / 60000)
  const count = Number(cache.get(bucket) || 0)
  if (count >= RATE_LIMIT_PER_MINUTE) return false
  cache.put(bucket, String(count + 1), 90)
  return true
}

// Evita inyección de fórmulas: si el valor empieza con = + - @, Sheets lo
// interpretaría como fórmula al abrir la celda. Anteponer ' lo fuerza a texto
// plano. También recorta a 500 caracteres para frenar payloads gigantes.
function sanitizeValue(value) {
  if (value === undefined || value === null) return ''
  const str = String(value).slice(0, 500)
  return /^[=+\-@]/.test(str) ? "'" + str : str
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}

// Función temporal solo para forzar el diálogo de autorización con el
// permiso de escritura en Drive (getFolderById solo pide lectura, createFile
// pide un scope más amplio). Se puede borrar una vez que autorice bien.
function testDrivePermiso() {
  const folder = DriveApp.getFolderById(DESCANSO_MEDICO_FOLDER_ID)
  const file = folder.createFile('prueba-permiso.txt', 'archivo de prueba, se puede borrar', MimeType.PLAIN_TEXT)
  Logger.log(file.getUrl())
}
