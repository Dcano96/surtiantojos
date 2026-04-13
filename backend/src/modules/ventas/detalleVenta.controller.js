import DetalleVenta from './detalleVenta.model.js'

export const getDetalles = async (req, res) => {
  try {
    const { desde, hasta, producto, venta } = req.query
    const filtro = {}
    if (producto) filtro.producto = producto
    if (venta) filtro.venta = venta
    if (desde || hasta) {
      filtro.createdAt = {}
      if (desde) filtro.createdAt.$gte = new Date(desde)
      if (hasta) {
        const h = new Date(hasta)
        h.setHours(23, 59, 59, 999)
        filtro.createdAt.$lte = h
      }
    }
    const detalles = await DetalleVenta.find(filtro)
      .populate({ path: 'venta', select: 'numero estado fechaVenta metodoPago clienteSnapshot cliente' })
      .populate('producto', 'nombre imagen')
      .sort({ createdAt: -1 })
    res.json(detalles)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener detalles de ventas', error: err.message })
  }
}

export const getDetallesPorVenta = async (req, res) => {
  try {
    const detalles = await DetalleVenta.find({ venta: req.params.ventaId })
      .populate('producto', 'nombre precio imagen')
    res.json(detalles)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener detalles', error: err.message })
  }
}
