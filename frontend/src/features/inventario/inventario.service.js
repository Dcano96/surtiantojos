import api from '../../services/api.js'

const API_URL = '/api/inventario'

const getMovimientos = async (params = {}) => {
  const { data } = await api.get(`${API_URL}/movimientos`, { params })
  return data
}

export default { getMovimientos }
