import MovimientoInventario from './movimientoInventario.model.js'
import Producto from '../productos/producto.model.js'
import {
  registrarEntrada as svcRegistrarEntrada,
  registrarAjuste as svcRegistrarAjuste,
} from './inventario.service.js'

/**
 * GET /api/inventario/movimientos
 * Lista paginada de movimientos con filtros opcionales.
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
        .populate('productoId', 'nombre precio imagen unidadMedida')
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

/**
 * GET /api/inventario/stock
 * Resumen del stock actual de todos los productos con estado de alerta.
 */
export const getStock = async (req, res) => {
  try {
    const productos = await Producto.find()
      .populate('categoria', 'nombre')
      .sort({ nombre: 1 })
      .lean()

    const stock = productos.map((p) => {
      let estadoStock = 'normal'
      if (p.stock === 0) estadoStock = 'agotado'
      else if (p.stock <= (p.stockMinimo || 0)) estadoStock = 'bajo'

      return {
        _id: p._id,
        nombre: p.nombre,
        imagen: p.imagen,
        categoria: p.categoria,
        precio: p.precio,
        stock: p.stock,
        stockMinimo: p.stockMinimo || 0,
        unidadMedida: p.unidadMedida || 'unidad',
        estadoStock,
        estado: p.estado,
      }
    })

    const resumen = {
      total: stock.length,
      activos: stock.filter((p) => p.estado).length,
      agotados: stock.filter((p) => p.estadoStock === 'agotado').length,
      bajoMinimo: stock.filter((p) => p.estadoStock === 'bajo').length,
    }

    res.json({ stock, resumen })
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener stock', error: err.message })
  }
}

/**
 * POST /api/inventario/entrada
 * Registra ingreso de mercancía. Sube el stock del producto.
 */
export const registrarEntrada = async (req, res) => {
  try {
    const { productoId, cantidad, nota, proveedor } = req.body

    if (!productoId) return res.status(400).json({ msg: 'El producto es requerido' })
    if (!cantidad || Number(cantidad) < 1) return res.status(400).json({ msg: 'La cantidad debe ser mayor a 0' })

    const { producto, movimiento } = await svcRegistrarEntrada({
      productoId,
      cantidad,
      nota,
      proveedor,
      usuarioId: req.usuario?.id,
    })

    res.status(201).json({
      msg: `Entrada registrada. Stock actual de "${producto.nombre}": ${producto.stock} ${producto.unidadMedida}`,
      producto,
      movimiento,
    })
  } catch (err) {
    res.status(400).json({ msg: err.message || 'Error al registrar entrada' })
  }
}

/**
 * POST /api/inventario/ajuste
 * Ajuste manual de stock (corrección por conteo físico).
 */
export const registrarAjuste = async (req, res) => {
  try {
    const { productoId, tipo, cantidad, nota } = req.body

    if (!productoId) return res.status(400).json({ msg: 'El producto es requerido' })
    if (!tipo) return res.status(400).json({ msg: 'El tipo de ajuste es requerido (entrada/salida)' })
    if (!cantidad || Number(cantidad) < 1) return res.status(400).json({ msg: 'La cantidad debe ser mayor a 0' })
    if (!nota || !nota.trim()) return res.status(400).json({ msg: 'La nota es obligatoria en ajustes manuales' })

    const { producto, movimiento } = await svcRegistrarAjuste({
      productoId,
      tipo,
      cantidad,
      nota,
      usuarioId: req.usuario?.id,
    })

    res.status(201).json({
      msg: `Ajuste registrado. Stock actual de "${producto.nombre}": ${producto.stock} ${producto.unidadMedida}`,
      producto,
      movimiento,
    })
  } catch (err) {
    res.status(400).json({ msg: err.message || 'Error al registrar ajuste' })
  }
}
