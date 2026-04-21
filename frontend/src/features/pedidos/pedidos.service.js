import api from "../../services/api.js"

const API_URL = "/api/pedidos"

const getPedidos = async (estado) => {
  try {
    const response = await api.get(API_URL, { params: estado ? { estado } : {} })
    return response.data?.data ?? response.data ?? []
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return []
  }
}

const getPedidoById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data?.data ?? response.data
  } catch (error) {
    console.error("Error al obtener pedido por ID:", error)
    throw error
  }
}

const createPedido = async (pedidoData) => {
  try {
    const response = await api.post(API_URL, pedidoData)
    return response.data
  } catch (error) {
    console.error("Error al crear pedido:", error)
    throw error
  }
}

const updatePedido = async (id, pedidoData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, pedidoData)
    return response.data
  } catch (error) {
    console.error("Error al actualizar pedido:", error)
    throw error
  }
}

const deletePedido = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar pedido:", error)
    throw error
  }
}

const cambiarEstado = async (id, estado, nota) => {
  try {
    const response = await api.patch(`${API_URL}/${id}/estado`, { estado, nota })
    return response.data
  } catch (error) {
    console.error("Error al cambiar estado:", error)
    throw error
  }
}

const uploadComprobante = async (pedidoId, file) => {
  const formData = new FormData()
  formData.append('comprobante', file)
  const response = await api.post(`${API_URL}/${pedidoId}/comprobante/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

const registrarComprobante = async (id, data) => {
  try {
    const response = await api.post(`${API_URL}/${id}/comprobante`, data)
    return response.data
  } catch (error) {
    console.error("Error al registrar comprobante:", error)
    throw error
  }
}

const verificarComprobante = async (id, aprobado, notas) => {
  try {
    const response = await api.post(`${API_URL}/${id}/comprobante/verificar`, { aprobado, notas })
    return response.data
  } catch (error) {
    console.error("Error al verificar comprobante:", error)
    throw error
  }
}

const getInboxPagos = async () => {
  try {
    const response = await api.get(`${API_URL}/inbox/pagos`)
    return response.data?.data ?? []
  } catch (error) {
    console.error("Error al obtener inbox de pagos:", error)
    return []
  }
}

const getInboxPagosCount = async () => {
  try {
    const response = await api.get(`${API_URL}/inbox/pagos/count`)
    return response.data?.count ?? 0
  } catch (error) {
    console.error("Error al obtener contador de pagos:", error)
    return 0
  }
}

const getDetalles = async (pedidoId) => {
  try {
    const response = await api.get(`${API_URL}/${pedidoId}/detalles`)
    return response.data?.data ?? response.data ?? []
  } catch (error) {
    console.error("Error al obtener detalles:", error)
    return []
  }
}

const agregarDetalle = async (pedidoId, data) => {
  try {
    const response = await api.post(`${API_URL}/${pedidoId}/detalles`, data)
    return response.data
  } catch (error) {
    console.error("Error al agregar detalle:", error)
    throw error
  }
}

const actualizarDetalle = async (id, data) => {
  try {
    const response = await api.put(`${API_URL}/detalles/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Error al actualizar detalle:", error)
    throw error
  }
}

const eliminarDetalle = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/detalles/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar detalle:", error)
    throw error
  }
}

export default {
  getPedidos,
  getPedidoById,
  createPedido,
  updatePedido,
  deletePedido,
  cambiarEstado,
  uploadComprobante,
  registrarComprobante,
  verificarComprobante,
  getInboxPagos,
  getInboxPagosCount,
  getDetalles,
  agregarDetalle,
  actualizarDetalle,
  eliminarDetalle,
}
