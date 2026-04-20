import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const pub = axios.create({ baseURL: BASE })

export const getProductosPublicos = async () => {
  const { data } = await pub.get('/api/productos')
  const lista = data?.data ?? data ?? []
  return lista.filter(p => p.estado && p.stock > 0)
}

export const crearPedidoPublico = async (payload) => {
  const { data } = await pub.post('/api/pedidos', payload)
  return data
}

export const crearClientePublico = async (payload) => {
  const { data } = await pub.post('/api/clientes', payload)
  return data
}

export const buscarClientePorDocumento = async (documento) => {
  const { data } = await pub.get('/api/clientes', { params: { q: documento } })
  const lista = data?.data ?? data ?? []
  return lista.find(c => c.documento === documento) || null
}

// ── Comprobante público (cliente sube su comprobante desde la landing) ──
export const subirComprobantePublico = async (pedidoId, file) => {
  const fd = new FormData()
  fd.append('comprobante', file)
  const { data } = await pub.post(`/api/pedidos/${pedidoId}/comprobante/upload/public`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const registrarComprobantePublico = async (pedidoId, payload) => {
  const { data } = await pub.post(`/api/pedidos/${pedidoId}/comprobante/public`, payload)
  return data
}

// Admins disponibles. El cliente elige a cuál contactar en el paso 4.
export const ADMINS_WHATSAPP = [
  { id: 'goez',   nombre: 'David Goez',   numero: '573128778843' },
  { id: 'zabala', nombre: 'David Zabala', numero: '573114196881' },
]

// Compatibilidad: primer admin como "principal"
export const ADMIN_WHATSAPP =
  (import.meta.env.VITE_ADMIN_WHATSAPP || ADMINS_WHATSAPP[0].numero).replace(/\D/g, '')

export const buildWhatsAppLink = (mensaje, numero = ADMIN_WHATSAPP) =>
  `https://wa.me/${String(numero).replace(/\D/g,'')}?text=${encodeURIComponent(mensaje)}`

// ── Vista pública del pedido (deep-link compartido por WhatsApp al admin) ──
// Adjunta el JWT del admin si está logueado para que el backend lo detecte.
const authHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getPedidoPublico = async (numero) => {
  const { data } = await pub.get(
    `/api/pedidos/public/${encodeURIComponent(numero)}`,
    { headers: authHeader() }
  )
  return data
}

export const marcarComprobanteWhatsapp = async (numero, payload) => {
  const { data } = await pub.post(
    `/api/pedidos/public/${encodeURIComponent(numero)}/comprobante-whatsapp`,
    payload
  )
  return data
}

// Admin: sube imagen del comprobante desde la vista pública
export const subirComprobanteAdminPublic = async (numero, file) => {
  const fd = new FormData()
  fd.append('comprobante', file)
  const { data } = await pub.post(
    `/api/pedidos/public/${encodeURIComponent(numero)}/admin/comprobante/upload`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data', ...authHeader() } }
  )
  return data
}

// Admin: registra/verifica el comprobante. action="verificar" avanza a pago_verificado.
export const adminPublicComprobante = async (numero, payload) => {
  const { data } = await pub.post(
    `/api/pedidos/public/${encodeURIComponent(numero)}/admin/comprobante`,
    payload,
    { headers: authHeader() }
  )
  return data
}
