function onOpen() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().setSpreadsheetTimeZone('America/Lima');
  } catch (e) {}

  // No reinstalar activadores aquí.
  // Antes esto creaba/recreaba activadores cada vez que alguien abría el archivo,
  // incluso desde otras cuentas. Resultado: varias ejecuciones pegando la misma fila.
}

var TZ_LIMA = 'America/Lima';
var ENCABEZADOS_RESUMEN = [
  'codigo_operacion',
  'pais',
  'correo',
  'fecha_hora',
  'bp',
  'nombre',
  'categoria',
  'correo_cpl',
  'tipo',
  'coordinador_responsable',
  'consulta',
  'archivo_referencia',
  'fecha_prevista_resolucion',
  'estado_rpta',
  'estado_encuesta',
  'respuesta',
  'fecha_hora_rpta',
  'sla',
  'ratio',
  'tipo_tramite',
  'contador',
  'motivo',
  'enlace_archivo'
];

var COL_RESUMEN = (function () {
  var m = {};
  for (var i = 0; i < ENCABEZADOS_RESUMEN.length; i++) {
    m[ENCABEZADOS_RESUMEN[i]] = i + 1;
  }
  return m;
})();

function _anchoResumen() {
  return ENCABEZADOS_RESUMEN.length;
}

function _normalizarClaveEncabezado(s) {
  return String(s == null ? '' : s)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function _obtenerMapaEncabezadosDesdeFila(filaEncabezados) {
  var mapa = {};
  for (var i = 0; i < filaEncabezados.length; i++) {
    var clave = _normalizarClaveEncabezado(filaEncabezados[i]);
    if (clave && !mapa.hasOwnProperty(clave)) {
      mapa[clave] = i;
    }
  }
  return mapa;
}

function _valorPorEncabezadoOFallback(fila, mapa, nombres, posFallback1Based) {
  var lista = Array.isArray(nombres) ? nombres : [nombres];

  for (var i = 0; i < lista.length; i++) {
    var clave = _normalizarClaveEncabezado(lista[i]);
    if (mapa.hasOwnProperty(clave)) {
      var idx = mapa[clave];
      return (idx >= 0 && idx < fila.length) ? fila[idx] : '';
    }
  }

  var idxFallback = Number(posFallback1Based) - 1;
  return (idxFallback >= 0 && idxFallback < fila.length) ? fila[idxFallback] : '';
}

function asegurarEncabezadosResumen(hoja) {
  if (!hoja) return;

  var anchoObjetivo = _anchoResumen();
  var lastRow = Math.max(hoja.getLastRow(), 1);
  var lastCol = Math.max(hoja.getLastColumn(), anchoObjetivo);

  var matriz = hoja.getRange(1, 1, lastRow, lastCol).getValues();
  if (!matriz.length) {
    hoja.getRange(1, 1, 1, anchoObjetivo).setValues([ENCABEZADOS_RESUMEN]);
    return;
  }

  var actuales = [];
  for (var i = 0; i < anchoObjetivo; i++) {
    actuales.push(String((matriz[0] && typeof matriz[0][i] !== 'undefined') ? matriz[0][i] : '').trim());
  }

  var coincide = true;
  for (var j = 0; j < anchoObjetivo; j++) {
    if (actuales[j] !== ENCABEZADOS_RESUMEN[j]) {
      coincide = false;
      break;
    }
  }

  if (coincide) return;

  var mapa = _obtenerMapaEncabezadosDesdeFila(matriz[0] || []);
  var nueva = [ENCABEZADOS_RESUMEN.slice()];

  for (var r = 1; r < matriz.length; r++) {
    var filaActual = matriz[r];
    var filaNueva = [];

    for (var c = 0; c < ENCABEZADOS_RESUMEN.length; c++) {
      var claveObjetivo = _normalizarClaveEncabezado(ENCABEZADOS_RESUMEN[c]);
      var idx = mapa.hasOwnProperty(claveObjetivo) ? mapa[claveObjetivo] : -1;
      filaNueva.push((idx >= 0 && idx < filaActual.length) ? filaActual[idx] : '');
    }

    nueva.push(filaNueva);
  }

  hoja.getRange(1, 1, lastRow, lastCol).clearContent();
  hoja.getRange(1, 1, nueva.length, anchoObjetivo).setValues(nueva);
}

function asegurarEncabezadosEnTodasLasHojasResumen() {
  var ss = SpreadsheetApp.getActive();
  var hojas = ss.getSheets();

  for (var i = 0; i < hojas.length; i++) {
    if (/^Resumen_.{2}$/.test(hojas[i].getName())) {
      asegurarEncabezadosResumen(hojas[i]);
    }
  }
}
function _toLowerEmail(addr) {
  var s = (addr == null ? '' : String(addr)).trim();
  return s ? s.toLowerCase() : '';
}
function _toLowerEmailList(list) {
  var s = (list == null ? '' : String(list)).trim();
  if (!s) return '';
  return s.split(/[,\s;]+/)
          .filter(function(x){ return x && x.trim(); })
          .map(function(x){ return x.trim().toLowerCase(); })
          .join(',');
}
function _claveFilaBase(ss, hojaResumen, filaIndice, filaValores) {
  var codigo = (filaValores && filaValores[0]) ? String(filaValores[0]).trim() : '';
  return ss.getId() + ':' + hojaResumen.getSheetId() + ':' + (codigo || ('row#' + filaIndice));
}
function _clavePorCodigo(ss, hojaResumen, codigo, filaIndice) {
  codigo = String(codigo || '').trim();
  return ss.getId() + ':' + hojaResumen.getSheetId() + ':' + (codigo || ('row#' + filaIndice));
}
function onInstall() {
  reinstalarDisparadores();
}
function asegurarDisparadorMinutal() {
  // Intencionalmente no hace nada.
  // Los activadores deben instalarse una sola vez ejecutando instalarActivadoresPrincipal().
  // No se deben crear activadores desde la ejecución minutal, porque si algo los borra
  // o entra otra cuenta, el script puede terminar con más de un disparador activo.
}

function reinstalarDisparadores() {
  instalarActivadoresPrincipal();
}

function instalarActivadoresPrincipal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssId = ss.getId();
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    Logger.log('No se pudieron instalar activadores porque otra ejecución mantiene el lock.');
    return;
  }

  try {
    var handlersPermitidos = {
      ejecutarCadaMinuto: true,
      triggerOnEditResumen: true
    };

    var triggers = ScriptApp.getProjectTriggers();

    for (var i = 0; i < triggers.length; i++) {
      var fn = triggers[i].getHandlerFunction && triggers[i].getHandlerFunction();
      if (handlersPermitidos[fn]) {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }

    ScriptApp.newTrigger('ejecutarCadaMinuto')
      .timeBased()
      .everyMinutes(1)
      .create();

    ScriptApp.newTrigger('triggerOnEditResumen')
      .forSpreadsheet(ssId)
      .onEdit()
      .create();

    PropertiesService.getScriptProperties().setProperty(
      'ACTIVADORES_INSTALADOS_POR',
      Session.getEffectiveUser().getEmail() || 'usuario_desconocido'
    );

    Logger.log('Activadores reinstalados correctamente para el usuario actual.');
  } finally {
    lock.releaseLock();
  }
}

function borrarMisActivadoresSAB() {
  var triggers = ScriptApp.getProjectTriggers();

  for (var i = 0; i < triggers.length; i++) {
    var fn = triggers[i].getHandlerFunction && triggers[i].getHandlerFunction();
    if (fn === 'ejecutarCadaMinuto' || fn === 'triggerOnEditResumen') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  Logger.log('Se borraron los activadores SAB visibles para el usuario actual.');
}

function ejecutarCadaMinuto() {
  try { _despacharColaOnEdit(); } catch (e) { Logger.log('_despacharColaOnEdit: ' + e); }
  sincronizar();
}

function sincronizar() {
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(25000)) {
    Logger.log('sincronizar omitido: ya hay otra ejecución activa.');
    return;
  }

  try {
    try { asegurarEncabezadosEnTodasLasHojasResumen(); } catch (e1) { Logger.log('asegurarEncabezadosEnTodasLasHojasResumen: ' + e1); }
    try { actualizarRegistroConHojasForm(); } catch (e2) { Logger.log('actualizarRegistroConHojasForm: ' + e2); }
    try { procesarRegistro(); } catch (e3) { Logger.log('procesarRegistro: ' + e3); }
    try { aplicarValidacionesEnResumen(); } catch (e4) { Logger.log('aplicarValidacionesEnResumen: ' + e4); }
    try { manejarCorreosPendientes(); } catch (e5) { Logger.log('manejarCorreosPendientes: ' + e5); }
  } finally {
    lock.releaseLock();
  }
}
function onEdit(e) {
  try { } catch (err) { }
}
var COLA_ONEDIT_KEY = 'COLA_ONEDIT_RESUMEN';
var COLA_EN_EJECUCION_KEY = 'COLA_ONEDIT_EJECUTANDO_RESUMEN';

function _propsDoc() {
  return PropertiesService.getDocumentProperties();
}
function _leerColaOnEdit() {
  var raw = _propsDoc().getProperty(COLA_ONEDIT_KEY);
  if (!raw) return [];
  try {
    var arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}
function _guardarColaOnEdit(arr) {
  _propsDoc().setProperty(COLA_ONEDIT_KEY, JSON.stringify(arr));
}
function _encolarEditResumenN_O(e) {
  if (!e || !e.range) return;
  var sh = e.range.getSheet();
  var nombre = sh.getName();
  if (!/^Resumen_.{2}$/.test(nombre)) return;

  var col = e.range.getColumn();
  if (col !== COL_RESUMEN.estado_rpta && col !== COL_RESUMEN.estado_encuesta) return;

  var evento = {
    hoja: nombre,
    fila: e.range.getRow(),
    col: col,
    valor: (typeof e.value !== 'undefined') ? e.value : sh.getRange(e.range.getRow(), e.range.getColumn()).getValue(),
    ts: Date.now()
  };

  var lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    var cola = _leerColaOnEdit();
    cola.push(evento);
    _guardarColaOnEdit(cola);
  } finally {
    lock.releaseLock();
  }
}
function _tomarSiguienteEventoOnEdit() {
  var lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  try {
    var cola = _leerColaOnEdit();
    if (!cola.length) return null;
    var evt = cola.shift();
    _guardarColaOnEdit(cola);
    return evt;
  } finally {
    lock.releaseLock();
  }
}
function _iniciarDespachador() {
  var props = _propsDoc();
  var sLock = LockService.getScriptLock();
  sLock.waitLock(30000);
  try {
    if (props.getProperty(COLA_EN_EJECUCION_KEY) === '1') return;
    props.setProperty(COLA_EN_EJECUCION_KEY, '1');
  } finally {
    sLock.releaseLock();
  }
  _despacharColaOnEdit();
}
function _despacharColaOnEdit() {
  var props = _propsDoc();
  var inicio = Date.now();
  var ventanaMs = 300000;

  while ((Date.now() - inicio) < ventanaMs) {
    var evento = _tomarSiguienteEventoOnEdit();
    if (!evento) break;

    try {
      controladorOnEdit(null, evento);
    } catch (err) { }

    Utilities.sleep(250);
  }

  var sLock = LockService.getScriptLock();
  sLock.waitLock(30000);
  try {
    props.deleteProperty(COLA_EN_EJECUCION_KEY);
  } finally {
    sLock.releaseLock();
  }
}
function triggerOnEditResumen(e) {
  _encolarEditResumenN_O(e);
  _iniciarDespachador();
}
function controladorOnEdit(e, contexto) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  var hojaResumen = null;
  if (contexto && contexto.hoja) {
    hojaResumen = ss.getSheetByName(contexto.hoja);
  }
  if (!hojaResumen) {
    var hojas = ss.getSheets();
    for (var i = hojas.length - 1; i >= 0; i--) {
      if (/^Resumen_.{2}$/.test(hojas[i].getName())) {
        hojaResumen = hojas[i];
        break;
      }
    }
  }
  if (!hojaResumen) return;

  asegurarEncabezadosResumen(hojaResumen);

  var hojaEditada = null;
  var filaIndice = 0;
  if (contexto && contexto.fila) {
    hojaEditada = hojaResumen;
    filaIndice = contexto.fila;
  } else if (e && e.range) {
    hojaEditada = e.range.getSheet();
    filaIndice = e.range.getRow();
  }

  if (!hojaEditada || hojaEditada.getSheetId() !== hojaResumen.getSheetId()) return;
  if (filaIndice < 2) return;

  var filaValores = hojaResumen.getRange(filaIndice, 1, 1, _anchoResumen()).getValues()[0];

  var estadoN = filaValores[COL_RESUMEN.estado_rpta - 1];
  var estadoO = filaValores[COL_RESUMEN.estado_encuesta - 1];
  var respuesta = filaValores[COL_RESUMEN.respuesta - 1];
  var correo = filaValores[COL_RESUMEN.correo - 1];
  var fechaD = filaValores[COL_RESUMEN.fecha_hora - 1];
  var nombre = filaValores[COL_RESUMEN.nombre - 1];
  var consulta = filaValores[COL_RESUMEN.consulta - 1];

  var props = PropertiesService.getScriptProperties();
  var claveBase = _claveFilaBase(ss, hojaResumen, filaIndice, filaValores);
  var tz = TZ_LIMA;
  var feriados = obtenerFeriados();
  var colEditada = contexto && contexto.col ? contexto.col : (e && e.range ? e.range.getColumn() : 0);

  props.setProperty('N:' + claveBase, estadoN || '');
  props.setProperty('O:' + claveBase, estadoO || '');

  if (colEditada === COL_RESUMEN.estado_encuesta && estadoO === 'Fe de erratas') {
    hojaResumen.getRange(filaIndice, COL_RESUMEN.respuesta, 1, 4).clearContent();

    if (estadoN === 'Completado') {
      hojaResumen.getRange(filaIndice, COL_RESUMEN.estado_rpta).setValue('Pendiente');
      props.setProperty('N:' + claveBase, 'Pendiente');
    }

    props.setProperty('F:' + claveBase, '1');
    props.deleteProperty('R:' + claveBase);
    props.deleteProperty('E:' + claveBase);
    props.deleteProperty('RF:' + claveBase);
    props.setProperty('O:' + claveBase, 'Fe de erratas');
    return;
  }

  if (colEditada === COL_RESUMEN.estado_rpta && estadoN === 'Completado' && estadoO === 'Fe de erratas') {
    props.setProperty('F:' + claveBase, '1');

    if (!respuesta || String(respuesta).trim() === '') {
      hojaResumen.getRange(filaIndice, COL_RESUMEN.estado_rpta).setValue('Pendiente');
      props.setProperty('N:' + claveBase, 'Pendiente');
      ss.toast('Para cerrar por "Fe de erratas", primero complete la columna P con el texto de corrección.');
      return;
    }

    if (correo && props.getProperty('RF:' + claveBase) !== '1') {
      var ahoraRpta = new Date();
      enviarCorreoResolucionFeDeErratas(
        correo,
        filaValores[COL_RESUMEN.correo_cpl - 1],
        filaValores[COL_RESUMEN.codigo_operacion - 1],
        filaValores[COL_RESUMEN.fecha_hora - 1],
        filaValores[COL_RESUMEN.tipo - 1],
        consulta,
        respuesta,
        ahoraRpta,
        nombre
      );
      props.setProperty('RF:' + claveBase, '1');
    }

    cerrarCasoFila(hojaResumen, filaIndice, fechaD, tz, feriados);
    return;
  }

  if (estadoO === 'Fe de erratas') {
    hojaResumen.getRange(filaIndice, COL_RESUMEN.respuesta, 1, 4).clearContent();
    hojaResumen.getRange(filaIndice, COL_RESUMEN.estado_rpta).setValue('Pendiente');

    props.setProperty('F:' + claveBase, '1');
    props.deleteProperty('R:' + claveBase);
    props.deleteProperty('E:' + claveBase);
    props.deleteProperty('RF:' + claveBase);
    props.setProperty('N:' + claveBase, 'Pendiente');
    props.setProperty('O:' + claveBase, 'Fe de erratas');
    return;
  }

  if (estadoO === 'Enviar' && (!respuesta || String(respuesta).trim() === '')) {
    hojaResumen.getRange(filaIndice, COL_RESUMEN.estado_encuesta).setValue('Pendiente');
    props.setProperty('O:' + claveBase, 'Pendiente');
    ss.toast('No se puede seleccionar "Enviar" si la columna P está vacía. Se revierte a "Pendiente".');
    return;
  }

  var enFeDeErratas = props.getProperty('F:' + claveBase) === '1';
  if ((estadoO === 'Fe de erratas' || enFeDeErratas) && estadoN === 'Completado') {
    if (!respuesta || String(respuesta).trim() === '') {
      hojaResumen.getRange(filaIndice, COL_RESUMEN.estado_rpta).setValue('Pendiente');
      props.setProperty('N:' + claveBase, 'Pendiente');
      ss.toast('Para cerrar por "Fe de erratas", primero complete la columna P con el texto de corrección.');
      return;
    }

    if (correo && props.getProperty('RF:' + claveBase) !== '1') {
      var ahoraRpta2 = new Date();
      enviarCorreoResolucionFeDeErratas(
        correo,
        filaValores[COL_RESUMEN.correo_cpl - 1],
        filaValores[COL_RESUMEN.codigo_operacion - 1],
        filaValores[COL_RESUMEN.fecha_hora - 1],
        filaValores[COL_RESUMEN.tipo - 1],
        consulta,
        respuesta,
        ahoraRpta2,
        nombre
      );
      props.setProperty('RF:' + claveBase, '1');
    }

    cerrarCasoFila(hojaResumen, filaIndice, fechaD, tz, feriados);
    return;
  }

  if (estadoN === 'Completado' && estadoO === 'No enviar') {
    cerrarCasoFila(hojaResumen, filaIndice, fechaD, tz, feriados);
    return;
  }

  if (estadoN === 'Completado' && estadoO === 'Enviar') {
    var resolucionEnviada = props.getProperty('R:' + claveBase) === '1';
    var encuestaEnviada = props.getProperty('E:' + claveBase) === '1';

    if (correo && respuesta && String(respuesta).trim() !== '') {
      if (!resolucionEnviada) {
        var ahoraRpta3 = new Date();
        enviarCorreoResolucion(
          correo,
          filaValores[COL_RESUMEN.correo_cpl - 1],
          filaValores[COL_RESUMEN.codigo_operacion - 1],
          filaValores[COL_RESUMEN.fecha_hora - 1],
          filaValores[COL_RESUMEN.tipo - 1],
          filaValores[COL_RESUMEN.coordinador_responsable - 1],
          consulta,
          respuesta,
          ahoraRpta3,
          nombre
        );
        props.setProperty('R:' + claveBase, '1');
      }

      if (!encuestaEnviada) {
        enviarCorreoEncuesta(correo, filaValores[COL_RESUMEN.tipo - 1]);
        props.setProperty('E:' + claveBase, '1');
      }

      cerrarCasoFila(hojaResumen, filaIndice, fechaD, tz, feriados);
    }
    return;
  }
}
function cerrarCasoFila(hojaResumen, filaIndice, fechaD, tz, feriados) {
  var celdaFechaRpta = hojaResumen.getRange(filaIndice, COL_RESUMEN.fecha_hora_rpta);
  var valorFechaRpta = celdaFechaRpta.getValue();
  var ahora = new Date();

  if (!valorFechaRpta) {
    celdaFechaRpta.setValue(ahora);
  } else {
    ahora = convertirAFecha(valorFechaRpta) || ahora;
  }

  var dias = diasHabilesTranscurridos(fechaD, ahora, feriados, tz);
  hojaResumen.getRange(filaIndice, COL_RESUMEN.sla).setValue(dias);
  hojaResumen.getRange(filaIndice, COL_RESUMEN.ratio).setValue(dias <= 5 ? 'IN' : 'OUT');

  return ahora;
}
function forzarImportante(mensaje) {
  try { if (mensaje && mensaje.markImportant) mensaje.markImportant(); } catch (e) {}
  try {
    if (mensaje && mensaje.getThread && GmailApp && GmailApp.markThreadImportant) {
      GmailApp.markThreadImportant(mensaje.getThread());
    }
  } catch (e) {}
  try {
    if (typeof Gmail !== 'undefined' && mensaje && mensaje.getId) {
      Gmail.Users.Messages.modify({ addLabelIds: ['IMPORTANT'] }, 'me', mensaje.getId());
    }
  } catch (e) {}
}
function _encodeSubjectUtf8(subject) {
  try {
    var b64 = Utilities.base64Encode(Utilities.newBlob(subject, 'text/plain').getBytes());
    return '=?UTF-8?B?' + b64 + '?=';
  } catch (e) {
    return subject || '';
  }
}

