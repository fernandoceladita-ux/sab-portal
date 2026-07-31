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

const SHARED_TOKEN = 'ACTUALIZACION'
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

    // Cambio de Uniforme no tiene un único campo `bp`/`nombre` (varía según
    // canal: lanyard o calidad), así que valida y sale antes de la regla
    // genérica de abajo, que sí aplica a los demás formularios.
    if (data.formType === 'cambio-uniforme') {
      const correoU = String(data.correo || '').trim().toLowerCase()
      if (!correoU.endsWith('@latam.com')) {
        return jsonResponse({ status: 'error', message: 'El correo debe ser una cuenta corporativa @latam.com' })
      }
      if (!String(data.nombreColaborador || '').trim()) {
        return jsonResponse({ status: 'error', message: 'Nombre y apellidos son obligatorios' })
      }
      const fotoUrl = data.calidadFoto
        ? uploadFileToDrive(data.calidadFoto, data.calidadFotoNombre, data.calidadFotoTipo, UNIFORMES_FOLDER_ID)
        : ''
      return writeToSheet(UNIFORMES_GID, buildUniformesRow(data, correoU, fotoUrl))
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
      const documentoUrl = uploadFileToDrive(data.documentoDM, data.documentoDMNombre, data.documentoDMTipo, DESCANSO_MEDICO_FOLDER_ID)
      return writeToSheet(DESCANSO_MEDICO_GID, buildDescansoMedicoRow(data, correo, documentoUrl))
    }

    if (data.formType === 'vacaciones') {
      return writeToSheet(VACACIONES_GID, buildVacacionesRow(data, correo))
    }

    if (data.formType === 'registro-sunat') {
      return writeToSheet(REGISTRO_SUNAT_GID, buildRegistroSunatRow(data, correo))
    }

    if (data.formType === 'domicilio-dgac') {
      const licenciaUrl = data.licenciaArchivo
        ? uploadFileToDrive(data.licenciaArchivo, data.licenciaArchivoNombre, data.licenciaArchivoTipo, DOMICILIO_DGAC_FOLDER_ID)
        : ''
      return writeToSheet(DOMICILIO_DGAC_GID, buildDomicilioDgacRow(data, correo, licenciaUrl))
    }

    // Sin formType (o 'actualizacion-datos'): comportamiento original, ahora
    // subiendo a Drive el archivo del trámite seleccionado (solo uno viene
    // relleno por envío, salvo VISA que puede traer Tripulante y/o Turista).
    const dniUrl = data.dniArchivo ? uploadFileToDrive(data.dniArchivo, data.dniArchivoNombre, data.dniArchivoTipo, ACTUALIZACION_DNI_FOLDER_ID) : ''
    const pasaporteUrl = data.pasaporteArchivo ? uploadFileToDrive(data.pasaporteArchivo, data.pasaporteArchivoNombre, data.pasaporteArchivoTipo, ACTUALIZACION_PASAPORTE_FOLDER_ID) : ''
    const fiebreUrl = data.fiebreArchivo ? uploadFileToDrive(data.fiebreArchivo, data.fiebreArchivoNombre, data.fiebreArchivoTipo, ACTUALIZACION_FIEBRE_FOLDER_ID) : ''
    const visaTripulanteUrl = data.visaTripulanteArchivo ? uploadFileToDrive(data.visaTripulanteArchivo, data.visaTripulanteArchivoNombre, data.visaTripulanteArchivoTipo, ACTUALIZACION_VISA_TRIPULANTE_FOLDER_ID) : ''
    const visaTuristaUrl = data.visaTuristaArchivo ? uploadFileToDrive(data.visaTuristaArchivo, data.visaTuristaArchivoNombre, data.visaTuristaArchivoTipo, ACTUALIZACION_VISA_TURISTA_FOLDER_ID) : ''
    const licenciaUrl = data.licenciaArchivo ? uploadFileToDrive(data.licenciaArchivo, data.licenciaArchivoNombre, data.licenciaArchivoTipo, ACTUALIZACION_LICENCIA_FOLDER_ID) : ''
    return writeToSheet(
      ACTUALIZACION_DATOS_GID,
      buildActualizacionDatosRow(data, correo, { dniUrl, pasaporteUrl, fiebreUrl, visaTripulanteUrl, visaTuristaUrl, licenciaUrl }),
    )
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message })
  }
}

