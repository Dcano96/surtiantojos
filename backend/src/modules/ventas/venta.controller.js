import Venta from './venta.model.js'

export const getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio')
      .populate('pedido')
    res.json(ventas)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener ventas', error: err.message })
  }
}

export const getVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('usuario', 'nombre email')
      .populate('productos.producto', 'nombre precio')
      .populate('pedido')
    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' })
    res.json(venta)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener venta', error: err.message })
  }
}

export const crearVenta = async (req, res) => {
  try {
    const venta = new Venta(req.body)
    await venta.save()
    res.status(201).json(venta)
  } catch (err) {
    res.status(400).json({ msg: 'Error al crear venta', error: err.message })
  }
}

export const actualizarVenta = async (req, res) => {
  try {
    const venta = await Venta.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' })
    res.json(venta)
  } catch (err) {
    res.status(400).json({ msg: 'Error al actualizar venta', error: err.message })
  }
}

export const eliminarVenta = async (req, res) => {
  try {
    const venta = await Venta.findByIdAndDelete(req.params.id)
    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' })
    res.json({ msg: 'Venta eliminada' })
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar venta', error: err.message })
  }
}