function enviarConHeadersImportante(para, cc, asunto, html) {
  var paraNorm = _toLowerEmailList(para);
  var ccNorm = _toLowerEmailList(cc);

  if (!paraNorm) {
    throw new Error('No hay destinatario válido para enviar el correo. Valor recibido: ' + para);
  }

  var opciones = { htmlBody: html || '' };
  if (ccNorm) opciones.cc = ccNorm;

  // MailApp es más simple y estable para activadores que GmailApp.
  // GmailApp depende más del contexto/cuenta y cuando falla deja a humanos mirando logs como si fueran oráculos.
  MailApp.sendEmail(paraNorm, asunto || '', ' ', opciones);
  return null;
}
function inspeccionarEnvio(codigoOperacion) {
  var ss = SpreadsheetApp.getActive();
  var hojas = obtenerHojasResumen();
  if (!hojas.length) { Logger.log('No hay hojas Resumen_XX'); return; }

  var encontrado = false;
  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    for (var i = 0; i < datos.length; i++) {
      if (String(datos[i][COL_RESUMEN.codigo_operacion - 1]).trim() === String(codigoOperacion).trim()) {
        encontrado = true;
        var fila = i + 2;
        var clave = _clavePorCodigo(ss, hoja, codigoOperacion, fila);
        var p = PropertiesService.getScriptProperties();
        var puede = _correoPuedeProcesarseFila_(datos[i]);

        Logger.log('Hoja %s | Fila %s | Clave %s | PuedeProcesarse=%s', hoja.getName(), fila, clave, puede);
        Logger.log(
          'codigo=%s | estado_rpta=%s | estado_encuesta=%s | correo=%s | respuesta_len=%s | fecha_hora_rpta=%s',
          datos[i][COL_RESUMEN.codigo_operacion - 1],
          datos[i][COL_RESUMEN.estado_rpta - 1],
          datos[i][COL_RESUMEN.estado_encuesta - 1],
          datos[i][COL_RESUMEN.correo - 1],
          String(datos[i][COL_RESUMEN.respuesta - 1] || '').length,
          datos[i][COL_RESUMEN.fecha_hora_rpta - 1]
        );
        Logger.log(
          'Props R:%s E:%s F:%s RF:%s LOCK:%s',
          p.getProperty('R:' + clave),
          p.getProperty('E:' + clave),
          p.getProperty('F:' + clave),
          p.getProperty('RF:' + clave),
          p.getProperty('ENVIO_EN_PROCESO:' + clave)
        );
      }
    }
  }

  if (!encontrado) Logger.log('Código no encontrado en ninguna hoja Resumen_XX: ' + codigoOperacion);
}

function diagnosticarPendientesCorreoSAB() {
  var hojas = obtenerHojasResumen();
  var total = 0;

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    var subtotal = 0;

    for (var i = 0; i < datos.length; i++) {
      if (_correoPuedeProcesarseFila_(datos[i])) {
        subtotal++;
        total++;
        Logger.log(
          'Pendiente correo | hoja=%s fila=%s codigo=%s estado=%s correo=%s respuesta_len=%s',
          hoja.getName(),
          i + 2,
          datos[i][COL_RESUMEN.codigo_operacion - 1],
          datos[i][COL_RESUMEN.estado_encuesta - 1],
          datos[i][COL_RESUMEN.correo - 1],
          String(datos[i][COL_RESUMEN.respuesta - 1] || '').length
        );
      }
    }

    Logger.log('Pendientes en ' + hoja.getName() + ': ' + subtotal);
  }

  Logger.log('Pendientes totales: ' + total);
}

