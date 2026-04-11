import api from "../../services/api.js"

const API_URL = "/api/productos"

const getProductos = async () => {
  try {
    const response = await api.get(API_URL)
    return response.data?.data ?? response.data ?? []
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return []
  }
}

const getProductoById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data?.data ?? response.data
  } catch (error) {
    console.error("Error al obtener producto por ID:", error)
    throw error
  }
}

const createProducto = async (productoData) => {
  try {
    const response = await api.post(API_URL, productoData)
    return response.data
  } catch (error) {
    console.error("Error al crear producto:", error)
    throw error
  }
}

const updateProducto = async (id, productoData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, productoData)
    return response.data
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    throw error
  }
}

const cambiarEstadoProducto = async (id) => {
  try {
    const response = await api.patch(`${API_URL}/${id}/estado`)
    return response.data
  } catch (error) {
    console.error("Error al cambiar estado del producto:", error)
    throw error
  }
}

const deleteProducto = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    throw error
  }
}

export default {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  cambiarEstadoProducto,
  deleteProducto,
}
