import Pedido from './pedido.model.js'

export const getPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate('usuario', 'nombre email').populate('productos.producto', 'nombre precio')
    res.json(pedidos)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener pedidos', error: err.message })
  }
}

export const getPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate('usuario', 'nombre email').populate('productos.producto', 'nombre precio')
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' })
    res.json(pedido)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener pedido', error: err.message })
  }
}

export const crearPedido = async (req, res) => {
  try {
    const pedido = new Pedido(req.body)
    await pedido.save()
    res.status(201).json(pedido)
  } catch (err) {
    res.status(400).json({ msg: 'Error al crear pedido', error: err.message })
  }
}

export const actualizarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' })
    res.json(pedido)
  } catch (err) {
    res.status(400).json({ msg: 'Error al actualizar pedido', error: err.message })
  }
}

export const eliminarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndDelete(req.params.id)
    if (!pedido) return res.status(404).json({ msg: 'Pedido no encontrado' })
    res.json({ msg: 'Pedido eliminado' })
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar pedido', error: err.message })
  }
}