function enviarCorreoResolucionFeDeErratas(para, ccCpl, codigoOperacion, fechaHora, tipo, consulta, respuestaCorregida, fechaHoraRpta, nombre) {
  var tz = TZ_LIMA;
  function fmt(d) {
    var dd = convertirAFecha(d);
    return dd ? Utilities.formatDate(dd, tz, 'dd/MM/yyyy HH:mm') : '';
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fila(label, value) {
    return '<tr>' +
             '<td style="width:220px;padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-right:none;border-radius:8px 0 0 8px;font-weight:600;color:#111">' + label + '</td>' +
             '<td style="padding:10px 12px;border:1px solid #e5e7eb;border-left:none;border-radius:0 8px 8px 0;color:#111">' + (value || '') + '</td>' +
           '</tr>';
  }
  function filaMultilinea(label, htmlValue) {
    return '<tr>' +
             '<td style="width:220px;vertical-align:top;padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-right:none;border-radius:8px 0 0 8px;font-weight:600;color:#111">' + label + '</td>' +
             '<td style="padding:10px 12px;border:1px solid #e5e7eb;border-left:none;border-radius:0 8px 8px 0;color:#111">' + (htmlValue || '') + '</td>' +
           '</tr>';
  }

  var asunto = 'Canal de Consultas SAB — Fe de erratas ' + (codigoOperacion || '');
  var logo = 'https://storage.googleapis.com/datagobdomain-prod-p3n5_data-governance-platform-public/assets/latam-logo-word.png';

  var html =
    '<div style="background:#f5f6fb;padding:24px 0;margin:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">' +
        '<tr>' +
          '<td style="background:#1b0088;padding:14px 20px">' +
            '<img src="' + logo + '" alt="LATAM" style="height:22px;display:block">' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="background:#ffffff;padding:22px 22px 8px 22px">' +
            '<div style="font-size:20px;line-height:1.3;color:#1b0088;margin:0 0 6px 0">Hola, ' + esc(nombre || '') + '.</div>' +
            '<div style="font-size:14px;color:#374151;margin:0 0 16px 0">Te compartimos la <strong>respuesta</strong> a tu consulta a <strong>Soporte SAB</strong>.</div>' +
            '<div style="display:inline-block;background:#fee2e2;color:#b91c1c;font-weight:700;font-size:12px;padding:6px 10px;border-radius:999px;margin:0 0 14px 0;letter-spacing:.3px">FE DE ERRATAS</div>' +
            '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 8px">' +
              fila('Código de operación', esc(codigoOperacion)) +
              fila('Fecha de ingreso', esc(fmt(fechaHora))) +
              fila('Tipo', esc(tipo)) +
              filaMultilinea('Consulta', esc(consulta).replace(/\n/g,'<br>')) +
              filaMultilinea('Respuesta', esc(respuestaCorregida).replace(/\n/g,'<br>')) +
              fila('Fecha de respuesta', esc(fmt(fechaHoraRpta))) +
            '</table>' +
            '<p style="margin:16px 0 0 0;font-size:12px;color:#6b7280">Recuerda que puedes hacerle seguimiento en la sección de trámites de tu aplicativo OSSA. <br>Por favor, no responder a este correo. Si necesitas mayor información, registra una nueva consulta en el formulario.</p>' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="background:#f3f4f6;color:#1b0088;text-align:center;padding:12px;font-size:12px">Soporte SAB – LATAM Airlines</td>' +
        '</tr>' +
      '</table>' +
    '</div>';

  enviarConHeadersImportante(para, ccCpl || '', asunto, html);
}
function obtenerHojasResumen() {
  var ss = SpreadsheetApp.getActive();
  var hojas = ss.getSheets();
  var res = [];

  for (var i = 0; i < hojas.length; i++) {
    if (/^Resumen_.{2}$/.test(hojas[i].getName())) {
      asegurarEncabezadosResumen(hojas[i]);
      res.push(hojas[i]);
    }
  }

  return res;
}

function obtenerHojaResumen() {
  var hojasResumen = obtenerHojasResumen();
  if (!hojasResumen.length) return null;

  // Se mantiene por compatibilidad con otras funciones antiguas.
  // Para envío de correos se usa obtenerHojasResumen(), no solo la última hoja.
  return hojasResumen[hojasResumen.length - 1];
}

function _columnaPorNombreFlexible(hoja, nombres, crearSiNoExiste) {
  var lista = Array.isArray(nombres) ? nombres : [nombres];
  var lastCol = Math.max(hoja.getLastColumn(), _anchoResumen());
  var encabezados = hoja.getRange(1, 1, 1, lastCol).getValues()[0];
  var mapa = _obtenerMapaEncabezadosDesdeFila(encabezados);

  for (var i = 0; i < lista.length; i++) {
    var clave = _normalizarClaveEncabezado(lista[i]);
    if (mapa.hasOwnProperty(clave)) return mapa[clave] + 1;
  }

  if (!crearSiNoExiste) return 0;

  var nombreNuevo = lista[0];
  var nuevaCol = lastCol + 1;
  hoja.getRange(1, nuevaCol).setValue(nombreNuevo);
  return nuevaCol;
}

function _registrarErrorAutomatizacionFila_(hoja, filaIndice, mensaje) {
  try {
    var colError = _columnaPorNombreFlexible(hoja, ['error_automatizacion', 'error automatizacion', 'error de automatizacion'], true);
    var colFecha = _columnaPorNombreFlexible(hoja, ['fecha_error_automatizacion', 'fecha error automatizacion', 'fecha de error de automatizacion'], true);

    hoja.getRange(filaIndice, colError).setValue(String(mensaje || '').slice(0, 45000));
    hoja.getRange(filaIndice, colFecha).setValue(new Date());
  } catch (e) {
    Logger.log('No se pudo registrar error en hoja: ' + e);
  }
}

function _limpiarErrorAutomatizacionFila_(hoja, filaIndice) {
  try {
    var colError = _columnaPorNombreFlexible(hoja, ['error_automatizacion', 'error automatizacion', 'error de automatizacion'], false);
    var colFecha = _columnaPorNombreFlexible(hoja, ['fecha_error_automatizacion', 'fecha error automatizacion', 'fecha de error de automatizacion'], false);

    if (colError) hoja.getRange(filaIndice, colError).clearContent();
    if (colFecha) hoja.getRange(filaIndice, colFecha).clearContent();
  } catch (e) {
    Logger.log('No se pudo limpiar error en hoja: ' + e);
  }
}
function obtenerHojaRegistro() {
  var ss = SpreadsheetApp.getActive();
  var hoja = ss.getSheetByName('Registro');
  if (!hoja) {
    hoja = ss.insertSheet('Registro');
  }
  return hoja;
}
function actualizarRegistroConHojasForm() {
  var ss = SpreadsheetApp.getActive();
  var hojaRegistro = obtenerHojaRegistro();
  var datosRegistro = hojaRegistro.getRange(1, 1, Math.max(hojaRegistro.getLastRow(), 1), 2).getValues();
  var indicePorNombre = {};
  for (var i = 0; i < datosRegistro.length; i++) {
    var nombre = datosRegistro[i][0];
    if (nombre) indicePorNombre[nombre] = i + 1;
  }
  var hojas = ss.getSheets();
  for (var j = 0; j < hojas.length; j++) {
    var nombreHoja = hojas[j].getName();
    if (/_Form$/.test(nombreHoja)) {
      var base = nombreHoja.replace(/_Form$/, '');
      if (!indicePorNombre[base]) {
        var hojaBase = ss.getSheetByName(base);
        var ultima = hojaBase ? hojaBase.getLastRow() : 1;
        var filaNueva = hojaRegistro.getLastRow() + 1;
        hojaRegistro.getRange(filaNueva, 1, 1, 2).setValues([[base, Math.max(ultima, 1)]]);
        indicePorNombre[base] = filaNueva;
      }
    }
  }
}

function _obtenerCodigosExistentesResumen(hojaResumen) {
  var existentes = {};
  if (!hojaResumen) return existentes;

  var ultima = hojaResumen.getLastRow();
  if (ultima < 2) return existentes;

  var valores = hojaResumen
    .getRange(2, COL_RESUMEN.codigo_operacion, ultima - 1, 1)
    .getValues();

  for (var i = 0; i < valores.length; i++) {
    var codigo = String(valores[i][0] == null ? '' : valores[i][0]).trim();
    if (codigo) existentes[codigo] = true;
  }

  return existentes;
}

function eliminarDuplicadosResumenPorCodigo() {
  var hojaResumen = obtenerHojaResumen();
  if (!hojaResumen) return;

  asegurarEncabezadosResumen(hojaResumen);

  var ultima = hojaResumen.getLastRow();
  if (ultima < 2) return;

  var ancho = Math.max(hojaResumen.getLastColumn(), _anchoResumen());
  var datos = hojaResumen.getRange(2, 1, ultima - 1, ancho).getValues();

  var mejorFilaPorCodigo = {};
  var filasEliminar = {};

  function puntajeFila(fila) {
    var score = 0;

    if (String(fila[COL_RESUMEN.estado_rpta - 1] || '').trim() === 'Completado') score += 1000;
    if (String(fila[COL_RESUMEN.respuesta - 1] || '').trim()) score += 500;
    if (fila[COL_RESUMEN.fecha_hora_rpta - 1]) score += 300;
    if (String(fila[COL_RESUMEN.sla - 1] || '').trim()) score += 100;
    if (String(fila[COL_RESUMEN.ratio - 1] || '').trim()) score += 100;
    if (String(fila[COL_RESUMEN.estado_encuesta - 1] || '').trim() === 'Enviar') score += 10;

    return score;
  }

  for (var i = 0; i < datos.length; i++) {
    var filaSheet = i + 2;
    var fila = datos[i];
    var codigo = String(fila[COL_RESUMEN.codigo_operacion - 1] || '').trim();

    if (!codigo) continue;

    if (!mejorFilaPorCodigo[codigo]) {
      mejorFilaPorCodigo[codigo] = {
        fila: filaSheet,
        score: puntajeFila(fila)
      };
      continue;
    }

    var actual = {
      fila: filaSheet,
      score: puntajeFila(fila)
    };

    var mejor = mejorFilaPorCodigo[codigo];

    if (actual.score > mejor.score) {
      filasEliminar[mejor.fila] = true;
      mejorFilaPorCodigo[codigo] = actual;
    } else {
      filasEliminar[actual.fila] = true;
    }
  }

  var lista = Object.keys(filasEliminar)
    .map(function (x) { return Number(x); })
    .sort(function (a, b) { return b - a; });

  for (var j = 0; j < lista.length; j++) {
    hojaResumen.deleteRow(lista[j]);
  }

  Logger.log('Duplicados eliminados de Resumen: ' + lista.length);
}

function diagnosticarDuplicadosResumen() {
  var hojaResumen = obtenerHojaResumen();
  if (!hojaResumen) return;

  var ultima = hojaResumen.getLastRow();
  if (ultima < 2) {
    Logger.log('Resumen vacío.');
    return;
  }

  var datos = hojaResumen.getRange(2, COL_RESUMEN.codigo_operacion, ultima - 1, 1).getValues();
  var conteo = {};
  var filas = {};

  for (var i = 0; i < datos.length; i++) {
    var codigo = String(datos[i][0] || '').trim();
    if (!codigo) continue;

    conteo[codigo] = (conteo[codigo] || 0) + 1;
    if (!filas[codigo]) filas[codigo] = [];
    filas[codigo].push(i + 2);
  }

  var totalCodigosDuplicados = 0;
  var totalFilasDuplicadas = 0;

  Object.keys(conteo).forEach(function (codigo) {
    if (conteo[codigo] > 1) {
      totalCodigosDuplicados++;
      totalFilasDuplicadas += conteo[codigo] - 1;
      Logger.log(codigo + ' => ' + conteo[codigo] + ' veces | filas: ' + filas[codigo].join(', '));
    }
  });

  Logger.log('Códigos duplicados: ' + totalCodigosDuplicados);
  Logger.log('Filas duplicadas sobrantes: ' + totalFilasDuplicadas);
}


function procesarRegistro() {
  var ss = SpreadsheetApp.getActive();
  var hojaRegistro = obtenerHojaRegistro();
  var ultimaFilaRegistro = hojaRegistro.getLastRow();
  if (ultimaFilaRegistro < 1) return;

  var registros = hojaRegistro.getRange(1, 1, ultimaFilaRegistro, 2).getValues();
  var hojaResumen = obtenerHojaResumen();
  if (!hojaResumen) return;

  asegurarEncabezadosResumen(hojaResumen);

  var tz = TZ_LIMA;
  var feriados = obtenerFeriados();
  var slaObjetivo = 5;

  // Blindaje principal: si el código ya está en Resumen, jamás se vuelve a insertar.
  var codigosExistentes = _obtenerCodigosExistentesResumen(hojaResumen);

  for (var i = 0; i < registros.length; i++) {
    var nombreBase = registros[i][0];
    var ultimaProcesada = Number(registros[i][1]) || 1;
    if (!nombreBase) continue;

    var hojaOp = ss.getSheetByName(nombreBase);
    if (!hojaOp) continue;

    var ultimaOp = hojaOp.getLastRow();
    if (ultimaOp <= ultimaProcesada) continue;

    var inicioOrigen = ultimaProcesada + 1;
    var numFilas = ultimaOp - ultimaProcesada;
    var numColsOp = Math.max(hojaOp.getLastColumn(), 17);

    var encabezadosOp = hojaOp.getRange(1, 1, 1, numColsOp).getValues()[0];
    var mapaOp = _obtenerMapaEncabezadosDesdeFila(encabezadosOp);
    var rangoValores = hojaOp.getRange(inicioOrigen, 1, numFilas, numColsOp).getValues();

    var filasParaResumen = [];
    var ultimaFilaLeidaOrigen = ultimaProcesada;

    for (var r = 0; r < rangoValores.length; r++) {
      var filaOrigenActual = inicioOrigen + r;
      ultimaFilaLeidaOrigen = filaOrigenActual;

      var filaOp = rangoValores[r];

      var codigoOperacion = String(_valorPorEncabezadoOFallback(filaOp, mapaOp, ['codigo_operacion'], 2) || '').trim();
      if (!codigoOperacion) {
        Logger.log('Fila omitida sin codigo_operacion. Hoja: ' + nombreBase + ', fila: ' + filaOrigenActual);
        continue;
      }

      if (codigosExistentes[codigoOperacion]) {
        Logger.log('Duplicado omitido: ' + codigoOperacion + ' | Hoja: ' + nombreBase + ', fila: ' + filaOrigenActual);
        continue;
      }

      var pais = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['pais'], 3) || '';
      var correo = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['correo'], 4) || '';
      var fechaHoraOriginal = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['fecha_hora', 'fecha y hora', 'fechahora'], 5);
      var bp = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['bp'], 6) || '';
      var nombre = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['nombre'], 7) || '';
      var categoria = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['categoria'], 8) || '';
      var correoCpl = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['correo_cpl'], 9) || '';
      var tipo = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['tipo'], 10) || '';
      var coordinadorResponsable = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['coordinador_responsable', 'coordinador'], 11) || '';
      var consulta = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['consulta'], 12) || '';
      var archivoReferencia = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['archivo_referencia', 'archivo'], 13) || '';
      var tipoTramite = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['tipo_tramite'], 14) || '';
      var contador = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['contador'], 15) || '';
      var motivo = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['motivo'], 16) || '';
      var enlaceArchivo = _valorPorEncabezadoOFallback(filaOp, mapaOp, ['enlace_archivo'], 17) || '';

      var fechaD = convertirAFecha(fechahoraNormalizada(fechaHoraOriginal, tz));
      if (!esFechaValida(fechaD)) {
        Logger.log('Fila omitida por fecha inválida. Código: ' + codigoOperacion + ' | Hoja: ' + nombreBase + ', fila: ' + filaOrigenActual);
        continue;
      }

      var fechaPrevista = sumarDiasHabiles(fechaD, slaObjetivo, feriados, tz);

      var nueva = [];
      nueva[0] = codigoOperacion;
      nueva[1] = pais;
      nueva[2] = correo;
      nueva[3] = fechaD;
      nueva[4] = bp;
      nueva[5] = nombre;
      nueva[6] = categoria;
      nueva[7] = correoCpl;
      nueva[8] = tipo;
      nueva[9] = coordinadorResponsable;
      nueva[10] = consulta;
      nueva[11] = archivoReferencia;
      nueva[12] = fechaPrevista;
      nueva[13] = 'Pendiente';
      nueva[14] = 'Pendiente';
      nueva[15] = '';
      nueva[16] = '';
      nueva[17] = '';
      nueva[18] = '';
      nueva[19] = tipoTramite;
      nueva[20] = contador;
      nueva[21] = motivo;
      nueva[22] = enlaceArchivo;

      filasParaResumen.push(nueva);
      codigosExistentes[codigoOperacion] = true;
    }

    // Primero se pega lo nuevo. Si no hay nada nuevo, igual avanzamos Registro.
    // Ese era el hueco: una fila duplicada o problemática podía quedarse viva eternamente.
    if (filasParaResumen.length) {
      var inicioResumen = hojaResumen.getLastRow() + 1;
      hojaResumen
        .getRange(inicioResumen, 1, filasParaResumen.length, _anchoResumen())
        .setValues(filasParaResumen);
    }

    // Punto crítico: Registro se actualiza siempre que se leyeron filas origen.
    // No depende de PropertiesService ni de que se hayan pegado filas.
    if (ultimaFilaLeidaOrigen > ultimaProcesada) {
      hojaRegistro.getRange(i + 1, 2).setValue(ultimaFilaLeidaOrigen);
    }
  }
}

function aplicarValidacionesEnResumen() {
  var hojaResumen = obtenerHojaResumen();
  if (!hojaResumen) return;

  asegurarEncabezadosResumen(hojaResumen);

  var reglaEstadoRpta = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendiente', 'En proceso', 'Completado'], true)
    .setAllowInvalid(false)
    .build();

  var reglaEstadoEncuesta = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendiente', 'Enviar', 'No enviar', 'Fe de erratas'], true)
    .setAllowInvalid(false)
    .build();

  var totalFilas = Math.max(hojaResumen.getMaxRows() - 1, 1);

  hojaResumen.getRange(2, COL_RESUMEN.estado_rpta, totalFilas, 1).setDataValidation(reglaEstadoRpta);
  hojaResumen.getRange(2, COL_RESUMEN.estado_encuesta, totalFilas, 1).setDataValidation(reglaEstadoEncuesta);
}
function _textoPlanoEstado_(valor) {
  return String(valor == null ? '' : valor).trim();
}

function _correoPuedeProcesarseFila_(filaValores) {
  var estadoN = _textoPlanoEstado_(filaValores[COL_RESUMEN.estado_rpta - 1]);
  var estadoO = _textoPlanoEstado_(filaValores[COL_RESUMEN.estado_encuesta - 1]);
  var respuesta = _textoPlanoEstado_(filaValores[COL_RESUMEN.respuesta - 1]);
  var correo = _textoPlanoEstado_(filaValores[COL_RESUMEN.correo - 1]);
  var fechaHoraRpta = filaValores[COL_RESUMEN.fecha_hora_rpta - 1];

  if (estadoN !== 'Completado') return false;
  if (fechaHoraRpta) return false;

  if (estadoO === 'No enviar') return true;
  if (estadoO === 'Enviar') return !!(correo && respuesta);
  if (estadoO === 'Fe de erratas') return !!(correo && respuesta);

  return false;
}

function _procesarCorreoPendienteFila_(ss, hojaResumen, filaIndice, filaValores, props, feriados, origen) {
  if (!_correoPuedeProcesarseFila_(filaValores)) return false;

  var codigo = filaValores[COL_RESUMEN.codigo_operacion - 1] || '';
  var claveBase = _clavePorCodigo(ss, hojaResumen, codigo, filaIndice);
  var lockKey = 'ENVIO_EN_PROCESO:' + claveBase;
  var ahoraMs = Date.now();
  var lockActual = Number(props.getProperty(lockKey) || 0);

  if (lockActual && (ahoraMs - lockActual) < 5 * 60 * 1000) {
    Logger.log('Envío omitido por lock temporal: hoja ' + hojaResumen.getName() + ' fila ' + filaIndice + ' código ' + codigo);
    return false;
  }

  props.setProperty(lockKey, String(ahoraMs));

  try {
    var estadoO = _textoPlanoEstado_(filaValores[COL_RESUMEN.estado_encuesta - 1]);
    var correo = filaValores[COL_RESUMEN.correo - 1];
    var respuesta = filaValores[COL_RESUMEN.respuesta - 1];
    var fechaD = filaValores[COL_RESUMEN.fecha_hora - 1];
    var consulta = filaValores[COL_RESUMEN.consulta - 1];
    var nombre = filaValores[COL_RESUMEN.nombre - 1];

    Logger.log(
      'Evaluando envío | hoja=%s fila=%s codigo=%s estado=%s correo=%s respuesta_len=%s origen=%s',
      hojaResumen.getName(),
      filaIndice,
      codigo,
      estadoO,
      correo,
      String(respuesta || '').length,
      origen
    );

    if (estadoO === 'No enviar') {
      cerrarCasoFila(hojaResumen, filaIndice, fechaD, TZ_LIMA, feriados);
      _limpiarErrorAutomatizacionFila_(hojaResumen, filaIndice);
      Logger.log('Caso cerrado sin correo: hoja ' + hojaResumen.getName() + ' fila ' + filaIndice + ' código ' + codigo + ' origen=' + origen);
      return true;
    }

    if (estadoO === 'Enviar') {
      if (!correo || !respuesta || String(respuesta).trim() === '') return false;

      var resolucionEnviada = props.getProperty('R:' + claveBase) === '1';
      var encuestaEnviada = props.getProperty('E:' + claveBase) === '1';
      var ahoraRpta = new Date();

      if (!resolucionEnviada) {
        enviarCorreoResolucion(
          correo,
          filaValores[COL_RESUMEN.correo_cpl - 1],
          filaValores[COL_RESUMEN.codigo_operacion - 1],
          filaValores[COL_RESUMEN.fecha_hora - 1],
          filaValores[COL_RESUMEN.tipo - 1],
          filaValores[COL_RESUMEN.coordinador_responsable - 1],
          consulta,
          respuesta,
          ahoraRpta,
          nombre
        );
        props.setProperty('R:' + claveBase, '1');
      }

      if (!encuestaEnviada) {
        enviarCorreoEncuesta(correo, filaValores[COL_RESUMEN.tipo - 1]);
        props.setProperty('E:' + claveBase, '1');
      }

      cerrarCasoFila(hojaResumen, filaIndice, fechaD, TZ_LIMA, feriados);
      _limpiarErrorAutomatizacionFila_(hojaResumen, filaIndice);
      Logger.log('Correo de resolución procesado: hoja ' + hojaResumen.getName() + ' fila ' + filaIndice + ' código ' + codigo + ' origen=' + origen);
      return true;
    }

    if (estadoO === 'Fe de erratas') {
      if (!correo || !respuesta || String(respuesta).trim() === '') return false;

      var feEnviada = props.getProperty('RF:' + claveBase) === '1';
      var ahoraFe = new Date();

      if (!feEnviada) {
        enviarCorreoResolucionFeDeErratas(
          correo,
          filaValores[COL_RESUMEN.correo_cpl - 1],
          filaValores[COL_RESUMEN.codigo_operacion - 1],
          filaValores[COL_RESUMEN.fecha_hora - 1],
          filaValores[COL_RESUMEN.tipo - 1],
          consulta,
          respuesta,
          ahoraFe,
          nombre
        );
        props.setProperty('RF:' + claveBase, '1');
      }

      cerrarCasoFila(hojaResumen, filaIndice, fechaD, TZ_LIMA, feriados);
      _limpiarErrorAutomatizacionFila_(hojaResumen, filaIndice);
      Logger.log('Correo de fe de erratas procesado: hoja ' + hojaResumen.getName() + ' fila ' + filaIndice + ' código ' + codigo + ' origen=' + origen);
      return true;
    }

    return false;
  } catch (err) {
    var mensaje = 'ERROR envío | hoja=' + hojaResumen.getName() + ' fila=' + filaIndice + ' codigo=' + codigo + ' origen=' + origen + ' | ' + (err && err.stack ? err.stack : err);
    Logger.log(mensaje);
    _registrarErrorAutomatizacionFila_(hojaResumen, filaIndice, mensaje);
    throw err;
  } finally {
    props.deleteProperty(lockKey);
  }
}

