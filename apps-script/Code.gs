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
      'Ingresa tu BP': data.bp || '',
      'Ingresa tus nombres y apellidos completos': data.nombre || '',
      'Selecciona que actualización deseas realizar': data.tramite || '',
      'Nombre del Contacto de Emergencia': data.contactoNombre || '',
      'Teléfono': data.contactoTelefono || '',
      'Indícanos tu nueva dirección': data.direccion || '',
      'Indícanos el distrito': data.distrito || '',
      'Agregar sus coordenadas': data.coordenadas || '',
      'Fecha vencimiento DNI': data.dniVencimiento || '',
      'Ingresa el número de tu nuevo pasaporte': data.pasaporteNumero || '',
      'Fecha de Vencimiento del pasaporte': data.pasaporteVencimiento || '',
      'País emisor de pasaporte': data.pasaportePais || '',
      'Indícanos qué número de celular deseas que consideremos ahora': data.celular || '',
      'Indícanos qué número de teléfono fijo deseas que consideremos ahora': data.telefonoFijo || '',
      'Fecha de vacunación': data.fiebreFecha || '',
      'Cuentas con tu pasaporte para ejercer funciones': data.rechazoPasaporte || '',
      'Ingresa el código alfanumérico de tu visa (código en rojo) Tripulante': data.visaTripulanteCodigo || '',
      'Fecha Emisión de VISA Tripulante': data.visaTripulanteEmision || '',
      'Fecha de Vencimiento de VISA Tripulante': data.visaTripulanteVencimiento || '',
      'Ingresa el código alfanumérico de tu visa (código en rojo) Turista': data.visaTuristaCodigo || '',
      'Fecha Emisión de VISA Turista': data.visaTuristaEmision || '',
      'Fecha de Vencimiento de VISA Turista': data.visaTuristaVencimiento || '',
    }

    const row = headers.map((header) => (header in valuesByHeader ? valuesByHeader[header] : ''))
    sheet.appendRow(row)

    return jsonResponse({ status: 'ok' })
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message })
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)
}
