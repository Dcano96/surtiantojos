import api from "../../services/api.js"

const API_URL = "/api/categorias"

const getCategorias = async () => {
  try {
    const response = await api.get(API_URL)
    return response.data?.data ?? response.data ?? []
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    return []
  }
}

const getCategoriaById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data?.data ?? response.data
  } catch (error) {
    console.error("Error al obtener categoría por ID:", error)
    throw error
  }
}

const createCategoria = async (categoriaData) => {
  try {
    const response = await api.post(API_URL, categoriaData)
    return response.data
  } catch (error) {
    console.error("Error al crear categoría:", error)
    throw error
  }
}

const updateCategoria = async (id, categoriaData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, categoriaData)
    return response.data
  } catch (error) {
    console.error("Error al actualizar categoría:", error)
    throw error
  }
}

const cambiarEstadoCategoria = async (id) => {
  try {
    const response = await api.patch(`${API_URL}/${id}/estado`)
    return response.data
  } catch (error) {
    console.error("Error al cambiar estado de categoría:", error)
    throw error
  }
}

const deleteCategoria = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    throw error
  }
}

export default {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  cambiarEstadoCategoria,
  deleteCategoria,
}