function manejarCorreosPendientes() {
  var hojasResumen = obtenerHojasResumen();
  if (!hojasResumen.length) {
    Logger.log('manejarCorreosPendientes: no se encontraron hojas Resumen_XX.');
    return;
  }

  var ss = SpreadsheetApp.getActive();
  var props = PropertiesService.getScriptProperties();
  var feriados = obtenerFeriados();
  var procesados = 0;

  for (var h = 0; h < hojasResumen.length; h++) {
    var hojaResumen = hojasResumen[h];
    asegurarEncabezadosResumen(hojaResumen);

    var ultima = hojaResumen.getLastRow();
    if (ultima < 2) {
      Logger.log('manejarCorreosPendientes: hoja ' + hojaResumen.getName() + ' vacía.');
      continue;
    }

    var valores = hojaResumen.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    var pendientesHoja = 0;

    for (var i = 0; i < valores.length; i++) {
      var filaIndice = i + 2;

      try {
        if (_procesarCorreoPendienteFila_(ss, hojaResumen, filaIndice, valores[i], props, feriados, 'minutal')) {
          procesados++;
          pendientesHoja++;
        }
      } catch (err) {
        Logger.log('manejarCorreosPendientes: hoja ' + hojaResumen.getName() + ' fila ' + filaIndice + ' falló: ' + err);
      }
    }

    Logger.log('manejarCorreosPendientes: hoja ' + hojaResumen.getName() + ' procesadas=' + pendientesHoja);
  }

  Logger.log('manejarCorreosPendientes finalizado. Filas procesadas total: ' + procesados);
}

function forzarRevisarCorreosPendientes() {
  // Ejecutar manualmente después de autorizar GmailApp o de reinstalar activadores.
  manejarCorreosPendientes();
}

function probarEnvioCorreoSAB() {
  var usuario = Session.getEffectiveUser().getEmail();
  if (!usuario) {
    throw new Error('No se pudo obtener el correo del usuario efectivo. Ejecuta esta función desde tu cuenta en Apps Script.');
  }

  var cuota = MailApp.getRemainingDailyQuota();
  Logger.log('Cuota restante de MailApp para esta cuenta: ' + cuota);

  MailApp.sendEmail(
    usuario,
    'Prueba de envío - Automatización Soporte SAB',
    'Si recibiste este correo, MailApp está autorizado para esta cuenta. Cuota restante antes del envío: ' + cuota
  );

  Logger.log('Correo de prueba enviado a: ' + usuario);
}

function enviarCorreoResolucion(para, ccCpl, codigoOperacion, fechaHora, tipo, coordinador, consulta, respuesta, fechaHoraRpta, nombre) {
  var tz = TZ_LIMA;
  function fmt(d) {
    var dd = convertirAFecha(d);
    return dd ? Utilities.formatDate(dd, tz, 'dd/MM/yyyy HH:mm') : '';
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fila(label, value) {
    return '<tr>' +
             '<td style="width:220px;padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-right:none;border-radius:8px 0 0 8px;font-weight:600;color:#111">' + label + '</td>' +
             '<td style="padding:10px 12px;border:1px solid #e5e7eb;border-left:none;border-radius:0 8px 8px 0;color:#111">' + (value || '') + '</td>' +
           '</tr>';
  }
  function filaMultilinea(label, htmlValue) {
    return '<tr>' +
             '<td style="width:220px;vertical-align:top;padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-right:none;border-radius:8px 0 0 8px;font-weight:600;color:#111">' + label + '</td>' +
             '<td style="padding:10px 12px;border:1px solid #e5e7eb;border-left:none;border-radius:0 8px 8px 0;color:#111">' + (htmlValue || '') + '</td>' +
           '</tr>';
  }

  var asunto = 'Canal de Consultas SAB — Resolución ' + (codigoOperacion || '');
  var logo = 'https://storage.googleapis.com/datagobdomain-prod-p3n5_data-governance-platform-public/assets/latam-logo-word.png';

  var html =
    '<div style="background:#f5f6fb;padding:24px 0;margin:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">' +
        '<tr>' +
          '<td style="background:#1b0088;padding:14px 20px">' +
            '<img src="' + logo + '" alt="LATAM" style="height:22px;display:block">' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="background:#ffffff;padding:22px 22px 8px 22px">' +
            '<div style="font-size:20px;line-height:1.3;color:#1b0088;margin:0 0 6px 0">Hola, ' + esc(nombre || '') + '.</div>' +
            '<div style="font-size:14px;color:#374151;margin:0 0 16px 0">Te compartimos la <strong>respuesta</strong> a tu consulta a <strong>Soporte SAB</strong>.</div>' +
            '<div style="display:inline-block;background:#ede9fe;color:#1b0088;font-weight:700;font-size:12px;padding:6px 10px;border-radius:999px;margin:0 0 14px 0;letter-spacing:.3px">RESOLUCIÓN</div>' +
            '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0 8px">' +
              fila('Código de operación', esc(codigoOperacion)) +
              fila('Fecha de ingreso', esc(fmt(fechaHora))) +
              fila('Tipo', esc(tipo)) +
              filaMultilinea('Consulta', esc(consulta).replace(/\n/g,'<br>')) +
              filaMultilinea('Respuesta', esc(respuesta).replace(/\n/g,'<br>')) +
              fila('Fecha de respuesta', esc(fmt(fechaHoraRpta))) +
            '</table>' +
            '<p style="margin:16px 0 0 0;font-size:12px;color:#6b7280">Recuerda que puedes hacerle seguimiento en la sección de trámites de tu aplicativo OSSA. <br>Por favor, no responder a este correo. Si necesitas mayor información, registra una nueva consulta en el formulario.</p>' +
          '</td>' +
        '</tr>' +
        '<tr>' +
          '<td style="background:#f3f4f6;color:#1b0088;text-align:center;padding:12px;font-size:12px">Soporte SAB – LATAM Airlines</td>' +
        '</tr>' +
      '</table>' +
    '</div>';

  enviarConHeadersImportante(para, ccCpl || '', asunto, html);
}
function enviarCorreoEncuesta(para, tipo) {
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var asunto = 'Queremos conocer tu experiencia con el Canal de Consultas SAB';
  var imagenHTML = '<a href="https://docs.google.com/forms/d/e/1FAIpQLSctOh7gyYu59aRalqakQARSwMiw9FE-nuox6iT06bRj7BjXtQ/viewform" target="_blank"><img src="https://drive.google.com/uc?id=1ciEFtcOfKc4nM4GfSGMZX8qcBg8mQm06" alt="Encuesta de satisfacción" width="600" style="display:block;margin:0 auto;"/></a>';

  var cuerpoHTML =
    '<div style="background:#f5f6fb;padding:24px 0;margin:0;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">' +
        '<tr><td style="background:#1b0088;padding:14px 20px">' +
          '<img src="https://storage.googleapis.com/datagobdomain-prod-p3n5_data-governance-platform-public/assets/latam-logo-word.png" alt="LATAM" style="height:22px;display:block">' +
        '</td></tr>' +
        '<tr><td style="background:#ffffff;padding:22px">' +
          '<div style="font-size:16px;color:#111;margin-bottom:12px;font-weight:600">Encuesta de satisfacción</div>' +
          '<p style="font-size:14px;color:#374151;margin:0 0 10px 0"><strong>Tipo de consulta:</strong> ' + esc(tipo) + '</p>' +
          '<p style="font-size:14px;color:#374151;margin:0 0 14px 0">Gracias por utilizar el Canal de Consultas SAB. Nos ayudaría mucho conocer tu experiencia para seguir mejorando.</p>' +
          '<p style="font-size:14px;margin:0 0 8px 0"><a href="https://forms.gle/KDbAgUNiDRp28swi9" target="_blank">https://forms.gle/KDbAgUNiDRp28swi9</a></p>' +
          '<div style="margin:16px 0 0 0">' + imagenHTML + '</div>' +
        '</td></tr>' +
        '<tr><td style="background:#f3f4f6;color:#1b0088;text-align:center;padding:12px;font-size:12px">Soporte SAB – LATAM Airlines</td></tr>' +
      '</table>' +
    '</div>';

  enviarConHeadersImportante(para, '', asunto, cuerpoHTML);
}
function instalarFiltroImportanteEnMiCuenta(remitente) {
  if (!remitente) throw new Error('Indica el remitente, ej.: soporte@tu-dominio.com');

  var filtro = {
    criteria: { from: remitente },
    action:    { addLabelIds: ['IMPORTANT'] }
  };
  Gmail.Users.Settings.Filters.create(filtro, 'me');
}
function instalarFiltroImportanteVarios(remitentes) {
  (remitentes || []).forEach(function(r) {
    Gmail.Users.Settings.Filters.create({ criteria: { from: r }, action: { addLabelIds: ['IMPORTANT'] } }, 'me');
  });
}
function obtenerFeriados() {
  var tz = TZ_LIMA;

  var cache = CacheService.getScriptCache();
  var props = PropertiesService.getScriptProperties();

  var hoyKey = Utilities.formatDate(new Date(), tz, 'yyyyMMdd');
  var cacheKey = 'FERIADOS_SET_V7_' + hoyKey;

  var cached = cache.get(cacheKey);
  if (cached) {
    try {
      var obj = JSON.parse(cached);
      if (obj && typeof obj === 'object') return obj;
    } catch (e) {}
  }

  var set = {};
  var idExterno = '1nmB84XLrocV_MCYchPK5g1ypqj5mHQf0Pe_cY_eq7YM';

  function pad2(n) { n = String(n); return n.length === 1 ? '0' + n : n; }

  function claveDesdeTexto(s) {
    s = (s == null ? '' : String(s)).trim();
    if (!s) return '';

    var m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); // d/M/yyyy
    if (m1) {
      var dd = pad2(Number(m1[1]));
      var mm = pad2(Number(m1[2]));
      var yy = String(m1[3]);
      return yy + '-' + mm + '-' + dd;
    }

    var m2 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); // yyyy-M-d
    if (m2) {
      var yy2 = String(m2[1]);
      var mm2 = pad2(Number(m2[2]));
      var dd2 = pad2(Number(m2[3]));
      return yy2 + '-' + mm2 + '-' + dd2;
    }

    var d = convertirAFecha(s);
    if (!esFechaValida(d)) return '';
    return Utilities.formatDate(d, tz, 'yyyy-MM-dd');
  }

  function elegirHojaFeriados(ssF) {
    var h = ssF.getSheetByName('Feriados_LP') || ssF.getSheetByName('Feriados');
    if (h) return h;

    var sheets = ssF.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var nm = (sheets[i].getName() || '').toLowerCase();
      if (nm.indexOf('feriad') !== -1) return sheets[i];
    }

    return sheets.length ? sheets[0] : null;
  }

  function cargarDesdeHoja(hoja) {
    if (!hoja) return { name: '', last: 0 };

    var last = hoja.getLastRow();
    if (last < 1) return { name: hoja.getName(), last: last };

    var rng = hoja.getRange(1, 1, last, 1);
    var vals = rng.getValues();
    var disp = rng.getDisplayValues();

    for (var i = 0; i < last; i++) {
      var display = (disp[i][0] == null ? '' : String(disp[i][0])).trim();
      var value = vals[i][0];

      if (!display || /^feriados$/i.test(display)) continue;

      var clave = '';

      // Si viene como Date real, formatea directo a yyyy-MM-dd
      if (value instanceof Date && esFechaValida(value)) {
        clave = Utilities.formatDate(value, tz, 'yyyy-MM-dd');
      } else {
        // si no, usa el display (que es lo que el usuario VE)
        clave = claveDesdeTexto(display);
      }

      if (clave) set[clave] = true;
    }

    return { name: hoja.getName(), last: last };
  }

  var info = { name: '', last: 0 };

  try {
    var ssF = SpreadsheetApp.openById(idExterno);
    var hojaF = elegirHojaFeriados(ssF);
    info = cargarDesdeHoja(hojaF);

    props.setProperty('FERIADOS_SRC_NAME_V7', info.name);
    props.setProperty('FERIADOS_SRC_LASTROW_V7', String(info.last));
    props.deleteProperty('FERIADOS_LAST_ERROR_V7');
  } catch (e1) {
    props.setProperty('FERIADOS_LAST_ERROR_V7', String(e1 && e1.message ? e1.message : e1));
  }

  try { props.setProperty('FERIADOS_JSON_V7', JSON.stringify(set)); } catch (e2) {}

  var count = Object.keys(set).length;
  var ttl = (count >= 20 ? 3600 : 60);
  try { cache.put(cacheKey, JSON.stringify(set), ttl); } catch (e3) {}

  return set;
}
function esFechaValida(d) {
  return d && Object.prototype.toString.call(d) === '[object Date]' && !isNaN(d.getTime());
}
function normalizarFecha(d, tz) {
  var zona = tz || TZ_LIMA || Session.getScriptTimeZone();
  var fecha = convertirAFecha(d);
  if (!esFechaValida(fecha)) return null;

  var ymd = Utilities.formatDate(fecha, zona, 'yyyy-MM-dd').split('-');
  var y = Number(ymd[0]), m = Number(ymd[1]), dia = Number(ymd[2]);

  return new Date(Date.UTC(y, m - 1, dia, 12, 0, 0));
}
function _claveFechaNormalizada(d, tz) {
  var zona = tz || TZ_LIMA || Session.getScriptTimeZone();
  var n = normalizarFecha(d, zona);
  return n ? Utilities.formatDate(n, zona, 'yyyy-MM-dd') : '';
}
function convertirAFecha(v) {
  if (v instanceof Date) return v;
  if (v === null || typeof v === 'undefined' || v === '') return null;

  if (typeof v === 'number') {
    var dn = new Date(v);
    return esFechaValida(dn) ? dn : null;
  }

  var s = String(v).trim();
  if (!s) return null;

  // dd/MM/yyyy [HH:mm[:ss]]
  var m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m1) {
    var dd = Number(m1[1]), mm = Number(m1[2]), yy = Number(m1[3]);
    var hh = Number(m1[4] || 0), mi = Number(m1[5] || 0), ss = Number(m1[6] || 0);
    var d1 = new Date(yy, mm - 1, dd, hh, mi, ss);
    return esFechaValida(d1) ? d1 : null;
  }

  // yyyy-MM-dd [HH:mm[:ss]]
  var m2 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m2) {
    var yy2 = Number(m2[1]), mm2 = Number(m2[2]), dd2 = Number(m2[3]);
    var hh2 = Number(m2[4] || 0), mi2 = Number(m2[5] || 0), ss2 = Number(m2[6] || 0);
    var d2 = new Date(yy2, mm2 - 1, dd2, hh2, mi2, ss2);
    return esFechaValida(d2) ? d2 : null;
  }

  var d = new Date(s);
  return esFechaValida(d) ? d : null;
}
function fechahoraNormalizada(v, tz) {
  var d = convertirAFecha(v);
  if (!esFechaValida(d)) return null;
  return d;
}
function esFinDeSemana(d) {
  var n = d.getDay();
  return n === 0 || n === 6;
}
function sumarDiasHabiles(inicio, nDias, feriados, tz) {
  var zona = tz || TZ_LIMA || Session.getScriptTimeZone();
  var fset = (feriados && typeof feriados === 'object') ? feriados : {};

  var base = normalizarFecha(inicio, zona);
  if (!base) return null;

  var objetivo = Math.max(0, Number(nDias) || 0);
  var agregados = 0;

  var d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + 1);

  while (agregados < objetivo) {
    var dow = d.getUTCDay();
    var esFinde = (dow === 0 || dow === 6);

    var clave = Utilities.formatDate(d, zona, 'yyyy-MM-dd');
    var esFeriado = !!fset[clave];

    if (!esFinde && !esFeriado) {
      agregados++;
      if (agregados >= objetivo) break;
    }

    d.setUTCDate(d.getUTCDate() + 1);
  }

  return d;
}
function contarDiasHabilesDesdeSiguiente(inicio, fin, feriados, tz) {
  var zona = tz || TZ_LIMA || Session.getScriptTimeZone();
  var fset = (feriados && typeof feriados === 'object') ? feriados : {};

  var iniN = normalizarFecha(inicio, zona);
  var finN = normalizarFecha(fin, zona);
  if (!iniN || !finN) return 0;

  if (finN.getTime() <= iniN.getTime()) return 0;

  var conteo = 0;

  var d = new Date(iniN.getTime());
  d.setUTCDate(d.getUTCDate() + 1);

  while (d.getTime() <= finN.getTime()) {
    var dow = d.getUTCDay();
    var esFinde = (dow === 0 || dow === 6);

    var clave = Utilities.formatDate(d, zona, 'yyyy-MM-dd');
    var esFeriado = !!fset[clave];

    if (!esFinde && !esFeriado) conteo++;

    d.setUTCDate(d.getUTCDate() + 1);
  }

  return conteo;
}
function diasHabilesTranscurridos(inicio, fin, feriados, tz) {
  return contarDiasHabilesDesdeSiguiente(convertirAFecha(inicio), convertirAFecha(fin), feriados, tz);
}
function reintentarEnvioPorCodigo(codigoOperacion) {
  var ss = SpreadsheetApp.getActive();
  var hojas = obtenerHojasResumen();
  var props = PropertiesService.getScriptProperties();
  var feriados = obtenerFeriados();

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    for (var i = 0; i < datos.length; i++) {
      var fila = i + 2;
      if (String(datos[i][COL_RESUMEN.codigo_operacion - 1]).trim() === String(codigoOperacion).trim()) {
        var clave = _clavePorCodigo(ss, hoja, codigoOperacion, fila);

        props.deleteProperty('R:' + clave);
        props.deleteProperty('E:' + clave);
        props.deleteProperty('RF:' + clave);
        props.deleteProperty('ENVIO_EN_PROCESO:' + clave);

        hoja.getRange(fila, COL_RESUMEN.estado_encuesta).setValue('Enviar');
        SpreadsheetApp.flush();

        var filaActualizada = hoja.getRange(fila, 1, 1, _anchoResumen()).getValues()[0];
        Logger.log('Reintentando envío inmediato para código ' + codigoOperacion + ' en hoja ' + hoja.getName() + ' fila ' + fila);
        return _procesarCorreoPendienteFila_(ss, hoja, fila, filaActualizada, props, feriados, 'manual-reintento');
      }
    }
  }

  Logger.log('Código no encontrado para reintento: ' + codigoOperacion);
  return false;
}


