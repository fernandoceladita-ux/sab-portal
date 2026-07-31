// Limpia los inputs nativos de un <form> excepto los que estén en `keep`
// (normalmente los de identificación: correo/BP/nombre, que tiene sentido
// conservar si la persona va a enviar otro trámite a continuación). Los
// checkbox/radio nativos se destildan; el resto se vacía. No toca estado de
// React (archivos adjuntos, radios/checkboxes controlados) — eso lo limpia
// cada componente aparte, junto con esta función.
export function resetFormExcept(form, keep = []) {
  if (!form) return
  for (const el of form.elements) {
    if (!el.name || keep.includes(el.name)) continue
    if (el.type === 'checkbox' || el.type === 'radio') el.checked = false
    else el.value = ''
  }
}
