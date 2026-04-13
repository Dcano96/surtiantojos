import mongoose from 'mongoose'
import Venta from './venta.model.js'
import DetalleVenta from './detalleVenta.model.js'
import Producto from '../productos/producto.model.js'
import Cliente from '../clientes/cliente.model.js'

const calcularTotales = (detalles, descuento = 0, impuesto = 0) => {
  const subtotal = detalles.reduce((acc, d) => acc + d.subtotal, 0)
  const total = Math.max(0, subtotal - descuento + impuesto)
  return { subtotal, total }
}

const construirDetalles = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('La venta debe tener al menos un producto')
  }
  const ids = items.map((i) => i.producto)
  const productos = await Producto.find({ _id: { $in: ids } }).lean()
  const mapa = new Map(productos.map((p) => [String(p._id), p]))

  return items.map((item) => {
    const p = mapa.get(String(item.producto))
    if (!p) throw new Error(`Producto no encontrado: ${item.producto}`)
    const cantidad = Number(item.cantidad) || 0
    if (cantidad < 1) throw new Error(`Cantidad inválida para ${p.nombre}`)
    const precioUnitario = item.precioUnitario != null ? Number(item.precioUnitario) : p.precio
    const descuento = Number(item.descuento) || 0
    const subtotal = Math.max(0, cantidad * precioUnitario - descuento)
    return {
      producto: p._id,
      nombreProducto: p.nombre,
      cantidad,
      precioUnitario,
      descuento,
      subtotal,
    }
  })
}

export const getVentas = async (req, res) => {
  try {
    const { estado, desde, hasta } = req.query
    const filtro = {}
    if (estado) filtro.estado = estado
    if (desde || hasta) {
      filtro.fechaVenta = {}
      if (desde) filtro.fechaVenta.$gte = new Date(desde)
      if (hasta) {
        const h = new Date(hasta)
        h.setHours(23, 59, 59, 999)
        filtro.fechaVenta.$lte = h
      }
    }
    const ventas = await Venta.find(filtro)
      .populate('cliente', 'nombre documento telefono')
      .populate('vendedor', 'nombre email')
      .populate('detalles')
      .sort({ createdAt: -1 })
    res.json(ventas)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener ventas', error: err.message })
  }
}

export const getVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente')
      .populate('vendedor', 'nombre email')
      .populate({ path: 'detalles', populate: { path: 'producto', select: 'nombre precio imagen' } })
    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' })
    res.json(venta)
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener venta', error: err.message })
  }
}

export const crearVenta = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    const {
      cliente: clienteId, items, descuento = 0, impuesto = 0,
      metodoPago, referenciaPago, notas, fechaVenta,
    } = req.body

    let clienteDoc = null
    if (clienteId) {
      clienteDoc = await Cliente.findById(clienteId)
      if (!clienteDoc) return res.status(400).json({ msg: 'Cliente no encontrado' })
    }

    const detallesPlanos = await construirDetalles(items)
    const { subtotal, total } = calcularTotales(detallesPlanos, descuento, impuesto)

    let ventaCreada
    await session.withTransaction(async () => {
      const [venta] = await Venta.create([{
        fechaVenta: fechaVenta || new Date(),
        cliente: clienteDoc?._id,
        clienteSnapshot: clienteDoc ? {
          nombre: `${clienteDoc.nombre}${clienteDoc.apellido ? ' ' + clienteDoc.apellido : ''}`,
          documento: clienteDoc.documento,
          telefono: clienteDoc.telefono,
        } : undefined,
        vendedor: req.usuario?.id,
        subtotal,
        descuento,
        impuesto,
        total,
        metodoPago: metodoPago || 'efectivo',
        referenciaPago,
        estado: 'completada',
        notas,
      }], { session })

      const detallesConVenta = detallesPlanos.map((d) => ({ ...d, venta: venta._id }))
      await DetalleVenta.insertMany(detallesConVenta, { session })
      ventaCreada = venta
    })

    const completa = await Venta.findById(ventaCreada._id)
      .populate('cliente', 'nombre documento telefono')
      .populate('vendedor', 'nombre email')
      .populate('detalles')
    res.status(201).json(completa)
  } catch (err) {
    res.status(400).json({ msg: 'Error al crear venta', error: err.message })
  } finally {
    session.endSession()
  }
}

export const actualizarVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' })
    if (venta.estado === 'anulada') {
      return res.status(400).json({ msg: 'No se puede editar una venta anulada' })
    }

    const { descuento, impuesto, metodoPago, referenciaPago, notas } = req.body
    if (descuento != null) venta.descuento = descuento
    if (impuesto != null) venta.impuesto = impuesto
    if (metodoPago) venta.metodoPago = metodoPago
    if (referenciaPago != null) venta.referenciaPago = referenciaPago
    if (notas != null) venta.notas = notas

    const detalles = await DetalleVenta.find({ venta: venta._id })
    const { subtotal, total } = calcularTotales(detalles, venta.descuento, venta.impuesto)
    venta.subtotal = subtotal
    venta.total = total

    await venta.save()
    res.json(venta)
  } catch (err) {
    res.status(400).json({ msg: 'Error al actualizar venta', error: err.message })
  }
}

export const anularVenta = async (req, res) => {
  try {
    const { motivo } = req.body
    if (!motivo?.trim()) return res.status(400).json({ msg: 'El motivo de anulación es obligatorio' })

    const venta = await Venta.findById(req.params.id)
    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' })
    if (venta.estado === 'anulada') return res.status(400).json({ msg: 'La venta ya está anulada' })

    venta.estado = 'anulada'
    venta.motivoAnulacion = motivo
    await venta.save()
    res.json(venta)
  } catch (err) {
    res.status(400).json({ msg: 'Error al anular venta', error: err.message })
  }
}

export const eliminarVenta = async (req, res) => {
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const venta = await Venta.findByIdAndDelete(req.params.id, { session })
      if (!venta) throw new Error('Venta no encontrada')
      await DetalleVenta.deleteMany({ venta: venta._id }, { session })
    })
    res.json({ msg: 'Venta eliminada' })
  } catch (err) {
    const code = err.message === 'Venta no encontrada' ? 404 : 500
    res.status(code).json({ msg: 'Error al eliminar venta', error: err.message })
  } finally {
    session.endSession()
  }
}