function enviarFilaActivaAhora() {
  var ss = SpreadsheetApp.getActive();
  var hoja = ss.getActiveSheet();
  if (!hoja || !/^Resumen_.{2}$/.test(hoja.getName())) {
    throw new Error('Selecciona una fila dentro de una hoja Resumen_XX antes de ejecutar esta función. Sí, hasta el robot necesita saber dónde estás parado.');
  }

  var fila = hoja.getActiveCell().getRow();
  if (fila < 2) throw new Error('Selecciona una fila de datos, no el encabezado.');

  var props = PropertiesService.getScriptProperties();
  var feriados = obtenerFeriados();
  var valores = hoja.getRange(fila, 1, 1, _anchoResumen()).getValues()[0];
  return _procesarCorreoPendienteFila_(ss, hoja, fila, valores, props, feriados, 'manual-fila-activa');
}


/***** PATCH V5 - ENVIO DIRECTO SIN DEPENDER DE PROPERTIES NI COLA ONEDIT *****/
function ejecutarCadaMinuto() {
  // V5: el trigger minutal primero sincroniza y envía pendientes.
  // La cola onEdit queda como apoyo, no como dueño del universo, porque ya vimos cómo salió eso.
  sincronizar();
}

function sincronizar() {
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(45000)) {
    Logger.log('sincronizar V5 omitido: ya hay otra ejecución activa.');
    return;
  }

  try {
    asegurarEncabezadosEnTodasLasHojasResumen();
    actualizarRegistroConHojasForm();
    procesarRegistro();
    aplicarValidacionesEnResumen();

    // Este envío NO usa R:/E:/RF: de PropertiesService para decidir si manda.
    // Solo mira la hoja: Completado + Enviar/No enviar/Fe de erratas + fecha_hora_rpta vacía.
    enviarPendientesDirectoV5();

    try { _despacharColaOnEdit(); } catch (eCola) { Logger.log('_despacharColaOnEdit V5: ' + eCola); }
  } finally {
    lock.releaseLock();
  }
}

function _textoV5_(v) {
  return String(v == null ? '' : v).trim();
}

function _valorVacioV5_(v) {
  return v === null || typeof v === 'undefined' || String(v).trim() === '';
}

function _filaCalificaEnvioDirectoV5_(fila) {
  var estadoRpta = _textoV5_(fila[COL_RESUMEN.estado_rpta - 1]);
  var estadoEncuesta = _textoV5_(fila[COL_RESUMEN.estado_encuesta - 1]);
  var correo = _textoV5_(fila[COL_RESUMEN.correo - 1]);
  var respuesta = _textoV5_(fila[COL_RESUMEN.respuesta - 1]);
  var fechaRpta = fila[COL_RESUMEN.fecha_hora_rpta - 1];

  if (estadoRpta !== 'Completado') return false;
  if (!_valorVacioV5_(fechaRpta)) return false;

  if (estadoEncuesta === 'No enviar') return true;
  if (estadoEncuesta === 'Enviar') return !!(correo && respuesta);
  if (estadoEncuesta === 'Fe de erratas') return !!(correo && respuesta);

  return false;
}

function _procesarFilaCorreoDirectoV5_(ss, hoja, filaIndice, filaValores, feriados, origen) {
  if (!_filaCalificaEnvioDirectoV5_(filaValores)) return false;

  var codigo = _textoV5_(filaValores[COL_RESUMEN.codigo_operacion - 1]);
  var estadoEncuesta = _textoV5_(filaValores[COL_RESUMEN.estado_encuesta - 1]);
  var correo = _textoV5_(filaValores[COL_RESUMEN.correo - 1]);
  var respuesta = _textoV5_(filaValores[COL_RESUMEN.respuesta - 1]);
  var fechaIngreso = filaValores[COL_RESUMEN.fecha_hora - 1];
  var ahora = new Date();

  Logger.log('V5 evaluando | hoja=%s fila=%s codigo=%s estado=%s correo=%s respuesta_len=%s origen=%s',
    hoja.getName(), filaIndice, codigo, estadoEncuesta, correo, respuesta.length, origen);

  try {
    if (estadoEncuesta === 'No enviar') {
      cerrarCasoFila(hoja, filaIndice, fechaIngreso, TZ_LIMA, feriados);
      _limpiarErrorAutomatizacionFila_(hoja, filaIndice);
      Logger.log('V5 cerrado sin correo | hoja=%s fila=%s codigo=%s', hoja.getName(), filaIndice, codigo);
      return true;
    }

    if (estadoEncuesta === 'Fe de erratas') {
      enviarCorreoResolucionFeDeErratas(
        correo,
        filaValores[COL_RESUMEN.correo_cpl - 1],
        codigo,
        filaValores[COL_RESUMEN.fecha_hora - 1],
        filaValores[COL_RESUMEN.tipo - 1],
        filaValores[COL_RESUMEN.consulta - 1],
        respuesta,
        ahora,
        filaValores[COL_RESUMEN.nombre - 1]
      );

      cerrarCasoFila(hoja, filaIndice, fechaIngreso, TZ_LIMA, feriados);
      _limpiarErrorAutomatizacionFila_(hoja, filaIndice);
      Logger.log('V5 fe de erratas enviada | hoja=%s fila=%s codigo=%s', hoja.getName(), filaIndice, codigo);
      return true;
    }

    if (estadoEncuesta === 'Enviar') {
      enviarCorreoResolucion(
        correo,
        filaValores[COL_RESUMEN.correo_cpl - 1],
        codigo,
        filaValores[COL_RESUMEN.fecha_hora - 1],
        filaValores[COL_RESUMEN.tipo - 1],
        filaValores[COL_RESUMEN.coordinador_responsable - 1],
        filaValores[COL_RESUMEN.consulta - 1],
        respuesta,
        ahora,
        filaValores[COL_RESUMEN.nombre - 1]
      );

      // Se cierra después del correo principal. Así evitamos reenviar la resolución si falla solo la encuesta.
      cerrarCasoFila(hoja, filaIndice, fechaIngreso, TZ_LIMA, feriados);

      try {
        enviarCorreoEncuesta(correo, filaValores[COL_RESUMEN.tipo - 1]);
      } catch (eEncuesta) {
        _registrarErrorAutomatizacionFila_(hoja, filaIndice, 'La resolución se envió, pero falló la encuesta: ' + (eEncuesta && eEncuesta.stack ? eEncuesta.stack : eEncuesta));
        Logger.log('V5 encuesta falló, resolución ya enviada | hoja=%s fila=%s codigo=%s error=%s', hoja.getName(), filaIndice, codigo, eEncuesta);
        return true;
      }

      _limpiarErrorAutomatizacionFila_(hoja, filaIndice);
      Logger.log('V5 resolución + encuesta enviadas | hoja=%s fila=%s codigo=%s', hoja.getName(), filaIndice, codigo);
      return true;
    }

    return false;
  } catch (err) {
    var msg = 'V5 ERROR envío | hoja=' + hoja.getName() + ' fila=' + filaIndice + ' codigo=' + codigo + ' origen=' + origen + ' | ' + (err && err.stack ? err.stack : err);
    Logger.log(msg);
    _registrarErrorAutomatizacionFila_(hoja, filaIndice, msg);
    throw err;
  }
}

function enviarPendientesDirectoV5() {
  var hojas = obtenerHojasResumen();
  if (!hojas.length) {
    Logger.log('V5: no hay hojas Resumen_XX.');
    return 0;
  }

  var ss = SpreadsheetApp.getActive();
  var feriados = obtenerFeriados();
  var procesados = 0;
  var errores = [];

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    asegurarEncabezadosResumen(hoja);

    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var valores = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    var procesadosHoja = 0;

    for (var i = 0; i < valores.length; i++) {
      var filaIndice = i + 2;
      try {
        if (_procesarFilaCorreoDirectoV5_(ss, hoja, filaIndice, valores[i], feriados, 'barrido-v5')) {
          procesados++;
          procesadosHoja++;
        }
      } catch (err) {
        errores.push('hoja=' + hoja.getName() + ' fila=' + filaIndice + ' error=' + err);
      }
    }

    Logger.log('V5 hoja %s procesados=%s', hoja.getName(), procesadosHoja);
  }

  Logger.log('V5 total procesados=' + procesados);

  // Que el trigger falle en rojo si hubo error real de envío. Basta de “Completada” mintiendo con descaro.
  if (errores.length) {
    throw new Error('V5 tuvo errores de envío: ' + errores.join(' || '));
  }

  return procesados;
}

function forzarRevisarCorreosPendientes() {
  return enviarPendientesDirectoV5();
}

function diagnosticarPendientesCorreoSAB() {
  var hojas = obtenerHojasResumen();
  var total = 0;

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    var subtotal = 0;

    for (var i = 0; i < datos.length; i++) {
      if (_filaCalificaEnvioDirectoV5_(datos[i])) {
        subtotal++;
        total++;
        Logger.log('V5 pendiente | hoja=%s fila=%s codigo=%s estado_rpta=%s estado_encuesta=%s correo=%s respuesta_len=%s fecha_rpta=%s',
          hoja.getName(),
          i + 2,
          datos[i][COL_RESUMEN.codigo_operacion - 1],
          datos[i][COL_RESUMEN.estado_rpta - 1],
          datos[i][COL_RESUMEN.estado_encuesta - 1],
          datos[i][COL_RESUMEN.correo - 1],
          String(datos[i][COL_RESUMEN.respuesta - 1] || '').length,
          datos[i][COL_RESUMEN.fecha_hora_rpta - 1]
        );
      }
    }

    Logger.log('V5 pendientes en ' + hoja.getName() + ': ' + subtotal);
  }

  Logger.log('V5 pendientes totales: ' + total);
  return total;
}

function reintentarEnvioPorCodigo(codigoOperacion) {
  var ss = SpreadsheetApp.getActive();
  var hojas = obtenerHojasResumen();
  var feriados = obtenerFeriados();
  var props = PropertiesService.getScriptProperties();

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    for (var i = 0; i < datos.length; i++) {
      var fila = i + 2;
      if (_textoV5_(datos[i][COL_RESUMEN.codigo_operacion - 1]) === _textoV5_(codigoOperacion)) {
        var clave = _clavePorCodigo(ss, hoja, codigoOperacion, fila);
        props.deleteProperty('R:' + clave);
        props.deleteProperty('E:' + clave);
        props.deleteProperty('RF:' + clave);
        props.deleteProperty('ENVIO_EN_PROCESO:' + clave);

        Logger.log('V5 reintento manual | hoja=%s fila=%s codigo=%s', hoja.getName(), fila, codigoOperacion);
        return _procesarFilaCorreoDirectoV5_(ss, hoja, fila, datos[i], feriados, 'manual-codigo-v5');
      }
    }
  }

  throw new Error('V5 no encontró el código: ' + codigoOperacion);
}

