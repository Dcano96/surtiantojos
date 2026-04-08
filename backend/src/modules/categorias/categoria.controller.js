import Categoria from './categoria.model.js'

export const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find()
    res.json(categorias)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener categorías', error: err.message })
  }
}

export const getCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id)
    if (!categoria) return res.status(404).json({ msg: 'Categoría no encontrada' })
    res.json(categoria)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener categoría', error: err.message })
  }
}

export const crearCategoria = async (req, res) => {
  try {
    const categoria = new Categoria(req.body)
    await categoria.save()
    res.status(201).json(categoria)
  } catch (err) {
    res.status(400).json({ msg: 'Error al crear categoría', error: err.message })
  }
}

export const actualizarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!categoria) return res.status(404).json({ msg: 'Categoría no encontrada' })
    res.json(categoria)
  } catch (err) {
    res.status(400).json({ msg: 'Error al actualizar categoría', error: err.message })
  }
}

export const eliminarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id)
    if (!categoria) return res.status(404).json({ msg: 'Categoría no encontrada' })
    res.json({ msg: 'Categoría eliminada' })
  } catch (err) {
    res.status(500).json({ msg: 'Error al eliminar categoría', error: err.message })
  }
}
