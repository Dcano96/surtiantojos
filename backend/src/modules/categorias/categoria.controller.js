import Categoria from './categoria.model.js'

// Obtener todas las categorías
export const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ createdAt: -1 })
    res.json({ ok: true, data: categorias, message: 'Categorías obtenidas correctamente' })
  } catch (err) {
    res.status(500).json({ ok: false, data: null, message: 'Error al obtener categorías' })
  }
}

// Obtener categoría por ID
export const getCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id)
    if (!categoria) {
      return res.status(404).json({ ok: false, data: null, message: 'Categoría no encontrada' })
    }
    res.json({ ok: true, data: categoria, message: 'Categoría obtenida correctamente' })
  } catch (err) {
    res.status(500).json({ ok: false, data: null, message: 'Error al obtener categoría' })
  }
}

// Crear categoría
export const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body
    const existe = await Categoria.findOne({ nombre: { $regex: new RegExp(`^${nombre}$`, 'i') } })
    if (existe) {
      return res.status(400).json({ ok: false, data: null, message: 'Ya existe una categoría con ese nombre' })
    }
    const categoria = new Categoria(req.body)
    await categoria.save()
    res.status(201).json({ ok: true, data: categoria, message: 'Categoría creada correctamente' })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, data: null, message: 'Ya existe una categoría con ese nombre' })
    }
    res.status(400).json({ ok: false, data: null, message: err.message || 'Error al crear categoría' })
  }
}

// Actualizar categoría
export const actualizarCategoria = async (req, res) => {
  try {
    const { nombre } = req.body
    if (nombre) {
      const existe = await Categoria.findOne({
        nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
        _id: { $ne: req.params.id },
      })
      if (existe) {
        return res.status(400).json({ ok: false, data: null, message: 'Ya existe una categoría con ese nombre' })
      }
    }
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!categoria) {
      return res.status(404).json({ ok: false, data: null, message: 'Categoría no encontrada' })
    }
    res.json({ ok: true, data: categoria, message: 'Categoría actualizada correctamente' })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, data: null, message: 'Ya existe una categoría con ese nombre' })
    }
    res.status(400).json({ ok: false, data: null, message: err.message || 'Error al actualizar categoría' })
  }
}

// Cambiar estado de categoría (activar/inactivar)
export const cambiarEstadoCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id)
    if (!categoria) {
      return res.status(404).json({ ok: false, data: null, message: 'Categoría no encontrada' })
    }
    categoria.estado = !categoria.estado
    await categoria.save()
    const estado = categoria.estado ? 'activada' : 'desactivada'
    res.json({ ok: true, data: categoria, message: `Categoría ${estado} correctamente` })
  } catch (err) {
    res.status(500).json({ ok: false, data: null, message: 'Error al cambiar estado de categoría' })
  }
}

// Eliminar categoría
export const eliminarCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id)
    if (!categoria) {
      return res.status(404).json({ ok: false, data: null, message: 'Categoría no encontrada' })
    }
    res.json({ ok: true, data: categoria, message: 'Categoría eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ ok: false, data: null, message: 'Error al eliminar categoría' })
  }
}