function enviarFilaActivaAhora() {
  var ss = SpreadsheetApp.getActive();
  var hoja = ss.getActiveSheet();
  if (!hoja || !/^Resumen_.{2}$/.test(hoja.getName())) {
    throw new Error('Selecciona una fila dentro de una hoja Resumen_XX antes de ejecutar esta función.');
  }

  var fila = hoja.getActiveCell().getRow();
  if (fila < 2) throw new Error('Selecciona una fila de datos, no el encabezado.');

  var feriados = obtenerFeriados();
  var valores = hoja.getRange(fila, 1, 1, _anchoResumen()).getValues()[0];
  return _procesarFilaCorreoDirectoV5_(ss, hoja, fila, valores, feriados, 'manual-fila-activa-v5');
}

function probarEnvioCorreoSAB() {
  var usuario = Session.getEffectiveUser().getEmail();
  if (!usuario) throw new Error('No se pudo obtener el correo del usuario efectivo.');

  var cuota = MailApp.getRemainingDailyQuota();
  Logger.log('V5 cuota restante MailApp antes del envío: ' + cuota);

  MailApp.sendEmail(
    usuario,
    'Prueba V5 - Automatización Soporte SAB',
    'Si recibiste este correo, MailApp está autorizado para esta cuenta. Cuota antes del envío: ' + cuota
  );

  Logger.log('V5 correo de prueba enviado a: ' + usuario);
}
/***** FIN PATCH V5 *****/
/***** PATCH V6 SAB - PEGAR AL FINAL DE Code.gs
 * Objetivo:
 * 1) Evitar dobles envíos por choque entre trigger onEdit, cola y barrido minutal.
 * 2) Usar una sola vía real de envío: ejecutarCadaMinuto() -> sincronizar() -> enviarPendientesDirectoV6().
 * 3) No reenviar si fecha_hora_rpta ya existe.
 * 4) Guardar marcas persistentes por codigo_operacion para no reenviar resolución/encuesta si una parte falla.
 * 5) Pausar el barrido cuando se agota la cuota de correo.
 *****/

var SAB_V6_PAUSA_ENVIO_KEY = 'SAB_V6_MAIL_PAUSADO_HASTA_MS';
var SAB_V6_PAUSA_HORAS_SIN_CUOTA = 8;
var SAB_V6_LOCK_MS = 10 * 60 * 1000;

function _textoV6_(v) {
  return String(v == null ? '' : v).trim();
}

function _vacioV6_(v) {
  return v === null || typeof v === 'undefined' || String(v).trim() === '';
}

function _esHojaResumenV6_(nombre) {
  return /^Resumen_.{2}$/.test(String(nombre || ''));
}

function _claveEnvioV6_(ss, hoja, filaIndice, filaValores) {
  var codigo = _textoV6_(filaValores && filaValores[COL_RESUMEN.codigo_operacion - 1]);
  return ss.getId() + ':' + hoja.getSheetId() + ':' + (codigo || ('row#' + filaIndice));
}

function _propV6_(tipo, clave) {
  return 'SAB_V6:' + tipo + ':' + clave;
}

function _tieneMarcaEnvioV6_(props, tipo, clave) {
  // Lee marcas nuevas V6 y marcas antiguas R/E/RF para no repetir correos ya enviados antes del parche.
  if (props.getProperty(_propV6_(tipo, clave)) === '1') return true;

  if (tipo === 'RESOLUCION' && props.getProperty('R:' + clave) === '1') return true;
  if (tipo === 'ENCUESTA' && props.getProperty('E:' + clave) === '1') return true;
  if (tipo === 'FE_ERRATAS' && props.getProperty('RF:' + clave) === '1') return true;

  return false;
}

function _marcarEnvioV6_(props, tipo, clave) {
  props.setProperty(_propV6_(tipo, clave), '1');

  // También deja marcas antiguas por compatibilidad con funciones previas que sigan vivas por ahí.
  if (tipo === 'RESOLUCION') props.setProperty('R:' + clave, '1');
  if (tipo === 'ENCUESTA') props.setProperty('E:' + clave, '1');
  if (tipo === 'FE_ERRATAS') props.setProperty('RF:' + clave, '1');
}

function _borrarMarcasEnvioV6_(props, clave) {
  ['RESOLUCION', 'ENCUESTA', 'FE_ERRATAS'].forEach(function (tipo) {
    props.deleteProperty(_propV6_(tipo, clave));
  });
  props.deleteProperty('R:' + clave);
  props.deleteProperty('E:' + clave);
  props.deleteProperty('RF:' + clave);
  props.deleteProperty('ENVIO_EN_PROCESO:' + clave);
  props.deleteProperty(_propV6_('LOCK', clave));
}

function _envioPausadoPorCuotaV6_() {
  var props = PropertiesService.getScriptProperties();
  var hasta = Number(props.getProperty(SAB_V6_PAUSA_ENVIO_KEY) || 0);
  return hasta && Date.now() < hasta;
}

function _pausarEnviosPorCuotaV6_(motivo) {
  var hasta = Date.now() + SAB_V6_PAUSA_HORAS_SIN_CUOTA * 60 * 60 * 1000;
  PropertiesService.getScriptProperties().setProperty(SAB_V6_PAUSA_ENVIO_KEY, String(hasta));
  Logger.log('SAB V6: envíos pausados hasta ' + new Date(hasta) + '. Motivo: ' + motivo);
}

function _reanudarEnviosV6_() {
  PropertiesService.getScriptProperties().deleteProperty(SAB_V6_PAUSA_ENVIO_KEY);
  Logger.log('SAB V6: pausa de envíos eliminada.');
}

function _registrarEstadoCasoV6_(hoja, filaIndice, estado) {
  try {
    var col = _columnaPorNombreFlexible(hoja, ['Estatus de caso', 'estatus_caso', 'estatus de caso'], false);
    if (col) hoja.getRange(filaIndice, col).setValue(estado);
  } catch (e) {
    Logger.log('SAB V6: no se pudo escribir Estatus de caso: ' + e);
  }
}

function _registrarErrorFilaV6_(hoja, filaIndice, mensaje) {
  _registrarErrorAutomatizacionFila_(hoja, filaIndice, mensaje);
  _registrarEstadoCasoV6_(hoja, filaIndice, 'Error automatización');
}

function _cerrarCasoFilaV6_(hoja, filaIndice, fechaIngreso, feriados) {
  var fechaCierre = cerrarCasoFila(hoja, filaIndice, fechaIngreso, TZ_LIMA, feriados);
  _registrarEstadoCasoV6_(hoja, filaIndice, 'Cerrado');
  _limpiarErrorAutomatizacionFila_(hoja, filaIndice);
  return fechaCierre;
}

function _filaCalificaEnvioDirectoV6_(filaValores) {
  var estadoRpta = _textoV6_(filaValores[COL_RESUMEN.estado_rpta - 1]);
  var estadoEncuesta = _textoV6_(filaValores[COL_RESUMEN.estado_encuesta - 1]);
  var correo = _textoV6_(filaValores[COL_RESUMEN.correo - 1]);
  var respuesta = _textoV6_(filaValores[COL_RESUMEN.respuesta - 1]);
  var fechaRpta = filaValores[COL_RESUMEN.fecha_hora_rpta - 1];

  if (estadoRpta !== 'Completado') return false;
  if (!_vacioV6_(fechaRpta)) return false;

  if (estadoEncuesta === 'No enviar') return true;
  if (estadoEncuesta === 'Enviar') return !!(correo && respuesta);
  if (estadoEncuesta === 'Fe de erratas') return !!(correo && respuesta);

  return false;
}

function _correosNecesariosFilaV6_(props, clave, estadoEncuesta) {
  if (estadoEncuesta === 'No enviar') return 0;
  if (estadoEncuesta === 'Fe de erratas') {
    return _tieneMarcaEnvioV6_(props, 'FE_ERRATAS', clave) ? 0 : 1;
  }
  if (estadoEncuesta === 'Enviar') {
    var n = 0;
    if (!_tieneMarcaEnvioV6_(props, 'RESOLUCION', clave)) n++;
    if (!_tieneMarcaEnvioV6_(props, 'ENCUESTA', clave)) n++;
    return n;
  }
  return 0;
}

function enviarConHeadersImportante(para, cc, asunto, html) {
  var paraNorm = _toLowerEmailList(para);
  var ccNorm = _toLowerEmailList(cc);

  if (!paraNorm) {
    throw new Error('No hay destinatario válido para enviar el correo. Valor recibido: ' + para);
  }

  if (_envioPausadoPorCuotaV6_()) {
    throw new Error('Envío pausado temporalmente por cuota agotada. No se envió a: ' + paraNorm);
  }

  try {
    var cuota = MailApp.getRemainingDailyQuota();
    if (typeof cuota === 'number' && cuota <= 0) {
      _pausarEnviosPorCuotaV6_('MailApp.getRemainingDailyQuota() = ' + cuota);
      throw new Error('Sin cuota diaria de MailApp. No se envió a: ' + paraNorm);
    }
  } catch (eCuotaLectura) {
    // Si no se puede leer la cuota, igual intentamos enviar. Apps Script, siempre tan poético.
    Logger.log('SAB V6: no se pudo leer cuota MailApp: ' + eCuotaLectura);
  }

  var opciones = { htmlBody: html || '' };
  if (ccNorm) opciones.cc = ccNorm;

  try {
    MailApp.sendEmail(paraNorm, asunto || '', ' ', opciones);
  } catch (err) {
    var msg = String(err && err.message ? err.message : err);
    if (/too many times|premium email|quota|cuota/i.test(msg)) {
      _pausarEnviosPorCuotaV6_(msg);
    }
    throw err;
  }
}

function _procesarFilaCorreoDirectoV6_(ss, hoja, filaIndice, filaValores, feriados, origen) {
  if (!_filaCalificaEnvioDirectoV6_(filaValores)) return false;

  var props = PropertiesService.getScriptProperties();
  var codigo = _textoV6_(filaValores[COL_RESUMEN.codigo_operacion - 1]);
  var clave = _claveEnvioV6_(ss, hoja, filaIndice, filaValores);
  var lockKey = _propV6_('LOCK', clave);
  var ahoraMs = Date.now();
  var lockActual = Number(props.getProperty(lockKey) || 0);

  if (lockActual && (ahoraMs - lockActual) < SAB_V6_LOCK_MS) {
    Logger.log('SAB V6 omitido por lock temporal | hoja=%s fila=%s codigo=%s', hoja.getName(), filaIndice, codigo);
    return false;
  }

  props.setProperty(lockKey, String(ahoraMs));

  try {
    var estadoEncuesta = _textoV6_(filaValores[COL_RESUMEN.estado_encuesta - 1]);
    var correo = _textoV6_(filaValores[COL_RESUMEN.correo - 1]);
    var respuesta = _textoV6_(filaValores[COL_RESUMEN.respuesta - 1]);
    var fechaIngreso = filaValores[COL_RESUMEN.fecha_hora - 1];
    var necesarios = _correosNecesariosFilaV6_(props, clave, estadoEncuesta);

    Logger.log('SAB V6 evaluando | hoja=%s fila=%s codigo=%s estado=%s necesarios=%s origen=%s',
      hoja.getName(), filaIndice, codigo, estadoEncuesta, necesarios, origen);

    if (estadoEncuesta === 'No enviar') {
      _cerrarCasoFilaV6_(hoja, filaIndice, fechaIngreso, feriados);
      Logger.log('SAB V6 cerrado sin correo | hoja=%s fila=%s codigo=%s', hoja.getName(), filaIndice, codigo);
      return true;
    }

    if (necesarios > 0) {
      var cuota = MailApp.getRemainingDailyQuota();
      if (typeof cuota === 'number' && cuota < necesarios) {
        var msgCuota = 'SAB V6 sin cuota suficiente. Necesarios=' + necesarios + ', cuota=' + cuota + ', codigo=' + codigo;
        _pausarEnviosPorCuotaV6_(msgCuota);
        _registrarErrorFilaV6_(hoja, filaIndice, msgCuota);
        return false;
      }
    }

    if (estadoEncuesta === 'Fe de erratas') {
      if (!correo || !respuesta) return false;

      if (!_tieneMarcaEnvioV6_(props, 'FE_ERRATAS', clave)) {
        enviarCorreoResolucionFeDeErratas(
          correo,
          filaValores[COL_RESUMEN.correo_cpl - 1],
          codigo,
          filaValores[COL_RESUMEN.fecha_hora - 1],
          filaValores[COL_RESUMEN.tipo - 1],
          filaValores[COL_RESUMEN.consulta - 1],
          respuesta,
          new Date(),
          filaValores[COL_RESUMEN.nombre - 1]
        );
        _marcarEnvioV6_(props, 'FE_ERRATAS', clave);
      }

      _cerrarCasoFilaV6_(hoja, filaIndice, fechaIngreso, feriados);
      Logger.log('SAB V6 fe de erratas enviada/cerrada | hoja=%s fila=%s codigo=%s', hoja.getName(), filaIndice, codigo);
      return true;
    }

    if (estadoEncuesta === 'Enviar') {
      if (!correo || !respuesta) return false;

      if (!_tieneMarcaEnvioV6_(props, 'RESOLUCION', clave)) {
        enviarCorreoResolucion(
          correo,
          filaValores[COL_RESUMEN.correo_cpl - 1],
          codigo,
          filaValores[COL_RESUMEN.fecha_hora - 1],
          filaValores[COL_RESUMEN.tipo - 1],
          filaValores[COL_RESUMEN.coordinador_responsable - 1],
          filaValores[COL_RESUMEN.consulta - 1],
          respuesta,
          new Date(),
          filaValores[COL_RESUMEN.nombre - 1]
        );
        _marcarEnvioV6_(props, 'RESOLUCION', clave);
      }

      if (!_tieneMarcaEnvioV6_(props, 'ENCUESTA', clave)) {
        enviarCorreoEncuesta(correo, filaValores[COL_RESUMEN.tipo - 1]);
        _marcarEnvioV6_(props, 'ENCUESTA', clave);
      }

      _cerrarCasoFilaV6_(hoja, filaIndice, fechaIngreso, feriados);
      Logger.log('SAB V6 resolución + encuesta enviada/cerrada | hoja=%s fila=%s codigo=%s', hoja.getName(), filaIndice, codigo);
      return true;
    }

    return false;
  } catch (err) {
    var msg = 'SAB V6 ERROR envío | hoja=' + hoja.getName() + ' fila=' + filaIndice + ' codigo=' + codigo + ' origen=' + origen + ' | ' + (err && err.stack ? err.stack : err);
    Logger.log(msg);
    _registrarErrorFilaV6_(hoja, filaIndice, msg);
    throw err;
  } finally {
    props.deleteProperty(lockKey);
  }
}

