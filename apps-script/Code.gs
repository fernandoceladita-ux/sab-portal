// Pega este código en el editor de Apps Script de tu Google Sheet
// (Extensiones > Apps Script), reemplaza SHARED_TOKEN por un valor propio,
// y despliega como Web App (ver instrucciones que te dio Claude en el chat).
//
// El script NO usa columnas fijas: en cada envío lee la fila 1 (encabezados)
// de la pestaña indicada por TARGET_GID y coloca cada valor en la columna
// cuyo encabezado coincida exactamente con el texto — así no hay riesgo de
// desalinear datos aunque cambies el orden de columnas más adelante.

function doGet() {
  // Solo para verificar en el navegador que el deployment está vivo.
  // El formulario real siempre usa doPost.
  return jsonResponse({ status: 'ok', message: 'SAB Portal sheet bridge activo. Este endpoint solo acepta POST.' })
}

function doPost(e) {
  const SHARED_TOKEN = 'CAMBIA_ESTE_TOKEN'
  const SHEET_ID = '1WSl5ChIUUzCNO4jcV3UHxVlELuKtja1hHDSZdPJia8U'
  const TARGET_GID = 2110233367

  try {
    const data = JSON.parse(e.postData.contents)

    if (data.token !== SHARED_TOKEN) {
      return jsonResponse({ status: 'error', message: 'Token inválido' })
    }

    if (!String(data.bp || '').trim() || !String(data.nombre || '').trim()) {
      return jsonResponse({ status: 'error', message: 'BP y nombre son obligatorios' })
    }

    const ss = SpreadsheetApp.openById(SHEET_ID)
    const sheet = ss.getSheets().find((s) => s.getSheetId() === TARGET_GID)
    if (!sheet) {
      return jsonResponse({ status: 'error', message: 'No se encontró la pestaña (gid) indicada' })
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map((h) => h.toString().trim())

    // Mapea encabezado exacto -> valor recibido del formulario.
    // "licencia" no está acá: su única columna relevante es de archivo.
    const valuesByHeader = {
      'Marca temporal': new Date(),
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

    const row = headers.map((header) => (header in valuesByHeader ? valuesByHeader[header] : ''))
    sheet.appendRow(row)

    return jsonResponse({ status: 'ok' })
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message })
  }
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