const ACTUALIZACION_DATOS_GID = 2110233367
// Subcarpetas dentro de tu carpeta de Drive "actualizacion de datos", una
// por tipo de archivo, para que no se mezclen. Crea cada una, compártela
// igual que las anteriores, y reemplaza estos 5 IDs.
const ACTUALIZACION_DNI_FOLDER_ID = '1uDCbkzcOn8mja8t3GFGjpAoWLzzrAqIh'
const ACTUALIZACION_PASAPORTE_FOLDER_ID = '1Rm0bG2HrXN5G1rtQh0Zrp-ZwELeFhilb'
const ACTUALIZACION_VISA_TRIPULANTE_FOLDER_ID = '1b2HmUomJNp3Pa_6cEQg4DPI_4VaggrCP'
const ACTUALIZACION_VISA_TURISTA_FOLDER_ID = '1CVaFg2hVhRqGTOKhAyi7mfhGmJohp6nC'
const ACTUALIZACION_FIEBRE_FOLDER_ID = '1_ZfdWWM5_PP2eqcE6ULzIXIwT_SEc9ql'
const ACTUALIZACION_LICENCIA_FOLDER_ID = '1_vfAxpYceoOUxkw5fXsBFtoAzwcDnfKQ'
const MES_SUBSIGUIENTE_GID = 1379865326
// TODO: reemplazar por el GID real de la pestaña "Descanso Médico" (créala
// con los encabezados que te pasé y pon aquí el número después de #gid= en
// la URL al hacer click en esa pestaña).
const DESCANSO_MEDICO_GID = 1801672376
const DESCANSO_MEDICO_FOLDER_ID = '1GD46b5Zigv8wSKE2jdpNwJnJV3-JH4JW'
// TODO: reemplazar por el GID real de la pestaña "Vacaciones" (créala con los
// encabezados que te pasó Claude y pon aquí el número después de #gid= en la
// URL al hacer click en esa pestaña).
const VACACIONES_GID = 1772728526
// TODO: reemplazar por el GID real de la pestaña "Cambio de Uniforme".
const UNIFORMES_GID = 815933579
// TODO: crea una carpeta en Drive para las fotos de prendas por problemas de
// calidad (igual que hiciste con la de Descanso Médico) y pon aquí su ID.
const UNIFORMES_FOLDER_ID = '1ivO-uXw8HWzFICk0w3RzPwUv7tnYHNDT'
// TODO: reemplazar por el GID real de la pestaña "Registro SUNAT".
const REGISTRO_SUNAT_GID = 1592932357
// TODO: reemplazar por el GID real de la pestaña "Domicilio DGAC".
const DOMICILIO_DGAC_GID = 1159770071
// TODO: crea una carpeta en Drive para las fotos de la nueva licencia DGAC y
// pon aquí su ID.
const DOMICILIO_DGAC_FOLDER_ID = '1SAGqcibpIRcBgceY1y7D_GxalFzug4do'

function buildActualizacionDatosRow(data, correo, fileUrls) {
  // Ojo con "Ingresa una foto de tu VISA": el encabezado está DUPLICADO en el
  // Sheet (una vez para Tripulante, otra para Turista, mismo texto literal).
  // `writeToSheet` distingue la 2da aparición agregando " (2)" al buscarla,
  // así que aquí van las dos claves por separado.
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

function buildUniformesRow(data, correo, fotoUrl) {
  return {
    'Marca temporal': new Date(),
    'Correo': sanitizeValue(correo),
    'Nombre Colaborador': sanitizeValue(data.nombreColaborador),
    'Canal': sanitizeValue(data.canal),
    'BP (Lanyard)': sanitizeValue(data.lanyardBP),
    'Nombre (Lanyard)': sanitizeValue(data.lanyardNombre),
    'Motivo (Lanyard)': sanitizeValue(data.motivo),
    'Base (Lanyard)': sanitizeValue(data.base),
    'BP (Calidad)': sanitizeValue(data.calidadBP),
    'Nombre (Calidad)': sanitizeValue(data.calidadNombre),
    'Tipo de Solicitud (Calidad)': sanitizeValue(data.calidadTipo),
    'Detalle (Calidad)': sanitizeValue(data.calidadDetalle),
    'Foto de Prenda (Calidad)': fotoUrl || '',
  }
}

function buildRegistroSunatRow(data, correo) {
  return {
    'Marca temporal': new Date(),
    'Correo': sanitizeValue(correo),
    'BP': sanitizeValue(data.bp),
    'Nombre': sanitizeValue(data.nombre),
    'Fecha de Nacimiento': sanitizeValue(data.fechaNacimiento),
    'Pasaporte': sanitizeValue(data.pasaporte),
    'Tipo de Equipo': sanitizeValue(data.tipoEquipo),
    'Uso': sanitizeValue(data.uso),
    'Marca': sanitizeValue(data.marca),
    'Modelo': sanitizeValue(data.modelo),
    'Serie': sanitizeValue(data.serie),
  }
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

// Decodifica el base64 recibido del formulario y sube el archivo a la
// carpeta de Drive indicada. Hereda los permisos de esa carpeta — no lo hace
// público, así que la carpeta debe estar compartida con quien deba revisar
// los archivos.
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
  if (!sheet) {
    return jsonResponse({ status: 'error', message: 'No se encontró la pestaña (gid) indicada' })
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map((h) => h.toString().trim())

  // Algunos Sheets viejos (ej. Actualización de Datos) tienen dos columnas
  // con el MISMO texto de encabezado (ej. "Ingresa una foto de tu VISA"
  // repetido para Tripulante y Turista). Para esos casos, la 2da aparición
  // en adelante se busca como "Encabezado (2)", "Encabezado (3)", etc. — así
  // el row-builder puede darle un valor distinto a cada una sin tocar el
  // Sheet ni depender de la posición de columna.
  const seen = {}
  const row = headers.map((header) => {
    seen[header] = (seen[header] || 0) + 1
    const key = seen[header] > 1 ? `${header} (${seen[header]})` : header
    if (key in valuesByHeader) return valuesByHeader[key]
    return header in valuesByHeader ? valuesByHeader[header] : ''
  })
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