function enviarPendientesDirectoV6() {
  if (_envioPausadoPorCuotaV6_()) {
    Logger.log('SAB V6: barrido omitido porque los envíos están pausados por cuota.');
    return 0;
  }

  var hojas = obtenerHojasResumen();
  if (!hojas.length) {
    Logger.log('SAB V6: no hay hojas Resumen_XX.');
    return 0;
  }

  var ss = SpreadsheetApp.getActive();
  var feriados = obtenerFeriados();
  var procesados = 0;
  var errores = [];

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    asegurarEncabezadosResumen(hoja);

    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var valores = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    var procesadosHoja = 0;

    for (var i = 0; i < valores.length; i++) {
      if (_envioPausadoPorCuotaV6_()) break;

      var filaIndice = i + 2;
      try {
        if (_procesarFilaCorreoDirectoV6_(ss, hoja, filaIndice, valores[i], feriados, 'barrido-v6')) {
          procesados++;
          procesadosHoja++;
        }
      } catch (err) {
        errores.push('hoja=' + hoja.getName() + ' fila=' + filaIndice + ' error=' + err);
        if (/too many times|premium email|quota|cuota|Sin cuota/i.test(String(err))) break;
      }
    }

    Logger.log('SAB V6 hoja %s procesados=%s', hoja.getName(), procesadosHoja);
    if (_envioPausadoPorCuotaV6_()) break;
  }

  Logger.log('SAB V6 total procesados=' + procesados);

  if (errores.length) {
    Logger.log('SAB V6 errores: ' + errores.join(' || '));
  }

  return procesados;
}

function _controlarEdicionResumenV6_(e) {
  if (!e || !e.range) return;

  var hoja = e.range.getSheet();
  if (!hoja || !_esHojaResumenV6_(hoja.getName())) return;

  var fila = e.range.getRow();
  var col = e.range.getColumn();
  if (fila < 2) return;
  if (col !== COL_RESUMEN.estado_rpta && col !== COL_RESUMEN.estado_encuesta) return;

  asegurarEncabezadosResumen(hoja);

  var ss = SpreadsheetApp.getActive();
  var filaValores = hoja.getRange(fila, 1, 1, _anchoResumen()).getValues()[0];
  var estadoRpta = _textoV6_(filaValores[COL_RESUMEN.estado_rpta - 1]);
  var estadoEncuesta = _textoV6_(filaValores[COL_RESUMEN.estado_encuesta - 1]);
  var respuesta = _textoV6_(filaValores[COL_RESUMEN.respuesta - 1]);
  var props = PropertiesService.getScriptProperties();
  var clave = _claveEnvioV6_(ss, hoja, fila, filaValores);

  if (col === COL_RESUMEN.estado_encuesta && estadoEncuesta === 'Fe de erratas') {
    // Reinicia el caso para que el barrido minutal mande SOLO la fe de erratas cuando se complete de nuevo.
    hoja.getRange(fila, COL_RESUMEN.respuesta, 1, 4).clearContent(); // respuesta, fecha_hora_rpta, sla, ratio
    hoja.getRange(fila, COL_RESUMEN.estado_rpta).setValue('Pendiente');
    _borrarMarcasEnvioV6_(props, clave);
    _registrarEstadoCasoV6_(hoja, fila, 'Fe de erratas pendiente');
    ss.toast('Fe de erratas preparada. Completa la respuesta en P y luego marca N como Completado.');
    return;
  }

  if (estadoEncuesta === 'Enviar' && !respuesta) {
    hoja.getRange(fila, COL_RESUMEN.estado_encuesta).setValue('Pendiente');
    ss.toast('No se puede seleccionar "Enviar" si la columna P está vacía. Se revirtió a Pendiente.');
    return;
  }

  if (estadoEncuesta === 'Fe de erratas' && estadoRpta === 'Completado' && !respuesta) {
    hoja.getRange(fila, COL_RESUMEN.estado_rpta).setValue('Pendiente');
    ss.toast('Para cerrar por Fe de erratas, primero completa la columna P.');
    return;
  }

  // Nada de enviar en onEdit. El envío lo hace el barrido minutal con lock global.
}

function triggerOnEditResumen(e) {
  _controlarEdicionResumenV6_(e);
}

function onEdit(e) {
  // Simple trigger: solo validación liviana. No envía correos.
  try { _controlarEdicionResumenV6_(e); } catch (err) { Logger.log('SAB V6 onEdit: ' + err); }
}

function controladorOnEdit(e, contexto) {
  // Anulado para evitar dobles envíos desde colas viejas.
  // Si alguna cola antigua lo llama, no manda correos. Gracias, civilización, por esta vuelta innecesaria.
  Logger.log('SAB V6: controladorOnEdit anulado para evitar dobles envíos.');
}

function _despacharColaOnEdit() {
  // Anulado: la cola antigua fue la fuente probable de duplicados cuando V5 ya había enviado y luego la cola reenviaba.
  _propsDoc().deleteProperty(COLA_ONEDIT_KEY);
  _propsDoc().deleteProperty(COLA_EN_EJECUCION_KEY);
  Logger.log('SAB V6: cola onEdit antigua limpiada.');
}

function ejecutarCadaMinuto() {
  sincronizar();
}

function sincronizar() {
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(45000)) {
    Logger.log('SAB V6 sincronizar omitido: ya hay otra ejecución activa.');
    return;
  }

  try {
    asegurarEncabezadosEnTodasLasHojasResumen();
    actualizarRegistroConHojasForm();
    procesarRegistro();
    aplicarValidacionesEnResumen();
    enviarPendientesDirectoV6();
  } finally {
    lock.releaseLock();
  }
}

function manejarCorreosPendientes() {
  return enviarPendientesDirectoV6();
}

function enviarPendientesDirectoV5() {
  // Compatibilidad: si alguien ejecuta V5 manualmente, lo mandamos por V6.
  return enviarPendientesDirectoV6();
}

function forzarRevisarCorreosPendientes() {
  _reanudarEnviosV6_();
  return enviarPendientesDirectoV6();
}

function diagnosticarPendientesCorreoSAB() {
  var hojas = obtenerHojasResumen();
  var total = 0;

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    var subtotal = 0;

    for (var i = 0; i < datos.length; i++) {
      if (_filaCalificaEnvioDirectoV6_(datos[i])) {
        subtotal++;
        total++;
        Logger.log('SAB V6 pendiente | hoja=%s fila=%s codigo=%s estado_rpta=%s estado_encuesta=%s correo=%s respuesta_len=%s fecha_rpta=%s',
          hoja.getName(),
          i + 2,
          datos[i][COL_RESUMEN.codigo_operacion - 1],
          datos[i][COL_RESUMEN.estado_rpta - 1],
          datos[i][COL_RESUMEN.estado_encuesta - 1],
          datos[i][COL_RESUMEN.correo - 1],
          String(datos[i][COL_RESUMEN.respuesta - 1] || '').length,
          datos[i][COL_RESUMEN.fecha_hora_rpta - 1]
        );
      }
    }

    Logger.log('SAB V6 pendientes en ' + hoja.getName() + ': ' + subtotal);
  }

  Logger.log('SAB V6 pendientes totales: ' + total);
  return total;
}

function reintentarEnvioPorCodigo(codigoOperacion) {
  var ss = SpreadsheetApp.getActive();
  var hojas = obtenerHojasResumen();
  var feriados = obtenerFeriados();
  var props = PropertiesService.getScriptProperties();
  _reanudarEnviosV6_();

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    for (var i = 0; i < datos.length; i++) {
      var fila = i + 2;
      if (_textoV6_(datos[i][COL_RESUMEN.codigo_operacion - 1]) === _textoV6_(codigoOperacion)) {
        var clave = _claveEnvioV6_(ss, hoja, fila, datos[i]);
        _borrarMarcasEnvioV6_(props, clave);
        hoja.getRange(fila, COL_RESUMEN.fecha_hora_rpta, 1, 3).clearContent(); // fecha_hora_rpta, sla, ratio
        Logger.log('SAB V6 reintento manual | hoja=%s fila=%s codigo=%s', hoja.getName(), fila, codigoOperacion);
        return _procesarFilaCorreoDirectoV6_(ss, hoja, fila, datos[i], feriados, 'manual-codigo-v6');
      }
    }
  }

  throw new Error('SAB V6 no encontró el código: ' + codigoOperacion);
}

function enviarFilaActivaAhora() {
  var ss = SpreadsheetApp.getActive();
  var hoja = ss.getActiveSheet();
  if (!hoja || !_esHojaResumenV6_(hoja.getName())) {
    throw new Error('Selecciona una fila dentro de una hoja Resumen_XX antes de ejecutar esta función.');
  }

  var fila = hoja.getActiveCell().getRow();
  if (fila < 2) throw new Error('Selecciona una fila de datos, no el encabezado.');

  _reanudarEnviosV6_();
  var feriados = obtenerFeriados();
  var valores = hoja.getRange(fila, 1, 1, _anchoResumen()).getValues()[0];
  return _procesarFilaCorreoDirectoV6_(ss, hoja, fila, valores, feriados, 'manual-fila-activa-v6');
}

function probarEnvioCorreoSAB() {
  var usuario = Session.getEffectiveUser().getEmail();
  if (!usuario) throw new Error('No se pudo obtener el correo del usuario efectivo.');

  _reanudarEnviosV6_();
  var cuota = MailApp.getRemainingDailyQuota();
  Logger.log('SAB V6 cuota restante MailApp antes del envío: ' + cuota);

  MailApp.sendEmail(
    usuario,
    'Prueba V6 - Automatización Soporte SAB',
    'Si recibiste este correo, MailApp está autorizado para esta cuenta. Cuota antes del envío: ' + cuota
  );

  Logger.log('SAB V6 correo de prueba enviado a: ' + usuario);
}

function instalarActivadoresPrincipal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssId = ss.getId();
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    Logger.log('SAB V6: no se pudieron instalar activadores porque otra ejecución mantiene el lock.');
    return;
  }

  try {
    var handlersPermitidos = {
      ejecutarCadaMinuto: true,
      triggerOnEditResumen: true,
      controladorOnEdit: true,
      sincronizar: true,
      enviarPendientesDirectoV5: true,
      enviarPendientesDirectoV6: true
    };

    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      var fn = triggers[i].getHandlerFunction && triggers[i].getHandlerFunction();
      if (handlersPermitidos[fn]) ScriptApp.deleteTrigger(triggers[i]);
    }

    ScriptApp.newTrigger('ejecutarCadaMinuto')
      .timeBased()
      .everyMinutes(1)
      .create();

    ScriptApp.newTrigger('triggerOnEditResumen')
      .forSpreadsheet(ssId)
      .onEdit()
      .create();

    PropertiesService.getScriptProperties().setProperty(
      'ACTIVADORES_INSTALADOS_POR',
      Session.getEffectiveUser().getEmail() || 'usuario_desconocido'
    );

    Logger.log('SAB V6: activadores reinstalados correctamente para el usuario actual.');
  } finally {
    lock.releaseLock();
  }
}

/***** FIN PATCH V6 SAB *****/

/***** PATCH V7 SAB - LIMPIEZA DE PROPERTIES Y ENVÍO SIN PROPERTIES *****/
/***** PEGAR AL FINAL EXACTO DEL ARCHIVO *****/

var SAB_V7_MAX_ENVIOS_POR_EJECUCION = 8;

var SAB_V7_COL_RESOLUCION = 'sab_v7_resolucion_enviada';
var SAB_V7_COL_ENCUESTA = 'sab_v7_encuesta_enviada';
var SAB_V7_COL_FE_ERRATAS = 'sab_v7_fe_erratas_enviada';
var SAB_V7_COL_ERROR = 'error_automatizacion';
var SAB_V7_COL_FECHA_ERROR = 'fecha_error_automatizacion';

function LIMPIAR_CUOTAS_PROPERTIES_SAB() {
  var total = 0;

  total += _borrarTodasLasPropertiesV7_(PropertiesService.getScriptProperties(), 'ScriptProperties');
  total += _borrarTodasLasPropertiesV7_(PropertiesService.getDocumentProperties(), 'DocumentProperties');
  total += _borrarTodasLasPropertiesV7_(PropertiesService.getUserProperties(), 'UserProperties');

  Logger.log('SAB V7: limpieza terminada. Properties borradas aprox: ' + total);
  Logger.log('SAB V7: ahora ejecuta instalarActivadoresPrincipal().');
}

function _borrarTodasLasPropertiesV7_(store, nombre) {
  try {
    var props = store.getProperties();
    var keys = Object.keys(props || {});
    for (var i = 0; i < keys.length; i++) {
      store.deleteProperty(keys[i]);
    }
    Logger.log('SAB V7: ' + nombre + ' borradas: ' + keys.length);
    return keys.length;
  } catch (e1) {
    try {
      store.deleteAllProperties();
      Logger.log('SAB V7: ' + nombre + ' borradas con deleteAllProperties().');
      return 1;
    } catch (e2) {
      Logger.log('SAB V7: no se pudo borrar ' + nombre + ': ' + e2);
      return 0;
    }
  }
}

