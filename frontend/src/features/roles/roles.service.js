import api from "../../services/api.js"

const API_URL = "/api/roles"

const getRoles = async () => {
  try {
    const response = await api.get(API_URL)
    if (Array.isArray(response.data)) {
      return response.data
    }
    return []
  } catch (error) {
    console.error("Error al obtener roles:", error)
    return []
  }
}

const getRolById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al obtener rol por ID:", error)
    throw error
  }
}

const createRol = async (rolData) => {
  try {
    const response = await api.post(API_URL, rolData)
    return response.data
  } catch (error) {
    console.error("Error al crear rol:", error)
    throw error
  }
}

const updateRol = async (id, rolData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, rolData)
    return response.data
  } catch (error) {
    console.error("Error al actualizar rol:", error)
    throw error
  }
}

const deleteRol = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar rol:", error)
    throw error
  }
}

export default {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
}
