// Envía un trámite al Apps Script Web App que escribe en el Google Sheet corporativo.
// Requiere VITE_SHEET_ENDPOINT y VITE_SHEET_TOKEN en tu .env (ver .env.example).
const ENDPOINT = import.meta.env.VITE_SHEET_ENDPOINT
const TOKEN = import.meta.env.VITE_SHEET_TOKEN

export async function submitTramite(payload) {
  if (!ENDPOINT) {
    throw new Error('Falta configurar VITE_SHEET_ENDPOINT en el archivo .env')
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    // text/plain evita el preflight CORS que Apps Script no responde bien;
    // el script igual lo parsea como JSON desde e.postData.contents.
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, token: TOKEN }),
  })

  const data = await res.json()
  if (data.status !== 'ok') {
    throw new Error(data.message || 'Error al guardar en Google Sheets')
  }
  return data
}