function _normalizarClaveV7_(s) {
  return String(s == null ? '' : s)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function _textoV7_(v) {
  return String(v == null ? '' : v).trim();
}

function _esHojaResumenV7_(nombre) {
  return /^Resumen_.{2}$/.test(String(nombre || ''));
}

function _columnaPorNombreFlexibleV7_(hoja, nombres, crearSiNoExiste) {
  var lista = Array.isArray(nombres) ? nombres : [nombres];
  var lastCol = Math.max(hoja.getLastColumn(), _anchoResumen());
  var encabezados = hoja.getRange(1, 1, 1, lastCol).getValues()[0];

  var mapa = {};
  for (var i = 0; i < encabezados.length; i++) {
    var clave = _normalizarClaveV7_(encabezados[i]);
    if (clave && !mapa.hasOwnProperty(clave)) mapa[clave] = i + 1;
  }

  for (var j = 0; j < lista.length; j++) {
    var buscada = _normalizarClaveV7_(lista[j]);
    if (mapa.hasOwnProperty(buscada)) return mapa[buscada];
  }

  if (!crearSiNoExiste) return 0;

  var nuevaCol = lastCol + 1;
  hoja.getRange(1, nuevaCol).setValue(lista[0]);
  return nuevaCol;
}

function _asegurarColumnasV7_(hoja) {
  return {
    resolucion: _columnaPorNombreFlexibleV7_(hoja, [SAB_V7_COL_RESOLUCION], true),
    encuesta: _columnaPorNombreFlexibleV7_(hoja, [SAB_V7_COL_ENCUESTA], true),
    feErratas: _columnaPorNombreFlexibleV7_(hoja, [SAB_V7_COL_FE_ERRATAS], true),
    error: _columnaPorNombreFlexibleV7_(hoja, [SAB_V7_COL_ERROR, 'error automatizacion', 'error de automatizacion'], true),
    fechaError: _columnaPorNombreFlexibleV7_(hoja, [SAB_V7_COL_FECHA_ERROR, 'fecha error automatizacion', 'fecha de error de automatizacion'], true)
  };
}

function _marcarErrorV7_(hoja, fila, mensaje) {
  try {
    var cols = _asegurarColumnasV7_(hoja);
    hoja.getRange(fila, cols.error).setValue(String(mensaje || '').slice(0, 45000));
    hoja.getRange(fila, cols.fechaError).setValue(new Date());
  } catch (e) {
    Logger.log('SAB V7: no se pudo registrar error: ' + e);
  }
}

function _limpiarErrorV7_(hoja, fila) {
  try {
    var colError = _columnaPorNombreFlexibleV7_(hoja, [SAB_V7_COL_ERROR, 'error automatizacion', 'error de automatizacion'], false);
    var colFecha = _columnaPorNombreFlexibleV7_(hoja, [SAB_V7_COL_FECHA_ERROR, 'fecha error automatizacion', 'fecha de error de automatizacion'], false);

    if (colError) hoja.getRange(fila, colError).clearContent();
    if (colFecha) hoja.getRange(fila, colFecha).clearContent();
  } catch (e) {
    Logger.log('SAB V7: no se pudo limpiar error: ' + e);
  }
}

function _exigirCuotaCorreoV7_() {
  try {
    var cuota = MailApp.getRemainingDailyQuota();
    if (cuota <= 0) {
      throw new Error('Sin cuota diaria disponible de MailApp. Cuota restante: ' + cuota);
    }
    return cuota;
  } catch (e) {
    throw new Error('No se pudo validar cuota de correo o no queda cuota: ' + e);
  }
}

function _correoPuedeProcesarseFila_(filaValores) {
  var estadoRpta = _textoV7_(filaValores[COL_RESUMEN.estado_rpta - 1]);
  var estadoEncuesta = _textoV7_(filaValores[COL_RESUMEN.estado_encuesta - 1]);
  var correo = _textoV7_(filaValores[COL_RESUMEN.correo - 1]);
  var respuesta = _textoV7_(filaValores[COL_RESUMEN.respuesta - 1]);
  var fechaRpta = filaValores[COL_RESUMEN.fecha_hora_rpta - 1];

  if (estadoRpta !== 'Completado') return false;
  if (fechaRpta) return false;

  if (estadoEncuesta === 'No enviar') return true;
  if (estadoEncuesta === 'Enviar') return !!(correo && respuesta);
  if (estadoEncuesta === 'Fe de erratas') return !!(correo && respuesta);

  return false;
}

function _procesarFilaCorreoDirectoV7_(ss, hoja, fila, filaValores, feriados, origen) {
  if (!_correoPuedeProcesarseFila_(filaValores)) return false;

  var cols = _asegurarColumnasV7_(hoja);

  var codigo = filaValores[COL_RESUMEN.codigo_operacion - 1];
  var correo = filaValores[COL_RESUMEN.correo - 1];
  var ccCpl = filaValores[COL_RESUMEN.correo_cpl - 1];
  var fechaHora = filaValores[COL_RESUMEN.fecha_hora - 1];
  var tipo = filaValores[COL_RESUMEN.tipo - 1];
  var coordinador = filaValores[COL_RESUMEN.coordinador_responsable - 1];
  var consulta = filaValores[COL_RESUMEN.consulta - 1];
  var respuesta = filaValores[COL_RESUMEN.respuesta - 1];
  var nombre = filaValores[COL_RESUMEN.nombre - 1];
  var estadoEncuesta = _textoV7_(filaValores[COL_RESUMEN.estado_encuesta - 1]);

  var flagResolucion = hoja.getRange(fila, cols.resolucion).getValue();
  var flagEncuesta = hoja.getRange(fila, cols.encuesta).getValue();
  var flagFeErratas = hoja.getRange(fila, cols.feErratas).getValue();

  Logger.log(
    'SAB V7 evalúa | hoja=%s fila=%s codigo=%s estado=%s origen=%s',
    hoja.getName(),
    fila,
    codigo,
    estadoEncuesta,
    origen
  );

  try {
    if (estadoEncuesta === 'No enviar') {
      cerrarCasoFila(hoja, fila, fechaHora, TZ_LIMA, feriados);
      _limpiarErrorV7_(hoja, fila);
      Logger.log('SAB V7 cerrado sin correo | ' + codigo);
      return true;
    }

    if (estadoEncuesta === 'Enviar') {
      if (!correo || !respuesta) return false;

      if (!flagResolucion) {
        _exigirCuotaCorreoV7_();
        enviarCorreoResolucion(
          correo,
          ccCpl,
          codigo,
          fechaHora,
          tipo,
          coordinador,
          consulta,
          respuesta,
          new Date(),
          nombre
        );
        hoja.getRange(fila, cols.resolucion).setValue(new Date());
        SpreadsheetApp.flush();
      }

      if (!flagEncuesta) {
        _exigirCuotaCorreoV7_();
        enviarCorreoEncuesta(correo, tipo);
        hoja.getRange(fila, cols.encuesta).setValue(new Date());
        SpreadsheetApp.flush();
      }

      cerrarCasoFila(hoja, fila, fechaHora, TZ_LIMA, feriados);
      _limpiarErrorV7_(hoja, fila);
      Logger.log('SAB V7 enviado y cerrado | ' + codigo);
      return true;
    }

    if (estadoEncuesta === 'Fe de erratas') {
      if (!correo || !respuesta) return false;

      if (!flagFeErratas) {
        _exigirCuotaCorreoV7_();
        enviarCorreoResolucionFeDeErratas(
          correo,
          ccCpl,
          codigo,
          fechaHora,
          tipo,
          consulta,
          respuesta,
          new Date(),
          nombre
        );
        hoja.getRange(fila, cols.feErratas).setValue(new Date());
        SpreadsheetApp.flush();
      }

      cerrarCasoFila(hoja, fila, fechaHora, TZ_LIMA, feriados);
      _limpiarErrorV7_(hoja, fila);
      Logger.log('SAB V7 fe de erratas enviada y cerrada | ' + codigo);
      return true;
    }

    return false;
  } catch (err) {
    var msg = 'SAB V7 ERROR | hoja=' + hoja.getName() + ' fila=' + fila + ' codigo=' + codigo + ' origen=' + origen + ' | ' + (err && err.stack ? err.stack : err);
    Logger.log(msg);
    _marcarErrorV7_(hoja, fila, msg);
    throw err;
  }
}

function manejarCorreosPendientes() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) {
    Logger.log('SAB V7: manejarCorreosPendientes omitido por lock activo.');
    return;
  }

  try {
    var ss = SpreadsheetApp.getActive();
    var hojas = obtenerHojasResumen();
    var feriados = obtenerFeriados();
    var procesados = 0;

    for (var h = 0; h < hojas.length; h++) {
      var hoja = hojas[h];
      if (!_esHojaResumenV7_(hoja.getName())) continue;

      asegurarEncabezadosResumen(hoja);
      _asegurarColumnasV7_(hoja);

      var ultima = hoja.getLastRow();
      if (ultima < 2) continue;

      var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();

      for (var i = 0; i < datos.length; i++) {
        if (procesados >= SAB_V7_MAX_ENVIOS_POR_EJECUCION) {
          Logger.log('SAB V7: límite por ejecución alcanzado: ' + SAB_V7_MAX_ENVIOS_POR_EJECUCION);
          return;
        }

        var fila = i + 2;

        try {
          if (_procesarFilaCorreoDirectoV7_(ss, hoja, fila, datos[i], feriados, 'minutal-v7')) {
            procesados++;
          }
        } catch (e) {
          Logger.log('SAB V7: fila falló, se continúa con la siguiente. ' + e);
        }
      }
    }

    Logger.log('SAB V7: manejarCorreosPendientes finalizado. Procesados=' + procesados);
  } finally {
    lock.releaseLock();
  }
}

function diagnosticarPendientesCorreoSAB() {
  var hojas = obtenerHojasResumen();
  var total = 0;

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    if (!_esHojaResumenV7_(hoja.getName())) continue;

    _asegurarColumnasV7_(hoja);

    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();
    var subtotal = 0;

    for (var i = 0; i < datos.length; i++) {
      if (_correoPuedeProcesarseFila_(datos[i])) {
        subtotal++;
        total++;
        Logger.log(
          'SAB V7 pendiente | hoja=%s fila=%s codigo=%s estado_rpta=%s estado_encuesta=%s correo=%s respuesta_len=%s',
          hoja.getName(),
          i + 2,
          datos[i][COL_RESUMEN.codigo_operacion - 1],
          datos[i][COL_RESUMEN.estado_rpta - 1],
          datos[i][COL_RESUMEN.estado_encuesta - 1],
          datos[i][COL_RESUMEN.correo - 1],
          String(datos[i][COL_RESUMEN.respuesta - 1] || '').length
        );
      }
    }

    Logger.log('SAB V7 pendientes en ' + hoja.getName() + ': ' + subtotal);
  }

  Logger.log('SAB V7 pendientes totales: ' + total);
}

function inspeccionarEnvio(codigoOperacion) {
  var hojas = obtenerHojasResumen();
  var encontrado = false;

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    var cols = _asegurarColumnasV7_(hoja);
    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();

    for (var i = 0; i < datos.length; i++) {
      var codigo = String(datos[i][COL_RESUMEN.codigo_operacion - 1] || '').trim();
      if (codigo !== String(codigoOperacion || '').trim()) continue;

      encontrado = true;
      var fila = i + 2;

      Logger.log('SAB V7 inspección | hoja=' + hoja.getName() + ' fila=' + fila);
      Logger.log('codigo=' + codigo);
      Logger.log('estado_rpta=' + datos[i][COL_RESUMEN.estado_rpta - 1]);
      Logger.log('estado_encuesta=' + datos[i][COL_RESUMEN.estado_encuesta - 1]);
      Logger.log('correo=' + datos[i][COL_RESUMEN.correo - 1]);
      Logger.log('respuesta_len=' + String(datos[i][COL_RESUMEN.respuesta - 1] || '').length);
      Logger.log('fecha_hora_rpta=' + datos[i][COL_RESUMEN.fecha_hora_rpta - 1]);
      Logger.log('flag_resolucion=' + hoja.getRange(fila, cols.resolucion).getValue());
      Logger.log('flag_encuesta=' + hoja.getRange(fila, cols.encuesta).getValue());
      Logger.log('flag_fe_erratas=' + hoja.getRange(fila, cols.feErratas).getValue());
    }
  }

  if (!encontrado) Logger.log('SAB V7 no encontró el código: ' + codigoOperacion);
}

function reintentarEnvioPorCodigo(codigoOperacion) {
  var ss = SpreadsheetApp.getActive();
  var hojas = obtenerHojasResumen();
  var feriados = obtenerFeriados();

  for (var h = 0; h < hojas.length; h++) {
    var hoja = hojas[h];
    var ultima = hoja.getLastRow();
    if (ultima < 2) continue;

    _asegurarColumnasV7_(hoja);

    var datos = hoja.getRange(2, 1, ultima - 1, _anchoResumen()).getValues();

    for (var i = 0; i < datos.length; i++) {
      var codigo = String(datos[i][COL_RESUMEN.codigo_operacion - 1] || '').trim();
      if (codigo === String(codigoOperacion || '').trim()) {
        return _procesarFilaCorreoDirectoV7_(ss, hoja, i + 2, datos[i], feriados, 'manual-codigo-v7');
      }
    }
  }

  throw new Error('SAB V7 no encontró el código: ' + codigoOperacion);
}

function enviarFilaActivaAhora() {
  var ss = SpreadsheetApp.getActive();
  var hoja = ss.getActiveSheet();

  if (!hoja || !_esHojaResumenV7_(hoja.getName())) {
    throw new Error('Selecciona una fila dentro de una hoja Resumen_XX.');
  }

  var fila = hoja.getActiveCell().getRow();
  if (fila < 2) throw new Error('Selecciona una fila de datos, no el encabezado.');

  _asegurarColumnasV7_(hoja);

  var feriados = obtenerFeriados();
  var valores = hoja.getRange(fila, 1, 1, _anchoResumen()).getValues()[0];

  return _procesarFilaCorreoDirectoV7_(ss, hoja, fila, valores, feriados, 'manual-fila-activa-v7');
}

function probarEnvioCorreoSAB() {
  var usuario = Session.getEffectiveUser().getEmail();
  if (!usuario) throw new Error('No se pudo obtener el correo del usuario efectivo.');

  var cuota = MailApp.getRemainingDailyQuota();
  Logger.log('SAB V7 cuota restante MailApp antes del envío: ' + cuota);

  MailApp.sendEmail(
    usuario,
    'Prueba V7 - Automatización Soporte SAB',
    'Si recibiste este correo, MailApp está autorizado para esta cuenta. Cuota antes del envío: ' + cuota
  );

  Logger.log('SAB V7 correo de prueba enviado a: ' + usuario);
}

function ejecutarCadaMinuto() {
  sincronizar();
}

function sincronizar() {
  var lock = LockService.getScriptLock();

  if (!lock.tryLock(25000)) {
    Logger.log('SAB V7 sincronizar omitido: ya hay otra ejecución activa.');
    return;
  }

  try {
    try { asegurarEncabezadosEnTodasLasHojasResumen(); } catch (e1) { Logger.log('SAB V7 encabezados: ' + e1); }
    try { actualizarRegistroConHojasForm(); } catch (e2) { Logger.log('SAB V7 registro: ' + e2); }
    try { procesarRegistro(); } catch (e3) { Logger.log('SAB V7 procesarRegistro: ' + e3); }
    try { aplicarValidacionesEnResumen(); } catch (e4) { Logger.log('SAB V7 validaciones: ' + e4); }
    try { manejarCorreosPendientes(); } catch (e5) { Logger.log('SAB V7 correos: ' + e5); }
  } finally {
    lock.releaseLock();
  }
}

function instalarActivadoresPrincipal() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssId = ss.getId();

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('SAB V7: no se pudieron instalar activadores porque otra ejecución mantiene el lock.');
    return;
  }

  try {
    var handlersPermitidos = {
      ejecutarCadaMinuto: true,
      triggerOnEditResumen: true,
      controladorOnEdit: true,
      sincronizar: true,
      enviarPendientesDirectoV5: true,
      enviarPendientesDirectoV6: true,
      enviarPendientesDirectoV7: true
    };

    var triggers = ScriptApp.getProjectTriggers();

    for (var i = 0; i < triggers.length; i++) {
      var fn = triggers[i].getHandlerFunction && triggers[i].getHandlerFunction();
      if (handlersPermitidos[fn]) {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }

    ScriptApp.newTrigger('ejecutarCadaMinuto')
      .timeBased()
      .everyMinutes(1)
      .create();

    Logger.log('SAB V7: activador minutal instalado. No se creó trigger onEdit para evitar duplicados.');
    Logger.log('SAB V7: no se escribió nada en PropertiesService.');
  } finally {
    lock.releaseLock();
  }
}

function reinstalarDisparadores() {
  instalarActivadoresPrincipal();
}

function borrarMisActivadoresSAB() {
  var triggers = ScriptApp.getProjectTriggers();
  var borrados = 0;

  var handlersPermitidos = {
    ejecutarCadaMinuto: true,
    triggerOnEditResumen: true,
    controladorOnEdit: true,
    sincronizar: true,
    enviarPendientesDirectoV5: true,
    enviarPendientesDirectoV6: true,
    enviarPendientesDirectoV7: true
  };

  for (var i = 0; i < triggers.length; i++) {
    var fn = triggers[i].getHandlerFunction && triggers[i].getHandlerFunction();
    if (handlersPermitidos[fn]) {
      ScriptApp.deleteTrigger(triggers[i]);
      borrados++;
    }
  }

  Logger.log('SAB V7: activadores borrados visibles para esta cuenta: ' + borrados);
}

function onOpen() {
  try {
    SpreadsheetApp.getActiveSpreadsheet().setSpreadsheetTimeZone('America/Lima');
  } catch (e) {}
}

function onInstall() {
  instalarActivadoresPrincipal();
}

function onEdit(e) {
  // SAB V7: intencionalmente vacío.
  // El envío se hace solo por ejecutarCadaMinuto para evitar dobles correos.
}

function triggerOnEditResumen(e) {
  // SAB V7: intencionalmente vacío.
  // Si quedó un trigger viejo de otra cuenta, cae aquí y no duplica nada.
}

function controladorOnEdit(e, contexto) {
  // SAB V7: intencionalmente vacío.
}

function _despacharColaOnEdit() {
  // SAB V7: cola vieja desactivada.
}

function _iniciarDespachador() {
  // SAB V7: despachador viejo desactivado.
}

function _encolarEditResumenN_O(e) {
  // SAB V7: cola vieja desactivada.
}

function _leerColaOnEdit() {
  return [];
}

function _guardarColaOnEdit(arr) {
  // SAB V7: no guardar cola en DocumentProperties.
}

function _tomarSiguienteEventoOnEdit() {
  return null;
}

/***** FIN PATCH V7 SAB *****/