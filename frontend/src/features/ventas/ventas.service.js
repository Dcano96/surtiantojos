import api from "../../services/api.js"

const API_URL = "/api/ventas"

const getVentas = async (params = {}) => {
  try {
    const response = await api.get(API_URL, { params })
    return response.data?.data ?? response.data ?? []
  } catch (error) {
    console.error("Error al obtener ventas:", error)
    return []
  }
}

const getVentaById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data?.data ?? response.data
  } catch (error) {
    console.error("Error al obtener venta:", error)
    throw error
  }
}

const createVenta = async (data) => {
  try {
    const response = await api.post(API_URL, data)
    return response.data
  } catch (error) {
    console.error("Error al crear venta:", error)
    throw error
  }
}

const updateVenta = async (id, data) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Error al actualizar venta:", error)
    throw error
  }
}

const anularVenta = async (id, motivo) => {
  try {
    const response = await api.patch(`${API_URL}/${id}/anular`, { motivo })
    return response.data
  } catch (error) {
    console.error("Error al anular venta:", error)
    throw error
  }
}

const deleteVenta = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar venta:", error)
    throw error
  }
}

const getDetallesVentas = async (params = {}) => {
  try {
    const response = await api.get(`${API_URL}/detalles`, { params })
    return response.data?.data ?? response.data ?? []
  } catch (error) {
    console.error("Error al obtener detalles de ventas:", error)
    return []
  }
}

export default {
  getVentas, getVentaById, createVenta, updateVenta,
  anularVenta, deleteVenta, getDetallesVentas,
}
