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
