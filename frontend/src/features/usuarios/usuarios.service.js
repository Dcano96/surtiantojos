import api from "../../services/api.js"

const API_URL = "/api/usuarios"

const getUsuarios = async () => {
  try {
    const response = await api.get(API_URL)
    if (Array.isArray(response.data)) return response.data
    return []
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return []
  }
}

const getUsuarioById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error)
    throw error
  }
}

const createUsuario = async (data) => {
  try {
    const response = await api.post(API_URL, data)
    return response.data
  } catch (error) {
    console.error("Error al crear usuario:", error)
    throw error
  }
}

const updateUsuario = async (id, data) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    throw error
  }
}

const deleteUsuario = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    throw error
  }
}

const removeRol = async (id) => {
  try {
    const response = await api.put(`${API_URL}/${id}/remove-rol`)
    return response.data
  } catch (error) {
    console.error("Error al quitar rol:", error)
    throw error
  }
}

const cambiarPassword = async (id, data) => {
  try {
    const response = await api.post(`${API_URL}/${id}/cambiar-password`, data)
    return response.data
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    throw error
  }
}

export default {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  removeRol,
  cambiarPassword,
}
