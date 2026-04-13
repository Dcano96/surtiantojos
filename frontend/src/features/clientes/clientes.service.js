import api from "../../services/api.js"

const API_URL = "/api/clientes"

const getClientes = async (params = {}) => {
  try {
    const response = await api.get(API_URL, { params })
    return response.data?.data ?? response.data ?? []
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return []
  }
}

const getClienteById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data?.data ?? response.data
  } catch (error) {
    console.error("Error al obtener cliente por ID:", error)
    throw error
  }
}

const createCliente = async (data) => {
  try {
    const response = await api.post(API_URL, data)
    return response.data
  } catch (error) {
    console.error("Error al crear cliente:", error)
    throw error
  }
}

const updateCliente = async (id, data) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    throw error
  }
}

const cambiarEstadoCliente = async (id) => {
  try {
    const response = await api.patch(`${API_URL}/${id}/estado`)
    return response.data
  } catch (error) {
    console.error("Error al cambiar estado del cliente:", error)
    throw error
  }
}

const deleteCliente = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar cliente:", error)
    throw error
  }
}

export default {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  cambiarEstadoCliente,
  deleteCliente,
}
