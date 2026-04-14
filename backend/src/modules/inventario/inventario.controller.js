import MovimientoInventario from './movimientoInventario.model.js'

/**
 * GET /api/inventario/movimientos
 *
 * Query params:
 *   productoId  - filtrar por producto
 *   tipo        - 'entrada' | 'salida'
 *   desde       - fecha ISO inicio
 *   hasta       - fecha ISO fin
 *   page        - página (default 1)
 *   limit       - resultados por página (default 20)
 */
export const getMovimientos = async (req, res) => {
  try {
    const { productoId, tipo, desde, hasta, page = 1, limit = 20 } = req.query

    const filtro = {}

    if (productoId) filtro.productoId = productoId
    if (tipo && ['entrada', 'salida'].includes(tipo)) filtro.tipo = tipo

    if (desde || hasta) {
      filtro.fecha = {}
      if (desde) filtro.fecha.$gte = new Date(desde)
      if (hasta) {
        const hastaDate = new Date(hasta)
        hastaDate.setHours(23, 59, 59, 999)
        filtro.fecha.$lte = hastaDate
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)))
    const skip = (pageNum - 1) * limitNum

    const [movimientos, total] = await Promise.all([
      MovimientoInventario.find(filtro)
        .populate('productoId', 'nombre precio imagen')
        .populate('usuarioId', 'nombre email')
        .populate('referenciaId', 'numero estado')
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MovimientoInventario.countDocuments(filtro),
    ])

    res.json({
      movimientos,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    })
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener movimientos', error: err.message })
  }
}
