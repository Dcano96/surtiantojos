import Producto from './producto.model.js'

export const getProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('categoria', 'nombre')
    res.json(productos)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener productos', error: err.message })
  }
}

export const getProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate('categoria', 'nombre')
    if (!producto) return res.status(404).json({ msg: 'Producto no encontrado' })
    res.json(producto)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener producto', error: err.message })
  }
}

export const crearProducto = async (req, res) => {
  try {
    const producto = new Producto(req.body)
    await producto.save()
    res.status(201).json(producto)
  } catch (err) {
    res.status(400).json({ msg: 'Error al crear producto', error: err.message })
  }
}

export const actualizarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!producto) return res.status(404).json({ msg: 'Producto no encontrado' })
    res.json(producto)
  } catch (err) {
    res.status(400).json({ msg: 'Error al actualizar producto', error: err.message })
  }
}

export const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id)
    if (!producto) return res.status(404).json({ msg: 'Producto no encontrado' })
    res.json({ msg: 'Producto eliminado' })
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar producto', error: err.message })
  }
}
