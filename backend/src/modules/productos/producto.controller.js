import Producto from './producto.model.js'
import Categoria from '../categorias/categoria.model.js'
import MovimientoInventario from '../inventario/movimientoInventario.model.js'

// Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    const productos = await Producto.find()
      .populate('categoria', 'nombre estado')
      .sort({ createdAt: -1 })
    res.json({ ok: true, data: productos, message: 'Productos obtenidos correctamente' })
  } catch (err) {
    res.status(500).json({ ok: false, data: null, message: 'Error al obtener productos' })
  }
}

// Obtener producto por ID
export const getProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate('categoria', 'nombre estado')
    if (!producto) {
      return res.status(404).json({ ok: false, data: null, message: 'Producto no encontrado' })
    }
    res.json({ ok: true, data: producto, message: 'Producto obtenido correctamente' })
  } catch (err) {
    res.status(500).json({ ok: false, data: null, message: 'Error al obtener producto' })
  }
}

// Crear producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, categoria, stockInicial, stockMinimo, unidadMedida, ...resto } = req.body

    // Validar que no exista otro producto con el mismo nombre en la misma categoría
    if (nombre && categoria) {
      const existe = await Producto.findOne({
        nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
        categoria,
      })
      if (existe) {
        return res.status(400).json({ ok: false, data: null, message: 'Ya existe un producto con ese nombre en esta categoría' })
      }
    }

    // Validar que la categoría exista y esté activa
    if (categoria) {
      const cat = await Categoria.findById(categoria)
      if (!cat) {
        return res.status(400).json({ ok: false, data: null, message: 'La categoría seleccionada no existe' })
      }
      if (!cat.estado) {
        return res.status(400).json({ ok: false, data: null, message: 'No se puede asociar un producto a una categoría inactiva' })
      }
    }

    // Crear el producto con stock en 0 — el stock se maneja via inventario
    const stockInicialNum = Number(stockInicial) || 0
    const producto = new Producto({
      ...resto,
      nombre,
      categoria,
      stockMinimo: Number(stockMinimo) || 0,
      unidadMedida: unidadMedida || 'unidad',
      stock: stockInicialNum,
    })
    await producto.save()

    // Si se especificó stock inicial, registrar el movimiento de entrada
    if (stockInicialNum > 0) {
      await MovimientoInventario.create({
        productoId: producto._id,
        tipo: 'entrada',
        cantidad: stockInicialNum,
        unidad_medida: unidadMedida || 'unidad',
        motivo: 'compra',
        nota: 'Stock inicial al crear el producto',
        usuarioId: req.usuario?.id || null,
        fecha: new Date(),
      })
    }

    await producto.populate('categoria', 'nombre estado')
    res.status(201).json({ ok: true, data: producto, message: 'Producto creado correctamente' })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, data: null, message: 'Ya existe un producto con ese nombre en esta categoría' })
    }
    res.status(400).json({ ok: false, data: null, message: err.message || 'Error al crear producto' })
  }
}

// Actualizar producto
export const actualizarProducto = async (req, res) => {
  try {
    const { nombre, categoria, stockMinimo, unidadMedida, descripcion, precio, imagen, estado } = req.body

    // El stock NO se puede modificar directamente — solo via inventario
    // Se construye el payload explícitamente para excluir el campo stock
    const updatePayload = {}
    if (nombre !== undefined) updatePayload.nombre = nombre
    if (descripcion !== undefined) updatePayload.descripcion = descripcion
    if (precio !== undefined) updatePayload.precio = precio
    if (imagen !== undefined) updatePayload.imagen = imagen
    if (estado !== undefined) updatePayload.estado = estado
    if (stockMinimo !== undefined) updatePayload.stockMinimo = stockMinimo
    if (unidadMedida !== undefined) updatePayload.unidadMedida = unidadMedida
    if (categoria !== undefined) updatePayload.categoria = categoria

    // Validar duplicado de nombre en la misma categoría
    if (nombre && categoria) {
      const existe = await Producto.findOne({
        nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
        categoria,
        _id: { $ne: req.params.id },
      })
      if (existe) {
        return res.status(400).json({ ok: false, data: null, message: 'Ya existe un producto con ese nombre en esta categoría' })
      }
    }

    // Validar que la categoría esté activa
    if (categoria) {
      const cat = await Categoria.findById(categoria)
      if (!cat) {
        return res.status(400).json({ ok: false, data: null, message: 'La categoría seleccionada no existe' })
      }
      if (!cat.estado) {
        return res.status(400).json({ ok: false, data: null, message: 'No se puede asociar un producto a una categoría inactiva' })
      }
    }

    const producto = await Producto.findByIdAndUpdate(req.params.id, updatePayload, { new: true, runValidators: true })
      .populate('categoria', 'nombre estado')
    if (!producto) {
      return res.status(404).json({ ok: false, data: null, message: 'Producto no encontrado' })
    }
    res.json({ ok: true, data: producto, message: 'Producto actualizado correctamente' })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, data: null, message: 'Ya existe un producto con ese nombre en esta categoría' })
    }
    res.status(400).json({ ok: false, data: null, message: err.message || 'Error al actualizar producto' })
  }
}

// Cambiar estado de producto (activar/inactivar)
export const cambiarEstadoProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id)
    if (!producto) {
      return res.status(404).json({ ok: false, data: null, message: 'Producto no encontrado' })
    }
    producto.estado = !producto.estado
    await producto.save()
    await producto.populate('categoria', 'nombre estado')
    const estado = producto.estado ? 'activado' : 'desactivado'
    res.json({ ok: true, data: producto, message: `Producto ${estado} correctamente` })
  } catch (err) {
    res.status(500).json({ ok: false, data: null, message: 'Error al cambiar estado del producto' })
  }
}

// Eliminar producto
export const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id)
    if (!producto) {
      return res.status(404).json({ ok: false, data: null, message: 'Producto no encontrado' })
    }
    if (producto.estado) {
      return res.status(400).json({ ok: false, data: null, message: 'No se puede eliminar un producto activo. Desactívalo primero.' })
    }
    await Producto.findByIdAndDelete(req.params.id)
    res.json({ ok: true, data: producto, message: 'Producto eliminado correctamente' })
  } catch (err) {
    res.status(500).json({ ok: false, data: null, message: 'Error al eliminar producto' })
  }
}
