import api from '../../services/api.js'

const API_URL = '/api/inventario'

const getMovimientos = async (params = {}) => {
  const { data } = await api.get(`${API_URL}/movimientos`, { params })
  return data
}

const getStock = async () => {
  const { data } = await api.get(`${API_URL}/stock`)
  return data
}

const registrarEntrada = async ({ productoId, cantidad, nota, proveedor }) => {
  const { data } = await api.post(`${API_URL}/entrada`, { productoId, cantidad, nota, proveedor })
  return data
}

const registrarAjuste = async ({ productoId, tipo, cantidad, nota }) => {
  const { data } = await api.post(`${API_URL}/ajuste`, { productoId, tipo, cantidad, nota })
  return data
}

export default { getMovimientos, getStock, registrarEntrada, registrarAjuste }
